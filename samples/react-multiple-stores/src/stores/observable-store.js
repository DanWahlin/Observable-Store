import { BehaviorSubject } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
export class ObservableStore {
    constructor(initialState, settings) {
        this.stateHistory = [];
        this._trackStateHistory = (settings) ? settings.trackStateHistory : false;
        this._initStore(initialState);
    }
    setState(state, action, dispatchState = true) {
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
    getState() {
        return this._clonerService.deepClone(this._state);
    }
    resetState(initialState) {
        this._initStore(initialState);
    }
    updateState(state) {
        this._state = (state) ? Object.assign({}, this._state, state) : null;
    }
    _initStore(initialState) {
        // Not injecting service (as with Angular) since we want to allow use of ObservableStore anywhere
        this._clonerService = new ClonerService();
        this._stateDispatcher = new BehaviorSubject(initialState);
        this.stateChanged = this._stateDispatcher.asObservable();
        this.setState(initialState, 'init_state');
    }
    _dispatchState() {
        const clone = this._clonerService.deepClone(this._state);
        this._stateDispatcher.next(clone);
    }
}
// Not a fan of using _ for private fields in TypeScript, but since 
// some may use this as pure ES6 I'm going with _ for the private fields.
ObservableStore.instance = null;
//# sourceMappingURL=observable-store.js.map