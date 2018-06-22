class Suggestions {
    public get TestInput() { return browser.element(".react-autosuggest__input"); }
    public get suggestionList() { return browser.element(".react-autosuggest__suggestions-list"); }

    public openCreate(): void {
        browser.url("/p/create");
    }

    public openSuggestion(): void {
        browser.url("/p/suggestions");
    }
}

const page = new Suggestions();

export default page;
