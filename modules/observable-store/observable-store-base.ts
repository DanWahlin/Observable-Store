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

    getStoreState() {
        if (this._storeState) {
            if (!this.globalSettings || (this.globalSettings && !this.globalSettings.isProduction)) {
                // Deep clone in dev
                return this.deepClone(this._storeState);
            }

            // Do NOT deep clone if not dev for performance
            return { ...this._storeState };
        }
        return null;
    }

    setStoreState(state) {
        let clonedState = (state) ? { ...this.getStoreState(), ...state } : null;

        if (!this.globalSettings || (this.globalSettings && !this.globalSettings.isProduction)) {
            // Clone in dev
            clonedState = this.deepClone(clonedState);
        }
        
        // Do NOT clone if in something other than dev for performance
        this._storeState = clonedState;
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