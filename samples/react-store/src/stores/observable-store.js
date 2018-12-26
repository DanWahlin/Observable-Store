import { BehaviorSubject } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
// static objects
var stateDispatcher = new BehaviorSubject(null);
var stateChanged = stateDispatcher.asObservable();
var clonerService = new ClonerService();
var storeState = null;
var stateHistory = [];
var ObservableStore = /** @class */ (function () {
    function ObservableStore(settings) {
        if (settings === void 0) { settings = { trackStateHistory: false }; }
        this._settings = settings;
        this._stateDispatcher = stateDispatcher;
        this._clonerService = clonerService;
        this.stateChanged = stateChanged;
        this.stateHistory = stateHistory;
    }
    ObservableStore.prototype.setState = function (state, action, dispatchState) {
        if (dispatchState === void 0) { dispatchState = true; }
        var previousState = this.getState();
        if (typeof state === 'function') {
            var newState = state(previousState);
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
        if (this._settings.trackStateHistory) {
            this.stateHistory.push({
                action: action,
                beginState: previousState,
                endState: this._clonerService.deepClone(this.getState())
            });
        }
    };
    ObservableStore.prototype.getState = function () {
        return this._clonerService.deepClone(storeState);
    };
    ObservableStore.prototype.logStateAction = function (state, action) {
        if (this._settings.trackStateHistory) {
            this.stateHistory.push({ action: action, state: this._clonerService.deepClone(state) });
        }
    };
    ObservableStore.prototype.updateState = function (state) {
        storeState = (state) ? Object.assign({}, storeState, state) : null;
    };
    ObservableStore.prototype._dispatchState = function () {
        var clone = this._clonerService.deepClone(storeState);
        this._stateDispatcher.next(clone);
    };
    return ObservableStore;
}());
export { ObservableStore };
//# sourceMappingURL=observable-store.js.map