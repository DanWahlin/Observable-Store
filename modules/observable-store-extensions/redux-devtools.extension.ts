import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevtoolsExtensionConnection, ReduxDevtoolsExtensionConfig, ObservableStoreExtension } from './interfaces';
import { Observable, Subscription } from 'rxjs';
import { AngularDevToolsExtension } from './angular/angular-devtools-extension';

const enum Actions {
    DISPATCH = 'DISPATCH',
    JUMP_TO_STATE = 'JUMP_TO_STATE',
    JUMP_TO_ACTION = 'JUMP_TO_ACTION',
    REDUX_DEVTOOLS_JUMP = 'REDUX_DEVTOOLS_JUMP',
    ROUTE_NAVIGATION = 'ROUTE_NAVIGATION',
    IMPORT_STATE = 'IMPORT_STATE'
}

export class ReduxDevToolsExtension extends ObservableStore<any> implements ObservableStoreExtension {
    private readonly window = window as any;
    private readonly require = this.window.require;
    private devToolsExtensionConnection: ReduxDevtoolsExtensionConnection | null = null;
    private readonly devtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];
    private angularExtension: AngularDevToolsExtension | null = null;
    private readonly isReact = this.checkIsReact();
    private routeTriggeredByDevTools = false;
    private sub: Subscription | null = null;

    constructor(private config?: ReduxDevtoolsExtensionConfig) {
        super({ trackStateHistory: true, logStateChanges: false });
    }

    init(): void {
        this.sync();

        this.window.addEventListener('DOMContentLoaded', () => {
            if (this.checkIsAngular()) {
                this.angularExtension = new AngularDevToolsExtension(this.config);
            }

            this.hookRouter();
        });

        this.connect();
    }

    private connect(config?: ReduxDevtoolsExtensionConfig): void {
        if (this.devtoolsExtension) {
            this.sub = new Observable(subscriber => {
                const connection = this.devtoolsExtension.connect(config);
                this.devToolsExtensionConnection = connection;
                connection.init(config);
                connection.subscribe((change: unknown) => subscriber.next(change));
                return connection.unsubscribe;
            })
            .subscribe((action: any) => this.processDevToolsAction(action));
        }
    }

    private disconnect(): void {
        if (this.devtoolsExtension) {
            this.devtoolsExtension.disconnect();
            this.sub?.unsubscribe();
        }
    }

    private processDevToolsAction(action: any): void {
        // Called as user interacts with Redux Devtools controls
        if (action?.type === Actions.DISPATCH) {
            switch (action.payload.type) {
                case Actions.JUMP_TO_STATE:
                case Actions.JUMP_TO_ACTION:
                    if (action.state) {
                        const actionState = JSON.parse(action.state);
                        if (actionState?.__devTools) {
                            // Track that we're "debugging" with the devtools so the state/action doesn't get sent back to the devtools
                            actionState.__devTools.debugging = true;
                            // If we have a route then navigate to it
                            if (actionState.__devTools.router) {
                                this.navigateToPath(actionState);
                            }
                            this.setStateFromDevTools(actionState, `${actionState.__devTools.action} [${Actions.REDUX_DEVTOOLS_JUMP}]`);
                        }
                    }
                    break;
                case Actions.IMPORT_STATE:
                    this.loadState(action);
                    break;
            }
        }
    }

    private loadState(action: any): void {
        // clear existing state from devtools
        this.disconnect();
        this.connect();
        if (action.payload) {
            const nextLiftedState = action.payload.nextLiftedState;
            if (nextLiftedState?.computedStates) {
                nextLiftedState.computedStates.shift();
                for (const computedState of nextLiftedState.computedStates) {
                    if (computedState.state?.__devTools) {
                        this.devToolsExtensionConnection!.send(computedState.state.__devTools.action, computedState.state);
                    }
                }
            }
        }
    }

    private navigateToPath(actionState: any): void {
        const path = actionState.__devTools.router.path;
        if (window.location.pathname !== path) {
            // Ensure route info doesn't make it into the devtool
            // since the devtool is actually triggering the route
            // rather than an end user interacting with the app.
            this.routeTriggeredByDevTools = true;

            if (this.config?.customRouteNavigator) {
                this.config.customRouteNavigator.navigate(path);
                return;
            }

            if (this.checkIsAngular()) {
                this.angularExtension!.navigate(path);
                return;
            }

            if (this.isReact && this.config?.reactRouterHistory) {
                this.config.reactRouterHistory.push(path);
                return;
            }
        }
    }

    private setStateFromDevTools(state: any, action: string): void {
        // Run in Angular zone if it's loaded to help with change detection
        if (this.angularExtension) {
            this.angularExtension.runInZone(() => this.dispatchDevToolsState(state, action));
            return;
        }

        this.dispatchDevToolsState(state, action);
    }

    private dispatchDevToolsState(state: any, action: string): void {
        // Set devtools state for each service but don't dispatch state
        // since it will also dispatch global state by default when setState() is called
        for (const service of ObservableStore.allStoreServices as any[]) {
            service.setState(state, action, false);
            // dispatch service state but not global state
            service.dispatchState(state, false);
        }

        // dispatch global state changes
        this.dispatchState(state);
    }

    private sync(): void {
        this.globalStateChanged.subscribe((state: any) => {
            if (this.devToolsExtensionConnection) {
                // See if we're debugging (time travel or jump actions) using the redux devtools
                if (state?.__devTools?.debugging) {
                    // delete debugging property to avoid clutter in __devTools property
                    delete state.__devTools.debugging;
                }
                else {
                    this.sendStateToDevTool();
                }
            }
        });
    }

    private sendStateToDevTool(): void {
        if (this.stateHistory?.length) {
            const lastItem = this.stateHistory[this.stateHistory.length - 1];
            const { action, endState } = lastItem;

            if (!action.endsWith(Actions.REDUX_DEVTOOLS_JUMP + ']')) {
                // Adding action value here since there's no way to retrieve it when
                // it's dispatched from the redux devtools
                this.devToolsExtensionConnection!.send(action, {
                    ...endState,
                    __devTools: { ...(endState as any).__devTools, action }
                });
            }
        }
    }

    private hookRouter(): void {
        try {
            const path = window.location.pathname;
            this.setState({
                __devTools: {
                    router: { path },
                    action: Actions.ROUTE_NAVIGATION
                }
            }, `${Actions.ROUTE_NAVIGATION} [${path}]`);

            window.history.pushState = (f => function(this: History) {
                const ret = f.apply(this, arguments as any);
                window.dispatchEvent(new CustomEvent('pushstate', { detail: window.location.pathname }));
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
                return ret;
            })(window.history.pushState);

            window.history.replaceState = (f => function(this: History) {
                const ret = f.apply(this, arguments as any);
                window.dispatchEvent(new CustomEvent('replacestate', { detail: window.location.pathname }));
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
                return ret;
            })(window.history.replaceState);

            window.addEventListener('popstate', () => {
                window.dispatchEvent(new CustomEvent('locationchange', { detail: window.location.pathname }));
            });

            window.addEventListener('locationchange', (e: Event) => {
                const detail = (e as CustomEvent).detail;
                if (!this.routeTriggeredByDevTools) {
                    this.setState({
                        __devTools: {
                            router: { path: detail },
                            action: Actions.ROUTE_NAVIGATION
                        }
                    }, `${Actions.ROUTE_NAVIGATION} [${detail}]`);
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

    private checkIsReact(): boolean {
        return !!(this.window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            this.window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers &&
            this.window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers.length) ||
            !!this.window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ || !!this.window.React ||
            !!(this.window.require && (this.require('react') || this.require('React')));
    }

    private checkIsAngular(): boolean {
        return !!(this.window.ng || this.window.getAllAngularTestabilities);
    }
}
