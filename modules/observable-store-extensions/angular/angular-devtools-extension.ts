import { filter, map, distinctUntilChanged } from "rxjs/operators";

export class AngularDevToolsExtension {
    private window = (window as any);
    private rootElements: any;
    private providers: any;
    private router: any;
    private location: any;
    private routeTriggered = false;
    private ngZone: any;

    constructor(private devToolsService: any, private routerPropertyName: string) {
        this.rootElements = this.window.ng.probe(this.window.getAllAngularRootElements()[0]);
        this.providers = this.rootElements.injector.view.root.ngModule._providers;
        
        this.router = this.providers.find(p => p && p.constructor && p.constructor.name === 'Router');
        this.location = this.providers.find(p => p && p.constructor && p.constructor.name === 'Location');

        this.ngZone = this.getNgZone();
        if (this.router) {
            this.hookRouter();
        }
    }

    runInZone(action: any) {
        this.ngZone.run(() => {
            action();
        });
    }

    navigate(path: any) {
        if (this.location.path() !== path) {
            this.runInZone(() => {
                this.routeTriggered = true;
                this.router.navigateByUrl(path);
            });
        }
    }

    hookRouter() {
        try {
            this.router.events
                .pipe(
                    filter(event => {
                        const navEnd = event.toString().startsWith('NavigationEnd');
                        // See if router.navigateByUrl() was triggered by the extension
                        // if so then don't add the route into the state
                        if (navEnd && this.routeTriggered) {
                            this.routeTriggered = false;
                            return false;
                        }
                        return navEnd;
                    }),
                    map(event => {
                        return { path: this.location.path() };
                    }),
                    distinctUntilChanged()
                ).subscribe(router => {
                    this.devToolsService.setState({ [this.routerPropertyName]: router }, `ROUTE_NAVIGATION [${router.path}]`);
                });

        }
        catch (e) {
            console.log(e);
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