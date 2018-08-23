"use strict";
exports.__esModule = true;
var rxjs_1 = require("rxjs");
var cloner_service_1 = require("./utilities/cloner.service");
var ObservableStore = /** @class */ (function () {
    function ObservableStore(initialState, trackStateHistory) {
        if (trackStateHistory === void 0) { trackStateHistory = false; }
        this.stateHistory = [];
        this.trackStateHistory = trackStateHistory;
        this.initStore(initialState);
    }
    ObservableStore.prototype.initStore = function (initialState) {
        //Not injecting service since we want to use ObservableStore outside of Angular
        this.clonerService = new cloner_service_1.ClonerService();
        this.stateDispatcher = new rxjs_1.BehaviorSubject(initialState);
        this.stateChanged = this.stateDispatcher.asObservable();
        this.setState('init', initialState);
    };
    ObservableStore.prototype.dispatchState = function () {
        var clone = this.clonerService.deepClone(this.state);
        this.stateDispatcher.next(clone);
    };
    ObservableStore.prototype.setState = function (action, state) {
        // console.log(this, state);
        this.state = state;
        this.dispatchState();
        if (this.trackStateHistory) {
            this.stateHistory.push({ action: action, state: state });
        }
    };
    ObservableStore.prototype.getState = function () {
        return this.clonerService.deepClone(this.state);
    };
    ObservableStore.prototype.resetState = function (initialState) {
        this.initStore(initialState);
    };
    ObservableStore.prototype.getNestedProp = function (p) {
        return p.reduce(function (xs, x) {
            if (xs === null || xs === undefined) {
                return null;
            }
            else {
                return xs[x];
            }
        }, this.state);
    };
    return ObservableStore;
}());
exports.ObservableStore = ObservableStore;
