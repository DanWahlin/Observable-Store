import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevtoolsExtensionConnection, ReduxDevtoolsExtensionConfig } from './interfaces';
import { EMPTY, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ObservableStoreExtension } from './interfaces';
import { AngularDevToolsExtension } from './angular/angular-devtools-extension';

export class ReduxDevToolsExtension extends ObservableStore<any> implements ObservableStoreExtension {
    private window = (window as any);
    private extensionConnection: ReduxDevtoolsExtensionConnection;
    private devtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];
    private routerPropertyName: string = 'router';
    private angularExtension: AngularDevToolsExtension;

    constructor() {
        super({ trackStateHistory: true, logStateChanges: false });
        this.sync();
    }

    init(config?: ReduxDevtoolsExtensionConfig) {
        if (!this.devtoolsExtension) {
            return EMPTY;
        }

        this.window.addEventListener('DOMContentLoaded', () => {
            // Angular
            if (this.window.ng) {
                this.angularExtension = new AngularDevToolsExtension(this, this.routerPropertyName);
            }
        });

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
                        // Angular
                        if (this.angularExtension) {
                            this.angularExtension.navigate(path);
                        }
                    }
                    this.setDevToolsState(state, 'REDUX_DEVTOOLS_JUMP');
                }
            }
        });
    }

    private setDevToolsState(state: any, action: string) {
        // #### Run in Angular zone if it's loaded to help with change dectection
        if (this.angularExtension) {
            this.angularExtension.runInZone(() => this.dispatchDevToolsState(state, action));
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

            if (action !== 'REDUX_DEVTOOLS_JUMP') {
                this.extensionConnection.send(action, endState);
            }
        }
    }



}