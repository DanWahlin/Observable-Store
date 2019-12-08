import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevtoolsExtensionConnection, ReduxDevtoolsExtensionConfig } from './interfaces';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { ObservableStoreExtension } from './interfaces';
import { AngularDevToolsExtension } from './angular/angular-devtools-extension';
import { ReactDevToolsExtension } from './react/react-devtools-extension';

export class ReduxDevToolsExtension extends ObservableStore<any> implements ObservableStoreExtension {
    private window = (window as any);
    private require = this.window.require;
    private devToolsExtensionConnection: ReduxDevtoolsExtensionConnection;
    private devtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];
    private routerPropertyName: string = 'router';
    private angularExtension: AngularDevToolsExtension;
    private reactExtension: ReactDevToolsExtension;
    private isAngular = this.window.ng;
    private isReact = this.checkIsReact();
    private sub: Subscription;

    constructor(private config?: ReduxDevtoolsExtensionConfig) {
        super({ trackStateHistory: true, logStateChanges: false });
        this.sync();
    }

    init() {
        if (!this.devtoolsExtension) {
            return EMPTY;
        }

        this.window.addEventListener('DOMContentLoaded', () => {
            if (this.isReact) {
                this.reactExtension = new ReactDevToolsExtension(this, this.routerPropertyName, this.config?.reactRouterHistory);
            };

            if (this.isAngular) {
                this.angularExtension = new AngularDevToolsExtension(this, this.routerPropertyName);
            }
        });

        if (this.config?.routerPropertyName) {
            this.routerPropertyName = this.config.routerPropertyName;
        }

        this.sub = this.connect();
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

    private processDevToolsAction(action: any) {
        // Called as user interacts with Redux Devtools controls
        if (action.type === 'DISPATCH') {
            if (action.payload.type === 'JUMP_TO_STATE' || action.payload.type === 'JUMP_TO_ACTION') {
                if (action.state) {
                    const actionState = JSON.parse(action.state);
                    if (actionState.state) {
                        if (actionState.state[this.routerPropertyName]) {
                            const path = actionState.state[this.routerPropertyName].path;
                            if (this.isAngular) {
                                this.angularExtension.navigate(path);
                            }
                            if (this.isReact) {
                                this.reactExtension.navigate(path);
                            }
                        }
                        this.setDevToolsState(actionState.state, `${actionState.action} [REDUX_DEVTOOLS_JUMP]`);
                    }
                }
            }
        }
    }

    private setDevToolsState(state: any, action: string) {
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
        if (this.stateHistory?.length) {
            const lastItem = this.stateHistory[this.stateHistory.length - 1];
            const { action, endState } = lastItem;

            if (!action.endsWith('[REDUX_DEVTOOLS_JUMP]')) {
                this.devToolsExtensionConnection.send(action, { state: endState, action });
            }
        }
    }

    disconnect() {
        if (this.devtoolsExtension) {
            this.devtoolsExtension.disconnect();
            if (this.sub) {
                this.sub.unsubscribe();
            }
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

}