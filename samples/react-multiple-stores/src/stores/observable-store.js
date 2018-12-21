import { BehaviorSubject } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
export class ObservableStore {
    constructor(initialState, settings) {
        this.stateHistory = [];
        this._trackStateHistory = settings.trackStateHistory;
        this._initStore(initialState);
    }
    _initStore(initialState) {
        // Not injecting service since we want to use ObservableStore outside of Angular
        this._clonerService = new ClonerService();
        this._stateDispatcher = new BehaviorSubject(initialState);
        this.stateChanged = this._stateDispatcher.asObservable();
        this.setState(initialState, 'init_state');
    }
    _dispatchState() {
        const clone = this._clonerService.deepClone(this._state);
        this._stateDispatcher.next(clone);
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
    updateState(state) {
        this._state = (state) ? Object.assign({}, this._state, state) : null;
    }
    getState() {
        return this._clonerService.deepClone(this._state);
    }
    resetState(initialState) {
        this._initStore(initialState);
    }
}
// Not a fan of using _ for private fields in TypeScript, but since 
// some may use this as pure ES6 I'm going with _ for the private fields.
ObservableStore.instance = null;
//# sourceMappingURL=observable-store.js.map