import { mount, shallow } from "enzyme";
import { createElement } from "react";

import * as Autosuggest from "react-autosuggest";

import { AutoComplete, AutoCompleteProps } from "../AutoComplete";

describe("AutoComplete", () => {
    const renderAutoComplete = (props: AutoCompleteProps) => shallow(createElement(AutoComplete, props));
    const fullRenderAutoComplete = (props: AutoCompleteProps) => mount(createElement(AutoComplete, props));
    const defaultProps: AutoCompleteProps = {
        addTag: () => jasmine.any(Function),
        inputPlaceholder: "",
        lazyLoad: false,
        suggestions: [ ]
    };

    it("renders the structure correctly", () => {
        const autoComplete = renderAutoComplete(defaultProps);

        expect(autoComplete).toBeElement(
            createElement(Autosuggest, {
                getSuggestionValue: jasmine.any(Function),
                inputProps: jasmine.any(Object),
                onSuggestionSelected: jasmine.any(Function),
                onSuggestionsClearRequested: jasmine.any(Function),
                onSuggestionsFetchRequested: jasmine.any(Function),
                renderSuggestion: jasmine.any(Function),
                suggestions: []
            })
        );
    });

    it("fetches suggestions when value is specified", () => {
        const suggestion = {
            method: "",
            name: "testValue",
            newValue: "testValue",
            suggestionValue: "testValue",
            value: "testValue"
        };
        const autoComplete = renderAutoComplete(defaultProps);
        const autoCompleteInstance = autoComplete.instance() as any;

        autoCompleteInstance.onSuggestionsFetchRequested(suggestion);
        autoCompleteInstance.getSuggestions(suggestion);
        autoCompleteInstance.onSuggestionSelected(jasmine.any(Event), suggestion);

        expect(autoComplete.state().value).toEqual("");
    });

    it("clears the suggestions when there is no value specified", () => {
        const autoComplete = renderAutoComplete(defaultProps);
        const autoCompleteInstance = autoComplete.instance() as any;
        autoCompleteInstance.onSuggestionsClearRequested();

        expect(autoComplete.state().suggestions).toEqual([]);
    });

    it("should lazyload suggestions suggestions and lazyloading are enabled", () => {
        const newProps: AutoCompleteProps = {
            ...defaultProps,
            fetchSuggestions: () => jasmine.any(Function) as any,
            lazyLoad: true
        };

        const suggestionValue = [ { method: "", name: "Uganda", newValue: "", suggestionValue: "", value: "" } ];
        const suggestions = [ { method: "", name: "Tanzania", newValue: "", suggestionValue: "", value: "" },
        { method: "", name: "Uganda", newValue: "", suggestionValue: "", value: "" },
        { method: "", name: "Kenya", newValue: "", suggestionValue: "", value: "" } ];

        const autoComplete = fullRenderAutoComplete(newProps);
        const autoCompleteInstance = autoComplete.instance() as any;
        const onChangeSpy = spyOn(autoCompleteInstance, "handleOnChange").and.callThrough();
        const renderSuggestions = spyOn(autoCompleteInstance, "renderSuggestion").and.callThrough();

        autoCompleteInstance.componentWillReceiveProps(newProps);
        autoCompleteInstance.fetchSuggestions(newProps);
        autoComplete.find("input").simulate("change", { target: { value: "U" } });
        autoCompleteInstance.onSuggestionsFetchRequested(suggestions);
        autoCompleteInstance.getSuggestions(suggestions);
        autoCompleteInstance.renderSuggestion(suggestions);
        autoCompleteInstance.getSuggestionValue(suggestionValue);

        expect(onChangeSpy).toHaveBeenCalled();
        expect(renderSuggestions).toHaveBeenCalled();
        autoCompleteInstance.componentWillUnmount();
    });

    it("adds a new tag while from selected suggestion", () => {
        const suggestions = {
            method: "type", name: "Canada", newValue: "Uganda",
            suggestionValue: "U", value: "Canada"
        };
        spyOn(defaultProps, "addTag").and.callThrough();

        const autoComplete = renderAutoComplete(defaultProps);
        const autoCompleteInstance = autoComplete.instance() as any;
        autoCompleteInstance.onSuggestionSelected(jasmine.any(Event), suggestions);

        expect(defaultProps.addTag).toHaveBeenCalledTimes(1);
    });
});
