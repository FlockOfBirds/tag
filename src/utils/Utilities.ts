import { Suggestion } from "./../components/AutoComplete";

export const processSuggestions = (newSuggestions: string[], currentTags: string[]): Suggestion[] => {
    const suggestionFilter = compareElemets(newSuggestions, currentTags);
    const suggestions: Suggestion[] = suggestionFilter.map(suggestion => ({
        method: "",
        name: suggestion,
        newValue: "",
        suggestionValue: "",
        value: ""
    }));

    return suggestions;
};

const compareElemets = (suggestions: string[], tags: string[]) => {
    // get difference of 2 arrays
    const diff = suggestions.filter(x => tags.indexOf(x) < 0);

    return diff;
};
