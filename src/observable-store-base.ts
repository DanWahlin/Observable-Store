import { BehaviorSubject } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { ObservableStoreSettings } from './interfaces';

// Will be used to create a singleton
class ObservableStoreBase {  
    private _storeState: Readonly<any> = null;
    public clonerService = new ClonerService();
    public stateHistory: any[] = [];
    settingsDefaults: ObservableStoreSettings = {
        trackStateHistory: false,
        logStateChanges: false,
        includeStateChangesOnSubscribe: false,
        stateSliceSelector: null
    };
    globalStateDispatcher = new BehaviorSubject<any>(null);

    getStoreState() {
        return this._storeState;
    }

    setStoreState(state) {
        this._storeState = this.clonerService.deepClone(state);
    }
}

// Created once to initialize singleton
export default new ObservableStoreBase();