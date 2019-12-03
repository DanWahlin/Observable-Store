import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevtoolsExtensionConnection, ReduxDevtoolsExtensionConfig } from './interfaces';
import { EMPTY, Observable } from 'rxjs';
import { map, filter, distinctUntilChanged, tap } from 'rxjs/operators';
import { ObservableStoreExtension } from './interfaces';

export class ReduxDevToolsExtension extends ObservableStore<any> implements ObservableStoreExtension {
    private window = (window as any);
    private extensionConnection: ReduxDevtoolsExtensionConnection;
    private devtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];
    private router: any;
    private location: any;
    private ngZone: any;
    private routeTriggered = false;
    private routerPropertyName: string = 'router';

    constructor() {
        super({ trackStateHistory: true, logStateChanges: false });
        this.sync();
    }

    init(config?: ReduxDevtoolsExtensionConfig) {
        this.window.addEventListener('DOMContentLoaded', () => {
            if (this.window.ng && this.window.getAllAngularRootElements) {
                this.hookAngularRouter();
                this.ngZone = this.getNgZone();
            }
        });

        if (!this.devtoolsExtension) {
            return EMPTY;
        }

        if (config && config.routerPropertyName) {
            this.routerPropertyName = config.routerPropertyName;
        }

        return new Observable(subscriber => {
            const connection = this.devtoolsExtension.connect(config);
            this.extensionConnection = connection;
            connection.init(config);
            connection.subscribe((change: any) => subscriber.next(change));
            return connection.unsubscribe;
        })
        .pipe(
            filter((action:any) => action.type === 'DISPATCH')
        )
        .subscribe((action: any) => {
            if (action.payload.type === 'JUMP_TO_STATE' || action.payload.type === 'JUMP_TO_ACTION') {
                if (action.state) {
                    const state = JSON.parse(action.state);
                    if (state[this.routerPropertyName]) {
                        const path = state[this.routerPropertyName].path;
                        if (this.location.path() !== path) {
                            if (this.ngZone) {
                                this.ngZone.run(() => {
                                    this.routeTriggered = true;
                                    this.router.navigateByUrl(path);
                                });
                            }
                        }
                    }
                    this.setDevToolsState(state, 'DEVTOOLS_JUMP');
                }
            }
        });
    }

    private setDevToolsState(state: any, action: string) {
        // #### Run in Angular zone if it's loaded to help with change dectection
        if (this.ngZone) {
            this.ngZone.run(() => {
                this.dispatchDevToolsState(state, action);
            });
            return;
        }

        this.dispatchDevToolsState(state, action);
    }

    private dispatchDevToolsState(state: any, action: string) {
        // Set devtools state for each service but don't dispatch state
        // since it will also dispatch global state by default when setState() is called
        for (let service of ObservableStore.allStoreServices) {
            service.setState(state, action, false);
            // dispatch service state but not global state
            service.dispatchState(state, false);
        }

        // dispatch global state changes
        this.dispatchState(state);
    }

    private getNgZone() {
        try {
            return this.window.ng.probe(this.window.getAllAngularRootElements()[0])
                .injector.get(this.window.ng.coreTokens.NgZone);
        }
        catch (e) {
            console.log(e);
        }

    }

    private sync() {
        this.globalStateChanged.subscribe(() => {
            this.sendStateToDevTool();
        });
    }

    private sendStateToDevTool() {
        if (this.stateHistory && this.stateHistory.length) {
            const lastItem = this.stateHistory[this.stateHistory.length - 1];
            const { action, endState } = lastItem;

            if (action !== 'DEVTOOLS_JUMP') {
                this.extensionConnection.send(action, endState);
            }
        }
    }

    private hookAngularRouter() {
        try {
            const rootElements = this.window.ng.probe(this.window.getAllAngularRootElements()[0]);
            const providers = rootElements.injector.view.root.ngModule._providers;
            this.router = providers.find(p => p && p.constructor && p.constructor.name === 'Router');
            this.location = providers.find(p => p && p.constructor && p.constructor.name === 'Location');
            let currentRoute = '/';

            this.router.events
                .pipe(
                    tap(event => {
                        if (event && event.toString().startsWith('NavigationStart')) {
                            // track where we're currently at before changing to the new route
                            currentRoute = this.location.path(); 
                        }
                    }),
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
                    this.setState({ [this.routerPropertyName]: router }, 'ROUTE_NAVIGATION');
                });
        }
        catch (e) {
            console.log(e);
        }
    }

}