import { AppPage } from './app.po';
describe('workspace-project App', function () {
    var page;
    beforeEach(function () {
        page = new AppPage();
    });
    it('should display welcome message', function () {
        page.navigateTo();
        expect(page.getParagraphText()).toEqual('Welcome to observable-store!');
    });
});
//# sourceMappingURL=app.e2e-spec.js.map