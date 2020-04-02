import { BehaviorSubject } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { ObservableStoreSettings, ObservableStoreGlobalSettings, StateWithPropertyChanges, ObservableStoreExtension } from './interfaces';

// Will be used to create a singleton
class ObservableStoreBase {  
    private _storeState: Readonly<any> = null;
    private _clonerService = new ClonerService();
    private _extensions = [];
    
    settingsDefaults: ObservableStoreSettings = {
        trackStateHistory: false,
        logStateChanges: false,
        // deprecated
        includeStateChangesOnSubscribe: false,
        stateSliceSelector: null
    };    
    stateHistory: any[] = [];
    globalStateDispatcher = new BehaviorSubject<any>(null);
    globalStateWithChangesDispatcher = new BehaviorSubject<StateWithPropertyChanges<any>>(null);
    globalSettings: ObservableStoreGlobalSettings = null;
    services: any[] = []; // Track all services reading/writing to store. Useful for extensions like DevToolsExtension.

    initializeState(state: any) {
        if (this._storeState) {
            throw Error('The store state has already been initialized. initializeStoreState() can ' +
                        'only be called once BEFORE any store state has been set.');
        }
        return this.setStoreState(state);
    }

    getStoreState(propertyName: string = null, deepCloneReturnedState: boolean = true) {
        let state = null;
        if (this._storeState) {
            // See if a specific property of the store should be returned via getStateProperty<T>()
            if (propertyName) {
                if (this._storeState.hasOwnProperty(propertyName)) {
                    state = this._storeState[propertyName];  
                }
            }
            else {
                state = this._storeState;
            }

            if (state && deepCloneReturnedState) {
                state = this.deepClone(state);
            }
        }

        return state;
    }

    setStoreState(state, deepCloneState: boolean = true) {
        const currentStoreState = this.getStoreState(null, deepCloneState);
        if (deepCloneState) {
            this._storeState = { ...currentStoreState, ...this.deepClone(state) }
        }
        else {
            this._storeState = { ...currentStoreState, ...state };
        }
    }

    clearStoreState() {
        this._storeState = null;
    }

    deepClone(obj: any) {
        return this._clonerService.deepClone(obj);
    }

    addExtension(extension: ObservableStoreExtension) {
        this._extensions.push(extension);
        extension.init();
    }
}

// Created once to initialize singleton
export default new ObservableStoreBase();