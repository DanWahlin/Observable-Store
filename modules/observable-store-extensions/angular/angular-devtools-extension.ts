// import { filter, map, distinctUntilChanged } from "rxjs/operators";

export class AngularDevToolsExtension {
    private window = (window as any);
    private rootElements: any;
    private router: any;
    private ngZone: any;

    constructor() {
        this.rootElements = this.window.ng.probe(this.window.getAllAngularRootElements()[0]);
        const providers = this.rootElements.injector.view.root.ngModule._providers;        
        this.router = providers.find(p => p && p.constructor && p.constructor.name === 'Router');

        this.ngZone = this.getNgZone();
    }

    navigate(path: string) {
        if (this.ngZone) {
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

    private getNgZone() {
        try {
            return this.rootElements.injector.get(this.window.ng.coreTokens.NgZone);
        }
        catch (e) {
            console.log(e);
        }
    }

}