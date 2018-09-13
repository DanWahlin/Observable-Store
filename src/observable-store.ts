import { BehaviorSubject, Observable } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { ObservableStoreSettings } from './interfaces';

export class ObservableStore<T> {
    private _state: Readonly<T>;
    private _stateDispatcher: BehaviorSubject<T>;
    private _clonerService: ClonerService;
    private _trackStateHistory: boolean;
    stateChanged: Observable<T>;
    stateHistory: any[] = [];
    static instance = null;

    constructor(initialState: T, settings: ObservableStoreSettings) {
        this._trackStateHistory = settings.trackStateHistory;
        this._initStore(initialState);
    }

    private _initStore(initialState: T) {
        // Not injecting service since we want to use ObservableStore outside of Angular
        this._clonerService = new ClonerService();
        this._stateDispatcher = new BehaviorSubject<T>(initialState);
        this.stateChanged = this._stateDispatcher.asObservable();
        this.setState(initialState, 'init_state');
    }

    private _dispatchState() {
        const clone = this._clonerService.deepClone(this._state);
        this._stateDispatcher.next(clone);
    }

    protected setState(state: any, action?: string, dispatchState: boolean = true) { 
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

    private updateState(state) {
        this._state = (state) ? Object.assign({}, this._state, state) : null;
    }

    protected getState() : T {
        return this._clonerService.deepClone(this._state);
    }

    protected resetState(initialState: T) {
        this._initStore(initialState);
    }

    protected getNestedProp(p) {
        return p.reduce((xs, x) => {
            if (xs === null || xs === undefined) {
                return null;
            }
            else {
                return xs[x];
            }
        }, this._state);
    }

}
