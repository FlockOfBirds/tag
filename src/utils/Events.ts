// *** Start of taginput event handling ** //

const handleTagFocus = (event: Event) => {
    const tagInput = event.target as HTMLElement;
    const tagSpan = tagInput.parentElement as HTMLElement;
    const tagContainer = tagSpan.parentElement as HTMLElement;

    tagContainer.classList.add("form-control");
};

const handleTagOnblur = (event: Event) => {
    const tagInput = event.target as HTMLElement;
    const tagSpan = tagInput.parentElement as HTMLElement;
    const tagContainer = tagSpan.parentElement as HTMLElement;

    tagContainer.classList.add("form-control");
    tagContainer.classList.remove("react-tagsinput--focused");
};

export const addTagEvents = (nodes: NodeListOf<Element>) => {
    for (let i = 0; nodes[i]; i++) {
        const node = nodes[i] as HTMLElement;

        node.addEventListener("focus", handleTagFocus, true);
        node.addEventListener("blur", handleTagOnblur, true);
    }
};

export const removeTagEvents = (nodes: NodeListOf<Element>) => {
    for (let i = 0; nodes[i]; i++) {
        const node = nodes[i] as HTMLElement;

        node.removeEventListener("focus", handleTagFocus, true);
        node.removeEventListener("blur", handleTagOnblur, true);
    }
};

// *** End of taginput event handling *** //
