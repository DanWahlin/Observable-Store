import { ObservableStore } from '../../observable-store';
import { ReduxDevtoolsExtensionConnection, ReduxDevtoolsExtensionConfig } from './dev-tools.interfaces';
import { EMPTY, Observable } from 'rxjs';
import { ObservableStoreExtension } from '../../interfaces';

export class ReduxDevToolsExtension extends ObservableStore<any> implements ObservableStoreExtension  {
    private window = (window as any);
    private extensionConnection: ReduxDevtoolsExtensionConnection;
    private devtoolsExtension = (window as any)['__REDUX_DEVTOOLS_EXTENSION__'];

    constructor() {
        super({ trackStateHistory: true, logStateChanges: false });
        this.sync();
    }

    init(config?: ReduxDevtoolsExtensionConfig) {
        if (!this.devtoolsExtension) {
            return EMPTY;
        }

        return new Observable(subscriber => {
            const connection = this.devtoolsExtension.connect(config);
            this.extensionConnection = connection;
            connection.init(config);
            connection.subscribe((change: any) => subscriber.next(change));
            return connection.unsubscribe;
        }).subscribe((action: any) => {
            if (action.type === 'DISPATCH') {
                if (action.payload.type === 'JUMP_TO_STATE' && action.state) {
                    this.setDevToolsState(JSON.parse(action.state), 'DEVTOOLS_JUMP');
                }
            }
        });
    }

    private setDevToolsState(state: any, action: string) {
        // #### Run in Angular zone if it's loaded to help with change dectection
        if (this.window.ng && this.window.getAllAngularRootElements) {
            const ngZone = this.getNgZone();
            ngZone.run(() => {
                this.dispatchDevToolsState(state, action);
            });
            return;
        }

        this.dispatchDevToolsState(state, action);
    }

    private dispatchDevToolsState(state: any, action: string) {
        // Set devtools state for each service but don't dispatch state
        // since it will also dispatch global state by default
        for (let service of ObservableStore.allStoreServices) {
            service.setState(state, action, false);
            // dispatch service state but not global state
            service.dispatchState(state, false);
        }

        // dispatch global state changes
        this.dispatchState(state);
    }

    private getNgZone() {
        return this.window.ng.probe(this.window.getAllAngularRootElements()[0])
                   .injector.get(this.window.ng.coreTokens.NgZone);
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
}