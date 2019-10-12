import { BehaviorSubject, Observable } from 'rxjs';
import { ObservableStoreSettings, StateHistory, ObservableStoreGlobalSettings } from './interfaces';
import ObservableStoreBase from './observable-store-base';

/**
 * Executes a function on `state` and returns a version of T
 * @param state - the original state model
 */
export type stateFunc<T> = (state: T) => Partial<T>;

/**
 * Core functionality for ObservableStore
 * providing getState(), setState() and additional functionality
 */
export class ObservableStore<T> {
    // Not a fan of using _ for private fields in TypeScript, but since 
    // some may use this as pure ES2015 I'm going with _ for the private fields.
    // private _stateDispatcher$ = new BehaviorSubject<T>(null);
    private _settings: ObservableStoreSettings;
    private _stateDispatcher$ = new BehaviorSubject<T>(null);

    stateChanged: Observable<T>;
    globalStateChanged: Observable<any>;
    
    get stateHistory(): StateHistory<T>[] {
        return ObservableStoreBase.stateHistory;
    }

    constructor(settings: ObservableStoreSettings) {
        this._settings = { ...ObservableStoreBase.settingsDefaults, ...settings, ...ObservableStoreBase.globalSettings };        
        this.stateChanged = this._stateDispatcher$.asObservable();
        this.globalStateChanged = ObservableStoreBase.globalStateDispatcher.asObservable();
    }

    static get globalSettings() {
        return ObservableStoreBase.globalSettings;
    }

    static set globalSettings(settings: ObservableStoreGlobalSettings) {
        // ObservableStore['isTesting'] used so that unit tests can set globalSettings 
        // multiple times during a suite of tests
        if (settings && (ObservableStore['isTesting'] || !ObservableStoreBase.globalSettings)) {
            ObservableStoreBase.globalSettings = settings;
        }
        else if (!settings) {
            throw new Error('Please provide the global settings you would like to apply to Observable Store');
        }
        else if (settings && ObservableStoreBase.globalSettings) {
            throw new Error('Observable Store global settings may only be set once.');
        }
    }

    protected getState() : T {
        const stateOrSlice = this._getStateOrSlice();
        return stateOrSlice;
    }

    protected setState(state: Partial<T> | stateFunc<T>, 
        action?: string, 
        dispatchState: boolean = true) : T { 

        // Needed for tracking below
        const previousState = this.getState();

        switch (typeof state) {
            case 'function':
                const newState = state(this.getState());
                this._updateState(newState);
                break;
            case 'object':
                this._updateState(state);
                break;
            default:
                throw Error('Pass an object or a function for the state parameter when calling setState().');
        }
        
        if (dispatchState) {
            this._dispatchState(state as any);
        }

        if (this._settings.trackStateHistory) {
            ObservableStoreBase.stateHistory.push({ 
                action, 
                beginState: previousState, 
                endState: this.getState() 
            });
        }

        if (this._settings.logStateChanges) {
            const caller = (this.constructor) ? '\r\nCaller: ' + this.constructor.name : '';
            console.log('%cSTATE CHANGED', 'font-weight: bold', '\r\nAction: ', action, caller, '\r\nState: ', state);
        }

        return this.getState();
    }

    protected logStateAction(state: any, action: string) {
        if (this._settings.trackStateHistory) {
            ObservableStoreBase.stateHistory.push({ 
                action, 
                beginState: this.getState(), 
                endState: ObservableStoreBase.deepClone(state) 
            });
        }
    }

    protected resetStateHistory() {
        ObservableStoreBase.stateHistory = [];
    }

    private _updateState(state: Partial<T>) {
        ObservableStoreBase.setStoreState(state);
    }

    private _getStateOrSlice(): Readonly<Partial<T>> {
        const storeState = ObservableStoreBase.getStoreState();
        if (this._settings.stateSliceSelector) {
            return this._settings.stateSliceSelector(storeState);
        }
        return storeState;
    }

    private _dispatchState(stateChanges: T) {
        const stateOrSlice = this._getStateOrSlice();
        
        // Get store state or slice of state
        const clonedStateOrSlice = stateOrSlice;

        //  Get full store state
        const clonedGlobalState = ObservableStoreBase.getStoreState();

        if (this._settings.includeStateChangesOnSubscribe) {
            this._stateDispatcher$.next({ state: clonedStateOrSlice, stateChanges } as any);
            ObservableStoreBase.globalStateDispatcher.next({ state: clonedGlobalState, stateChanges });
        }
        else {
            this._stateDispatcher$.next(clonedStateOrSlice);
            ObservableStoreBase.globalStateDispatcher.next(clonedGlobalState);
        }
    }

}
