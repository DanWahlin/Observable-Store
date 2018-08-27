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
        this.setState('init_state', initialState);
    }
    _dispatchState() {
        const clone = this._clonerService.deepClone(this._state);
        this._stateDispatcher.next(clone);
    }
    setState(action, state) {
        this._state = (state) ? Object.assign({}, this._state, state) : null;
        this._dispatchState();
        if (this._trackStateHistory) {
            this.stateHistory.push({ action, state });
        }
    }
    getState() {
        return this._clonerService.deepClone(this._state);
    }
    resetState(initialState) {
        this._initStore(initialState);
    }
    getNestedProp(p) {
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
ObservableStore.instance = null;
//# sourceMappingURL=observable-store.js.map