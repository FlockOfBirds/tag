import { Component, createElement } from "react";

import { BootstrapStyle, Tag } from "./Tag";
import { ValidateConfigs } from "../utils/ValidateConfigs";

import { addTagEvents, removeTagEvents } from "../utils/Events";

interface WrapperProps {
    class?: string;
    mxObject: mendix.lib.MxObject;
    mxform: mxui.lib.form._FormBase;
    readOnly: boolean;
    style?: string;
}

export interface TagContainerProps extends WrapperProps {
    afterCreateMicroflow: string;
    afterCreateNanoflow: Nanoflow;
    tagStyle: BootstrapStyle;
    editable: "default" | "never";
    enableSuggestions: boolean;
    inputPlaceholder: string;
    onChangeMicroflow: string;
    onChangeNanoflow: Nanoflow;
    lazyLoad: boolean;
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

interface Nanoflow {
    nanoflow: object[];
    paramsSpec: { Progress: string };
}

export default class TagContainer extends Component<TagContainerProps, TagContainerState> {
    private subscriptionHandles: number[] = [];
    private tagEntity: string;
    private reference: string;

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

        this.tagEntity = props.tagEntity.split("/")[props.tagEntity.split("/").length - 1];
        this.reference = props.tagEntity.split("/")[0];
    }

    render() {
        return createElement(Tag, {
            addTagEvents: this.addTagEvents,
            alertMessage: this.state.alertMessage,
            className: this.props.class,
            createTag: this.validateTag,
            enableSuggestions: this.props.enableSuggestions,
            fetchSuggestions: this.lazyLoadSuggestions,
            inputPlaceholder: this.props.inputPlaceholder,
            lazyLoad: this.props.lazyLoad,
            newTag: this.state.newTag,
            onRemove: this.removeTag,
            readOnly: this.isReadOnly(),
            removeTagEvents: this.removeTagEvents,
            style: ValidateConfigs.parseStyle(this.props.style),
            suggestions: this.state.suggestions,
            tagLimit: this.props.tagLimit,
            tagLimitMessage: this.props.tagLimitMessage,
            tagList: this.state.tagList,
            tagStyle: this.props.tagStyle
        });
    }

    componentWillReceiveProps(newProps: TagContainerProps) {
        this.fetchData(newProps.mxObject);
        this.resetSubscriptions(newProps.mxObject);
    }

    componentWillUnmount() {
        this.subscriptionHandles.forEach(mx.data.unsubscribe);
    }

    private isReadOnly = (): boolean => {
        return !this.props.mxObject || this.props.editable === "never" ||
            this.props.mxObject.isReadonlyAttr(this.reference);
    }

    private handleValidations = (validations: mendix.lib.ObjectValidation[]) => {
        const alertMessage = validations[0].getErrorReason(this.reference);
        validations[0].removeAttribute(this.reference);
        if (alertMessage) {
            this.setState({ alertMessage });
        }
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        if (this.subscriptionHandles.length > 0) {
            this.subscriptionHandles.forEach(window.mx.data.unsubscribe);
        }

        if (mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: () => this.handleValidations,
                guid: mxObject.getGuid(),
                val: true
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: () => this.fetchData(mxObject),
                guid: mxObject.getGuid()
            }));
            this.subscriptionHandles.push(window.mx.data.subscribe({
                attr: this.reference,
                callback: () => this.fetchData(mxObject),
                guid: mxObject.getGuid()
            }));
        }
    }

    private lazyLoadSuggestions = () => {
        this.fetchData(this.props.mxObject);
        this.setState({ lazyLoaded: true });
    }

    private fetchData(mxObject: mendix.lib.MxObject) {
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

    private processTags = (tagData: mendix.lib.MxObject[]) => {
        const referenceTags = this.props.mxObject.getReferences(this.reference) as string[];
        const getSuggestions = tagData.map(object => ({ value: object.get(this.props.tagAttribute) as string }));
        const currentTags = this.getCurrentTags(tagData, referenceTags);
        const getTags = currentTags && currentTags.length > 0
            ? currentTags.map(object => ({ value: object ? object.get(this.props.tagAttribute) as string : "" }))
            : [];

        this.setState({
            fetchTags: true,
            suggestions: getSuggestions.map(suggestion => suggestion.value),
            tagCache: tagData,
            tagList: getTags.map(tag => tag.value)
        });
    }

    private getCurrentTags(MxObjects: mendix.lib.MxObject[], availableTags: string[]): (mendix.lib.MxObject | undefined)[] | undefined {
        if (availableTags.length > 0) {
            return availableTags.map(guid => {
                return MxObjects.find(object =>
                    guid === object.getGuid()
                );
            });
        }
    }

    private validateTag = (newTag: string) => {
        const { mxObject } = this.props;
        const tagList = this.state.tagList;

        // Compare new tag with the existing tags
        for (const object of this.state.tagCache) {
            const isExisting = object.get(this.props.tagAttribute) as string;
            if (newTag !== "" && newTag === isExisting) {
                tagList.push(newTag);
                this.setState({ tagList });
                if (!mxObject.isReference(object.getGuid())) {
                    mxObject.addReference(this.reference, object.getGuid());
                    this.saveChanges(mxObject);
                }

                return;
            }
        }

        this.createTag(mxObject, newTag);
        tagList.push(newTag);
        this.setState({ tagList });
    }

    private createTag = (mxObject: mendix.lib.MxObject, tag: string) => {
        mx.data.create({
            callback: object => {
                object.set(this.props.tagAttribute, tag);
                mx.data.commit({
                    callback: () => {
                        mxObject.addReference(this.reference, object.getGuid());
                        this.saveChanges(mxObject);
                        this.executeAction(mxObject);
                    },
                    error: error => window.mx.ui.error("Error occurred attempting to commit: " + error.message),
                    mxobj: object
                });
            },
            entity: this.tagEntity,
            error: error => window.mx.ui.error(`Error creating tag object ${this.tagEntity}, ${error.message}`)
        });
    }

    private removeTag = (value: string) => {
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
        const { mxObject } = this.props;
        const xpath = `//${this.tagEntity}[ ${this.props.tagAttribute} = '${tag}' ]`;
        mx.data.get({
            callback: (object) => {
                mxObject.removeReferences(this.reference, [ object[0].getGuid() ]);
                this.saveChanges(mxObject);
                this.executeAction(mxObject);
            },
            error: error => `${error.message}`,
            xpath
        });
    }

    private saveChanges(mxobj: mendix.lib.MxObject) {
        mx.data.commit({ mxobj, callback: () => null });
    }

    private executeAction = (mxObject: mendix.lib.MxObject) => {
        const { afterCreateMicroflow, afterCreateNanoflow, onChangeMicroflow, onChangeNanoflow } = this.props;
        const context = new mendix.lib.MxContext();
        context.setContext(mxObject.getEntity(), mxObject.getGuid());

        if (afterCreateMicroflow) {
            this.callMicroflow(context, afterCreateMicroflow);
        }
        if (onChangeMicroflow) {
            this.callMicroflow(context, onChangeMicroflow);
        }
        if (afterCreateNanoflow && afterCreateNanoflow.nanoflow) {
            this.callNanoflow(context, afterCreateNanoflow);
        }
        if (onChangeNanoflow && onChangeNanoflow.nanoflow) {
            this.callNanoflow(context, onChangeNanoflow);
        }
    }

    private callNanoflow = (context: mendix.lib.MxContext, nanoflow: Nanoflow) => {
        window.mx.data.callNanoflow({
            context,
            error: error => window.mx.ui.error(
                `An error occurred while executing the on change nanoflow: ${error.message}`
            ),
            nanoflow,
            origin: this.props.mxform
        });
    }

    private callMicroflow = (context: mendix.lib.MxContext, action: string) => {
        window.mx.ui.action(action as string, {
            context,
            error: error => window.mx.ui.error(`Error while executing microflow: ${action}: ${error.message}`),
            origin: this.props.mxform
        });
    }

    private addTagEvents = (nodeList: NodeListOf<Element>) => {
        addTagEvents(nodeList);
    }

    private removeTagEvents = (nodeList: NodeListOf<Element>) => {
        removeTagEvents(nodeList);
    }
}
