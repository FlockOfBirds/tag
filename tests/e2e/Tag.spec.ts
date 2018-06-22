import HomePage from "./pages/home.page";
import Suggestions from "./pages/suggestions.page";

const test1 = "test1";
const test2 = "test2";

describe("TagInput", () => {

    it("should add a new tag", () => {
        HomePage.open();
        HomePage.textInput.waitForVisible();
        HomePage.textInput.click();
        HomePage.textInput.setValue(test1);

        browser.keys("Enter");
        HomePage.tagsContainer.waitForVisible();

        expect(HomePage.tagsContainer.getText()).toContain(test1);
    });

    it("should remove a tag if exists", () => {
        HomePage.open();
        HomePage.textInput.waitForVisible();
        HomePage.textInput.click();

        HomePage.textInput.setValue(test2);
        browser.keys("Enter");
        HomePage.textInput.click();
        browser.keys("Backspace");
        HomePage.tagsContainer.waitForValue();

        expect(HomePage.tagsContainer.getText()).not.toContain(test2);
    });

    it("should show suggestions when user starts typing", () => {
        const suggestion = test1.charAt(0);

        Suggestions.openSuggestion();
        Suggestions.TestInput.waitForExist();
        Suggestions.TestInput.click();
        browser.keys("Backspace");
        Suggestions.TestInput.setValue(suggestion);
        Suggestions.suggestionList.waitForExist();

        const suggestionList = Suggestions.suggestionList.getText();
        expect(suggestionList).toContain(test2);
    });
});
