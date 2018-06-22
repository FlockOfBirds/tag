import { mount, shallow } from "enzyme";
import { createElement } from "react";

import * as Autosuggest from "react-autosuggest";

import { AutoComplete, AutoCompleteProps } from "../AutoComplete";

describe("AutoComplete", () => {
    const renderAutoComplete = (props: AutoCompleteProps) => shallow(createElement(AutoComplete, props), { disableLifecycleMethods: true });
    const fullRenderAutoComplete = (props: AutoCompleteProps) => mount(createElement(AutoComplete, props));
    const defaultProps: AutoCompleteProps = {
        addTag: () => jasmine.any(Function),
        inputPlaceholder: "",
        lazyLoad: false,
        suggestions: [ ]
    };
    const suggestions = [ { method: "", name: "Tanzania", newValue: "", suggestionValue: "", value: "" },
    { method: "", name: "Uganda", newValue: "", suggestionValue: "", value: "" },
    { method: "", name: "Kenya", newValue: "", suggestionValue: "", value: "" } ];

    const renderedSuggestion = `<li role="option" id="react-autowhatever-1--item-0"
        aria-selected="false" class="react-autosuggest__suggestion react-autosuggest__suggestion--first"
        data-suggestion-index="0"><span class="">Kenya</span></li>`;

    const customProps: AutoCompleteProps = {
        addTag: () => jasmine.any(Function),
        fetchSuggestions: () => jasmine.any(Function),
        inputPlaceholder: "",
        lazyLoad: true,
        suggestions
    };

    it("renders the structure correctly", () => {
        const autoCompleteComponent: any = renderAutoComplete(defaultProps);

        expect(autoCompleteComponent.getElement(0)).toBeElement(
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

    it("should update suggestions based on user input", () => {
        const autoComplete = renderAutoComplete(customProps);
        const autoCompleteInstance = autoComplete.instance() as any;

        autoCompleteInstance.onSuggestionsFetchRequested({ reason: "input-changed", value: "K" });
        autoCompleteInstance.getSuggestions({ reason: "input-changed", value: "K" });
        spyOn(autoCompleteInstance, "renderSuggestion").and.returnValue(renderedSuggestion);
        autoCompleteInstance.renderSuggestion(customProps.suggestions);

        expect(autoCompleteInstance.renderSuggestion).toHaveBeenCalledWith(customProps.suggestions);
    });

    it("should allow user input", () => {
        const autoCompleteInstance = fullRenderAutoComplete(customProps);
        autoCompleteInstance.setProps({ lazyLoad: true });
        autoCompleteInstance.find("input").simulate("change", { target: { value: "K" } });

        expect(autoCompleteInstance.state().value).toBe("K");
    });

    it("should render suggestions when they are lazyload", () => {
        const autoComplete = renderAutoComplete(customProps);
        const autoCompleteInstance = autoComplete.instance() as any;

        autoCompleteInstance.onSuggestionsFetchRequested({ reason: "input-changed", value: "K" });
        autoCompleteInstance.getSuggestions({ reason: "input-changed", value: "K" });
        spyOn(autoCompleteInstance, "renderSuggestion").and.returnValue(renderedSuggestion);
        autoCompleteInstance.renderSuggestion(customProps.suggestions);

        expect(autoCompleteInstance.renderSuggestion).toHaveBeenCalledWith(customProps.suggestions);
    });

    it("should fetch suggestions when lazyload is set to true", () => {
        const autoComplete = renderAutoComplete(customProps);
        const autoCompleteInstance = autoComplete.instance() as any;

        autoCompleteInstance.onSuggestionsFetchRequested({ reason: "input-changed", value: "K" });
        autoCompleteInstance.getSuggestions({ reason: "input-changed", value: "K" });
        spyOn(autoCompleteInstance, "fetchSuggestions").and.callThrough();
        autoCompleteInstance.fetchSuggestions(customProps);

        expect(autoCompleteInstance.fetchSuggestions).toHaveBeenCalled();
    });

    it("should add a new tag when selected from suggestion", () => {
        const newSuggestions = {
            method: "type", name: "Canada", newValue: "Uganda", suggestionValue: "U", value: "Canada"
        };
        spyOn(defaultProps, "addTag").and.callThrough();

        const autoComplete = renderAutoComplete(defaultProps);
        const autoCompleteInstance = autoComplete.instance() as any;
        autoCompleteInstance.onSuggestionSelected(jasmine.any(Event), newSuggestions);

        expect(defaultProps.addTag).toHaveBeenCalledTimes(1);
        autoCompleteInstance.componentWillUnmount();
    });
});
