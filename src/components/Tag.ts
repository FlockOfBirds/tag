import { Component, createElement } from "react";
import * as classNames from "classnames";

import { Alert } from "./Alert";
import * as TagsInput from "react-tagsinput";
import { AutoComplete } from "./AutoComplete";

import { processSuggestions } from "../utils/Utilities";

import "react-tagsinput/react-tagsinput.css";
import "../ui/Tag.scss";

export interface TagProps {
    alertMessage?: string;
    tagStyle?: BootstrapStyle;
    className?: string;
    createTag?: (tag: string) => void;
    enableSuggestions?: boolean;
    fetchSuggestions?: () => void;
    addTagEvents?: (nodeList: NodeListOf<Element>) => void;
    removeTagEvents?: (nodeList: NodeListOf<Element>) => void;
    inputPlaceholder: string;
    lazyLoad?: boolean;
    newTag: string;
    onRemove?: (tag: string) => void;
    readOnly: boolean;
    style?: object;
    suggestions: string[];
    tagLimit: number;
    tagLimitMessage: string;
    tagList: string[];
}

interface TagState {
    alertMessage?: string;
    newTag: string;
    tagList: string[];
}

export type BootstrapStyle = "primary" | "inverse" | "success" | "info" | "warning" | "danger";

export class Tag extends Component<TagProps, TagState> {

    constructor(props: TagProps) {
        super(props);

        this.state = {
            alertMessage: props.alertMessage,
            newTag: this.props.newTag,
            tagList: props.tagList
        };
    }

    render() {
        const inputProps = {
            className: "react-tagsinput-input",
            placeholder: this.props.readOnly ? " " : this.props.inputPlaceholder
        };
        return createElement("div",
            {
                className: classNames("widget-tag", `widget-tag-${this.props.tagStyle}`, this.props.className),
                style: this.props.style
            },
            createElement(TagsInput, {
                addOnBlur: true,
                addOnPaste: true,
                className: this.props.readOnly ? "tag-container-readOnly" : "tag-container",
                disabled: this.props.readOnly,
                inputProps,
                inputValue: this.state.newTag,
                onChange: this.handleChange,
                onChangeInput: this.handleChangeInput,
                renderInput: this.props.enableSuggestions ? this.renderAutoComplete : undefined,
                value: this.state.tagList
            }),
            createElement(Alert, { className: "widget-tag-alert" }, this.state.alertMessage)
        );
    }

    componentDidMount() {
        const inputNodeList = document.querySelectorAll(".react-tagsinput-input");
        if (this.props.addTagEvents) {
            this.props.addTagEvents(inputNodeList);
        }
    }

    componentWillReceiveProps(newProps: TagProps) {
        const alertMessage = newProps.tagLimitMessage.replace("{limit}", `${newProps.tagLimit}`);

        this.setState({
            alertMessage: (newProps.tagLimit > 0 && newProps.tagList.length > newProps.tagLimit)
                ? alertMessage
                : newProps.alertMessage,
            tagList: newProps.tagList
        });
    }

    componentWillUnmount() {
        const inputNodeList = document.querySelectorAll(".react-tagsinput-input");
        if (this.props.removeTagEvents) {
            this.props.removeTagEvents(inputNodeList);
        }
    }

    private renderAutoComplete = () => {
        return createElement(AutoComplete, {
            addTag: (tag: string) => this.processTag(tag),
            fetchSuggestions: this.props.fetchSuggestions,
            inputPlaceholder: this.props.inputPlaceholder,
            lazyLoad: this.props.lazyLoad,
            onRemove: this.props.onRemove,
            readOnly: this.props.readOnly,
            suggestions: processSuggestions(this.props.suggestions, this.props.tagList),
            tagList: this.state.tagList
        });
    }

    private handleChangeInput = (newTag: string) => {
        this.setState({ newTag });
    }

    private handleChange = (tagList: string[], changed: string[]) => {
        if (this.props.onRemove && this.state.tagList.length > tagList.length) {
            this.props.onRemove(changed.toString());
            this.setState({ alertMessage: "", tagList });
        } else {
            this.processTag(changed.toString());
        }
    }

    private processTag = (newTag: string) => {
        const { tagLimit, tagLimitMessage, createTag } = this.props;
        const duplicateTag = this.state.tagList.filter(oldTag => oldTag === newTag);

        if (tagLimit === 0 || this.state.tagList.length < tagLimit) {
            if (duplicateTag.length > 0) {
                this.setState({ alertMessage: `Duplicate ${newTag}`, newTag });
            } else if (createTag) {
                this.setState({ alertMessage: "" });
                createTag(newTag);
            }
        } else {
            this.setState({ alertMessage: tagLimitMessage.replace("{limit}", `${tagLimit}`), newTag });
        }
    }
}
