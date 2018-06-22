import { Component, createElement } from "react";

import { Tag, TagProps } from "./components/Tag";
import { TagContainerProps } from "./components/TagContainer";

import { ValidateConfigs } from "./utils/ValidateConfigs";

declare function require(name: string): string;

// tslint:disable-next-line class-name
export class preview extends Component<TagContainerProps, {}> {
    render() {
        return createElement(ValidateConfigs, {
            ...this.props as TagContainerProps,
            showOnError: true
        }, createElement(Tag, preview.transformProps(this.props)));
    }

    private static transformProps(props: TagContainerProps): TagProps {

        return {
            inputPlaceholder: props.inputPlaceholder,
            newTag: "",
            readOnly: props.editable === "never",
            style: {},
            suggestions: [ ],
            tagLimit: props.tagLimit,
            tagLimitMessage: props.tagLimitMessage,
            tagList: [ "tag1", "tag2" ],
            tagStyle: props.tagStyle
        };
    }
}

export function getPreviewCss() {
    return (
        require("./ui/Tag.scss") +
        require("react-tagsinput/react-tagsinput.css")
    );
}
