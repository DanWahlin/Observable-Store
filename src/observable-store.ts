import { BehaviorSubject, Observable } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';

export interface ObservableStoreSettings {
    trackStateHistory?: boolean;
    logStateChanges?: boolean;
    includeStateChangesOnSubscribe?: boolean;
}

export interface CurrentStoreState {
    state: any;
    stateChanges: any;
}

// static objects
const clonerService = new ClonerService();
let storeState: Readonly<any> =  null;
let stateHistory: any[] = [];
const settingsDefaults = { 
    trackStateHistory: false, 
    logStateChanges: false,
    includeStateChangesOnSubscribe: false 
};

export class ObservableStore<T> {
    // Not a fan of using _ for private fields in TypeScript, but since 
    // some may use this as pure ES6 I'm going with _ for the private fields.
    public stateChanged: Observable<any>;
    public stateHistory: any[];

    private _stateDispatcher = new BehaviorSubject<any>(null);
    private _clonerService: ClonerService;
    private _settings: ObservableStoreSettings

    constructor(settings: ObservableStoreSettings = settingsDefaults) {
        this._settings = settings;
        this._clonerService = clonerService;
        
        this.stateChanged = this._stateDispatcher.asObservable();
        this.stateHistory = stateHistory;        
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
        return this._clonerService.deepClone(storeState) as T;
    }

    protected logStateAction(state: any, action: string) {
        if (this._settings.trackStateHistory) {
            this.stateHistory.push({ action, state: this._clonerService.deepClone(state) });
        }
    }

    private _updateState(state: T) {
        storeState = (state) ? Object.assign({}, storeState, state) : null;
    }

    private _dispatchState(stateChanges: T) {
        const clone = this._clonerService.deepClone(storeState);
        if (this._settings.includeStateChangesOnSubscribe) {
            this._stateDispatcher.next({ state: clone, stateChanges });
        }
        else {
            this._stateDispatcher.next(clone);
        }

    }

}
