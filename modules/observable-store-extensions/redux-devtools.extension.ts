import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevtoolsExtensionConnection, ReduxDevtoolsExtensionConfig } from './interfaces';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { ObservableStoreExtension } from './interfaces';
import { AngularDevToolsExtension } from './angular/angular-devtools-extension';

export class ReduxDevToolsExtension extends ObservableStore<any> implements ObservableStoreExtension {
    private window = (window as any);
    private require = this.window.require;
    private devToolsExtensionConnection: ReduxDevtoolsExtensionConnection;
    private devtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];
    private routerPropertyName = '__router';
    private devToolsActionName = '__action';
    private angularExtension: AngularDevToolsExtension;
    private isAngular = this.checkIsAngular();
    private isReact = this.checkIsReact();
    private routeTriggeredByDevTools = false;
    private sub: Subscription;

    constructor(private config?: ReduxDevtoolsExtensionConfig) {
        super({ trackStateHistory: true, logStateChanges: false });
    }

    init() {
        this.sync();

        this.window.addEventListener('DOMContentLoaded', () => {
            if (this.isAngular) {
                this.angularExtension = new AngularDevToolsExtension();
            }

            this.hookRouter();
        });

        if (this.devtoolsExtension) {
            if (this.config && this.config.routerPropertyName) {
                this.routerPropertyName = this.config.routerPropertyName;
            }
            this.sub = this.connect();
        }
    }

    private connect(config?: ReduxDevtoolsExtensionConfig) {
        return new Observable(subscriber => {
            const connection = this.devtoolsExtension.connect(config);
            this.devToolsExtensionConnection = connection;
            connection.init(config);
            connection.subscribe((change: any) => subscriber.next(change));
            return connection.unsubscribe;
        })
        .subscribe((action: any) => this.processDevToolsAction(action));
    }

    private disconnect() {
        if (this.devtoolsExtension) {
            this.devtoolsExtension.disconnect();
            if (this.sub) {
                this.sub.unsubscribe();
            }
        }        
    }

    private processDevToolsAction(action: any) {
        // Called as user interacts with Redux Devtools controls
        if (action.type === Actions.DISPATCH) {
            if (action.payload.type === Actions.JUMP_TO_STATE || action.payload.type === Actions.JUMP_TO_ACTION) {
                if (action.state) {
                    const actionState = JSON.parse(action.state);
                    if (actionState && actionState.__devTools) {
                        // If we have a route then navigate to it
                        if (actionState.__devTools.router) {
                            this.navigateToPath(actionState);
                        }                        
                        this.setStateFromDevTools(actionState, `${actionState.__devTools.action} [${Actions.REDUX_DEVTOOLS_JUMP}]`);
                    }
                }
            }
        }
    }

    private navigateToPath(actionState: any) {
        const path = actionState.__devTools.router.path;
        if (window.location.pathname !== path) {
            // Ensure route info doesn't make it into the devtool
            // since the devtool is actually triggering the route
            // rather than an end user interacting with the app.
            // It will be set to false in this.hookRouter().
            this.routeTriggeredByDevTools = true;
            if (this.config && this.config.customRouteNavigator) {
                this.config.customRouteNavigator.navigate(path);
                return;
            }

            if (this.isAngular) {
                this.angularExtension.navigate(path);
                return;
            }
            
            if (this.isReact && (this.config && this.config.reactRouterHistory)) {
                this.config.reactRouterHistory.push(path);
                return;
            }
        }
    }

    private setStateFromDevTools(state: any, action: string) {
        // #### Run in Angular zone if it's loaded to help with change dectection
        if (this.angularExtension) {
            this.angularExtension.runInZone(() => this.dispatchDevToolsState(state, action));
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

    private sync() {
        this.globalStateChanged.subscribe(() => {
            this.sendStateToDevTool();
        });
    }

    private sendStateToDevTool() {
        if (this.stateHistory && this.stateHistory.length) {
            const lastItem = this.stateHistory[this.stateHistory.length - 1];
            const { action, endState } = lastItem;

            if (!action.endsWith(Actions.REDUX_DEVTOOLS_JUMP + ']')) {
                // Adding action value here since there's no way to retrieve it when
                // it's dispatched from the redux devtools
                this.devToolsExtensionConnection.send(action, { 
                    ...endState, 
                    __devTools: { ...endState.__devTools, action } 
                });
            }
        }
    }

    private hookRouter() {
        try {
            const path = window.location.pathname;
            this.setState({ 
                __devTools: { 
                    router: { path },
                    action: Actions.ROUTE_NAVIGATION
                }
            }, `${Actions.ROUTE_NAVIGATION} [${path}]`);

            window.history.pushState = (f => function() {
                var ret = f.apply(this, arguments);
                window.dispatchEvent(new CustomEvent('pushstate', { detail: window.location.pathname }));
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
                return ret;
            })(window.history.pushState);
            
            window.history.replaceState = (f => function() {
                var ret = f.apply(this, arguments);
                window.dispatchEvent(new CustomEvent('replacestate', { detail: window.location.pathname }));
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
                return ret;
            })(window.history.replaceState);
            
            window.addEventListener('popstate', () => {
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
            });

            window.addEventListener('locationchange', (e: CustomEvent) => {
                if (!this.routeTriggeredByDevTools) {
                    const path = e.detail;
                    this.setState({ 
                        __devTools: { 
                            router: { path },
                            action: Actions.ROUTE_NAVIGATION
                        }
                    }, `${Actions.ROUTE_NAVIGATION} [${path}]`);
                }
                else {
                    this.routeTriggeredByDevTools = false;
                }
            });            
        }
        catch (e) {
            console.log(e);
        }
    }

    private checkIsReact() {
        const isReact = (this.window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            this.window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers &&
            this.window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers.length) ||
            this.window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ || this.window.React ||
            (this.window.require && (this.require('react') || this.require('React')));
        return isReact;
    }

    private checkIsAngular() {
        return this.window.ng;
    }

}

enum Actions {
    DISPATCH = 'DISPATCH',
    JUMP_TO_STATE = 'JUMP_TO_STATE',
    JUMP_TO_ACTION = 'JUMP_TO_ACTION',
    REDUX_DEVTOOLS_JUMP = 'REDUX_DEVTOOLS_JUMP',
    ROUTE_NAVIGATION = 'ROUTE_NAVIGATION'
}