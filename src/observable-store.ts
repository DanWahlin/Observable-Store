import { BehaviorSubject, Observable } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { ObservableStoreSettings } from './interfaces';

export class ObservableStore<T> {
    // Not a fan of using _ for private fields in TypeScript, but since 
    // some may use this as pure ES6 I'm going with _ for the private fields.
    public static instance = null;
    public stateChanged: Observable<T>;
    public stateHistory: any[] = [];

    private _state: Readonly<T>;
    private _stateDispatcher: BehaviorSubject<T>;
    private _clonerService: ClonerService;
    private _trackStateHistory: boolean;

    constructor(initialState: T, settings: ObservableStoreSettings) {
        this._trackStateHistory = settings.trackStateHistory;
        this._initStore(initialState);
    }

    public setState(state: any, action?: string, dispatchState: boolean = true) { 
        if (typeof state === 'function') {
            const newState = state(this.getState());
            this.updateState(newState);
        }
        else if (typeof state === 'object') {
            this.updateState(state);
        }
        else {
            throw Error('Pass an object or a function for the state parameter when calling setState().');
        }
        
        if (dispatchState) {
            this._dispatchState();
        }

        if (this._trackStateHistory) {
            this.stateHistory.push({ action, state: this._clonerService.deepClone(this._state) });
        }
    }

    public getState() : T {
        return this._clonerService.deepClone(this._state) as T;
    }

    public resetState(initialState: T) {
        this._initStore(initialState);
    }

    private updateState(state: any) {
        this._state = (state) ? Object.assign({}, this._state, state) : null;
    }

    private _initStore(initialState: T) {
        // Not injecting service (as with Angular) since we want to allow use of ObservableStore anywhere
        this._clonerService = new ClonerService();
        this._stateDispatcher = new BehaviorSubject<T>(initialState);
        this.stateChanged = this._stateDispatcher.asObservable();
        this.setState(initialState, 'init_state');
    }

    private _dispatchState() {
        const clone = this._clonerService.deepClone(this._state);
        this._stateDispatcher.next(clone);
    }

    // protected getNestedProp(p) {
    //     return p.reduce((xs, x) => {
    //         if (xs === null || xs === undefined) {
    //             return null;
    //         }
    //         else {
    //             return xs[x];
    //         }
    //     }, this._state);
    // }

}
