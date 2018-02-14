import { mount, shallow } from "enzyme";
import { createElement } from "react";

import * as TagsInput from "react-tagsinput";
import * as classNames from "classnames";

import { Tag, TagProps } from "../Tag";
import { Alert } from "../Alert";

describe("TagsInput", () => {
    const shallowRenderTag = (props: TagProps) => shallow(createElement(Tag, props));
    const fullRenderTag = (props: TagProps) => mount(createElement(Tag, props));
    const defaultProps: TagProps = {
        className: "",
        enableSuggestions: false,
        inputPlaceholder:  "",
        lazyLoad: false,
        newTag: "",
        readOnly: false,
        style: undefined,
        suggestions: [],
        tagLimit: 5,
        tagLimitMessage: "",
        tagList: [],
        tagStyle: "primary"
    };

    const inputProps = {
        className: "react-tagsinput-input",
        placeholder: ""
    };

    it("renders TagInput structure correctly", () => {
        const tag = shallowRenderTag(defaultProps);

        expect(tag).toBeElement(
            createElement("div", {
                className: classNames(
                    "widget-tag",
                    `widget-tag-${defaultProps.tagStyle}`,
                    defaultProps.className
                ),
                style: defaultProps.style
            }, createElement(TagsInput, {
                addOnBlur: true, addOnPaste: true, className: "tag-container",
                disabled: false, inputProps, inputValue: "", onChange: jasmine.any(Function) as any,
                onChangeInput: jasmine.any(Function) as any, renderInput: jasmine.any(Function) as any, value: []
            }), createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-tag-alert",
                message: ""
            }))
        );
    });

    it("should add tags", () => {
        const newValue = "foo";
        const newProps: TagProps = {
            ...defaultProps,
            createTag: () => jasmine.any(Function) as any
        };

        spyOn(newProps, "createTag").and.callThrough();
        const tag = fullRenderTag(newProps);
        const tagInstance = tag.instance() as any;
        const handleChangeSpy = spyOn(tagInstance, "handleChange").and.callThrough();
        const addEventsSpy = spyOn(tagInstance, "addEvents").and.callThrough();

        tagInstance.componentDidMount();
        tagInstance.componentWillReceiveProps(newProps);
        const input = tag.find("input").simulate("change", { target: { value: newValue } });
        input.simulate("keyDown", { keyCode: 13 });

        expect(handleChangeSpy).toHaveBeenCalled();
        expect(addEventsSpy).toHaveBeenCalled();
        tagInstance.componentWillUnmount();
        setTimeout(() => {
            expect(newProps.createTag).toHaveBeenCalledWith(newValue);
        }, 1000);
    });

    it("should remove tags", () => {
        const newProps: TagProps = {
            ...defaultProps,
            onRemove: () => jasmine.any(Function) as any,
            tagList: [ "tag1", "tag2" ]
        };

        spyOn(newProps, "onRemove").and.callThrough();
        const tag = fullRenderTag(newProps);
        const tagInstance = tag.instance() as any;
        tagInstance.componentWillReceiveProps(newProps);
        const input = tag.find("input").simulate("click", { currentTarget: { childElementCount: 1 } });
        input.simulate("keyDown", { keyCode: 8 });

        expect(tag.state().tagList.length).toEqual(1);
        setTimeout(() => {
            expect(newProps.onRemove).toHaveBeenCalledWith("tag2");
        }, 1000);
    });

    it("show suggestions if they are enabled", () => {
        const tag = fullRenderTag(defaultProps);
        const autoCompleteSpy = spyOn(tag.instance() as any, "renderAutoComplete").and.callThrough();

        tag.setProps({ enableSuggestions: true });
        expect(autoCompleteSpy).toHaveBeenCalled();
    });
});
