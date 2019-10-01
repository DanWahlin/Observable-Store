Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var cloner_service_1 = require("./utilities/cloner.service");
// static objects
var clonerService = new cloner_service_1.ClonerService();
var storeState = null;
var stateHistory = [];
var settingsDefaults = {
    trackStateHistory: false,
    logStateChanges: false,
    includeStateChangesOnSubscribe: false,
    stateSliceSelector: null
};
var globalStateDispatcher = new rxjs_1.BehaviorSubject(null);
var ObservableStore = /** @class */ (function () {
    function ObservableStore(settings) {
        this._stateDispatcher = new rxjs_1.BehaviorSubject(null);
        this._settings = Object.assign({}, settingsDefaults, settings);
        this._clonerService = clonerService;
        this.stateChanged = this._stateDispatcher.asObservable();
        this.stateHistory = stateHistory;
        this.globalStateChanged = globalStateDispatcher.asObservable();
    }
    ObservableStore.prototype.setState = function (state, action, dispatchState) {
        if (dispatchState === void 0) { dispatchState = true; }
        // Needed for tracking below
        var previousState = this.getState();
        if (typeof state === 'function') {
            var newState = state(this.getState());
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
                action: action,
                beginState: previousState,
                endState: this._clonerService.deepClone(this.getState())
            });
        }
        if (this._settings.logStateChanges) {
            var caller = (this.constructor) ? '\r\nCaller: ' + this.constructor.name : '';
            console.log('%cSTATE CHANGED', 'font-weight: bold', '\r\nAction: ', action, caller, '\r\nState: ', state);
        }
        return this.getState();
    };
    ObservableStore.prototype.getState = function () {
        var stateOrSlice = this._getStateOrSlice(storeState);
        return this._clonerService.deepClone(stateOrSlice);
    };
    ObservableStore.prototype.logStateAction = function (state, action) {
        if (this._settings.trackStateHistory) {
            this.stateHistory.push({ action: action, state: this._clonerService.deepClone(state) });
        }
    };
    ObservableStore.prototype._updateState = function (state) {
        storeState = (state) ? Object.assign({}, storeState, state) : null;
    };
    ObservableStore.prototype._getStateOrSlice = function (state) {
        if (this._settings.stateSliceSelector) {
            return this._settings.stateSliceSelector(storeState);
        }
        return storeState;
    };
    ObservableStore.prototype._dispatchState = function (stateChanges) {
        var stateOrSlice = this._getStateOrSlice(storeState);
        var clonedStateOrSlice = this._clonerService.deepClone(stateOrSlice);
        var clonedGlobalState = this._clonerService.deepClone(storeState);
        if (this._settings.includeStateChangesOnSubscribe) {
            this._stateDispatcher.next({ state: clonedStateOrSlice, stateChanges: stateChanges });
            globalStateDispatcher.next({ state: clonedGlobalState, stateChanges: stateChanges });
        }
        else {
            this._stateDispatcher.next(clonedStateOrSlice);
            globalStateDispatcher.next(clonedGlobalState);
        }
    };
    return ObservableStore;
}());
exports.ObservableStore = ObservableStore;
//# sourceMappingURL=observable-store.js.map