export class ReactDevToolsExtension {

    private location: string;
    routeTriggered = false;

    constructor(private devToolsService: any, private routerPropertyName: string, private history: any) {
        this.hookRouter();
    }

    navigate(path: string) {
        if (window.location.pathname !== path) {
            console.log('navigate', path);
            this.routeTriggered = true;
            this.history.push(path);
        }
    }

    hookRouter() {
        try {
            const currentPath = window.location.pathname;
            this.devToolsService.setState({ [this.routerPropertyName]: { path: currentPath } }, `ROUTE_NAVIGATION [${currentPath}]`);

            window.history.pushState = (f => function pushState() {
                var ret = f.apply(this, arguments);
                window.dispatchEvent(new CustomEvent('pushstate', { detail: window.location.pathname }));
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
                return ret;
            })(window.history.pushState);
            
            window.history.replaceState = (f => function replaceState() {
                var ret = f.apply(this, arguments);
                window.dispatchEvent(new CustomEvent('replacestate', { detail: window.location.pathname }));
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
                return ret;
            })(window.history.replaceState);
            
            window.addEventListener('popstate', () => {
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
            });

            window.addEventListener('locationchange', (e: CustomEvent) => {
                if (!this.routeTriggered) {
                    const path = e.detail;
                    this.devToolsService.setState({ [this.routerPropertyName]: { path } }, `ROUTE_NAVIGATION [${path}]`);
                }
                else {
                    this.routeTriggered = false;
                }
            });            
        }
        catch (e) {
            console.log(e);
        }
    }

}