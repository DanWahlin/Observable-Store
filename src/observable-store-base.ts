import { BehaviorSubject } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { ObservableStoreSettings, ObservableStoreGlobalSettings } from './interfaces';

// Will be used to create a singleton
class ObservableStoreBase {  
    private _storeState: Readonly<any> = null;
    private _clonerService = new ClonerService();
    
    settingsDefaults: ObservableStoreSettings = {
        trackStateHistory: false,
        logStateChanges: false,
        includeStateChangesOnSubscribe: false,
        stateSliceSelector: null
    };    
    stateHistory: any[] = [];
    globalStateDispatcher = new BehaviorSubject<any>(null);
    globalSettings: ObservableStoreGlobalSettings = null;

    getStoreState() {
        if (!this.globalSettings || (this.globalSettings && !this.globalSettings.isProduction)) {
            // Clone in dev
            return this.deepClone(this._storeState);
        }
        // Do NOT clone if in something other than dev for performance
        return this._storeState;
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
}

// Created once to initialize singleton
export default new ObservableStoreBase();