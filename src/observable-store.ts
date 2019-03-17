import { BehaviorSubject, Observable } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';

export interface ObservableStoreSettings {
    trackStateHistory?: boolean;
    logStateChanges?: boolean;
    includeStateChangesOnSubscribe?: boolean;
    stateSliceSelector?: (state: any) => any;
}

export interface CurrentStoreState {
    state: any;
    stateChanges: any;
}

// static objects
const clonerService = new ClonerService();
let storeState: Readonly<any> =  null;
let stateHistory: any[] = [];
const settingsDefaults: ObservableStoreSettings = { 
    trackStateHistory: false, 
    logStateChanges: false,
    includeStateChangesOnSubscribe: false,
    stateSliceSelector: null
};
const globalStateDispatcher = new BehaviorSubject<any>(null);

export class ObservableStore<T> {
    // Not a fan of using _ for private fields in TypeScript, but since 
    // some may use this as pure ES6 I'm going with _ for the private fields.
    // stateChanged is for changes to a slice of state managed by a particular service
    public stateChanged: Observable<any>;
    public stateHistory: any[];
    public globalStateChanged: Observable<any>;

    private _stateDispatcher = new BehaviorSubject<any>(null);
    private _clonerService: ClonerService;
    private _settings: ObservableStoreSettings

    constructor(settings: ObservableStoreSettings) {
        this._settings = Object.assign({}, settingsDefaults, settings);
        this._clonerService = clonerService;
        
        this.stateChanged = this._stateDispatcher.asObservable();
        this.stateHistory = stateHistory;
        this.globalStateChanged = globalStateDispatcher.asObservable();
    }

    protected setState(state: any, action?: string, dispatchState: boolean = true) : T { 
        // Needed for tracking below
        const previousState = this.getState();

        if (typeof state === 'function') {
            const newState = state(this.getState());
            this._updateState(newState);
        }
        else if (typeof state === 'object') {
            this._updateState(state);
        }
        else {
            throw Error('Pass an object or a function for the state parameter when calling setState().');
        }
        
        if (dispatchState) {
            this._dispatchState(state);
        }

        if (this._settings.trackStateHistory) {
            this.stateHistory.push({ 
                action, 
                beginState: previousState, 
                endState: this._clonerService.deepClone(this.getState()) 
            });
        }

        if (this._settings.logStateChanges) {
            const caller = (this.constructor) ? '\r\nCaller: ' + this.constructor.name : '';
            console.log('%cSTATE CHANGED', 'font-weight: bold', '\r\nAction: ', action, caller, '\r\nState: ', state);
        }

        return this.getState();
    }

    protected getState() : T {
        const stateOrSlice = this._getStateOrSlice(storeState);
        return this._clonerService.deepClone(stateOrSlice) as T;
    }

    protected logStateAction(state: any, action: string) {
        if (this._settings.trackStateHistory) {
            this.stateHistory.push({ action, state: this._clonerService.deepClone(state) });
        }
    }

    private _updateState(state: T) {
        storeState = (state) ? Object.assign({}, storeState, state) : null;
    }

    private _getStateOrSlice(state : Readonly<any>): Readonly<any> {
        if (this._settings.stateSliceSelector) {
            return this._settings.stateSliceSelector(storeState);
        }
        return storeState;
    }

    private _dispatchState(stateChanges: T) {
        const stateOrSlice = this._getStateOrSlice(storeState);
        const clonedStateOrSlice = this._clonerService.deepClone(stateOrSlice);
        const clonedGlobalState = this._clonerService.deepClone(storeState);

        if (this._settings.includeStateChangesOnSubscribe) {
            this._stateDispatcher.next({ state: clonedStateOrSlice, stateChanges });
            globalStateDispatcher.next({ state: clonedGlobalState, stateChanges });
        }
        else {
            this._stateDispatcher.next(clonedStateOrSlice);
            globalStateDispatcher.next(clonedGlobalState);
        }
    }

}
