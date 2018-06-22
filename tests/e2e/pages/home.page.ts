class HomePage {
    public get textInput() { return browser.element(".react-tagsinput-input"); }
    public get tagsContainer() { return browser.element(".tag-container"); }

    public open(): void {
        browser.url("/");
    }
}

const page = new HomePage();

export default page;
