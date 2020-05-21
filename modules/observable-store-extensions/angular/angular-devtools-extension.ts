import { ReduxDevtoolsExtensionConfig } from "interfaces";

export class AngularDevToolsExtension {
    private window = (window as any);
    private router: any;
    private ngZone: any;

    constructor(private config?: ReduxDevtoolsExtensionConfig) {
        
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
        if (this.window.ng.getInjector && this.window.getAllAngularRootElements && 
            this.config && this.config.router && this.config.ngZone) {
            try {
                // const injector = this.window.ng.getInjector(this.window.getAllAngularRootElements()[0]);
                // this.router = injector.get(this.config.router);
                // this.ngZone = injector.get(this.config.ngZone);
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