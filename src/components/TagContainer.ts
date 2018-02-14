import { Component, createElement } from "react";

import { BootstrapStyle, Tag } from "./Tag";
import { ValidateConfigs } from "../utils/ValidateConfigs";

interface WrapperProps {
    class?: string;
    mxObject: mendix.lib.MxObject;
    readOnly: boolean;
    style?: string;
}

export interface TagContainerProps extends WrapperProps {
    afterCreateMicroflow: string;
    allowDrag: boolean;
    tagStyle: BootstrapStyle;
    editable: "default" | "never";
    enableSuggestions: boolean;
    inputPlaceholder: string;
    onChangeMicroflow: string;
    lazyLoad: boolean;
    mxform: mxui.lib.form._FormBase;
    tagAttribute: string;
    tagConstraint: string;
    tagEntity: string;
    tagLimit: number;
    tagLimitMessage: string;
}

export interface TagContainerState {
    alertMessage?: string;
    isReference: boolean;
    suggestions: string[];
    lazyLoaded: boolean;
    fetchTags: boolean;
    tagList: string[];
    newTag: string;
    tagCache: mendix.lib.MxObject[];
}

export default class TagContainer extends Component<TagContainerProps, TagContainerState> {
    private subscriptionHandles: number[] = [];
    private tagEntity: string;
    private referenceAttribute: string;

    constructor(props: TagContainerProps) {
        super(props);

        this.state = {
            fetchTags: false,
            isReference: false,
            lazyLoaded: false,
            newTag: "",
            suggestions: [],
            tagCache: [],
            tagList: []
        };

        this.createTag = this.createTag.bind(this);
        this.processTags = this.processTags.bind(this);
        this.lazyLoadSuggestions = this.lazyLoadSuggestions.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.tagEntity = props.tagEntity.split("/")[props.tagEntity.split("/").length - 1];
        this.referenceAttribute = props.tagEntity.split("/")[0];
    }

    render() {
        return createElement(Tag, {
            alertMessage: this.state.alertMessage,
            className: this.props.class,
            createTag: this.createTag,
            enableSuggestions: this.props.enableSuggestions,
            fetchSuggestions: this.lazyLoadSuggestions,
            inputPlaceholder: this.props.inputPlaceholder,
            lazyLoad: this.props.lazyLoad,
            newTag: this.state.newTag,
            onRemove: this.removeTag,
            readOnly: this.isReadOnly(),
            style: ValidateConfigs.parseStyle(this.props.style),
            suggestions: this.state.suggestions,
            tagLimit: this.props.tagLimit,
            tagLimitMessage: this.props.tagLimitMessage,
            tagList: this.state.tagList,
            tagStyle: this.props.tagStyle
        });
    }

    componentWillReceiveProps(newProps: TagContainerProps) {
        this.fetchTags(newProps.mxObject);
        this.resetSubscriptions(newProps.mxObject);
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(mx.data.unsubscribe);
    }

    // private isReadOnly() {
    //     const { booleanAttribute, editable, mxObject, readOnly } = this.props;
    //     if (editable === "default" && mxObject) {
    //         return readOnly || mxObject.isReadonlyAttr(booleanAttribute);
    //     }

    //     return true;
    // }

    private isReadOnly() {
        const { editable, mxObject, readOnly } = this.props;
        if (editable === "default" && mxObject) {
            return readOnly;
        }

        return true;
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(window.mx.data.unsubscribe);

        if (mxObject) {
            this.subscriptionHandles.push(mx.data.subscribe({
                callback: guid => {
                    mx.data.get({
                        callback: object => this.fetchTags(object),
                        guid: guid.toString()
                    });
                },
                guid: mxObject.getGuid()
            }));

            this.subscriptionHandles.push(mx.data.subscribe({
                attr: this.referenceAttribute,
                callback: guid => {
                    mx.data.get({
                        callback: object => this.fetchTags(object),
                        guid: guid.toString()
                    });
                },
                guid: mxObject.getGuid()
            }));

            this.subscriptionHandles.push(mx.data.subscribe({
                callback: validations => {
                    window.mx.ui.error(validations[0].getErrorReason(this.referenceAttribute));
                },
                guid: mxObject.getGuid(),
                val: true
            }));
        }
    }

    private lazyLoadSuggestions() {
        this.fetchTags(this.props.mxObject);
        this.setState({ lazyLoaded: true });
    }

    private fetchTags(mxObject: mendix.lib.MxObject) {
        if (!this.state.fetchTags) {
            const { tagConstraint } = this.props;
            const constraint = tagConstraint
                ? tagConstraint.replace(/\[\%CurrentObject\%\]/gi, mxObject.getGuid())
                : "";
            const XPath = "//" + this.tagEntity + constraint;

            mx.data.get({
                callback: objects => this.processTags(objects),
                error: error =>
                    window.mx.ui.error(`An error occurred while retrieving tags (${this.tagEntity}):
                ${error.message}`),
                xpath: XPath
            });
        }
    }

    private processTags(tagData: mendix.lib.MxObject[]) {
        const referenceTags = this.props.mxObject.getReferences(this.referenceAttribute) as string[];
        const getSuggestions = tagData.map(object => ({ value: object.get(this.props.tagAttribute) as string }));
        const currentTags = this.getCurrentTags(tagData, referenceTags);
        const getTags = currentTags !== []
        ? currentTags.map(object => ({ value: object.get(this.props.tagAttribute) as string }))
        : [];

        this.setState({
            fetchTags: true,
            suggestions: getSuggestions.map(suggestion => suggestion.value),
            tagCache: tagData,
            tagList: getTags.map(tag => tag.value)
        });
    }

    private getCurrentTags(objects: mendix.lib.MxObject[], availableTags: string[]): mendix.lib.MxObject[] {
        const currentTags: mendix.lib.MxObject[] = [];

        objects.map(object => {
            if (availableTags.length > 0) {
                availableTags.forEach(tagGuid => {
                    if (tagGuid === object.getGuid()) {
                        currentTags.push(object);
                    }
                });
            }
        });

        return currentTags;
    }

    private createTag(newTag: string) {
        const { afterCreateMicroflow, onChangeMicroflow, mxObject } = this.props;
        const tagList = this.state.tagList;

        // Check if newTag exists in the database
        for (const object of this.state.tagCache) {
            const existingTag = object.get(this.props.tagAttribute) as string;
            if (newTag !== "" && newTag === existingTag) {
                tagList.push(newTag);
                this.setState({ tagList });
                if (!mxObject.isReference(object.getGuid())) {
                    mxObject.addReference(this.referenceAttribute, object.getGuid());
                    this.saveChanges(mxObject);
                }

                return;
            }
        }
        mx.data.create({
            callback: object => {
                object.set(this.props.tagAttribute, newTag);
                mx.data.commit({
                    callback: () => {
                        mxObject.addReference(this.referenceAttribute, object.getGuid());
                        this.saveChanges(mxObject);
                        if (afterCreateMicroflow || onChangeMicroflow) {
                            this.executeAction(mxObject, afterCreateMicroflow);
                            this.executeAction(mxObject, onChangeMicroflow);
                        }
                    },
                    error: error => window.mx.ui.error("Error occurred attempting to commit: " + error.message),
                    mxobj: object
                });
            },
            entity: this.tagEntity,
            error: error => window.mx.ui.error(`Error creating tag object ${this.tagEntity}, ${error.message}`)
        });

        tagList.push(newTag);
        this.setState({ tagList });
    }

    private removeTag(value: string) {
        if (value) {
            const tagIndex = this.state.tagList.indexOf(value);
            const tagList = this.state.tagList.slice();
            const removeCount = setTimeout(this.removeReference(value), 1000);

            tagList.splice(tagIndex, 1);
            this.setState({
                alertMessage: "",
                tagList: tagIndex !== -1 ? tagList : this.state.tagList
            });
            window.clearTimeout(removeCount);
        }
    }

    private removeReference(tag: string) {
        const { onChangeMicroflow, mxObject } = this.props;
        const xpath = `//${this.tagEntity}[ ${this.props.tagAttribute} = '${tag}' ]`;

        mx.data.get({
            callback: (object) => {
                mxObject.removeReferences(this.referenceAttribute, [ object[0].getGuid() ]);
                this.saveChanges(mxObject);
                if (onChangeMicroflow) {
                    this.executeAction(mxObject, onChangeMicroflow);
                }
            },
            error: error => `${error.message}`,
            xpath
        });
    }

    private saveChanges(object: mendix.lib.MxObject) {
        mx.data.commit({ mxobj: object, callback: () => null });
    }

    private executeAction(mxObject: mendix.lib.MxObject, action?: string) {
        if (action) {
            window.mx.ui.action(action, {
                error: error => window.mx.ui.error(`Error while executing microflow: ${action}: ${error.message}`),
                origin: this.props.mxform,
                params: {
                    applyto: "selection",
                    guids: [ mxObject.getGuid() ]
                }
            });
        }
    }
}
