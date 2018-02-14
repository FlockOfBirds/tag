import { Component, ReactElement, createElement } from "react";
import { TagContainerProps } from "../components/TagContainer";

import { Alert } from "../components/Alert";

export class ValidateConfigs extends Component<TagContainerProps & { showOnError: boolean }, {}> {
    render() {
        const message = ValidateConfigs.validate(this.props);

        if (message) {
            const alertClassName = "widget-tag-text-alert";

            if (this.props.showOnError) {
                return createElement("div", { className: "widget-tag-text-invalid" },
                    createElement(Alert, {
                        bootstrapStyle: "danger",
                        className: alertClassName,
                        message
                    }),
                    this.props.children as ReactElement<TagContainerProps>);
            } else {
                return createElement(Alert, {
                    bootstrapStyle: "danger",
                    className: alertClassName,
                    message
                });
            }
        }

        return this.props.children as ReactElement<TagContainerProps>;
    }

    static parseStyle = (style = ""): {[key: string]: string} => {
        try {
            return style.split(";").reduce<{[key: string]: string}>((styleObject, line) => {
                const pair = line.split(":");
                if (pair.length === 2) {
                    const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                    styleObject[name] = pair[1].trim();
                }
                return styleObject;
            }, {});
        } catch (error) {
            // tslint:disable-next-line no-console
            window.console.log("Failed to parse style", style, error);
        }

        return {};
    }

    static validate(props: TagContainerProps): string {
        const widgetName = "Tag";

        if (props.lazyLoad && !props.enableSuggestions) {
            return `${widgetName}: suggestions must be enabled before being lazyloaded`;
        }

        if (props.tagLimitMessage && props.tagLimitMessage.indexOf("{limit}") === -1) {
            return `${widgetName}: tagLimit message must contain "{limit}" placeholder`;
        }

        return "";
    }
}
