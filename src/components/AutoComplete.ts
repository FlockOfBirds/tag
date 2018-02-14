import { Component, createElement } from "react";
import * as ReactDOM from "react-dom";

import * as Autosuggest from "react-autosuggest";

export interface Suggestion {
    method: string;
    name: string;
    newValue: string;
    suggestionValue: string;
    value: string;
}

export interface AutoCompleteProps {
    addTag: (tag: string) => void;
    fetchSuggestions?: () => void;
    inputPlaceholder: string;
    lazyLoad?: boolean;
    onRemove?: (tag: string) => void;
    readOnly?: boolean;
    suggestions: Suggestion[];
    tagList?: string[];
}

interface AutoCompleteState {
    lazyloaded: boolean;
    newValue: string;
    suggestions: Suggestion[];
    suggestionsLazyLoaded: Suggestion[];
    value: string;
}

export class AutoComplete extends Component<AutoCompleteProps, AutoCompleteState> {
    private node: Element;
    private suggestionContainer: Element;

    constructor(props: AutoCompleteProps) {
        super(props);

        this.state = {
            lazyloaded: false,
            newValue: "",
            suggestions: [],
            suggestionsLazyLoaded: [],
            value: ""
        };

        this.getSuggestions = this.getSuggestions.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.handleOnblur = this.handleOnblur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            onBlur: this.handleOnblur,
            onChange: this.handleOnChange,
            placeholder: this.props.readOnly ? " " : this.props.inputPlaceholder,
            type: "search",
            value
        };

        return createElement(Autosuggest, {
            getSuggestionValue: this.getSuggestionValue,
            inputProps,
            onSuggestionSelected: this.onSuggestionSelected,
            onSuggestionsClearRequested: this.onSuggestionsClearRequested,
            onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
            renderSuggestion: this.renderSuggestion,
            suggestions
        });
    }

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        const suggestionInput = this.node.querySelectorAll(".react-autosuggest__input");
        if (this.node.firstElementChild) {
            this.suggestionContainer = this.node.firstElementChild.nextElementSibling as Element;
        }
        if (suggestionInput) {
            this.addEventListener(suggestionInput);
        }
    }

    componentWillReceiveProps(newProps: AutoCompleteProps) {
        if (newProps.lazyLoad && !this.state.lazyloaded) {
            this.setState({
                lazyloaded: true,
                suggestionsLazyLoaded: newProps.suggestions
            });
        }
    }

    componentWillUnmount() {
        const suggestionInput = this.node.querySelectorAll(".react-autosuggest__input");
        if (suggestionInput) {
            this.removeEventsListeners(suggestionInput);
        }
    }

    // Call this function every time you need to update suggestions in state.
    private onSuggestionsFetchRequested(suggestion: Suggestion) {
        this.setState({ suggestions: this.getSuggestions(suggestion) });
    }

    // Calculate suggestions from the input value.
    private getSuggestions(suggestion: Suggestion) {
        let inputValue = "";
        if (suggestion.value) {
            inputValue = suggestion.value.trim().toLowerCase();
        }
        const inputLength = inputValue.length;
        const { suggestionsLazyLoaded } = this.state;

        if (this.props.lazyLoad && suggestionsLazyLoaded.length > 0) {
            const result = suggestionsLazyLoaded.filter(suggest => suggest.name.toLowerCase().includes(inputValue));

            return inputLength === 0 ? [] : result.slice(0, 1000);
        }
        return inputLength === 0 ? [] : this.props.suggestions.filter(suggest =>
            suggest.name.toLowerCase().includes(inputValue)
        );
    }

    // When suggestion is clicked, Teach Autosuggest how to calculate the
    // input value for every given suggestion.
    private getSuggestionValue(suggestion: Suggestion): string {
        return suggestion.name;
    }

    private renderSuggestion(suggestion: Suggestion) {
        return createElement("span", { className: "" }, suggestion.name);
    }

    private onSuggestionSelected(_event: Event, suggestion: Suggestion) {
        this.props.addTag(suggestion.suggestionValue);
        this.setState({ value: "" });
    }

    private onSuggestionsClearRequested() {
        this.setState({ suggestions: this.props.suggestions });
    }

    private handleOnChange(_event: Event, inputObject: Suggestion) {
        if (inputObject.method === "type" && this.props.lazyLoad) {
            this.suggestionContainer.classList.add("loader");
            setTimeout(() => {
                this.fetchSuggestions(this.props);
                this.suggestionContainer.classList.remove("loader");
            }, 1000);
            this.setState({ value: inputObject.newValue });
        } else {
            this.setState({ value: inputObject.newValue });
        }
    }

    private fetchSuggestions(props: AutoCompleteProps) {
        if (props.fetchSuggestions && props.lazyLoad) {
            props.fetchSuggestions();
        }
    }

    private addEventListener(nodes: NodeListOf<Element>) {
        for (let i = 0; nodes[i]; i++) {
            const node = nodes[i] as HTMLElement;
            const suggestionContainer = node.parentNode as HTMLElement;
            const suggestionSpan = suggestionContainer.parentNode as HTMLElement;
            const tagContainer = suggestionSpan.parentNode as HTMLElement;

            if (tagContainer) {
                tagContainer.addEventListener("focus", this.hundleContainerFocus, true);
                tagContainer.addEventListener("click", this.hundleClick, true);
            }
            if (node) {
                node.addEventListener("keydown", this.handleKeyPress, true);
                node.addEventListener("focus", this.handleFocus, true);
            }
        }
    }

    private removeEventsListeners(nodes: NodeListOf<Element>) {
        for (let i = 0; nodes[i]; i++) {
            const node = nodes[i] as HTMLElement;
            const suggestionContainer = node.parentNode as HTMLElement;
            const suggestionSpan = suggestionContainer.parentNode as HTMLElement;
            const tagContainer = suggestionSpan.parentNode as HTMLElement;

            if (tagContainer) {
                tagContainer.removeEventListener("focus", this.hundleContainerFocus, true);
                tagContainer.removeEventListener("click", this.hundleClick, true);
            }
            if (node) {
                node.removeEventListener("keydown", this.handleKeyPress, true);
                node.removeEventListener("focus", this.handleFocus, true);
            }
        }
    }

    private hundleClick(event: Event) {
        const tagContainer = event.target as HTMLElement;
        const suggestionInput = tagContainer.getElementsByTagName("input")[0];

        if (suggestionInput !== undefined) {
            suggestionInput.focus();
        }
    }

    private handleFocus(event: Event) {
        const suggestionInput = event.target as HTMLElement;
        const inputContainer = suggestionInput.parentElement as HTMLElement;
        const tagSpan = inputContainer.parentElement as HTMLElement;
        const tagContainer = tagSpan.parentElement as HTMLElement;

        tagContainer.classList.add("react-tagsinput--focused");
        tagContainer.classList.add("form-control");
    }

    private hundleContainerFocus(event: Event) {
        const tagContainer = event.target as HTMLElement;
        const suggestionInput = tagContainer.getElementsByTagName("input")[0];

        if (suggestionInput !== undefined) {
            suggestionInput.focus();
        }
    }

    private handleOnblur(event: Event) {
        const suggestionInput = event.target as HTMLInputElement;
        const suggestContainer = suggestionInput.parentElement as HTMLElement;
        const span = suggestContainer.parentElement as HTMLElement;
        const spanContainer = span.parentElement as HTMLElement;
        const focus = "react-tagsinput--focused";
        suggestionInput.classList.remove("react-autosuggest__input--focused");
        suggestionInput.classList.remove("mx-focus");

        if (spanContainer.classList.contains(focus)) {
            spanContainer.classList.remove(focus);
        }
        // Add tag
        if (suggestionInput.defaultValue) {
            this.props.addTag(suggestionInput.defaultValue);
            this.setState({ value: "" });
        }
    }

    private handleKeyPress(event: Event) {
        const input = event.target as HTMLInputElement;
        const keyPress = event as KeyboardEvent;
        const { onRemove, tagList } = this.props;

        if (keyPress.code === "Enter" && keyPress.keyCode === 13 && input.defaultValue) {
            this.props.addTag(input.defaultValue);
            this.setState({ value: "" });
        } else if (keyPress.key === "Backspace" && keyPress.keyCode === 8 && onRemove && tagList) {
            if (tagList.length > 0 && !input.defaultValue) {
                const tagToRemove = tagList.slice(-1).toString();
                onRemove(tagToRemove);
            }
        }
    }
}
