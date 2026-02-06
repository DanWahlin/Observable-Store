import { ReduxDevtoolsExtensionConfig } from '../interfaces';

export class AngularDevToolsExtension {
    private readonly window = window as any;
    private router: any = null;
    private ngZone: any = null;

    constructor(private config?: ReduxDevtoolsExtensionConfig) {
        // Angular with NO Ivy
        if (this.window.ng?.probe && this.window.getAllAngularRootElements) {
            const rootElements = this.window.ng.probe(this.window.getAllAngularRootElements()[0]);
            const providers = rootElements.injector.view.root.ngModule._providers;
            this.router = providers.find((p: any) => p?.constructor?.name === 'Router');
            try {
                this.ngZone = rootElements.injector.get(this.window.ng.coreTokens.NgZone);
            }
            catch (e) {
                console.log(e);
            }
            return;
        }

        // Angular with Ivy
        if (this.window.ng?.getInjector && this.window.getAllAngularRootElements &&
            this.config?.router && this.config?.ngZone) {
            try {
                const injector = this.window.ng.getInjector(this.window.getAllAngularRootElements()[0]);
                this.router = injector.get(this.config.router);
                this.ngZone = injector.get(this.config.ngZone);
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    navigate(path: string): void {
        if (this.ngZone && this.router) {
            this.runInZone(() => {
                this.router.navigateByUrl(path);
            });
        }
    }

    runInZone(action: () => void): void {
        if (this.ngZone) {
            this.ngZone.run(() => {
                action();
            });
        }
    }
}
