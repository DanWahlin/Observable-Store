// import { filter, map, distinctUntilChanged } from "rxjs/operators";

export class AngularDevToolsExtension {
    private window = (window as any);
    private rootElements: any;
    private router: any;
    private ngZone: any;
    // private providers: any;
    // private location: any;
    // private routeTriggered = false;

    constructor() {
        this.rootElements = this.window.ng.probe(this.window.getAllAngularRootElements()[0]);
        const providers = this.rootElements.injector.view.root.ngModule._providers;        
        this.router = providers.find(p => p && p.constructor && p.constructor.name === 'Router');
        // this.location = this.providers.find(p => p && p.constructor && p.constructor.name === 'Location');

        this.ngZone = this.getNgZone();

        // if (this.router) {
        //     this.hookRouter();
        // }
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

    // hookRouter() {
    //     try {
    //         const currentPath = this.location.path();
    //         this.devToolsService.setState({ [this.routerPropertyName]: { path: currentPath } }, `ROUTE_NAVIGATION [${currentPath}]`);

    //         this.router.events
    //             .pipe(
    //                 filter(event => {
    //                     const navEnd = event.toString().startsWith('NavigationEnd');
    //                     // See if router.navigateByUrl() was triggered by the extension
    //                     // if so then don't add the route into the state
    //                     if (navEnd && this.routeTriggered) {
    //                         this.routeTriggered = false;
    //                         return false;
    //                     }
    //                     return navEnd;
    //                 }),
    //                 map(event => {
    //                     return { path: this.location.path() };
    //                 }),
    //                 distinctUntilChanged()
    //             ).subscribe(router => {
    //                 this.devToolsService.setState({ [this.routerPropertyName]: router }, `ROUTE_NAVIGATION [${router.path}]`);
    //             });

    //     }
    //     catch (e) {
    //         console.log(e);
    //     }
    // }

}