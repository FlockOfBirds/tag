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

        HomePage.textInput.click();
        browser.keys("Backspace");
        HomePage.tagsContainer.waitForVisible();

        expect(HomePage.tagsContainer.getText()).not.toContain(test2);
    });

    it("should show suggestions when user starts typing", () => {
        const result = test2.charAt(0);

        Suggestions.openSuggestion();
        Suggestions.TestInput.waitForVisible();
        Suggestions.TestInput.click();
        Suggestions.TestInput.setValue(result);
        Suggestions.suggestionList.waitForVisible(1000);

        const suggestionList = Suggestions.suggestionList.getText();
        expect(suggestionList).toContain(test2);
    });
});
