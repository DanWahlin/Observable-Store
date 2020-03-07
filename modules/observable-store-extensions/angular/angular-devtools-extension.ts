export class AngularDevToolsExtension {
    private window = (window as any);
    private router: any;
    private ngZone: any;

    constructor() {
        
        // Angular with NO Ivy
        if (this.window.ng.probe && this.window.getAllAngularRootElements) {
            const rootElements = this.window.ng.probe(this.window.getAllAngularRootElements()[0]);
            const providers = rootElements.injector.view.root.ngModule._providers;        
            this.router = providers.find(p => p && p.constructor && p.constructor.name === 'Router');
            try {
                this.ngZone = rootElements.injector.get(this.window.ng.coreTokens.NgZone);
            }
            catch (e) {
                console.log(e);
            }
            return;
        }

        // Angular with Ivy
        if (this.window.getAllAngularTestabilities && this.window.getAllAngularRootElements) {
            const testabilities = this.window.getAllAngularTestabilities()[0];
            this.router = testabilities.findProviders(this.window.getAllAngularRootElements()[0], 'Router');
            try {
                this.ngZone = testabilities._ngZone;
            }
            catch (e) {
                console.log(e);
            }
            return;
        }
    }

    navigate(path: string) {
        if (this.ngZone && this.router) {
            this.runInZone(() => {
                this.router.navigateByUrl(path);
            });
        }
    }

    runInZone(action: any) {
        if (this.ngZone) {
            this.ngZone.run(() => {
                action();
            });
        }
    }

}