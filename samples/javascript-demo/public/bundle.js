/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@codewithdan/observable-store/dist/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/@codewithdan/observable-store/dist/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObservableStore = void 0;
var observable_store_1 = __webpack_require__(/*! ./observable-store */ "./node_modules/@codewithdan/observable-store/dist/observable-store.js");
Object.defineProperty(exports, "ObservableStore", ({ enumerable: true, get: function () { return observable_store_1.ObservableStore; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@codewithdan/observable-store/dist/observable-store-base.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@codewithdan/observable-store/dist/observable-store-base.js ***!
  \**********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var rxjs_1 = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/dist/esm5/index.js");
var cloner_service_1 = __webpack_require__(/*! ./utilities/cloner.service */ "./node_modules/@codewithdan/observable-store/dist/utilities/cloner.service.js");
// Will be used to create a singleton
var ObservableStoreBase = /** @class */ (function () {
    function ObservableStoreBase() {
        this._storeState = null;
        this._clonerService = new cloner_service_1.ClonerService();
        this._extensions = [];
        this.settingsDefaults = {
            trackStateHistory: false,
            logStateChanges: false,
            // deprecated
            includeStateChangesOnSubscribe: false,
            stateSliceSelector: null
        };
        this.stateHistory = [];
        this.globalStateDispatcher = new rxjs_1.BehaviorSubject(null);
        this.globalStateWithChangesDispatcher = new rxjs_1.BehaviorSubject(null);
        this.globalSettings = null;
        this.services = []; // Track all services reading/writing to store. Useful for extensions like DevToolsExtension.
    }
    ObservableStoreBase.prototype.initializeState = function (state) {
        if (this._storeState) {
            throw Error('The store state has already been initialized. initializeStoreState() can ' +
                'only be called once BEFORE any store state has been set.');
        }
        return this.setStoreState(state);
    };
    ObservableStoreBase.prototype.getStoreState = function (propertyName, deepCloneReturnedState) {
        if (propertyName === void 0) { propertyName = null; }
        if (deepCloneReturnedState === void 0) { deepCloneReturnedState = true; }
        var state = null;
        if (this._storeState) {
            // See if a specific property of the store should be returned via getStateProperty<T>()
            if (propertyName) {
                if (this._storeState.hasOwnProperty(propertyName)) {
                    state = this._storeState[propertyName];
                }
            }
            else {
                state = this._storeState;
            }
            if (state && deepCloneReturnedState) {
                state = this.deepClone(state);
            }
        }
        return state;
    };
    ObservableStoreBase.prototype.setStoreState = function (state, deepCloneState) {
        if (deepCloneState === void 0) { deepCloneState = true; }
        var currentStoreState = this.getStoreState(null, deepCloneState);
        if (deepCloneState) {
            this._storeState = __assign(__assign({}, currentStoreState), this.deepClone(state));
        }
        else {
            this._storeState = __assign(__assign({}, currentStoreState), state);
        }
    };
    ObservableStoreBase.prototype.clearStoreState = function () {
        this._storeState = null;
    };
    ObservableStoreBase.prototype.deepClone = function (obj) {
        return this._clonerService.deepClone(obj);
    };
    ObservableStoreBase.prototype.addExtension = function (extension) {
        this._extensions.push(extension);
        extension.init();
    };
    return ObservableStoreBase;
}());
// Created once to initialize singleton
exports.default = new ObservableStoreBase();
//# sourceMappingURL=observable-store-base.js.map

/***/ }),

/***/ "./node_modules/@codewithdan/observable-store/dist/observable-store.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@codewithdan/observable-store/dist/observable-store.js ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObservableStore = void 0;
var rxjs_1 = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/dist/esm5/index.js");
var observable_store_base_1 = __webpack_require__(/*! ./observable-store-base */ "./node_modules/@codewithdan/observable-store/dist/observable-store-base.js");
/**
 * Core functionality for ObservableStore
 * providing getState(), setState() and additional functionality
 */
var ObservableStore = /** @class */ (function () {
    function ObservableStore(settings) {
        this._stateDispatcher$ = new rxjs_1.BehaviorSubject(null);
        this._stateWithChangesDispatcher$ = new rxjs_1.BehaviorSubject(null);
        this._settings = __assign(__assign(__assign({}, observable_store_base_1.default.settingsDefaults), settings), observable_store_base_1.default.globalSettings);
        this.stateChanged = this._stateDispatcher$.asObservable();
        this.globalStateChanged = observable_store_base_1.default.globalStateDispatcher.asObservable();
        this.stateWithPropertyChanges = this._stateWithChangesDispatcher$.asObservable();
        this.globalStateWithPropertyChanges = observable_store_base_1.default.globalStateWithChangesDispatcher.asObservable();
        observable_store_base_1.default.services.push(this);
    }
    Object.defineProperty(ObservableStore.prototype, "stateHistory", {
        /**
         * Retrieve state history. Assumes trackStateHistory setting was set on the store.
         */
        get: function () {
            return observable_store_base_1.default.stateHistory;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObservableStore, "globalSettings", {
        /**
         * get/set global settings throughout the application for ObservableStore.
         * See the [Observable Store Settings](https://github.com/danwahlin/observable-store#store-settings-per-service) documentation
         * for additional information. Note that global settings can only be set once as the application first loads.
         */
        get: function () {
            return observable_store_base_1.default.globalSettings;
        },
        set: function (settings) {
            // ObservableStore['isTesting'] used so that unit tests can set globalSettings 
            // multiple times during a suite of tests
            if (settings && (ObservableStore['isTesting'] || !observable_store_base_1.default.globalSettings)) {
                observable_store_base_1.default.globalSettings = settings;
            }
            else if (!settings) {
                throw new Error('Please provide the global settings you would like to apply to Observable Store');
            }
            else if (settings && observable_store_base_1.default.globalSettings) {
                throw new Error('Observable Store global settings may only be set once when the application first loads.');
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObservableStore, "allStoreServices", {
        /**
         * Provides access to all services that interact with ObservableStore. Useful for extensions
         * that need to be able to access a specific service.
         */
        get: function () {
            return observable_store_base_1.default.services;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Used to add an extension into ObservableStore. The extension must implement the
     * `ObservableStoreExtension` interface.
     */
    ObservableStore.addExtension = function (extension) {
        observable_store_base_1.default.addExtension(extension);
    };
    /**
     * Used to initialize the store's starting state. An error will be thrown if this is called and store state already exists.
     * No notifications are sent out when the store state is initialized by calling initializeStoreState().
     */
    ObservableStore.initializeState = function (state) {
        observable_store_base_1.default.initializeState(state);
    };
    /**
     * Used to reset the state of the store to a desired value for all services that derive
     * from ObservableStore<T> to a desired value.
     * A state change notification and global state change notification is sent out to subscribers if the dispatchState parameter is true (the default value).
     */
    ObservableStore.resetState = function (state, dispatchState) {
        if (dispatchState === void 0) { dispatchState = true; }
        observable_store_base_1.default.setStoreState(state);
        if (dispatchState) {
            ObservableStore.dispatchToAllServices(state);
        }
    };
    /**
     * Clear/null the store state for all services that use it.
     */
    ObservableStore.clearState = function (dispatchState) {
        if (dispatchState === void 0) { dispatchState = true; }
        observable_store_base_1.default.clearStoreState();
        if (dispatchState) {
            ObservableStore.dispatchToAllServices(null);
        }
    };
    ObservableStore.dispatchToAllServices = function (state) {
        var services = ObservableStore.allStoreServices;
        if (services) {
            for (var _i = 0, services_1 = services; _i < services_1.length; _i++) {
                var service = services_1[_i];
                service.dispatchState(state);
            }
        }
    };
    /**
     * Retrieve store's state. If using TypeScript (optional) then the state type defined when the store
     * was created will be returned rather than `any`. The deepCloneReturnedState boolean parameter (default is true) can be used
     * to determine if the returned state will be deep cloned or not. If set to false, a reference to the store state will
     * be returned and it's up to the user to ensure the state isn't change from outside the store. Setting it to false can be
     * useful in cases where read-only cached data is stored and must be retrieved as quickly as possible without any cloning.
     */
    ObservableStore.prototype.getState = function (deepCloneReturnedState) {
        if (deepCloneReturnedState === void 0) { deepCloneReturnedState = true; }
        return this._getStateOrSlice(deepCloneReturnedState);
    };
    /**
     * Retrieve a specific property from the store's state which can be more efficient than getState()
     * since only the defined property value will be returned (and cloned) rather than the entire
     * store value. If using TypeScript (optional) then the generic property type used with the
     * function call will be the return type.
     */
    ObservableStore.prototype.getStateProperty = function (propertyName, deepCloneReturnedState) {
        if (deepCloneReturnedState === void 0) { deepCloneReturnedState = true; }
        return observable_store_base_1.default.getStoreState(propertyName, deepCloneReturnedState);
    };
    /**
     * Set store state. Pass the state to be updated as well as the action that is occuring.
     * The state value can be a function [(see example)](https://github.com/danwahlin/observable-store#store-api).
     * The latest store state is returned.
     * The dispatchState parameter can be set to false if you do not want to send state change notifications to subscribers.
     * The deepCloneReturnedState boolean parameter (default is true) can be used
     * to determine if the state will be deep cloned before it is added to the store. Setting it to false can be
     * useful in cases where read-only cached data is stored and must added to the store as quickly as possible without any cloning.
     */
    ObservableStore.prototype.setState = function (state, action, dispatchState, deepCloneState) {
        if (dispatchState === void 0) { dispatchState = true; }
        if (deepCloneState === void 0) { deepCloneState = true; }
        // Needed for tracking below (don't move or delete)
        var previousState = this.getState(deepCloneState);
        switch (typeof state) {
            case 'function':
                var newState = state(this.getState(deepCloneState));
                this._updateState(newState, deepCloneState);
                break;
            case 'object':
                this._updateState(state, deepCloneState);
                break;
            default:
                throw Error('Pass an object or a function for the state parameter when calling setState().');
        }
        if (this._settings.trackStateHistory) {
            observable_store_base_1.default.stateHistory.push({
                action: action,
                beginState: previousState,
                endState: this.getState(deepCloneState)
            });
        }
        if (dispatchState) {
            this.dispatchState(state);
        }
        if (this._settings.logStateChanges) {
            var caller = (this.constructor) ? '\r\nCaller: ' + this.constructor.name : '';
            console.log('%cSTATE CHANGED', 'font-weight: bold', '\r\nAction: ', action, caller, '\r\nState: ', state);
        }
        return this.getState(deepCloneState);
    };
    /**
     * Add a custom state value and action into the state history. Assumes `trackStateHistory` setting was set
     * on store or using the global settings.
     */
    ObservableStore.prototype.logStateAction = function (state, action) {
        if (this._settings.trackStateHistory) {
            observable_store_base_1.default.stateHistory.push({
                action: action,
                beginState: this.getState(),
                endState: observable_store_base_1.default.deepClone(state)
            });
        }
    };
    /**
     * 	Reset the store's state history to an empty array.
     */
    ObservableStore.prototype.resetStateHistory = function () {
        observable_store_base_1.default.stateHistory = [];
    };
    ObservableStore.prototype._updateState = function (state, deepCloneState) {
        observable_store_base_1.default.setStoreState(state, deepCloneState);
    };
    ObservableStore.prototype._getStateOrSlice = function (deepCloneReturnedState) {
        var storeState = observable_store_base_1.default.getStoreState(null, deepCloneReturnedState);
        if (this._settings.stateSliceSelector) {
            return this._settings.stateSliceSelector(storeState);
        }
        return storeState;
    };
    /**
     * Dispatch the store's state without modifying the store state. Service state can be dispatched as well as the global store state.
     * If `dispatchGlobalState` is false then global state will not be dispatched to subscribers (defaults to `true`).
     */
    ObservableStore.prototype.dispatchState = function (stateChanges, dispatchGlobalState) {
        if (dispatchGlobalState === void 0) { dispatchGlobalState = true; }
        // Get store state or slice of state
        var clonedStateOrSlice = this._getStateOrSlice(true);
        //  Get full store state
        var clonedGlobalState = observable_store_base_1.default.getStoreState();
        // includeStateChangesOnSubscribe is deprecated
        if (this._settings.includeStateChangesOnSubscribe) {
            console.warn('includeStateChangesOnSubscribe is deprecated. ' +
                'Subscribe to stateChangedWithChanges or globalStateChangedWithChanges instead.');
            this._stateDispatcher$.next({ state: clonedStateOrSlice, stateChanges: stateChanges });
            observable_store_base_1.default.globalStateDispatcher.next({ state: clonedGlobalState, stateChanges: stateChanges });
        }
        else {
            this._stateDispatcher$.next(clonedStateOrSlice);
            this._stateWithChangesDispatcher$.next({ state: clonedStateOrSlice, stateChanges: stateChanges });
            if (dispatchGlobalState) {
                observable_store_base_1.default.globalStateDispatcher.next(clonedGlobalState);
                observable_store_base_1.default.globalStateWithChangesDispatcher.next({ state: clonedGlobalState, stateChanges: stateChanges });
            }
            ;
        }
    };
    return ObservableStore;
}());
exports.ObservableStore = ObservableStore;
//# sourceMappingURL=observable-store.js.map

/***/ }),

/***/ "./node_modules/@codewithdan/observable-store/dist/utilities/cloner.service.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@codewithdan/observable-store/dist/utilities/cloner.service.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

// https://github.com/codeandcats/fast-clone/blob/master/index.js
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClonerService = void 0;
var ClonerService = /** @class */ (function () {
    function ClonerService() {
    }
    ClonerService.prototype.deepClone = function (value) {
        var type = typeof value;
        switch (type) {
            case 'object':
                // null and undefined
                if (value == null) {
                    return value;
                }
                var result = void 0;
                if (value instanceof Date) {
                    result = new Date();
                    result.setTime(value.getTime());
                    return result;
                }
                else if (value instanceof RegExp) {
                    result = this.newRegExp(value);
                    return result;
                }
                else if (value instanceof Map) {
                    result = new Map(value);
                    return result;
                }
                else if (value instanceof Set) {
                    result = new Set(value);
                    return result;
                }
                result = JSON.parse(JSON.stringify(value));
                this.fixTypes(value, result);
                return result;
            default:
                return value;
        }
    };
    ClonerService.prototype.fixPropertyValue = function (original, copy, key) {
        var originalValue = original[key];
        var originalType = typeof originalValue;
        switch (originalType) {
            case 'object':
                if (originalValue instanceof Date) {
                    var newValue = new Date();
                    newValue.setTime(originalValue.getTime());
                    copy[key] = newValue;
                }
                else if (originalValue instanceof RegExp) {
                    copy[key] = this.newRegExp(originalValue);
                }
                else if (originalValue instanceof Map) {
                    copy[key] = new Map(originalValue);
                }
                else if (originalValue instanceof Set) {
                    copy[key] = new Set(originalValue);
                }
                else if (originalValue == null) {
                    copy[key] = originalValue;
                }
                else {
                    this.fixTypes(originalValue, copy[key]);
                }
                break;
            case 'number':
                if (isNaN(originalValue)) {
                    copy[key] = NaN;
                }
                else if (originalValue == Infinity) {
                    copy[key] = Infinity;
                }
                break;
            default:
                break;
        }
    };
    ClonerService.prototype.fixTypes = function (original, copy) {
        var _this = this;
        if (original instanceof Array) {
            for (var index = 0; index < original.length; index++) {
                this.fixPropertyValue(original, copy, index);
            }
        }
        else {
            var keys = Object.getOwnPropertyNames(original);
            keys.forEach(function (key) {
                _this.fixPropertyValue(original, copy, key);
            });
        }
    };
    ClonerService.prototype.newRegExp = function (value) {
        var regexpText = String(value);
        var slashIndex = regexpText.lastIndexOf('/');
        return new RegExp(regexpText.slice(1, slashIndex), regexpText.slice(slashIndex + 1));
    };
    return ClonerService;
}());
exports.ClonerService = ClonerService;
//# sourceMappingURL=cloner.service.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/index.js":
/*!**********************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Observable": () => (/* reexport safe */ _internal_Observable__WEBPACK_IMPORTED_MODULE_0__.Observable),
/* harmony export */   "ConnectableObservable": () => (/* reexport safe */ _internal_observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__.ConnectableObservable),
/* harmony export */   "observable": () => (/* reexport safe */ _internal_symbol_observable__WEBPACK_IMPORTED_MODULE_2__.observable),
/* harmony export */   "animationFrames": () => (/* reexport safe */ _internal_observable_dom_animationFrames__WEBPACK_IMPORTED_MODULE_3__.animationFrames),
/* harmony export */   "Subject": () => (/* reexport safe */ _internal_Subject__WEBPACK_IMPORTED_MODULE_4__.Subject),
/* harmony export */   "BehaviorSubject": () => (/* reexport safe */ _internal_BehaviorSubject__WEBPACK_IMPORTED_MODULE_5__.BehaviorSubject),
/* harmony export */   "ReplaySubject": () => (/* reexport safe */ _internal_ReplaySubject__WEBPACK_IMPORTED_MODULE_6__.ReplaySubject),
/* harmony export */   "AsyncSubject": () => (/* reexport safe */ _internal_AsyncSubject__WEBPACK_IMPORTED_MODULE_7__.AsyncSubject),
/* harmony export */   "asap": () => (/* reexport safe */ _internal_scheduler_asap__WEBPACK_IMPORTED_MODULE_8__.asap),
/* harmony export */   "asapScheduler": () => (/* reexport safe */ _internal_scheduler_asap__WEBPACK_IMPORTED_MODULE_8__.asapScheduler),
/* harmony export */   "async": () => (/* reexport safe */ _internal_scheduler_async__WEBPACK_IMPORTED_MODULE_9__.async),
/* harmony export */   "asyncScheduler": () => (/* reexport safe */ _internal_scheduler_async__WEBPACK_IMPORTED_MODULE_9__.asyncScheduler),
/* harmony export */   "queue": () => (/* reexport safe */ _internal_scheduler_queue__WEBPACK_IMPORTED_MODULE_10__.queue),
/* harmony export */   "queueScheduler": () => (/* reexport safe */ _internal_scheduler_queue__WEBPACK_IMPORTED_MODULE_10__.queueScheduler),
/* harmony export */   "animationFrame": () => (/* reexport safe */ _internal_scheduler_animationFrame__WEBPACK_IMPORTED_MODULE_11__.animationFrame),
/* harmony export */   "animationFrameScheduler": () => (/* reexport safe */ _internal_scheduler_animationFrame__WEBPACK_IMPORTED_MODULE_11__.animationFrameScheduler),
/* harmony export */   "VirtualTimeScheduler": () => (/* reexport safe */ _internal_scheduler_VirtualTimeScheduler__WEBPACK_IMPORTED_MODULE_12__.VirtualTimeScheduler),
/* harmony export */   "VirtualAction": () => (/* reexport safe */ _internal_scheduler_VirtualTimeScheduler__WEBPACK_IMPORTED_MODULE_12__.VirtualAction),
/* harmony export */   "Scheduler": () => (/* reexport safe */ _internal_Scheduler__WEBPACK_IMPORTED_MODULE_13__.Scheduler),
/* harmony export */   "Subscription": () => (/* reexport safe */ _internal_Subscription__WEBPACK_IMPORTED_MODULE_14__.Subscription),
/* harmony export */   "Subscriber": () => (/* reexport safe */ _internal_Subscriber__WEBPACK_IMPORTED_MODULE_15__.Subscriber),
/* harmony export */   "Notification": () => (/* reexport safe */ _internal_Notification__WEBPACK_IMPORTED_MODULE_16__.Notification),
/* harmony export */   "NotificationKind": () => (/* reexport safe */ _internal_Notification__WEBPACK_IMPORTED_MODULE_16__.NotificationKind),
/* harmony export */   "pipe": () => (/* reexport safe */ _internal_util_pipe__WEBPACK_IMPORTED_MODULE_17__.pipe),
/* harmony export */   "noop": () => (/* reexport safe */ _internal_util_noop__WEBPACK_IMPORTED_MODULE_18__.noop),
/* harmony export */   "identity": () => (/* reexport safe */ _internal_util_identity__WEBPACK_IMPORTED_MODULE_19__.identity),
/* harmony export */   "isObservable": () => (/* reexport safe */ _internal_util_isObservable__WEBPACK_IMPORTED_MODULE_20__.isObservable),
/* harmony export */   "lastValueFrom": () => (/* reexport safe */ _internal_lastValueFrom__WEBPACK_IMPORTED_MODULE_21__.lastValueFrom),
/* harmony export */   "firstValueFrom": () => (/* reexport safe */ _internal_firstValueFrom__WEBPACK_IMPORTED_MODULE_22__.firstValueFrom),
/* harmony export */   "ArgumentOutOfRangeError": () => (/* reexport safe */ _internal_util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_23__.ArgumentOutOfRangeError),
/* harmony export */   "EmptyError": () => (/* reexport safe */ _internal_util_EmptyError__WEBPACK_IMPORTED_MODULE_24__.EmptyError),
/* harmony export */   "NotFoundError": () => (/* reexport safe */ _internal_util_NotFoundError__WEBPACK_IMPORTED_MODULE_25__.NotFoundError),
/* harmony export */   "ObjectUnsubscribedError": () => (/* reexport safe */ _internal_util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_26__.ObjectUnsubscribedError),
/* harmony export */   "SequenceError": () => (/* reexport safe */ _internal_util_SequenceError__WEBPACK_IMPORTED_MODULE_27__.SequenceError),
/* harmony export */   "TimeoutError": () => (/* reexport safe */ _internal_operators_timeout__WEBPACK_IMPORTED_MODULE_28__.TimeoutError),
/* harmony export */   "UnsubscriptionError": () => (/* reexport safe */ _internal_util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_29__.UnsubscriptionError),
/* harmony export */   "bindCallback": () => (/* reexport safe */ _internal_observable_bindCallback__WEBPACK_IMPORTED_MODULE_30__.bindCallback),
/* harmony export */   "bindNodeCallback": () => (/* reexport safe */ _internal_observable_bindNodeCallback__WEBPACK_IMPORTED_MODULE_31__.bindNodeCallback),
/* harmony export */   "combineLatest": () => (/* reexport safe */ _internal_observable_combineLatest__WEBPACK_IMPORTED_MODULE_32__.combineLatest),
/* harmony export */   "concat": () => (/* reexport safe */ _internal_observable_concat__WEBPACK_IMPORTED_MODULE_33__.concat),
/* harmony export */   "connectable": () => (/* reexport safe */ _internal_observable_connectable__WEBPACK_IMPORTED_MODULE_34__.connectable),
/* harmony export */   "defer": () => (/* reexport safe */ _internal_observable_defer__WEBPACK_IMPORTED_MODULE_35__.defer),
/* harmony export */   "empty": () => (/* reexport safe */ _internal_observable_empty__WEBPACK_IMPORTED_MODULE_36__.empty),
/* harmony export */   "forkJoin": () => (/* reexport safe */ _internal_observable_forkJoin__WEBPACK_IMPORTED_MODULE_37__.forkJoin),
/* harmony export */   "from": () => (/* reexport safe */ _internal_observable_from__WEBPACK_IMPORTED_MODULE_38__.from),
/* harmony export */   "fromEvent": () => (/* reexport safe */ _internal_observable_fromEvent__WEBPACK_IMPORTED_MODULE_39__.fromEvent),
/* harmony export */   "fromEventPattern": () => (/* reexport safe */ _internal_observable_fromEventPattern__WEBPACK_IMPORTED_MODULE_40__.fromEventPattern),
/* harmony export */   "generate": () => (/* reexport safe */ _internal_observable_generate__WEBPACK_IMPORTED_MODULE_41__.generate),
/* harmony export */   "iif": () => (/* reexport safe */ _internal_observable_iif__WEBPACK_IMPORTED_MODULE_42__.iif),
/* harmony export */   "interval": () => (/* reexport safe */ _internal_observable_interval__WEBPACK_IMPORTED_MODULE_43__.interval),
/* harmony export */   "merge": () => (/* reexport safe */ _internal_observable_merge__WEBPACK_IMPORTED_MODULE_44__.merge),
/* harmony export */   "never": () => (/* reexport safe */ _internal_observable_never__WEBPACK_IMPORTED_MODULE_45__.never),
/* harmony export */   "of": () => (/* reexport safe */ _internal_observable_of__WEBPACK_IMPORTED_MODULE_46__.of),
/* harmony export */   "onErrorResumeNext": () => (/* reexport safe */ _internal_observable_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_47__.onErrorResumeNext),
/* harmony export */   "pairs": () => (/* reexport safe */ _internal_observable_pairs__WEBPACK_IMPORTED_MODULE_48__.pairs),
/* harmony export */   "partition": () => (/* reexport safe */ _internal_observable_partition__WEBPACK_IMPORTED_MODULE_49__.partition),
/* harmony export */   "race": () => (/* reexport safe */ _internal_observable_race__WEBPACK_IMPORTED_MODULE_50__.race),
/* harmony export */   "range": () => (/* reexport safe */ _internal_observable_range__WEBPACK_IMPORTED_MODULE_51__.range),
/* harmony export */   "throwError": () => (/* reexport safe */ _internal_observable_throwError__WEBPACK_IMPORTED_MODULE_52__.throwError),
/* harmony export */   "timer": () => (/* reexport safe */ _internal_observable_timer__WEBPACK_IMPORTED_MODULE_53__.timer),
/* harmony export */   "using": () => (/* reexport safe */ _internal_observable_using__WEBPACK_IMPORTED_MODULE_54__.using),
/* harmony export */   "zip": () => (/* reexport safe */ _internal_observable_zip__WEBPACK_IMPORTED_MODULE_55__.zip),
/* harmony export */   "scheduled": () => (/* reexport safe */ _internal_scheduled_scheduled__WEBPACK_IMPORTED_MODULE_56__.scheduled),
/* harmony export */   "EMPTY": () => (/* reexport safe */ _internal_observable_empty__WEBPACK_IMPORTED_MODULE_36__.EMPTY),
/* harmony export */   "NEVER": () => (/* reexport safe */ _internal_observable_never__WEBPACK_IMPORTED_MODULE_45__.NEVER),
/* harmony export */   "config": () => (/* reexport safe */ _internal_config__WEBPACK_IMPORTED_MODULE_57__.config),
/* harmony export */   "audit": () => (/* reexport safe */ _internal_operators_audit__WEBPACK_IMPORTED_MODULE_58__.audit),
/* harmony export */   "auditTime": () => (/* reexport safe */ _internal_operators_auditTime__WEBPACK_IMPORTED_MODULE_59__.auditTime),
/* harmony export */   "buffer": () => (/* reexport safe */ _internal_operators_buffer__WEBPACK_IMPORTED_MODULE_60__.buffer),
/* harmony export */   "bufferCount": () => (/* reexport safe */ _internal_operators_bufferCount__WEBPACK_IMPORTED_MODULE_61__.bufferCount),
/* harmony export */   "bufferTime": () => (/* reexport safe */ _internal_operators_bufferTime__WEBPACK_IMPORTED_MODULE_62__.bufferTime),
/* harmony export */   "bufferToggle": () => (/* reexport safe */ _internal_operators_bufferToggle__WEBPACK_IMPORTED_MODULE_63__.bufferToggle),
/* harmony export */   "bufferWhen": () => (/* reexport safe */ _internal_operators_bufferWhen__WEBPACK_IMPORTED_MODULE_64__.bufferWhen),
/* harmony export */   "catchError": () => (/* reexport safe */ _internal_operators_catchError__WEBPACK_IMPORTED_MODULE_65__.catchError),
/* harmony export */   "combineAll": () => (/* reexport safe */ _internal_operators_combineAll__WEBPACK_IMPORTED_MODULE_66__.combineAll),
/* harmony export */   "combineLatestAll": () => (/* reexport safe */ _internal_operators_combineLatestAll__WEBPACK_IMPORTED_MODULE_67__.combineLatestAll),
/* harmony export */   "combineLatestWith": () => (/* reexport safe */ _internal_operators_combineLatestWith__WEBPACK_IMPORTED_MODULE_68__.combineLatestWith),
/* harmony export */   "concatAll": () => (/* reexport safe */ _internal_operators_concatAll__WEBPACK_IMPORTED_MODULE_69__.concatAll),
/* harmony export */   "concatMap": () => (/* reexport safe */ _internal_operators_concatMap__WEBPACK_IMPORTED_MODULE_70__.concatMap),
/* harmony export */   "concatMapTo": () => (/* reexport safe */ _internal_operators_concatMapTo__WEBPACK_IMPORTED_MODULE_71__.concatMapTo),
/* harmony export */   "concatWith": () => (/* reexport safe */ _internal_operators_concatWith__WEBPACK_IMPORTED_MODULE_72__.concatWith),
/* harmony export */   "connect": () => (/* reexport safe */ _internal_operators_connect__WEBPACK_IMPORTED_MODULE_73__.connect),
/* harmony export */   "count": () => (/* reexport safe */ _internal_operators_count__WEBPACK_IMPORTED_MODULE_74__.count),
/* harmony export */   "debounce": () => (/* reexport safe */ _internal_operators_debounce__WEBPACK_IMPORTED_MODULE_75__.debounce),
/* harmony export */   "debounceTime": () => (/* reexport safe */ _internal_operators_debounceTime__WEBPACK_IMPORTED_MODULE_76__.debounceTime),
/* harmony export */   "defaultIfEmpty": () => (/* reexport safe */ _internal_operators_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_77__.defaultIfEmpty),
/* harmony export */   "delay": () => (/* reexport safe */ _internal_operators_delay__WEBPACK_IMPORTED_MODULE_78__.delay),
/* harmony export */   "delayWhen": () => (/* reexport safe */ _internal_operators_delayWhen__WEBPACK_IMPORTED_MODULE_79__.delayWhen),
/* harmony export */   "dematerialize": () => (/* reexport safe */ _internal_operators_dematerialize__WEBPACK_IMPORTED_MODULE_80__.dematerialize),
/* harmony export */   "distinct": () => (/* reexport safe */ _internal_operators_distinct__WEBPACK_IMPORTED_MODULE_81__.distinct),
/* harmony export */   "distinctUntilChanged": () => (/* reexport safe */ _internal_operators_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_82__.distinctUntilChanged),
/* harmony export */   "distinctUntilKeyChanged": () => (/* reexport safe */ _internal_operators_distinctUntilKeyChanged__WEBPACK_IMPORTED_MODULE_83__.distinctUntilKeyChanged),
/* harmony export */   "elementAt": () => (/* reexport safe */ _internal_operators_elementAt__WEBPACK_IMPORTED_MODULE_84__.elementAt),
/* harmony export */   "endWith": () => (/* reexport safe */ _internal_operators_endWith__WEBPACK_IMPORTED_MODULE_85__.endWith),
/* harmony export */   "every": () => (/* reexport safe */ _internal_operators_every__WEBPACK_IMPORTED_MODULE_86__.every),
/* harmony export */   "exhaust": () => (/* reexport safe */ _internal_operators_exhaust__WEBPACK_IMPORTED_MODULE_87__.exhaust),
/* harmony export */   "exhaustAll": () => (/* reexport safe */ _internal_operators_exhaustAll__WEBPACK_IMPORTED_MODULE_88__.exhaustAll),
/* harmony export */   "exhaustMap": () => (/* reexport safe */ _internal_operators_exhaustMap__WEBPACK_IMPORTED_MODULE_89__.exhaustMap),
/* harmony export */   "expand": () => (/* reexport safe */ _internal_operators_expand__WEBPACK_IMPORTED_MODULE_90__.expand),
/* harmony export */   "filter": () => (/* reexport safe */ _internal_operators_filter__WEBPACK_IMPORTED_MODULE_91__.filter),
/* harmony export */   "finalize": () => (/* reexport safe */ _internal_operators_finalize__WEBPACK_IMPORTED_MODULE_92__.finalize),
/* harmony export */   "find": () => (/* reexport safe */ _internal_operators_find__WEBPACK_IMPORTED_MODULE_93__.find),
/* harmony export */   "findIndex": () => (/* reexport safe */ _internal_operators_findIndex__WEBPACK_IMPORTED_MODULE_94__.findIndex),
/* harmony export */   "first": () => (/* reexport safe */ _internal_operators_first__WEBPACK_IMPORTED_MODULE_95__.first),
/* harmony export */   "groupBy": () => (/* reexport safe */ _internal_operators_groupBy__WEBPACK_IMPORTED_MODULE_96__.groupBy),
/* harmony export */   "ignoreElements": () => (/* reexport safe */ _internal_operators_ignoreElements__WEBPACK_IMPORTED_MODULE_97__.ignoreElements),
/* harmony export */   "isEmpty": () => (/* reexport safe */ _internal_operators_isEmpty__WEBPACK_IMPORTED_MODULE_98__.isEmpty),
/* harmony export */   "last": () => (/* reexport safe */ _internal_operators_last__WEBPACK_IMPORTED_MODULE_99__.last),
/* harmony export */   "map": () => (/* reexport safe */ _internal_operators_map__WEBPACK_IMPORTED_MODULE_100__.map),
/* harmony export */   "mapTo": () => (/* reexport safe */ _internal_operators_mapTo__WEBPACK_IMPORTED_MODULE_101__.mapTo),
/* harmony export */   "materialize": () => (/* reexport safe */ _internal_operators_materialize__WEBPACK_IMPORTED_MODULE_102__.materialize),
/* harmony export */   "max": () => (/* reexport safe */ _internal_operators_max__WEBPACK_IMPORTED_MODULE_103__.max),
/* harmony export */   "mergeAll": () => (/* reexport safe */ _internal_operators_mergeAll__WEBPACK_IMPORTED_MODULE_104__.mergeAll),
/* harmony export */   "flatMap": () => (/* reexport safe */ _internal_operators_flatMap__WEBPACK_IMPORTED_MODULE_105__.flatMap),
/* harmony export */   "mergeMap": () => (/* reexport safe */ _internal_operators_mergeMap__WEBPACK_IMPORTED_MODULE_106__.mergeMap),
/* harmony export */   "mergeMapTo": () => (/* reexport safe */ _internal_operators_mergeMapTo__WEBPACK_IMPORTED_MODULE_107__.mergeMapTo),
/* harmony export */   "mergeScan": () => (/* reexport safe */ _internal_operators_mergeScan__WEBPACK_IMPORTED_MODULE_108__.mergeScan),
/* harmony export */   "mergeWith": () => (/* reexport safe */ _internal_operators_mergeWith__WEBPACK_IMPORTED_MODULE_109__.mergeWith),
/* harmony export */   "min": () => (/* reexport safe */ _internal_operators_min__WEBPACK_IMPORTED_MODULE_110__.min),
/* harmony export */   "multicast": () => (/* reexport safe */ _internal_operators_multicast__WEBPACK_IMPORTED_MODULE_111__.multicast),
/* harmony export */   "observeOn": () => (/* reexport safe */ _internal_operators_observeOn__WEBPACK_IMPORTED_MODULE_112__.observeOn),
/* harmony export */   "pairwise": () => (/* reexport safe */ _internal_operators_pairwise__WEBPACK_IMPORTED_MODULE_113__.pairwise),
/* harmony export */   "pluck": () => (/* reexport safe */ _internal_operators_pluck__WEBPACK_IMPORTED_MODULE_114__.pluck),
/* harmony export */   "publish": () => (/* reexport safe */ _internal_operators_publish__WEBPACK_IMPORTED_MODULE_115__.publish),
/* harmony export */   "publishBehavior": () => (/* reexport safe */ _internal_operators_publishBehavior__WEBPACK_IMPORTED_MODULE_116__.publishBehavior),
/* harmony export */   "publishLast": () => (/* reexport safe */ _internal_operators_publishLast__WEBPACK_IMPORTED_MODULE_117__.publishLast),
/* harmony export */   "publishReplay": () => (/* reexport safe */ _internal_operators_publishReplay__WEBPACK_IMPORTED_MODULE_118__.publishReplay),
/* harmony export */   "raceWith": () => (/* reexport safe */ _internal_operators_raceWith__WEBPACK_IMPORTED_MODULE_119__.raceWith),
/* harmony export */   "reduce": () => (/* reexport safe */ _internal_operators_reduce__WEBPACK_IMPORTED_MODULE_120__.reduce),
/* harmony export */   "repeat": () => (/* reexport safe */ _internal_operators_repeat__WEBPACK_IMPORTED_MODULE_121__.repeat),
/* harmony export */   "repeatWhen": () => (/* reexport safe */ _internal_operators_repeatWhen__WEBPACK_IMPORTED_MODULE_122__.repeatWhen),
/* harmony export */   "retry": () => (/* reexport safe */ _internal_operators_retry__WEBPACK_IMPORTED_MODULE_123__.retry),
/* harmony export */   "retryWhen": () => (/* reexport safe */ _internal_operators_retryWhen__WEBPACK_IMPORTED_MODULE_124__.retryWhen),
/* harmony export */   "refCount": () => (/* reexport safe */ _internal_operators_refCount__WEBPACK_IMPORTED_MODULE_125__.refCount),
/* harmony export */   "sample": () => (/* reexport safe */ _internal_operators_sample__WEBPACK_IMPORTED_MODULE_126__.sample),
/* harmony export */   "sampleTime": () => (/* reexport safe */ _internal_operators_sampleTime__WEBPACK_IMPORTED_MODULE_127__.sampleTime),
/* harmony export */   "scan": () => (/* reexport safe */ _internal_operators_scan__WEBPACK_IMPORTED_MODULE_128__.scan),
/* harmony export */   "sequenceEqual": () => (/* reexport safe */ _internal_operators_sequenceEqual__WEBPACK_IMPORTED_MODULE_129__.sequenceEqual),
/* harmony export */   "share": () => (/* reexport safe */ _internal_operators_share__WEBPACK_IMPORTED_MODULE_130__.share),
/* harmony export */   "shareReplay": () => (/* reexport safe */ _internal_operators_shareReplay__WEBPACK_IMPORTED_MODULE_131__.shareReplay),
/* harmony export */   "single": () => (/* reexport safe */ _internal_operators_single__WEBPACK_IMPORTED_MODULE_132__.single),
/* harmony export */   "skip": () => (/* reexport safe */ _internal_operators_skip__WEBPACK_IMPORTED_MODULE_133__.skip),
/* harmony export */   "skipLast": () => (/* reexport safe */ _internal_operators_skipLast__WEBPACK_IMPORTED_MODULE_134__.skipLast),
/* harmony export */   "skipUntil": () => (/* reexport safe */ _internal_operators_skipUntil__WEBPACK_IMPORTED_MODULE_135__.skipUntil),
/* harmony export */   "skipWhile": () => (/* reexport safe */ _internal_operators_skipWhile__WEBPACK_IMPORTED_MODULE_136__.skipWhile),
/* harmony export */   "startWith": () => (/* reexport safe */ _internal_operators_startWith__WEBPACK_IMPORTED_MODULE_137__.startWith),
/* harmony export */   "subscribeOn": () => (/* reexport safe */ _internal_operators_subscribeOn__WEBPACK_IMPORTED_MODULE_138__.subscribeOn),
/* harmony export */   "switchAll": () => (/* reexport safe */ _internal_operators_switchAll__WEBPACK_IMPORTED_MODULE_139__.switchAll),
/* harmony export */   "switchMap": () => (/* reexport safe */ _internal_operators_switchMap__WEBPACK_IMPORTED_MODULE_140__.switchMap),
/* harmony export */   "switchMapTo": () => (/* reexport safe */ _internal_operators_switchMapTo__WEBPACK_IMPORTED_MODULE_141__.switchMapTo),
/* harmony export */   "switchScan": () => (/* reexport safe */ _internal_operators_switchScan__WEBPACK_IMPORTED_MODULE_142__.switchScan),
/* harmony export */   "take": () => (/* reexport safe */ _internal_operators_take__WEBPACK_IMPORTED_MODULE_143__.take),
/* harmony export */   "takeLast": () => (/* reexport safe */ _internal_operators_takeLast__WEBPACK_IMPORTED_MODULE_144__.takeLast),
/* harmony export */   "takeUntil": () => (/* reexport safe */ _internal_operators_takeUntil__WEBPACK_IMPORTED_MODULE_145__.takeUntil),
/* harmony export */   "takeWhile": () => (/* reexport safe */ _internal_operators_takeWhile__WEBPACK_IMPORTED_MODULE_146__.takeWhile),
/* harmony export */   "tap": () => (/* reexport safe */ _internal_operators_tap__WEBPACK_IMPORTED_MODULE_147__.tap),
/* harmony export */   "throttle": () => (/* reexport safe */ _internal_operators_throttle__WEBPACK_IMPORTED_MODULE_148__.throttle),
/* harmony export */   "throttleTime": () => (/* reexport safe */ _internal_operators_throttleTime__WEBPACK_IMPORTED_MODULE_149__.throttleTime),
/* harmony export */   "throwIfEmpty": () => (/* reexport safe */ _internal_operators_throwIfEmpty__WEBPACK_IMPORTED_MODULE_150__.throwIfEmpty),
/* harmony export */   "timeInterval": () => (/* reexport safe */ _internal_operators_timeInterval__WEBPACK_IMPORTED_MODULE_151__.timeInterval),
/* harmony export */   "timeout": () => (/* reexport safe */ _internal_operators_timeout__WEBPACK_IMPORTED_MODULE_28__.timeout),
/* harmony export */   "timeoutWith": () => (/* reexport safe */ _internal_operators_timeoutWith__WEBPACK_IMPORTED_MODULE_152__.timeoutWith),
/* harmony export */   "timestamp": () => (/* reexport safe */ _internal_operators_timestamp__WEBPACK_IMPORTED_MODULE_153__.timestamp),
/* harmony export */   "toArray": () => (/* reexport safe */ _internal_operators_toArray__WEBPACK_IMPORTED_MODULE_154__.toArray),
/* harmony export */   "window": () => (/* reexport safe */ _internal_operators_window__WEBPACK_IMPORTED_MODULE_155__.window),
/* harmony export */   "windowCount": () => (/* reexport safe */ _internal_operators_windowCount__WEBPACK_IMPORTED_MODULE_156__.windowCount),
/* harmony export */   "windowTime": () => (/* reexport safe */ _internal_operators_windowTime__WEBPACK_IMPORTED_MODULE_157__.windowTime),
/* harmony export */   "windowToggle": () => (/* reexport safe */ _internal_operators_windowToggle__WEBPACK_IMPORTED_MODULE_158__.windowToggle),
/* harmony export */   "windowWhen": () => (/* reexport safe */ _internal_operators_windowWhen__WEBPACK_IMPORTED_MODULE_159__.windowWhen),
/* harmony export */   "withLatestFrom": () => (/* reexport safe */ _internal_operators_withLatestFrom__WEBPACK_IMPORTED_MODULE_160__.withLatestFrom),
/* harmony export */   "zipAll": () => (/* reexport safe */ _internal_operators_zipAll__WEBPACK_IMPORTED_MODULE_161__.zipAll),
/* harmony export */   "zipWith": () => (/* reexport safe */ _internal_operators_zipWith__WEBPACK_IMPORTED_MODULE_162__.zipWith)
/* harmony export */ });
/* harmony import */ var _internal_Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal/Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _internal_observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./internal/observable/ConnectableObservable */ "./node_modules/rxjs/dist/esm5/internal/observable/ConnectableObservable.js");
/* harmony import */ var _internal_symbol_observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./internal/symbol/observable */ "./node_modules/rxjs/dist/esm5/internal/symbol/observable.js");
/* harmony import */ var _internal_observable_dom_animationFrames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./internal/observable/dom/animationFrames */ "./node_modules/rxjs/dist/esm5/internal/observable/dom/animationFrames.js");
/* harmony import */ var _internal_Subject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./internal/Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _internal_BehaviorSubject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./internal/BehaviorSubject */ "./node_modules/rxjs/dist/esm5/internal/BehaviorSubject.js");
/* harmony import */ var _internal_ReplaySubject__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./internal/ReplaySubject */ "./node_modules/rxjs/dist/esm5/internal/ReplaySubject.js");
/* harmony import */ var _internal_AsyncSubject__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./internal/AsyncSubject */ "./node_modules/rxjs/dist/esm5/internal/AsyncSubject.js");
/* harmony import */ var _internal_scheduler_asap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./internal/scheduler/asap */ "./node_modules/rxjs/dist/esm5/internal/scheduler/asap.js");
/* harmony import */ var _internal_scheduler_async__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./internal/scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _internal_scheduler_queue__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./internal/scheduler/queue */ "./node_modules/rxjs/dist/esm5/internal/scheduler/queue.js");
/* harmony import */ var _internal_scheduler_animationFrame__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./internal/scheduler/animationFrame */ "./node_modules/rxjs/dist/esm5/internal/scheduler/animationFrame.js");
/* harmony import */ var _internal_scheduler_VirtualTimeScheduler__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./internal/scheduler/VirtualTimeScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/VirtualTimeScheduler.js");
/* harmony import */ var _internal_Scheduler__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./internal/Scheduler */ "./node_modules/rxjs/dist/esm5/internal/Scheduler.js");
/* harmony import */ var _internal_Subscription__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./internal/Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _internal_Subscriber__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./internal/Subscriber */ "./node_modules/rxjs/dist/esm5/internal/Subscriber.js");
/* harmony import */ var _internal_Notification__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./internal/Notification */ "./node_modules/rxjs/dist/esm5/internal/Notification.js");
/* harmony import */ var _internal_util_pipe__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./internal/util/pipe */ "./node_modules/rxjs/dist/esm5/internal/util/pipe.js");
/* harmony import */ var _internal_util_noop__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./internal/util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _internal_util_identity__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./internal/util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");
/* harmony import */ var _internal_util_isObservable__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./internal/util/isObservable */ "./node_modules/rxjs/dist/esm5/internal/util/isObservable.js");
/* harmony import */ var _internal_lastValueFrom__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./internal/lastValueFrom */ "./node_modules/rxjs/dist/esm5/internal/lastValueFrom.js");
/* harmony import */ var _internal_firstValueFrom__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./internal/firstValueFrom */ "./node_modules/rxjs/dist/esm5/internal/firstValueFrom.js");
/* harmony import */ var _internal_util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./internal/util/ArgumentOutOfRangeError */ "./node_modules/rxjs/dist/esm5/internal/util/ArgumentOutOfRangeError.js");
/* harmony import */ var _internal_util_EmptyError__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./internal/util/EmptyError */ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js");
/* harmony import */ var _internal_util_NotFoundError__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./internal/util/NotFoundError */ "./node_modules/rxjs/dist/esm5/internal/util/NotFoundError.js");
/* harmony import */ var _internal_util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./internal/util/ObjectUnsubscribedError */ "./node_modules/rxjs/dist/esm5/internal/util/ObjectUnsubscribedError.js");
/* harmony import */ var _internal_util_SequenceError__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./internal/util/SequenceError */ "./node_modules/rxjs/dist/esm5/internal/util/SequenceError.js");
/* harmony import */ var _internal_operators_timeout__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./internal/operators/timeout */ "./node_modules/rxjs/dist/esm5/internal/operators/timeout.js");
/* harmony import */ var _internal_util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./internal/util/UnsubscriptionError */ "./node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js");
/* harmony import */ var _internal_observable_bindCallback__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./internal/observable/bindCallback */ "./node_modules/rxjs/dist/esm5/internal/observable/bindCallback.js");
/* harmony import */ var _internal_observable_bindNodeCallback__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./internal/observable/bindNodeCallback */ "./node_modules/rxjs/dist/esm5/internal/observable/bindNodeCallback.js");
/* harmony import */ var _internal_observable_combineLatest__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./internal/observable/combineLatest */ "./node_modules/rxjs/dist/esm5/internal/observable/combineLatest.js");
/* harmony import */ var _internal_observable_concat__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./internal/observable/concat */ "./node_modules/rxjs/dist/esm5/internal/observable/concat.js");
/* harmony import */ var _internal_observable_connectable__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./internal/observable/connectable */ "./node_modules/rxjs/dist/esm5/internal/observable/connectable.js");
/* harmony import */ var _internal_observable_defer__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./internal/observable/defer */ "./node_modules/rxjs/dist/esm5/internal/observable/defer.js");
/* harmony import */ var _internal_observable_empty__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./internal/observable/empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _internal_observable_forkJoin__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./internal/observable/forkJoin */ "./node_modules/rxjs/dist/esm5/internal/observable/forkJoin.js");
/* harmony import */ var _internal_observable_from__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./internal/observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _internal_observable_fromEvent__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./internal/observable/fromEvent */ "./node_modules/rxjs/dist/esm5/internal/observable/fromEvent.js");
/* harmony import */ var _internal_observable_fromEventPattern__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./internal/observable/fromEventPattern */ "./node_modules/rxjs/dist/esm5/internal/observable/fromEventPattern.js");
/* harmony import */ var _internal_observable_generate__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./internal/observable/generate */ "./node_modules/rxjs/dist/esm5/internal/observable/generate.js");
/* harmony import */ var _internal_observable_iif__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./internal/observable/iif */ "./node_modules/rxjs/dist/esm5/internal/observable/iif.js");
/* harmony import */ var _internal_observable_interval__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./internal/observable/interval */ "./node_modules/rxjs/dist/esm5/internal/observable/interval.js");
/* harmony import */ var _internal_observable_merge__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./internal/observable/merge */ "./node_modules/rxjs/dist/esm5/internal/observable/merge.js");
/* harmony import */ var _internal_observable_never__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./internal/observable/never */ "./node_modules/rxjs/dist/esm5/internal/observable/never.js");
/* harmony import */ var _internal_observable_of__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./internal/observable/of */ "./node_modules/rxjs/dist/esm5/internal/observable/of.js");
/* harmony import */ var _internal_observable_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./internal/observable/onErrorResumeNext */ "./node_modules/rxjs/dist/esm5/internal/observable/onErrorResumeNext.js");
/* harmony import */ var _internal_observable_pairs__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./internal/observable/pairs */ "./node_modules/rxjs/dist/esm5/internal/observable/pairs.js");
/* harmony import */ var _internal_observable_partition__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./internal/observable/partition */ "./node_modules/rxjs/dist/esm5/internal/observable/partition.js");
/* harmony import */ var _internal_observable_race__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./internal/observable/race */ "./node_modules/rxjs/dist/esm5/internal/observable/race.js");
/* harmony import */ var _internal_observable_range__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./internal/observable/range */ "./node_modules/rxjs/dist/esm5/internal/observable/range.js");
/* harmony import */ var _internal_observable_throwError__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ./internal/observable/throwError */ "./node_modules/rxjs/dist/esm5/internal/observable/throwError.js");
/* harmony import */ var _internal_observable_timer__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! ./internal/observable/timer */ "./node_modules/rxjs/dist/esm5/internal/observable/timer.js");
/* harmony import */ var _internal_observable_using__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! ./internal/observable/using */ "./node_modules/rxjs/dist/esm5/internal/observable/using.js");
/* harmony import */ var _internal_observable_zip__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! ./internal/observable/zip */ "./node_modules/rxjs/dist/esm5/internal/observable/zip.js");
/* harmony import */ var _internal_scheduled_scheduled__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! ./internal/scheduled/scheduled */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js");
/* harmony import */ var _internal_config__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! ./internal/config */ "./node_modules/rxjs/dist/esm5/internal/config.js");
/* harmony import */ var _internal_operators_audit__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! ./internal/operators/audit */ "./node_modules/rxjs/dist/esm5/internal/operators/audit.js");
/* harmony import */ var _internal_operators_auditTime__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! ./internal/operators/auditTime */ "./node_modules/rxjs/dist/esm5/internal/operators/auditTime.js");
/* harmony import */ var _internal_operators_buffer__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! ./internal/operators/buffer */ "./node_modules/rxjs/dist/esm5/internal/operators/buffer.js");
/* harmony import */ var _internal_operators_bufferCount__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! ./internal/operators/bufferCount */ "./node_modules/rxjs/dist/esm5/internal/operators/bufferCount.js");
/* harmony import */ var _internal_operators_bufferTime__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! ./internal/operators/bufferTime */ "./node_modules/rxjs/dist/esm5/internal/operators/bufferTime.js");
/* harmony import */ var _internal_operators_bufferToggle__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! ./internal/operators/bufferToggle */ "./node_modules/rxjs/dist/esm5/internal/operators/bufferToggle.js");
/* harmony import */ var _internal_operators_bufferWhen__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! ./internal/operators/bufferWhen */ "./node_modules/rxjs/dist/esm5/internal/operators/bufferWhen.js");
/* harmony import */ var _internal_operators_catchError__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! ./internal/operators/catchError */ "./node_modules/rxjs/dist/esm5/internal/operators/catchError.js");
/* harmony import */ var _internal_operators_combineAll__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! ./internal/operators/combineAll */ "./node_modules/rxjs/dist/esm5/internal/operators/combineAll.js");
/* harmony import */ var _internal_operators_combineLatestAll__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! ./internal/operators/combineLatestAll */ "./node_modules/rxjs/dist/esm5/internal/operators/combineLatestAll.js");
/* harmony import */ var _internal_operators_combineLatestWith__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! ./internal/operators/combineLatestWith */ "./node_modules/rxjs/dist/esm5/internal/operators/combineLatestWith.js");
/* harmony import */ var _internal_operators_concatAll__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! ./internal/operators/concatAll */ "./node_modules/rxjs/dist/esm5/internal/operators/concatAll.js");
/* harmony import */ var _internal_operators_concatMap__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! ./internal/operators/concatMap */ "./node_modules/rxjs/dist/esm5/internal/operators/concatMap.js");
/* harmony import */ var _internal_operators_concatMapTo__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! ./internal/operators/concatMapTo */ "./node_modules/rxjs/dist/esm5/internal/operators/concatMapTo.js");
/* harmony import */ var _internal_operators_concatWith__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! ./internal/operators/concatWith */ "./node_modules/rxjs/dist/esm5/internal/operators/concatWith.js");
/* harmony import */ var _internal_operators_connect__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! ./internal/operators/connect */ "./node_modules/rxjs/dist/esm5/internal/operators/connect.js");
/* harmony import */ var _internal_operators_count__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! ./internal/operators/count */ "./node_modules/rxjs/dist/esm5/internal/operators/count.js");
/* harmony import */ var _internal_operators_debounce__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! ./internal/operators/debounce */ "./node_modules/rxjs/dist/esm5/internal/operators/debounce.js");
/* harmony import */ var _internal_operators_debounceTime__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! ./internal/operators/debounceTime */ "./node_modules/rxjs/dist/esm5/internal/operators/debounceTime.js");
/* harmony import */ var _internal_operators_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_77__ = __webpack_require__(/*! ./internal/operators/defaultIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _internal_operators_delay__WEBPACK_IMPORTED_MODULE_78__ = __webpack_require__(/*! ./internal/operators/delay */ "./node_modules/rxjs/dist/esm5/internal/operators/delay.js");
/* harmony import */ var _internal_operators_delayWhen__WEBPACK_IMPORTED_MODULE_79__ = __webpack_require__(/*! ./internal/operators/delayWhen */ "./node_modules/rxjs/dist/esm5/internal/operators/delayWhen.js");
/* harmony import */ var _internal_operators_dematerialize__WEBPACK_IMPORTED_MODULE_80__ = __webpack_require__(/*! ./internal/operators/dematerialize */ "./node_modules/rxjs/dist/esm5/internal/operators/dematerialize.js");
/* harmony import */ var _internal_operators_distinct__WEBPACK_IMPORTED_MODULE_81__ = __webpack_require__(/*! ./internal/operators/distinct */ "./node_modules/rxjs/dist/esm5/internal/operators/distinct.js");
/* harmony import */ var _internal_operators_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_82__ = __webpack_require__(/*! ./internal/operators/distinctUntilChanged */ "./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js");
/* harmony import */ var _internal_operators_distinctUntilKeyChanged__WEBPACK_IMPORTED_MODULE_83__ = __webpack_require__(/*! ./internal/operators/distinctUntilKeyChanged */ "./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilKeyChanged.js");
/* harmony import */ var _internal_operators_elementAt__WEBPACK_IMPORTED_MODULE_84__ = __webpack_require__(/*! ./internal/operators/elementAt */ "./node_modules/rxjs/dist/esm5/internal/operators/elementAt.js");
/* harmony import */ var _internal_operators_endWith__WEBPACK_IMPORTED_MODULE_85__ = __webpack_require__(/*! ./internal/operators/endWith */ "./node_modules/rxjs/dist/esm5/internal/operators/endWith.js");
/* harmony import */ var _internal_operators_every__WEBPACK_IMPORTED_MODULE_86__ = __webpack_require__(/*! ./internal/operators/every */ "./node_modules/rxjs/dist/esm5/internal/operators/every.js");
/* harmony import */ var _internal_operators_exhaust__WEBPACK_IMPORTED_MODULE_87__ = __webpack_require__(/*! ./internal/operators/exhaust */ "./node_modules/rxjs/dist/esm5/internal/operators/exhaust.js");
/* harmony import */ var _internal_operators_exhaustAll__WEBPACK_IMPORTED_MODULE_88__ = __webpack_require__(/*! ./internal/operators/exhaustAll */ "./node_modules/rxjs/dist/esm5/internal/operators/exhaustAll.js");
/* harmony import */ var _internal_operators_exhaustMap__WEBPACK_IMPORTED_MODULE_89__ = __webpack_require__(/*! ./internal/operators/exhaustMap */ "./node_modules/rxjs/dist/esm5/internal/operators/exhaustMap.js");
/* harmony import */ var _internal_operators_expand__WEBPACK_IMPORTED_MODULE_90__ = __webpack_require__(/*! ./internal/operators/expand */ "./node_modules/rxjs/dist/esm5/internal/operators/expand.js");
/* harmony import */ var _internal_operators_filter__WEBPACK_IMPORTED_MODULE_91__ = __webpack_require__(/*! ./internal/operators/filter */ "./node_modules/rxjs/dist/esm5/internal/operators/filter.js");
/* harmony import */ var _internal_operators_finalize__WEBPACK_IMPORTED_MODULE_92__ = __webpack_require__(/*! ./internal/operators/finalize */ "./node_modules/rxjs/dist/esm5/internal/operators/finalize.js");
/* harmony import */ var _internal_operators_find__WEBPACK_IMPORTED_MODULE_93__ = __webpack_require__(/*! ./internal/operators/find */ "./node_modules/rxjs/dist/esm5/internal/operators/find.js");
/* harmony import */ var _internal_operators_findIndex__WEBPACK_IMPORTED_MODULE_94__ = __webpack_require__(/*! ./internal/operators/findIndex */ "./node_modules/rxjs/dist/esm5/internal/operators/findIndex.js");
/* harmony import */ var _internal_operators_first__WEBPACK_IMPORTED_MODULE_95__ = __webpack_require__(/*! ./internal/operators/first */ "./node_modules/rxjs/dist/esm5/internal/operators/first.js");
/* harmony import */ var _internal_operators_groupBy__WEBPACK_IMPORTED_MODULE_96__ = __webpack_require__(/*! ./internal/operators/groupBy */ "./node_modules/rxjs/dist/esm5/internal/operators/groupBy.js");
/* harmony import */ var _internal_operators_ignoreElements__WEBPACK_IMPORTED_MODULE_97__ = __webpack_require__(/*! ./internal/operators/ignoreElements */ "./node_modules/rxjs/dist/esm5/internal/operators/ignoreElements.js");
/* harmony import */ var _internal_operators_isEmpty__WEBPACK_IMPORTED_MODULE_98__ = __webpack_require__(/*! ./internal/operators/isEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/isEmpty.js");
/* harmony import */ var _internal_operators_last__WEBPACK_IMPORTED_MODULE_99__ = __webpack_require__(/*! ./internal/operators/last */ "./node_modules/rxjs/dist/esm5/internal/operators/last.js");
/* harmony import */ var _internal_operators_map__WEBPACK_IMPORTED_MODULE_100__ = __webpack_require__(/*! ./internal/operators/map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");
/* harmony import */ var _internal_operators_mapTo__WEBPACK_IMPORTED_MODULE_101__ = __webpack_require__(/*! ./internal/operators/mapTo */ "./node_modules/rxjs/dist/esm5/internal/operators/mapTo.js");
/* harmony import */ var _internal_operators_materialize__WEBPACK_IMPORTED_MODULE_102__ = __webpack_require__(/*! ./internal/operators/materialize */ "./node_modules/rxjs/dist/esm5/internal/operators/materialize.js");
/* harmony import */ var _internal_operators_max__WEBPACK_IMPORTED_MODULE_103__ = __webpack_require__(/*! ./internal/operators/max */ "./node_modules/rxjs/dist/esm5/internal/operators/max.js");
/* harmony import */ var _internal_operators_mergeAll__WEBPACK_IMPORTED_MODULE_104__ = __webpack_require__(/*! ./internal/operators/mergeAll */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js");
/* harmony import */ var _internal_operators_flatMap__WEBPACK_IMPORTED_MODULE_105__ = __webpack_require__(/*! ./internal/operators/flatMap */ "./node_modules/rxjs/dist/esm5/internal/operators/flatMap.js");
/* harmony import */ var _internal_operators_mergeMap__WEBPACK_IMPORTED_MODULE_106__ = __webpack_require__(/*! ./internal/operators/mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");
/* harmony import */ var _internal_operators_mergeMapTo__WEBPACK_IMPORTED_MODULE_107__ = __webpack_require__(/*! ./internal/operators/mergeMapTo */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMapTo.js");
/* harmony import */ var _internal_operators_mergeScan__WEBPACK_IMPORTED_MODULE_108__ = __webpack_require__(/*! ./internal/operators/mergeScan */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeScan.js");
/* harmony import */ var _internal_operators_mergeWith__WEBPACK_IMPORTED_MODULE_109__ = __webpack_require__(/*! ./internal/operators/mergeWith */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeWith.js");
/* harmony import */ var _internal_operators_min__WEBPACK_IMPORTED_MODULE_110__ = __webpack_require__(/*! ./internal/operators/min */ "./node_modules/rxjs/dist/esm5/internal/operators/min.js");
/* harmony import */ var _internal_operators_multicast__WEBPACK_IMPORTED_MODULE_111__ = __webpack_require__(/*! ./internal/operators/multicast */ "./node_modules/rxjs/dist/esm5/internal/operators/multicast.js");
/* harmony import */ var _internal_operators_observeOn__WEBPACK_IMPORTED_MODULE_112__ = __webpack_require__(/*! ./internal/operators/observeOn */ "./node_modules/rxjs/dist/esm5/internal/operators/observeOn.js");
/* harmony import */ var _internal_operators_pairwise__WEBPACK_IMPORTED_MODULE_113__ = __webpack_require__(/*! ./internal/operators/pairwise */ "./node_modules/rxjs/dist/esm5/internal/operators/pairwise.js");
/* harmony import */ var _internal_operators_pluck__WEBPACK_IMPORTED_MODULE_114__ = __webpack_require__(/*! ./internal/operators/pluck */ "./node_modules/rxjs/dist/esm5/internal/operators/pluck.js");
/* harmony import */ var _internal_operators_publish__WEBPACK_IMPORTED_MODULE_115__ = __webpack_require__(/*! ./internal/operators/publish */ "./node_modules/rxjs/dist/esm5/internal/operators/publish.js");
/* harmony import */ var _internal_operators_publishBehavior__WEBPACK_IMPORTED_MODULE_116__ = __webpack_require__(/*! ./internal/operators/publishBehavior */ "./node_modules/rxjs/dist/esm5/internal/operators/publishBehavior.js");
/* harmony import */ var _internal_operators_publishLast__WEBPACK_IMPORTED_MODULE_117__ = __webpack_require__(/*! ./internal/operators/publishLast */ "./node_modules/rxjs/dist/esm5/internal/operators/publishLast.js");
/* harmony import */ var _internal_operators_publishReplay__WEBPACK_IMPORTED_MODULE_118__ = __webpack_require__(/*! ./internal/operators/publishReplay */ "./node_modules/rxjs/dist/esm5/internal/operators/publishReplay.js");
/* harmony import */ var _internal_operators_raceWith__WEBPACK_IMPORTED_MODULE_119__ = __webpack_require__(/*! ./internal/operators/raceWith */ "./node_modules/rxjs/dist/esm5/internal/operators/raceWith.js");
/* harmony import */ var _internal_operators_reduce__WEBPACK_IMPORTED_MODULE_120__ = __webpack_require__(/*! ./internal/operators/reduce */ "./node_modules/rxjs/dist/esm5/internal/operators/reduce.js");
/* harmony import */ var _internal_operators_repeat__WEBPACK_IMPORTED_MODULE_121__ = __webpack_require__(/*! ./internal/operators/repeat */ "./node_modules/rxjs/dist/esm5/internal/operators/repeat.js");
/* harmony import */ var _internal_operators_repeatWhen__WEBPACK_IMPORTED_MODULE_122__ = __webpack_require__(/*! ./internal/operators/repeatWhen */ "./node_modules/rxjs/dist/esm5/internal/operators/repeatWhen.js");
/* harmony import */ var _internal_operators_retry__WEBPACK_IMPORTED_MODULE_123__ = __webpack_require__(/*! ./internal/operators/retry */ "./node_modules/rxjs/dist/esm5/internal/operators/retry.js");
/* harmony import */ var _internal_operators_retryWhen__WEBPACK_IMPORTED_MODULE_124__ = __webpack_require__(/*! ./internal/operators/retryWhen */ "./node_modules/rxjs/dist/esm5/internal/operators/retryWhen.js");
/* harmony import */ var _internal_operators_refCount__WEBPACK_IMPORTED_MODULE_125__ = __webpack_require__(/*! ./internal/operators/refCount */ "./node_modules/rxjs/dist/esm5/internal/operators/refCount.js");
/* harmony import */ var _internal_operators_sample__WEBPACK_IMPORTED_MODULE_126__ = __webpack_require__(/*! ./internal/operators/sample */ "./node_modules/rxjs/dist/esm5/internal/operators/sample.js");
/* harmony import */ var _internal_operators_sampleTime__WEBPACK_IMPORTED_MODULE_127__ = __webpack_require__(/*! ./internal/operators/sampleTime */ "./node_modules/rxjs/dist/esm5/internal/operators/sampleTime.js");
/* harmony import */ var _internal_operators_scan__WEBPACK_IMPORTED_MODULE_128__ = __webpack_require__(/*! ./internal/operators/scan */ "./node_modules/rxjs/dist/esm5/internal/operators/scan.js");
/* harmony import */ var _internal_operators_sequenceEqual__WEBPACK_IMPORTED_MODULE_129__ = __webpack_require__(/*! ./internal/operators/sequenceEqual */ "./node_modules/rxjs/dist/esm5/internal/operators/sequenceEqual.js");
/* harmony import */ var _internal_operators_share__WEBPACK_IMPORTED_MODULE_130__ = __webpack_require__(/*! ./internal/operators/share */ "./node_modules/rxjs/dist/esm5/internal/operators/share.js");
/* harmony import */ var _internal_operators_shareReplay__WEBPACK_IMPORTED_MODULE_131__ = __webpack_require__(/*! ./internal/operators/shareReplay */ "./node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js");
/* harmony import */ var _internal_operators_single__WEBPACK_IMPORTED_MODULE_132__ = __webpack_require__(/*! ./internal/operators/single */ "./node_modules/rxjs/dist/esm5/internal/operators/single.js");
/* harmony import */ var _internal_operators_skip__WEBPACK_IMPORTED_MODULE_133__ = __webpack_require__(/*! ./internal/operators/skip */ "./node_modules/rxjs/dist/esm5/internal/operators/skip.js");
/* harmony import */ var _internal_operators_skipLast__WEBPACK_IMPORTED_MODULE_134__ = __webpack_require__(/*! ./internal/operators/skipLast */ "./node_modules/rxjs/dist/esm5/internal/operators/skipLast.js");
/* harmony import */ var _internal_operators_skipUntil__WEBPACK_IMPORTED_MODULE_135__ = __webpack_require__(/*! ./internal/operators/skipUntil */ "./node_modules/rxjs/dist/esm5/internal/operators/skipUntil.js");
/* harmony import */ var _internal_operators_skipWhile__WEBPACK_IMPORTED_MODULE_136__ = __webpack_require__(/*! ./internal/operators/skipWhile */ "./node_modules/rxjs/dist/esm5/internal/operators/skipWhile.js");
/* harmony import */ var _internal_operators_startWith__WEBPACK_IMPORTED_MODULE_137__ = __webpack_require__(/*! ./internal/operators/startWith */ "./node_modules/rxjs/dist/esm5/internal/operators/startWith.js");
/* harmony import */ var _internal_operators_subscribeOn__WEBPACK_IMPORTED_MODULE_138__ = __webpack_require__(/*! ./internal/operators/subscribeOn */ "./node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js");
/* harmony import */ var _internal_operators_switchAll__WEBPACK_IMPORTED_MODULE_139__ = __webpack_require__(/*! ./internal/operators/switchAll */ "./node_modules/rxjs/dist/esm5/internal/operators/switchAll.js");
/* harmony import */ var _internal_operators_switchMap__WEBPACK_IMPORTED_MODULE_140__ = __webpack_require__(/*! ./internal/operators/switchMap */ "./node_modules/rxjs/dist/esm5/internal/operators/switchMap.js");
/* harmony import */ var _internal_operators_switchMapTo__WEBPACK_IMPORTED_MODULE_141__ = __webpack_require__(/*! ./internal/operators/switchMapTo */ "./node_modules/rxjs/dist/esm5/internal/operators/switchMapTo.js");
/* harmony import */ var _internal_operators_switchScan__WEBPACK_IMPORTED_MODULE_142__ = __webpack_require__(/*! ./internal/operators/switchScan */ "./node_modules/rxjs/dist/esm5/internal/operators/switchScan.js");
/* harmony import */ var _internal_operators_take__WEBPACK_IMPORTED_MODULE_143__ = __webpack_require__(/*! ./internal/operators/take */ "./node_modules/rxjs/dist/esm5/internal/operators/take.js");
/* harmony import */ var _internal_operators_takeLast__WEBPACK_IMPORTED_MODULE_144__ = __webpack_require__(/*! ./internal/operators/takeLast */ "./node_modules/rxjs/dist/esm5/internal/operators/takeLast.js");
/* harmony import */ var _internal_operators_takeUntil__WEBPACK_IMPORTED_MODULE_145__ = __webpack_require__(/*! ./internal/operators/takeUntil */ "./node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js");
/* harmony import */ var _internal_operators_takeWhile__WEBPACK_IMPORTED_MODULE_146__ = __webpack_require__(/*! ./internal/operators/takeWhile */ "./node_modules/rxjs/dist/esm5/internal/operators/takeWhile.js");
/* harmony import */ var _internal_operators_tap__WEBPACK_IMPORTED_MODULE_147__ = __webpack_require__(/*! ./internal/operators/tap */ "./node_modules/rxjs/dist/esm5/internal/operators/tap.js");
/* harmony import */ var _internal_operators_throttle__WEBPACK_IMPORTED_MODULE_148__ = __webpack_require__(/*! ./internal/operators/throttle */ "./node_modules/rxjs/dist/esm5/internal/operators/throttle.js");
/* harmony import */ var _internal_operators_throttleTime__WEBPACK_IMPORTED_MODULE_149__ = __webpack_require__(/*! ./internal/operators/throttleTime */ "./node_modules/rxjs/dist/esm5/internal/operators/throttleTime.js");
/* harmony import */ var _internal_operators_throwIfEmpty__WEBPACK_IMPORTED_MODULE_150__ = __webpack_require__(/*! ./internal/operators/throwIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _internal_operators_timeInterval__WEBPACK_IMPORTED_MODULE_151__ = __webpack_require__(/*! ./internal/operators/timeInterval */ "./node_modules/rxjs/dist/esm5/internal/operators/timeInterval.js");
/* harmony import */ var _internal_operators_timeoutWith__WEBPACK_IMPORTED_MODULE_152__ = __webpack_require__(/*! ./internal/operators/timeoutWith */ "./node_modules/rxjs/dist/esm5/internal/operators/timeoutWith.js");
/* harmony import */ var _internal_operators_timestamp__WEBPACK_IMPORTED_MODULE_153__ = __webpack_require__(/*! ./internal/operators/timestamp */ "./node_modules/rxjs/dist/esm5/internal/operators/timestamp.js");
/* harmony import */ var _internal_operators_toArray__WEBPACK_IMPORTED_MODULE_154__ = __webpack_require__(/*! ./internal/operators/toArray */ "./node_modules/rxjs/dist/esm5/internal/operators/toArray.js");
/* harmony import */ var _internal_operators_window__WEBPACK_IMPORTED_MODULE_155__ = __webpack_require__(/*! ./internal/operators/window */ "./node_modules/rxjs/dist/esm5/internal/operators/window.js");
/* harmony import */ var _internal_operators_windowCount__WEBPACK_IMPORTED_MODULE_156__ = __webpack_require__(/*! ./internal/operators/windowCount */ "./node_modules/rxjs/dist/esm5/internal/operators/windowCount.js");
/* harmony import */ var _internal_operators_windowTime__WEBPACK_IMPORTED_MODULE_157__ = __webpack_require__(/*! ./internal/operators/windowTime */ "./node_modules/rxjs/dist/esm5/internal/operators/windowTime.js");
/* harmony import */ var _internal_operators_windowToggle__WEBPACK_IMPORTED_MODULE_158__ = __webpack_require__(/*! ./internal/operators/windowToggle */ "./node_modules/rxjs/dist/esm5/internal/operators/windowToggle.js");
/* harmony import */ var _internal_operators_windowWhen__WEBPACK_IMPORTED_MODULE_159__ = __webpack_require__(/*! ./internal/operators/windowWhen */ "./node_modules/rxjs/dist/esm5/internal/operators/windowWhen.js");
/* harmony import */ var _internal_operators_withLatestFrom__WEBPACK_IMPORTED_MODULE_160__ = __webpack_require__(/*! ./internal/operators/withLatestFrom */ "./node_modules/rxjs/dist/esm5/internal/operators/withLatestFrom.js");
/* harmony import */ var _internal_operators_zipAll__WEBPACK_IMPORTED_MODULE_161__ = __webpack_require__(/*! ./internal/operators/zipAll */ "./node_modules/rxjs/dist/esm5/internal/operators/zipAll.js");
/* harmony import */ var _internal_operators_zipWith__WEBPACK_IMPORTED_MODULE_162__ = __webpack_require__(/*! ./internal/operators/zipWith */ "./node_modules/rxjs/dist/esm5/internal/operators/zipWith.js");







































































































































































//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/AsyncSubject.js":
/*!**************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/AsyncSubject.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsyncSubject": () => (/* binding */ AsyncSubject)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");


var AsyncSubject = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AsyncSubject, _super);
    function AsyncSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._value = null;
        _this._hasValue = false;
        _this._isComplete = false;
        return _this;
    }
    AsyncSubject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, _hasValue = _a._hasValue, _value = _a._value, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            _hasValue && subscriber.next(_value);
            subscriber.complete();
        }
    };
    AsyncSubject.prototype.next = function (value) {
        if (!this.isStopped) {
            this._value = value;
            this._hasValue = true;
        }
    };
    AsyncSubject.prototype.complete = function () {
        var _a = this, _hasValue = _a._hasValue, _value = _a._value, _isComplete = _a._isComplete;
        if (!_isComplete) {
            this._isComplete = true;
            _hasValue && _super.prototype.next.call(this, _value);
            _super.prototype.complete.call(this);
        }
    };
    return AsyncSubject;
}(_Subject__WEBPACK_IMPORTED_MODULE_1__.Subject));

//# sourceMappingURL=AsyncSubject.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/BehaviorSubject.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/BehaviorSubject.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BehaviorSubject": () => (/* binding */ BehaviorSubject)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");


var BehaviorSubject = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: false,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        !subscription.closed && subscriber.next(this._value);
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
        if (hasError) {
            throw thrownError;
        }
        this._throwIfClosed();
        return _value;
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, (this._value = value));
    };
    return BehaviorSubject;
}(_Subject__WEBPACK_IMPORTED_MODULE_1__.Subject));

//# sourceMappingURL=BehaviorSubject.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/Notification.js":
/*!**************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/Notification.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NotificationKind": () => (/* binding */ NotificationKind),
/* harmony export */   "Notification": () => (/* binding */ Notification),
/* harmony export */   "observeNotification": () => (/* binding */ observeNotification)
/* harmony export */ });
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./observable/empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _observable_of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./observable/of */ "./node_modules/rxjs/dist/esm5/internal/observable/of.js");
/* harmony import */ var _observable_throwError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./observable/throwError */ "./node_modules/rxjs/dist/esm5/internal/observable/throwError.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");




var NotificationKind;
(function (NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));
var Notification = (function () {
    function Notification(kind, value, error) {
        this.kind = kind;
        this.value = value;
        this.error = error;
        this.hasValue = kind === 'N';
    }
    Notification.prototype.observe = function (observer) {
        return observeNotification(this, observer);
    };
    Notification.prototype.do = function (nextHandler, errorHandler, completeHandler) {
        var _a = this, kind = _a.kind, value = _a.value, error = _a.error;
        return kind === 'N' ? nextHandler === null || nextHandler === void 0 ? void 0 : nextHandler(value) : kind === 'E' ? errorHandler === null || errorHandler === void 0 ? void 0 : errorHandler(error) : completeHandler === null || completeHandler === void 0 ? void 0 : completeHandler();
    };
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        var _a;
        return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)((_a = nextOrObserver) === null || _a === void 0 ? void 0 : _a.next)
            ? this.observe(nextOrObserver)
            : this.do(nextOrObserver, error, complete);
    };
    Notification.prototype.toObservable = function () {
        var _a = this, kind = _a.kind, value = _a.value, error = _a.error;
        var result = kind === 'N'
            ?
                (0,_observable_of__WEBPACK_IMPORTED_MODULE_1__.of)(value)
            :
                kind === 'E'
                    ?
                        (0,_observable_throwError__WEBPACK_IMPORTED_MODULE_2__.throwError)(function () { return error; })
                    :
                        kind === 'C'
                            ?
                                _observable_empty__WEBPACK_IMPORTED_MODULE_3__.EMPTY
                            :
                                0;
        if (!result) {
            throw new TypeError("Unexpected notification kind " + kind);
        }
        return result;
    };
    Notification.createNext = function (value) {
        return new Notification('N', value);
    };
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    Notification.createComplete = function () {
        return Notification.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    return Notification;
}());

function observeNotification(notification, observer) {
    var _a, _b, _c;
    var _d = notification, kind = _d.kind, value = _d.value, error = _d.error;
    if (typeof kind !== 'string') {
        throw new TypeError('Invalid notification, missing "kind"');
    }
    kind === 'N' ? (_a = observer.next) === null || _a === void 0 ? void 0 : _a.call(observer, value) : kind === 'E' ? (_b = observer.error) === null || _b === void 0 ? void 0 : _b.call(observer, error) : (_c = observer.complete) === null || _c === void 0 ? void 0 : _c.call(observer);
}
//# sourceMappingURL=Notification.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/NotificationFactories.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/NotificationFactories.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COMPLETE_NOTIFICATION": () => (/* binding */ COMPLETE_NOTIFICATION),
/* harmony export */   "errorNotification": () => (/* binding */ errorNotification),
/* harmony export */   "nextNotification": () => (/* binding */ nextNotification),
/* harmony export */   "createNotification": () => (/* binding */ createNotification)
/* harmony export */ });
var COMPLETE_NOTIFICATION = (function () { return createNotification('C', undefined, undefined); })();
function errorNotification(error) {
    return createNotification('E', undefined, error);
}
function nextNotification(value) {
    return createNotification('N', value, undefined);
}
function createNotification(kind, value, error) {
    return {
        kind: kind,
        value: value,
        error: error,
    };
}
//# sourceMappingURL=NotificationFactories.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/Observable.js":
/*!************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/Observable.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Observable": () => (/* binding */ Observable)
/* harmony export */ });
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Subscriber */ "./node_modules/rxjs/dist/esm5/internal/Subscriber.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./symbol/observable */ "./node_modules/rxjs/dist/esm5/internal/symbol/observable.js");
/* harmony import */ var _util_pipe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/pipe */ "./node_modules/rxjs/dist/esm5/internal/util/pipe.js");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./config */ "./node_modules/rxjs/dist/esm5/internal/config.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _util_errorContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/errorContext */ "./node_modules/rxjs/dist/esm5/internal/util/errorContext.js");







var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new _Subscriber__WEBPACK_IMPORTED_MODULE_0__.SafeSubscriber(observerOrNext, error, complete);
        (0,_util_errorContext__WEBPACK_IMPORTED_MODULE_1__.errorContext)(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function (value) {
                try {
                    next(value);
                }
                catch (err) {
                    reject(err);
                    subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[_symbol_observable__WEBPACK_IMPORTED_MODULE_2__.observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return operations.length ? (0,_util_pipe__WEBPACK_IMPORTED_MODULE_3__.pipeFromArray)(operations)(this) : this;
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());

function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : _config__WEBPACK_IMPORTED_MODULE_4__.config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_5__.isFunction)(value.next) && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_5__.isFunction)(value.error) && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_5__.isFunction)(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof _Subscriber__WEBPACK_IMPORTED_MODULE_0__.Subscriber) || (isObserver(value) && (0,_Subscription__WEBPACK_IMPORTED_MODULE_6__.isSubscription)(value));
}
//# sourceMappingURL=Observable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/ReplaySubject.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/ReplaySubject.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ReplaySubject": () => (/* binding */ ReplaySubject)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scheduler/dateTimestampProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js");



var ReplaySubject = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(ReplaySubject, _super);
    function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
        if (_bufferSize === void 0) { _bufferSize = Infinity; }
        if (_windowTime === void 0) { _windowTime = Infinity; }
        if (_timestampProvider === void 0) { _timestampProvider = _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_1__.dateTimestampProvider; }
        var _this = _super.call(this) || this;
        _this._bufferSize = _bufferSize;
        _this._windowTime = _windowTime;
        _this._timestampProvider = _timestampProvider;
        _this._buffer = [];
        _this._infiniteTimeWindow = true;
        _this._infiniteTimeWindow = _windowTime === Infinity;
        _this._bufferSize = Math.max(1, _bufferSize);
        _this._windowTime = Math.max(1, _windowTime);
        return _this;
    }
    ReplaySubject.prototype.next = function (value) {
        var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
        if (!isStopped) {
            _buffer.push(value);
            !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
        }
        this._trimBuffer();
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._trimBuffer();
        var subscription = this._innerSubscribe(subscriber);
        var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow, _buffer = _a._buffer;
        var copy = _buffer.slice();
        for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
            subscriber.next(copy[i]);
        }
        this._checkFinalizedStatuses(subscriber);
        return subscription;
    };
    ReplaySubject.prototype._trimBuffer = function () {
        var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
        var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
        _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
        if (!_infiniteTimeWindow) {
            var now = _timestampProvider.now();
            var last = 0;
            for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
                last = i;
            }
            last && _buffer.splice(0, last + 1);
        }
    };
    return ReplaySubject;
}(_Subject__WEBPACK_IMPORTED_MODULE_2__.Subject));

//# sourceMappingURL=ReplaySubject.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/Scheduler.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/Scheduler.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Scheduler": () => (/* binding */ Scheduler)
/* harmony export */ });
/* harmony import */ var _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scheduler/dateTimestampProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js");

var Scheduler = (function () {
    function Scheduler(schedulerActionCtor, now) {
        if (now === void 0) { now = Scheduler.now; }
        this.schedulerActionCtor = schedulerActionCtor;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) { delay = 0; }
        return new this.schedulerActionCtor(this, work).schedule(state, delay);
    };
    Scheduler.now = _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_0__.dateTimestampProvider.now;
    return Scheduler;
}());

//# sourceMappingURL=Scheduler.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/Subject.js":
/*!*********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/Subject.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Subject": () => (/* binding */ Subject),
/* harmony export */   "AnonymousSubject": () => (/* binding */ AnonymousSubject)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/ObjectUnsubscribedError */ "./node_modules/rxjs/dist/esm5/internal/util/ObjectUnsubscribedError.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");
/* harmony import */ var _util_errorContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/errorContext */ "./node_modules/rxjs/dist/esm5/internal/util/errorContext.js");






var Subject = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.observers = [];
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._throwIfClosed = function () {
        if (this.closed) {
            throw new _util_ObjectUnsubscribedError__WEBPACK_IMPORTED_MODULE_1__.ObjectUnsubscribedError();
        }
    };
    Subject.prototype.next = function (value) {
        var _this = this;
        (0,_util_errorContext__WEBPACK_IMPORTED_MODULE_2__.errorContext)(function () {
            var e_1, _a;
            _this._throwIfClosed();
            if (!_this.isStopped) {
                var copy = _this.observers.slice();
                try {
                    for (var copy_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__values)(copy), copy_1_1 = copy_1.next(); !copy_1_1.done; copy_1_1 = copy_1.next()) {
                        var observer = copy_1_1.value;
                        observer.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (copy_1_1 && !copy_1_1.done && (_a = copy_1.return)) _a.call(copy_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    };
    Subject.prototype.error = function (err) {
        var _this = this;
        (0,_util_errorContext__WEBPACK_IMPORTED_MODULE_2__.errorContext)(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.hasError = _this.isStopped = true;
                _this.thrownError = err;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().error(err);
                }
            }
        });
    };
    Subject.prototype.complete = function () {
        var _this = this;
        (0,_util_errorContext__WEBPACK_IMPORTED_MODULE_2__.errorContext)(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.isStopped = true;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().complete();
                }
            }
        });
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = this.closed = true;
        this.observers = null;
    };
    Object.defineProperty(Subject.prototype, "observed", {
        get: function () {
            var _a;
            return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Subject.prototype._trySubscribe = function (subscriber) {
        this._throwIfClosed();
        return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    };
    Subject.prototype._innerSubscribe = function (subscriber) {
        var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
        return hasError || isStopped
            ? _Subscription__WEBPACK_IMPORTED_MODULE_3__.EMPTY_SUBSCRIPTION
            : (observers.push(subscriber), new _Subscription__WEBPACK_IMPORTED_MODULE_3__.Subscription(function () { return (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_4__.arrRemove)(observers, subscriber); }));
    };
    Subject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            subscriber.complete();
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new _Observable__WEBPACK_IMPORTED_MODULE_5__.Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(_Observable__WEBPACK_IMPORTED_MODULE_5__.Observable));

var AnonymousSubject = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    };
    AnonymousSubject.prototype.error = function (err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    AnonymousSubject.prototype.complete = function () {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var _a, _b;
        return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : _Subscription__WEBPACK_IMPORTED_MODULE_3__.EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject;
}(Subject));

//# sourceMappingURL=Subject.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/Subscriber.js":
/*!************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/Subscriber.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Subscriber": () => (/* binding */ Subscriber),
/* harmony export */   "SafeSubscriber": () => (/* binding */ SafeSubscriber),
/* harmony export */   "EMPTY_OBSERVER": () => (/* binding */ EMPTY_OBSERVER)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./config */ "./node_modules/rxjs/dist/esm5/internal/config.js");
/* harmony import */ var _util_reportUnhandledError__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./util/reportUnhandledError */ "./node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _NotificationFactories__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./NotificationFactories */ "./node_modules/rxjs/dist/esm5/internal/NotificationFactories.js");
/* harmony import */ var _scheduler_timeoutProvider__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./scheduler/timeoutProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js");
/* harmony import */ var _util_errorContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util/errorContext */ "./node_modules/rxjs/dist/esm5/internal/util/errorContext.js");









var Subscriber = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if ((0,_Subscription__WEBPACK_IMPORTED_MODULE_1__.isSubscription)(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) {
            handleStoppedNotification((0,_NotificationFactories__WEBPACK_IMPORTED_MODULE_2__.nextNotification)(value), this);
        }
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) {
            handleStoppedNotification((0,_NotificationFactories__WEBPACK_IMPORTED_MODULE_2__.errorNotification)(err), this);
        }
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) {
            handleStoppedNotification(_NotificationFactories__WEBPACK_IMPORTED_MODULE_2__.COMPLETE_NOTIFICATION, this);
        }
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
            this.destination = null;
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    };
    Subscriber.prototype._complete = function () {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(_Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription));

var SafeSubscriber = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        var next;
        if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_3__.isFunction)(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            (next = observerOrNext.next, error = observerOrNext.error, complete = observerOrNext.complete);
            var context_1;
            if (_this && _config__WEBPACK_IMPORTED_MODULE_4__.config.useDeprecatedNextContext) {
                context_1 = Object.create(observerOrNext);
                context_1.unsubscribe = function () { return _this.unsubscribe(); };
            }
            else {
                context_1 = observerOrNext;
            }
            next = next === null || next === void 0 ? void 0 : next.bind(context_1);
            error = error === null || error === void 0 ? void 0 : error.bind(context_1);
            complete = complete === null || complete === void 0 ? void 0 : complete.bind(context_1);
        }
        _this.destination = {
            next: next ? wrapForErrorHandling(next, _this) : _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop,
            error: wrapForErrorHandling(error !== null && error !== void 0 ? error : defaultErrorHandler, _this),
            complete: complete ? wrapForErrorHandling(complete, _this) : _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop,
        };
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));

function wrapForErrorHandling(handler, instance) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        try {
            handler.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__read)(args)));
        }
        catch (err) {
            if (_config__WEBPACK_IMPORTED_MODULE_4__.config.useDeprecatedSynchronousErrorHandling) {
                (0,_util_errorContext__WEBPACK_IMPORTED_MODULE_6__.captureError)(err);
            }
            else {
                (0,_util_reportUnhandledError__WEBPACK_IMPORTED_MODULE_7__.reportUnhandledError)(err);
            }
        }
    };
}
function defaultErrorHandler(err) {
    throw err;
}
function handleStoppedNotification(notification, subscriber) {
    var onStoppedNotification = _config__WEBPACK_IMPORTED_MODULE_4__.config.onStoppedNotification;
    onStoppedNotification && _scheduler_timeoutProvider__WEBPACK_IMPORTED_MODULE_8__.timeoutProvider.setTimeout(function () { return onStoppedNotification(notification, subscriber); });
}
var EMPTY_OBSERVER = {
    closed: true,
    next: _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop,
    error: defaultErrorHandler,
    complete: _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop,
};
//# sourceMappingURL=Subscriber.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/Subscription.js":
/*!**************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/Subscription.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Subscription": () => (/* binding */ Subscription),
/* harmony export */   "EMPTY_SUBSCRIPTION": () => (/* binding */ EMPTY_SUBSCRIPTION),
/* harmony export */   "isSubscription": () => (/* binding */ isSubscription)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/UnsubscriptionError */ "./node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");




var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._teardowns = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__values)(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialTeardown = this.initialTeardown;
            if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(initialTeardown)) {
                try {
                    initialTeardown();
                }
                catch (e) {
                    errors = e instanceof _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_2__.UnsubscriptionError ? e.errors : [e];
                }
            }
            var _teardowns = this._teardowns;
            if (_teardowns) {
                this._teardowns = null;
                try {
                    for (var _teardowns_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__values)(_teardowns), _teardowns_1_1 = _teardowns_1.next(); !_teardowns_1_1.done; _teardowns_1_1 = _teardowns_1.next()) {
                        var teardown_1 = _teardowns_1_1.value;
                        try {
                            execTeardown(teardown_1);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_2__.UnsubscriptionError) {
                                errors = (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__spreadArray)((0,tslib__WEBPACK_IMPORTED_MODULE_0__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__read)(errors)), (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__read)(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_teardowns_1_1 && !_teardowns_1_1.done && (_b = _teardowns_1.return)) _b.call(_teardowns_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new _util_UnsubscriptionError__WEBPACK_IMPORTED_MODULE_2__.UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execTeardown(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._teardowns = (_a = this._teardowns) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_3__.arrRemove)(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _teardowns = this._teardowns;
        _teardowns && (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_3__.arrRemove)(_teardowns, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());

var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value.remove) && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value.add) && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value.unsubscribe)));
}
function execTeardown(teardown) {
    if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(teardown)) {
        teardown();
    }
    else {
        teardown.unsubscribe();
    }
}
//# sourceMappingURL=Subscription.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/config.js":
/*!********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/config.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "config": () => (/* binding */ config)
/* harmony export */ });
var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};
//# sourceMappingURL=config.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/firstValueFrom.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/firstValueFrom.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "firstValueFrom": () => (/* binding */ firstValueFrom)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/EmptyError */ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Subscriber */ "./node_modules/rxjs/dist/esm5/internal/Subscriber.js");


function firstValueFrom(source, config) {
    var hasConfig = typeof config === 'object';
    return new Promise(function (resolve, reject) {
        var subscriber = new _Subscriber__WEBPACK_IMPORTED_MODULE_0__.SafeSubscriber({
            next: function (value) {
                resolve(value);
                subscriber.unsubscribe();
            },
            error: reject,
            complete: function () {
                if (hasConfig) {
                    resolve(config.defaultValue);
                }
                else {
                    reject(new _util_EmptyError__WEBPACK_IMPORTED_MODULE_1__.EmptyError());
                }
            },
        });
        source.subscribe(subscriber);
    });
}
//# sourceMappingURL=firstValueFrom.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/lastValueFrom.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/lastValueFrom.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lastValueFrom": () => (/* binding */ lastValueFrom)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/EmptyError */ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js");

function lastValueFrom(source, config) {
    var hasConfig = typeof config === 'object';
    return new Promise(function (resolve, reject) {
        var _hasValue = false;
        var _value;
        source.subscribe({
            next: function (value) {
                _value = value;
                _hasValue = true;
            },
            error: reject,
            complete: function () {
                if (_hasValue) {
                    resolve(_value);
                }
                else if (hasConfig) {
                    resolve(config.defaultValue);
                }
                else {
                    reject(new _util_EmptyError__WEBPACK_IMPORTED_MODULE_0__.EmptyError());
                }
            },
        });
    });
}
//# sourceMappingURL=lastValueFrom.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/ConnectableObservable.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/ConnectableObservable.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConnectableObservable": () => (/* binding */ ConnectableObservable)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _operators_refCount__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../operators/refCount */ "./node_modules/rxjs/dist/esm5/internal/operators/refCount.js");
/* harmony import */ var _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../operators/OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");






var ConnectableObservable = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(ConnectableObservable, _super);
    function ConnectableObservable(source, subjectFactory) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subjectFactory = subjectFactory;
        _this._subject = null;
        _this._refCount = 0;
        _this._connection = null;
        if ((0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.hasLift)(source)) {
            _this.lift = source.lift;
        }
        return _this;
    }
    ConnectableObservable.prototype._subscribe = function (subscriber) {
        return this.getSubject().subscribe(subscriber);
    };
    ConnectableObservable.prototype.getSubject = function () {
        var subject = this._subject;
        if (!subject || subject.isStopped) {
            this._subject = this.subjectFactory();
        }
        return this._subject;
    };
    ConnectableObservable.prototype._teardown = function () {
        this._refCount = 0;
        var _connection = this._connection;
        this._subject = this._connection = null;
        _connection === null || _connection === void 0 ? void 0 : _connection.unsubscribe();
    };
    ConnectableObservable.prototype.connect = function () {
        var _this = this;
        var connection = this._connection;
        if (!connection) {
            connection = this._connection = new _Subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription();
            var subject_1 = this.getSubject();
            connection.add(this.source.subscribe(new _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subject_1, undefined, function () {
                _this._teardown();
                subject_1.complete();
            }, function (err) {
                _this._teardown();
                subject_1.error(err);
            }, function () { return _this._teardown(); })));
            if (connection.closed) {
                this._connection = null;
                connection = _Subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription.EMPTY;
            }
        }
        return connection;
    };
    ConnectableObservable.prototype.refCount = function () {
        return (0,_operators_refCount__WEBPACK_IMPORTED_MODULE_4__.refCount)()(this);
    };
    return ConnectableObservable;
}(_Observable__WEBPACK_IMPORTED_MODULE_5__.Observable));

//# sourceMappingURL=ConnectableObservable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/bindCallback.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/bindCallback.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bindCallback": () => (/* binding */ bindCallback)
/* harmony export */ });
/* harmony import */ var _bindCallbackInternals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bindCallbackInternals */ "./node_modules/rxjs/dist/esm5/internal/observable/bindCallbackInternals.js");

function bindCallback(callbackFunc, resultSelector, scheduler) {
    return (0,_bindCallbackInternals__WEBPACK_IMPORTED_MODULE_0__.bindCallbackInternals)(false, callbackFunc, resultSelector, scheduler);
}
//# sourceMappingURL=bindCallback.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/bindCallbackInternals.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/bindCallbackInternals.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bindCallbackInternals": () => (/* binding */ bindCallbackInternals)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isScheduler */ "./node_modules/rxjs/dist/esm5/internal/util/isScheduler.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _operators_subscribeOn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../operators/subscribeOn */ "./node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js");
/* harmony import */ var _util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/mapOneOrManyArgs */ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js");
/* harmony import */ var _operators_observeOn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../operators/observeOn */ "./node_modules/rxjs/dist/esm5/internal/operators/observeOn.js");
/* harmony import */ var _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../AsyncSubject */ "./node_modules/rxjs/dist/esm5/internal/AsyncSubject.js");







function bindCallbackInternals(isNodeStyle, callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_0__.isScheduler)(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindCallbackInternals(isNodeStyle, callbackFunc, scheduler)
                    .apply(this, args)
                    .pipe((0,_util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_1__.mapOneOrManyArgs)(resultSelector));
            };
        }
    }
    if (scheduler) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return bindCallbackInternals(isNodeStyle, callbackFunc)
                .apply(this, args)
                .pipe((0,_operators_subscribeOn__WEBPACK_IMPORTED_MODULE_2__.subscribeOn)(scheduler), (0,_operators_observeOn__WEBPACK_IMPORTED_MODULE_3__.observeOn)(scheduler));
        };
    }
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var subject = new _AsyncSubject__WEBPACK_IMPORTED_MODULE_4__.AsyncSubject();
        var uninitialized = true;
        return new _Observable__WEBPACK_IMPORTED_MODULE_5__.Observable(function (subscriber) {
            var subs = subject.subscribe(subscriber);
            if (uninitialized) {
                uninitialized = false;
                var isAsync_1 = false;
                var isComplete_1 = false;
                callbackFunc.apply(_this, (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__spreadArray)((0,tslib__WEBPACK_IMPORTED_MODULE_6__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__read)(args)), [
                    function () {
                        var results = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            results[_i] = arguments[_i];
                        }
                        if (isNodeStyle) {
                            var err = results.shift();
                            if (err != null) {
                                subject.error(err);
                                return;
                            }
                        }
                        subject.next(1 < results.length ? results : results[0]);
                        isComplete_1 = true;
                        if (isAsync_1) {
                            subject.complete();
                        }
                    },
                ]));
                if (isComplete_1) {
                    subject.complete();
                }
                isAsync_1 = true;
            }
            return subs;
        });
    };
}
//# sourceMappingURL=bindCallbackInternals.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/bindNodeCallback.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/bindNodeCallback.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bindNodeCallback": () => (/* binding */ bindNodeCallback)
/* harmony export */ });
/* harmony import */ var _bindCallbackInternals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bindCallbackInternals */ "./node_modules/rxjs/dist/esm5/internal/observable/bindCallbackInternals.js");

function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
    return (0,_bindCallbackInternals__WEBPACK_IMPORTED_MODULE_0__.bindCallbackInternals)(true, callbackFunc, resultSelector, scheduler);
}
//# sourceMappingURL=bindNodeCallback.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/combineLatest.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/combineLatest.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "combineLatest": () => (/* binding */ combineLatest),
/* harmony export */   "combineLatestInit": () => (/* binding */ combineLatestInit)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _util_argsArgArrayOrObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/argsArgArrayOrObject */ "./node_modules/rxjs/dist/esm5/internal/util/argsArgArrayOrObject.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");
/* harmony import */ var _util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/mapOneOrManyArgs */ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");
/* harmony import */ var _util_createObject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/createObject */ "./node_modules/rxjs/dist/esm5/internal/util/createObject.js");
/* harmony import */ var _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../operators/OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");








function combineLatest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(args);
    var resultSelector = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popResultSelector)(args);
    var _a = (0,_util_argsArgArrayOrObject__WEBPACK_IMPORTED_MODULE_1__.argsArgArrayOrObject)(args), observables = _a.args, keys = _a.keys;
    if (observables.length === 0) {
        return (0,_from__WEBPACK_IMPORTED_MODULE_2__.from)([], scheduler);
    }
    var result = new _Observable__WEBPACK_IMPORTED_MODULE_3__.Observable(combineLatestInit(observables, scheduler, keys
        ?
            function (values) { return (0,_util_createObject__WEBPACK_IMPORTED_MODULE_4__.createObject)(keys, values); }
        :
            _util_identity__WEBPACK_IMPORTED_MODULE_5__.identity));
    return resultSelector ? result.pipe((0,_util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_6__.mapOneOrManyArgs)(resultSelector)) : result;
}
function combineLatestInit(observables, scheduler, valueTransform) {
    if (valueTransform === void 0) { valueTransform = _util_identity__WEBPACK_IMPORTED_MODULE_5__.identity; }
    return function (subscriber) {
        maybeSchedule(scheduler, function () {
            var length = observables.length;
            var values = new Array(length);
            var active = length;
            var remainingFirstValues = length;
            var _loop_1 = function (i) {
                maybeSchedule(scheduler, function () {
                    var source = (0,_from__WEBPACK_IMPORTED_MODULE_2__.from)(observables[i], scheduler);
                    var hasFirstValue = false;
                    source.subscribe(new _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_7__.OperatorSubscriber(subscriber, function (value) {
                        values[i] = value;
                        if (!hasFirstValue) {
                            hasFirstValue = true;
                            remainingFirstValues--;
                        }
                        if (!remainingFirstValues) {
                            subscriber.next(valueTransform(values.slice()));
                        }
                    }, function () {
                        if (!--active) {
                            subscriber.complete();
                        }
                    }));
                }, subscriber);
            };
            for (var i = 0; i < length; i++) {
                _loop_1(i);
            }
        }, subscriber);
    };
}
function maybeSchedule(scheduler, execute, subscription) {
    if (scheduler) {
        subscription.add(scheduler.schedule(execute));
    }
    else {
        execute();
    }
}
//# sourceMappingURL=combineLatest.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/concat.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/concat.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "concat": () => (/* binding */ concat)
/* harmony export */ });
/* harmony import */ var _operators_concatAll__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../operators/concatAll */ "./node_modules/rxjs/dist/esm5/internal/operators/concatAll.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fromArray */ "./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");



function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return (0,_operators_concatAll__WEBPACK_IMPORTED_MODULE_0__.concatAll)()((0,_fromArray__WEBPACK_IMPORTED_MODULE_1__.internalFromArray)(args, (0,_util_args__WEBPACK_IMPORTED_MODULE_2__.popScheduler)(args)));
}
//# sourceMappingURL=concat.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/connectable.js":
/*!************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/connectable.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "connectable": () => (/* binding */ connectable)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _defer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./defer */ "./node_modules/rxjs/dist/esm5/internal/observable/defer.js");



var DEFAULT_CONFIG = {
    connector: function () { return new _Subject__WEBPACK_IMPORTED_MODULE_0__.Subject(); },
    resetOnDisconnect: true,
};
function connectable(source, config) {
    if (config === void 0) { config = DEFAULT_CONFIG; }
    var connection = null;
    var connector = config.connector, _a = config.resetOnDisconnect, resetOnDisconnect = _a === void 0 ? true : _a;
    var subject = connector();
    var result = new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        return subject.subscribe(subscriber);
    });
    result.connect = function () {
        if (!connection || connection.closed) {
            connection = (0,_defer__WEBPACK_IMPORTED_MODULE_2__.defer)(function () { return source; }).subscribe(subject);
            if (resetOnDisconnect) {
                connection.add(function () { return (subject = connector()); });
            }
        }
        return connection;
    };
    return result;
}
//# sourceMappingURL=connectable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/defer.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/defer.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defer": () => (/* binding */ defer)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");


function defer(observableFactory) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        (0,_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(observableFactory()).subscribe(subscriber);
    });
}
//# sourceMappingURL=defer.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/dom/animationFrames.js":
/*!********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/dom/animationFrames.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "animationFrames": () => (/* binding */ animationFrames)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _scheduler_performanceTimestampProvider__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../scheduler/performanceTimestampProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/performanceTimestampProvider.js");
/* harmony import */ var _scheduler_animationFrameProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../scheduler/animationFrameProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/animationFrameProvider.js");




function animationFrames(timestampProvider) {
    return timestampProvider ? animationFramesFactory(timestampProvider) : DEFAULT_ANIMATION_FRAMES;
}
function animationFramesFactory(timestampProvider) {
    var schedule = _scheduler_animationFrameProvider__WEBPACK_IMPORTED_MODULE_0__.animationFrameProvider.schedule;
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        var subscription = new _Subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription();
        var provider = timestampProvider || _scheduler_performanceTimestampProvider__WEBPACK_IMPORTED_MODULE_3__.performanceTimestampProvider;
        var start = provider.now();
        var run = function (timestamp) {
            var now = provider.now();
            subscriber.next({
                timestamp: timestampProvider ? now : timestamp,
                elapsed: now - start
            });
            if (!subscriber.closed) {
                subscription.add(schedule(run));
            }
        };
        subscription.add(schedule(run));
        return subscription;
    });
}
var DEFAULT_ANIMATION_FRAMES = animationFramesFactory();
//# sourceMappingURL=animationFrames.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/empty.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EMPTY": () => (/* binding */ EMPTY),
/* harmony export */   "empty": () => (/* binding */ empty)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");

var EMPTY = new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) { return subscriber.complete(); });
function empty(scheduler) {
    return scheduler ? emptyScheduled(scheduler) : EMPTY;
}
function emptyScheduled(scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
}
//# sourceMappingURL=empty.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/forkJoin.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/forkJoin.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "forkJoin": () => (/* binding */ forkJoin)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _util_argsArgArrayOrObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/argsArgArrayOrObject */ "./node_modules/rxjs/dist/esm5/internal/util/argsArgArrayOrObject.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");
/* harmony import */ var _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../operators/OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/mapOneOrManyArgs */ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js");
/* harmony import */ var _util_createObject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/createObject */ "./node_modules/rxjs/dist/esm5/internal/util/createObject.js");







function forkJoin() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popResultSelector)(args);
    var _a = (0,_util_argsArgArrayOrObject__WEBPACK_IMPORTED_MODULE_1__.argsArgArrayOrObject)(args), sources = _a.args, keys = _a.keys;
    var result = new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(function (subscriber) {
        var length = sources.length;
        if (!length) {
            subscriber.complete();
            return;
        }
        var values = new Array(length);
        var remainingCompletions = length;
        var remainingEmissions = length;
        var _loop_1 = function (sourceIndex) {
            var hasValue = false;
            (0,_from__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(sources[sourceIndex]).subscribe(new _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_4__.OperatorSubscriber(subscriber, function (value) {
                if (!hasValue) {
                    hasValue = true;
                    remainingEmissions--;
                }
                values[sourceIndex] = value;
            }, function () {
                if (!--remainingCompletions || !hasValue) {
                    if (!remainingEmissions) {
                        subscriber.next(keys ? (0,_util_createObject__WEBPACK_IMPORTED_MODULE_5__.createObject)(keys, values) : values);
                    }
                    subscriber.complete();
                }
            }));
        };
        for (var sourceIndex = 0; sourceIndex < length; sourceIndex++) {
            _loop_1(sourceIndex);
        }
    });
    return resultSelector ? result.pipe((0,_util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_6__.mapOneOrManyArgs)(resultSelector)) : result;
}
//# sourceMappingURL=forkJoin.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/from.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/from.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "from": () => (/* binding */ from),
/* harmony export */   "innerFrom": () => (/* binding */ innerFrom),
/* harmony export */   "fromArrayLike": () => (/* binding */ fromArrayLike)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_isArrayLike__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/isArrayLike */ "./node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js");
/* harmony import */ var _util_isPromise__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/isPromise */ "./node_modules/rxjs/dist/esm5/internal/util/isPromise.js");
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../symbol/observable */ "./node_modules/rxjs/dist/esm5/internal/symbol/observable.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _scheduled_scheduled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduled/scheduled */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _util_reportUnhandledError__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../util/reportUnhandledError */ "./node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js");
/* harmony import */ var _util_isInteropObservable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isInteropObservable */ "./node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js");
/* harmony import */ var _util_isAsyncIterable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/isAsyncIterable */ "./node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js");
/* harmony import */ var _util_throwUnobservableError__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../util/throwUnobservableError */ "./node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js");
/* harmony import */ var _util_isIterable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/isIterable */ "./node_modules/rxjs/dist/esm5/internal/util/isIterable.js");
/* harmony import */ var _util_isReadableStreamLike__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../util/isReadableStreamLike */ "./node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js");













function from(input, scheduler) {
    return scheduler ? (0,_scheduled_scheduled__WEBPACK_IMPORTED_MODULE_0__.scheduled)(input, scheduler) : innerFrom(input);
}
function innerFrom(input) {
    if (input instanceof _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable) {
        return input;
    }
    if (input != null) {
        if ((0,_util_isInteropObservable__WEBPACK_IMPORTED_MODULE_2__.isInteropObservable)(input)) {
            return fromInteropObservable(input);
        }
        if ((0,_util_isArrayLike__WEBPACK_IMPORTED_MODULE_3__.isArrayLike)(input)) {
            return fromArrayLike(input);
        }
        if ((0,_util_isPromise__WEBPACK_IMPORTED_MODULE_4__.isPromise)(input)) {
            return fromPromise(input);
        }
        if ((0,_util_isAsyncIterable__WEBPACK_IMPORTED_MODULE_5__.isAsyncIterable)(input)) {
            return fromAsyncIterable(input);
        }
        if ((0,_util_isIterable__WEBPACK_IMPORTED_MODULE_6__.isIterable)(input)) {
            return fromIterable(input);
        }
        if ((0,_util_isReadableStreamLike__WEBPACK_IMPORTED_MODULE_7__.isReadableStreamLike)(input)) {
            return fromReadableStreamLike(input);
        }
    }
    throw (0,_util_throwUnobservableError__WEBPACK_IMPORTED_MODULE_8__.createInvalidObservableTypeError)(input);
}
function fromInteropObservable(obj) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        var obs = obj[_symbol_observable__WEBPACK_IMPORTED_MODULE_9__.observable]();
        if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_10__.isFunction)(obs.subscribe)) {
            return obs.subscribe(subscriber);
        }
        throw new TypeError('Provided object does not correctly implement Symbol.observable');
    });
}
function fromArrayLike(array) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        for (var i = 0; i < array.length && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    });
}
function fromPromise(promise) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        promise
            .then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, _util_reportUnhandledError__WEBPACK_IMPORTED_MODULE_11__.reportUnhandledError);
    });
}
function fromIterable(iterable) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        var e_1, _a;
        try {
            for (var iterable_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_12__.__values)(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var value = iterable_1_1.value;
                subscriber.next(value);
                if (subscriber.closed) {
                    return;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        subscriber.complete();
    });
}
function fromAsyncIterable(asyncIterable) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        process(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
    });
}
function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable((0,_util_isReadableStreamLike__WEBPACK_IMPORTED_MODULE_7__.readableStreamLikeToAsyncGenerator)(readableStream));
}
function process(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a;
    return (0,tslib__WEBPACK_IMPORTED_MODULE_12__.__awaiter)(this, void 0, void 0, function () {
        var value, e_2_1;
        return (0,tslib__WEBPACK_IMPORTED_MODULE_12__.__generator)(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    asyncIterable_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_12__.__asyncValues)(asyncIterable);
                    _b.label = 1;
                case 1: return [4, asyncIterable_1.next()];
                case 2:
                    if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                    value = asyncIterable_1_1.value;
                    subscriber.next(value);
                    if (subscriber.closed) {
                        return [2];
                    }
                    _b.label = 3;
                case 3: return [3, 1];
                case 4: return [3, 11];
                case 5:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                    return [4, _a.call(asyncIterable_1)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3, 10];
                case 9:
                    if (e_2) throw e_2.error;
                    return [7];
                case 10: return [7];
                case 11:
                    subscriber.complete();
                    return [2];
            }
        });
    });
}
//# sourceMappingURL=from.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "internalFromArray": () => (/* binding */ internalFromArray)
/* harmony export */ });
/* harmony import */ var _scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduled/scheduleArray */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");


function internalFromArray(input, scheduler) {
    return scheduler ? (0,_scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_0__.scheduleArray)(input, scheduler) : (0,_from__WEBPACK_IMPORTED_MODULE_1__.fromArrayLike)(input);
}
//# sourceMappingURL=fromArray.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/fromEvent.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/fromEvent.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromEvent": () => (/* binding */ fromEvent)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _operators_mergeMap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../operators/mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");
/* harmony import */ var _util_isArrayLike__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/isArrayLike */ "./node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/mapOneOrManyArgs */ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./fromArray */ "./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js");







var nodeEventEmitterMethods = ['addListener', 'removeListener'];
var eventTargetMethods = ['addEventListener', 'removeEventListener'];
var jqueryMethods = ['on', 'off'];
function fromEvent(target, eventName, options, resultSelector) {
    if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(options)) {
        resultSelector = options;
        options = undefined;
    }
    if (resultSelector) {
        return fromEvent(target, eventName, options).pipe((0,_util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_1__.mapOneOrManyArgs)(resultSelector));
    }
    var _a = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__read)(isEventTarget(target)
        ? eventTargetMethods.map(function (methodName) { return function (handler) { return target[methodName](eventName, handler, options); }; })
        :
            isNodeStyleEventEmitter(target)
                ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName))
                : isJQueryStyleEventEmitter(target)
                    ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName))
                    : [], 2), add = _a[0], remove = _a[1];
    if (!add) {
        if ((0,_util_isArrayLike__WEBPACK_IMPORTED_MODULE_3__.isArrayLike)(target)) {
            return (0,_operators_mergeMap__WEBPACK_IMPORTED_MODULE_4__.mergeMap)(function (subTarget) { return fromEvent(subTarget, eventName, options); })((0,_fromArray__WEBPACK_IMPORTED_MODULE_5__.internalFromArray)(target));
        }
    }
    if (!add) {
        throw new TypeError('Invalid event target');
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_6__.Observable(function (subscriber) {
        var handler = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return subscriber.next(1 < args.length ? args : args[0]);
        };
        add(handler);
        return function () { return remove(handler); };
    });
}
function toCommonHandlerRegistry(target, eventName) {
    return function (methodName) { return function (handler) { return target[methodName](eventName, handler); }; };
}
function isNodeStyleEventEmitter(target) {
    return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(target.addListener) && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
    return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(target.on) && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(target.off);
}
function isEventTarget(target) {
    return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(target.addEventListener) && (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(target.removeEventListener);
}
//# sourceMappingURL=fromEvent.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/fromEventPattern.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/fromEventPattern.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromEventPattern": () => (/* binding */ fromEventPattern)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/mapOneOrManyArgs */ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js");



function fromEventPattern(addHandler, removeHandler, resultSelector) {
    if (resultSelector) {
        return fromEventPattern(addHandler, removeHandler).pipe((0,_util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_0__.mapOneOrManyArgs)(resultSelector));
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(function (subscriber) {
        var handler = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return subscriber.next(e.length === 1 ? e[0] : e);
        };
        var retValue = addHandler(handler);
        return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_2__.isFunction)(removeHandler) ? function () { return removeHandler(handler, retValue); } : undefined;
    });
}
//# sourceMappingURL=fromEventPattern.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/fromSubscribable.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/fromSubscribable.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "fromSubscribable": () => (/* binding */ fromSubscribable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");

function fromSubscribable(subscribable) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) { return subscribable.subscribe(subscriber); });
}
//# sourceMappingURL=fromSubscribable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/generate.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/generate.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "generate": () => (/* binding */ generate)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isScheduler */ "./node_modules/rxjs/dist/esm5/internal/util/isScheduler.js");
/* harmony import */ var _defer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defer */ "./node_modules/rxjs/dist/esm5/internal/observable/defer.js");
/* harmony import */ var _scheduled_scheduleIterable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../scheduled/scheduleIterable */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js");





function generate(initialStateOrOptions, condition, iterate, resultSelectorOrScheduler, scheduler) {
    var _a, _b;
    var resultSelector;
    var initialState;
    if (arguments.length === 1) {
        (_a = initialStateOrOptions, initialState = _a.initialState, condition = _a.condition, iterate = _a.iterate, _b = _a.resultSelector, resultSelector = _b === void 0 ? _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity : _b, scheduler = _a.scheduler);
    }
    else {
        initialState = initialStateOrOptions;
        if (!resultSelectorOrScheduler || (0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(resultSelectorOrScheduler)) {
            resultSelector = _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity;
            scheduler = resultSelectorOrScheduler;
        }
        else {
            resultSelector = resultSelectorOrScheduler;
        }
    }
    function gen() {
        var state;
        return (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__generator)(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = initialState;
                    _a.label = 1;
                case 1:
                    if (!(!condition || condition(state))) return [3, 4];
                    return [4, resultSelector(state)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    state = iterate(state);
                    return [3, 1];
                case 4: return [2];
            }
        });
    }
    return (0,_defer__WEBPACK_IMPORTED_MODULE_3__.defer)((scheduler
        ?
            function () { return (0,_scheduled_scheduleIterable__WEBPACK_IMPORTED_MODULE_4__.scheduleIterable)(gen(), scheduler); }
        :
            gen));
}
//# sourceMappingURL=generate.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/iif.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/iif.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "iif": () => (/* binding */ iif)
/* harmony export */ });
/* harmony import */ var _defer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./defer */ "./node_modules/rxjs/dist/esm5/internal/observable/defer.js");

function iif(condition, trueResult, falseResult) {
    return (0,_defer__WEBPACK_IMPORTED_MODULE_0__.defer)(function () { return (condition() ? trueResult : falseResult); });
}
//# sourceMappingURL=iif.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/interval.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/interval.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "interval": () => (/* binding */ interval)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _timer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./timer */ "./node_modules/rxjs/dist/esm5/internal/observable/timer.js");


function interval(period, scheduler) {
    if (period === void 0) { period = 0; }
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.asyncScheduler; }
    if (period < 0) {
        period = 0;
    }
    return (0,_timer__WEBPACK_IMPORTED_MODULE_1__.timer)(period, period, scheduler);
}
//# sourceMappingURL=interval.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/merge.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/merge.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "merge": () => (/* binding */ merge)
/* harmony export */ });
/* harmony import */ var _operators_mergeAll__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../operators/mergeAll */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js");
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./fromArray */ "./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");





function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(args);
    var concurrent = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popNumber)(args, Infinity);
    var sources = args;
    return !sources.length
        ?
            _empty__WEBPACK_IMPORTED_MODULE_1__.EMPTY
        : sources.length === 1
            ?
                (0,_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(sources[0])
            :
                (0,_operators_mergeAll__WEBPACK_IMPORTED_MODULE_3__.mergeAll)(concurrent)((0,_fromArray__WEBPACK_IMPORTED_MODULE_4__.internalFromArray)(sources, scheduler));
}
//# sourceMappingURL=merge.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/never.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/never.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NEVER": () => (/* binding */ NEVER),
/* harmony export */   "never": () => (/* binding */ never)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");


var NEVER = new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(_util_noop__WEBPACK_IMPORTED_MODULE_1__.noop);
function never() {
    return NEVER;
}
//# sourceMappingURL=never.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/of.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/of.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "of": () => (/* binding */ of)
/* harmony export */ });
/* harmony import */ var _fromArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fromArray */ "./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js");
/* harmony import */ var _scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scheduled/scheduleArray */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");



function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(args);
    return scheduler ? (0,_scheduled_scheduleArray__WEBPACK_IMPORTED_MODULE_1__.scheduleArray)(args, scheduler) : (0,_fromArray__WEBPACK_IMPORTED_MODULE_2__.internalFromArray)(args);
}
//# sourceMappingURL=of.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/onErrorResumeNext.js":
/*!******************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/onErrorResumeNext.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "onErrorResumeNext": () => (/* binding */ onErrorResumeNext)
/* harmony export */ });
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _operators_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../operators/onErrorResumeNext */ "./node_modules/rxjs/dist/esm5/internal/operators/onErrorResumeNext.js");
/* harmony import */ var _util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/argsOrArgArray */ "./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js");



function onErrorResumeNext() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return (0,_operators_onErrorResumeNext__WEBPACK_IMPORTED_MODULE_0__.onErrorResumeNext)((0,_util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_1__.argsOrArgArray)(sources))(_empty__WEBPACK_IMPORTED_MODULE_2__.EMPTY);
}
//# sourceMappingURL=onErrorResumeNext.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/pairs.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/pairs.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pairs": () => (/* binding */ pairs)
/* harmony export */ });
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");

function pairs(obj, scheduler) {
    return (0,_from__WEBPACK_IMPORTED_MODULE_0__.from)(Object.entries(obj), scheduler);
}
//# sourceMappingURL=pairs.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/partition.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/partition.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "partition": () => (/* binding */ partition)
/* harmony export */ });
/* harmony import */ var _util_not__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/not */ "./node_modules/rxjs/dist/esm5/internal/util/not.js");
/* harmony import */ var _operators_filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../operators/filter */ "./node_modules/rxjs/dist/esm5/internal/operators/filter.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");



function partition(source, predicate, thisArg) {
    return [(0,_operators_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(predicate, thisArg)((0,_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(source)), (0,_operators_filter__WEBPACK_IMPORTED_MODULE_0__.filter)((0,_util_not__WEBPACK_IMPORTED_MODULE_2__.not)(predicate, thisArg))((0,_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(source))];
}
//# sourceMappingURL=partition.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/race.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/race.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "race": () => (/* binding */ race),
/* harmony export */   "raceInit": () => (/* binding */ raceInit)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/argsOrArgArray */ "./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js");
/* harmony import */ var _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../operators/OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");




function race() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    sources = (0,_util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_0__.argsOrArgArray)(sources);
    return sources.length === 1 ? (0,_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(sources[0]) : new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(raceInit(sources));
}
function raceInit(sources) {
    return function (subscriber) {
        var subscriptions = [];
        var _loop_1 = function (i) {
            subscriptions.push((0,_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(sources[i]).subscribe(new _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subscriber, function (value) {
                if (subscriptions) {
                    for (var s = 0; s < subscriptions.length; s++) {
                        s !== i && subscriptions[s].unsubscribe();
                    }
                    subscriptions = null;
                }
                subscriber.next(value);
            })));
        };
        for (var i = 0; subscriptions && !subscriber.closed && i < sources.length; i++) {
            _loop_1(i);
        }
    };
}
//# sourceMappingURL=race.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/range.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/range.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "range": () => (/* binding */ range)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");


function range(start, count, scheduler) {
    if (count == null) {
        count = start;
        start = 0;
    }
    if (count <= 0) {
        return _empty__WEBPACK_IMPORTED_MODULE_0__.EMPTY;
    }
    var end = count + start;
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(scheduler
        ?
            function (subscriber) {
                var n = start;
                return scheduler.schedule(function () {
                    if (n < end) {
                        subscriber.next(n++);
                        this.schedule();
                    }
                    else {
                        subscriber.complete();
                    }
                });
            }
        :
            function (subscriber) {
                var n = start;
                while (n < end && !subscriber.closed) {
                    subscriber.next(n++);
                }
                subscriber.complete();
            });
}
//# sourceMappingURL=range.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/throwError.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/throwError.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "throwError": () => (/* binding */ throwError)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function throwError(errorOrErrorFactory, scheduler) {
    var errorFactory = (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(errorOrErrorFactory) ? errorOrErrorFactory : function () { return errorOrErrorFactory; };
    var init = function (subscriber) { return subscriber.error(errorFactory()); };
    return new _Observable__WEBPACK_IMPORTED_MODULE_1__.Observable(scheduler ? function (subscriber) { return scheduler.schedule(init, 0, subscriber); } : init);
}
//# sourceMappingURL=throwError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/timer.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/timer.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "timer": () => (/* binding */ timer)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _util_isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isScheduler */ "./node_modules/rxjs/dist/esm5/internal/util/isScheduler.js");
/* harmony import */ var _util_isDate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/isDate */ "./node_modules/rxjs/dist/esm5/internal/util/isDate.js");




function timer(dueTime, intervalOrScheduler, scheduler) {
    if (dueTime === void 0) { dueTime = 0; }
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async; }
    var intervalDuration = -1;
    if (intervalOrScheduler != null) {
        if ((0,_util_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(intervalOrScheduler)) {
            scheduler = intervalOrScheduler;
        }
        else {
            intervalDuration = intervalOrScheduler;
        }
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(function (subscriber) {
        var due = (0,_util_isDate__WEBPACK_IMPORTED_MODULE_3__.isValidDate)(dueTime) ? +dueTime - scheduler.now() : dueTime;
        if (due < 0) {
            due = 0;
        }
        var n = 0;
        return scheduler.schedule(function () {
            if (!subscriber.closed) {
                subscriber.next(n++);
                if (0 <= intervalDuration) {
                    this.schedule(undefined, intervalDuration);
                }
                else {
                    subscriber.complete();
                }
            }
        }, due);
    });
}
//# sourceMappingURL=timer.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/using.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/using.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "using": () => (/* binding */ using)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");



function using(resourceFactory, observableFactory) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var resource = resourceFactory();
        var result = observableFactory(resource);
        var source = result ? (0,_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(result) : _empty__WEBPACK_IMPORTED_MODULE_2__.EMPTY;
        source.subscribe(subscriber);
        return function () {
            if (resource) {
                resource.unsubscribe();
            }
        };
    });
}
//# sourceMappingURL=using.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/observable/zip.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/observable/zip.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "zip": () => (/* binding */ zip)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/argsOrArgArray */ "./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js");
/* harmony import */ var _empty__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../operators/OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");







function zip() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popResultSelector)(args);
    var sources = (0,_util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_1__.argsOrArgArray)(args);
    return sources.length
        ? new _Observable__WEBPACK_IMPORTED_MODULE_2__.Observable(function (subscriber) {
            var buffers = sources.map(function () { return []; });
            var completed = sources.map(function () { return false; });
            subscriber.add(function () {
                buffers = completed = null;
            });
            var _loop_1 = function (sourceIndex) {
                (0,_from__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(sources[sourceIndex]).subscribe(new _operators_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_4__.OperatorSubscriber(subscriber, function (value) {
                    buffers[sourceIndex].push(value);
                    if (buffers.every(function (buffer) { return buffer.length; })) {
                        var result = buffers.map(function (buffer) { return buffer.shift(); });
                        subscriber.next(resultSelector ? resultSelector.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__read)(result))) : result);
                        if (buffers.some(function (buffer, i) { return !buffer.length && completed[i]; })) {
                            subscriber.complete();
                        }
                    }
                }, function () {
                    completed[sourceIndex] = true;
                    !buffers[sourceIndex].length && subscriber.complete();
                }));
            };
            for (var sourceIndex = 0; !subscriber.closed && sourceIndex < sources.length; sourceIndex++) {
                _loop_1(sourceIndex);
            }
            return function () {
                buffers = completed = null;
            };
        })
        : _empty__WEBPACK_IMPORTED_MODULE_6__.EMPTY;
}
//# sourceMappingURL=zip.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js":
/*!******************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "OperatorSubscriber": () => (/* binding */ OperatorSubscriber)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscriber */ "./node_modules/rxjs/dist/esm5/internal/Subscriber.js");


var OperatorSubscriber = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(OperatorSubscriber, _super);
    function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
        var _this = _super.call(this, destination) || this;
        _this.onFinalize = onFinalize;
        _this._next = onNext
            ? function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    destination.error(err);
                }
            }
            : _super.prototype._next;
        _this._error = onError
            ? function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._error;
        _this._complete = onComplete
            ? function () {
                try {
                    onComplete();
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._complete;
        return _this;
    }
    OperatorSubscriber.prototype.unsubscribe = function () {
        var _a;
        var closed = this.closed;
        _super.prototype.unsubscribe.call(this);
        !closed && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    };
    return OperatorSubscriber;
}(_Subscriber__WEBPACK_IMPORTED_MODULE_1__.Subscriber));

//# sourceMappingURL=OperatorSubscriber.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/audit.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/audit.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "audit": () => (/* binding */ audit)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function audit(durationSelector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        var durationSubscriber = null;
        var isComplete = false;
        var endDuration = function () {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            durationSubscriber = null;
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
            isComplete && subscriber.complete();
        };
        var cleanupDuration = function () {
            durationSubscriber = null;
            isComplete && subscriber.complete();
        };
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            lastValue = value;
            if (!durationSubscriber) {
                (0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(durationSelector(value)).subscribe((durationSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, endDuration, cleanupDuration)));
            }
        }, function () {
            isComplete = true;
            (!hasValue || !durationSubscriber || durationSubscriber.closed) && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=audit.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/auditTime.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/auditTime.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "auditTime": () => (/* binding */ auditTime)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _audit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./audit */ "./node_modules/rxjs/dist/esm5/internal/operators/audit.js");
/* harmony import */ var _observable_timer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/timer */ "./node_modules/rxjs/dist/esm5/internal/observable/timer.js");



function auditTime(duration, scheduler) {
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async; }
    return (0,_audit__WEBPACK_IMPORTED_MODULE_1__.audit)(function () { return (0,_observable_timer__WEBPACK_IMPORTED_MODULE_2__.timer)(duration, scheduler); });
}
//# sourceMappingURL=auditTime.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/buffer.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/buffer.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "buffer": () => (/* binding */ buffer)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function buffer(closingNotifier) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var currentBuffer = [];
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) { return currentBuffer.push(value); }, function () {
            subscriber.next(currentBuffer);
            subscriber.complete();
        }));
        closingNotifier.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function () {
            var b = currentBuffer;
            currentBuffer = [];
            subscriber.next(b);
        }, _util_noop__WEBPACK_IMPORTED_MODULE_2__.noop));
        return function () {
            currentBuffer = null;
        };
    });
}
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/bufferCount.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/bufferCount.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bufferCount": () => (/* binding */ bufferCount)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");




function bufferCount(bufferSize, startBufferEvery) {
    if (startBufferEvery === void 0) { startBufferEvery = null; }
    startBufferEvery = startBufferEvery !== null && startBufferEvery !== void 0 ? startBufferEvery : bufferSize;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var buffers = [];
        var count = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            var e_1, _a, e_2, _b;
            var toEmit = null;
            if (count++ % startBufferEvery === 0) {
                buffers.push([]);
            }
            try {
                for (var buffers_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__values)(buffers), buffers_1_1 = buffers_1.next(); !buffers_1_1.done; buffers_1_1 = buffers_1.next()) {
                    var buffer = buffers_1_1.value;
                    buffer.push(value);
                    if (bufferSize <= buffer.length) {
                        toEmit = toEmit !== null && toEmit !== void 0 ? toEmit : [];
                        toEmit.push(buffer);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (toEmit) {
                try {
                    for (var toEmit_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__values)(toEmit), toEmit_1_1 = toEmit_1.next(); !toEmit_1_1.done; toEmit_1_1 = toEmit_1.next()) {
                        var buffer = toEmit_1_1.value;
                        (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_3__.arrRemove)(buffers, buffer);
                        subscriber.next(buffer);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (toEmit_1_1 && !toEmit_1_1.done && (_b = toEmit_1.return)) _b.call(toEmit_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }, function () {
            var e_3, _a;
            try {
                for (var buffers_2 = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__values)(buffers), buffers_2_1 = buffers_2.next(); !buffers_2_1.done; buffers_2_1 = buffers_2.next()) {
                    var buffer = buffers_2_1.value;
                    subscriber.next(buffer);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (buffers_2_1 && !buffers_2_1.done && (_a = buffers_2.return)) _a.call(buffers_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            subscriber.complete();
        }, undefined, function () {
            buffers = null;
        }));
    });
}
//# sourceMappingURL=bufferCount.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/bufferTime.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/bufferTime.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bufferTime": () => (/* binding */ bufferTime)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");







function bufferTime(bufferTimeSpan) {
    var _a, _b;
    var otherArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherArgs[_i - 1] = arguments[_i];
    }
    var scheduler = (_a = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(otherArgs)) !== null && _a !== void 0 ? _a : _scheduler_async__WEBPACK_IMPORTED_MODULE_1__.asyncScheduler;
    var bufferCreationInterval = (_b = otherArgs[0]) !== null && _b !== void 0 ? _b : null;
    var maxBufferSize = otherArgs[1] || Infinity;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_2__.operate)(function (source, subscriber) {
        var bufferRecords = [];
        var restartOnEmit = false;
        var emit = function (record) {
            var buffer = record.buffer, subs = record.subs;
            subs.unsubscribe();
            (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_3__.arrRemove)(bufferRecords, record);
            subscriber.next(buffer);
            restartOnEmit && startBuffer();
        };
        var startBuffer = function () {
            if (bufferRecords) {
                var subs = new _Subscription__WEBPACK_IMPORTED_MODULE_4__.Subscription();
                subscriber.add(subs);
                var buffer = [];
                var record_1 = {
                    buffer: buffer,
                    subs: subs,
                };
                bufferRecords.push(record_1);
                subs.add(scheduler.schedule(function () { return emit(record_1); }, bufferTimeSpan));
            }
        };
        bufferCreationInterval !== null && bufferCreationInterval >= 0
            ?
                subscriber.add(scheduler.schedule(function () {
                    startBuffer();
                    !this.closed && subscriber.add(this.schedule(null, bufferCreationInterval));
                }, bufferCreationInterval))
            : (restartOnEmit = true);
        startBuffer();
        var bufferTimeSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_5__.OperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            var recordsCopy = bufferRecords.slice();
            try {
                for (var recordsCopy_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__values)(recordsCopy), recordsCopy_1_1 = recordsCopy_1.next(); !recordsCopy_1_1.done; recordsCopy_1_1 = recordsCopy_1.next()) {
                    var record = recordsCopy_1_1.value;
                    var buffer = record.buffer;
                    buffer.push(value);
                    maxBufferSize <= buffer.length && emit(record);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (recordsCopy_1_1 && !recordsCopy_1_1.done && (_a = recordsCopy_1.return)) _a.call(recordsCopy_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (bufferRecords === null || bufferRecords === void 0 ? void 0 : bufferRecords.length) {
                subscriber.next(bufferRecords.shift().buffer);
            }
            bufferTimeSubscriber === null || bufferTimeSubscriber === void 0 ? void 0 : bufferTimeSubscriber.unsubscribe();
            subscriber.complete();
            subscriber.unsubscribe();
        }, undefined, function () { return (bufferRecords = null); });
        source.subscribe(bufferTimeSubscriber);
    });
}
//# sourceMappingURL=bufferTime.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/bufferToggle.js":
/*!************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/bufferToggle.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bufferToggle": () => (/* binding */ bufferToggle)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");







function bufferToggle(openings, closingSelector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var buffers = [];
        (0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(openings).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (openValue) {
            var buffer = [];
            buffers.push(buffer);
            var closingSubscription = new _Subscription__WEBPACK_IMPORTED_MODULE_3__.Subscription();
            var emitBuffer = function () {
                (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_4__.arrRemove)(buffers, buffer);
                subscriber.next(buffer);
                closingSubscription.unsubscribe();
            };
            closingSubscription.add((0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(closingSelector(openValue)).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, emitBuffer, _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop)));
        }, _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop));
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            try {
                for (var buffers_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__values)(buffers), buffers_1_1 = buffers_1.next(); !buffers_1_1.done; buffers_1_1 = buffers_1.next()) {
                    var buffer = buffers_1_1.value;
                    buffer.push(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (buffers.length > 0) {
                subscriber.next(buffers.shift());
            }
            subscriber.complete();
        }));
    });
}
//# sourceMappingURL=bufferToggle.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/bufferWhen.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/bufferWhen.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bufferWhen": () => (/* binding */ bufferWhen)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");




function bufferWhen(closingSelector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var buffer = null;
        var closingSubscriber = null;
        var openBuffer = function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            var b = buffer;
            buffer = [];
            b && subscriber.next(b);
            (0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(closingSelector()).subscribe((closingSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, openBuffer, _util_noop__WEBPACK_IMPORTED_MODULE_3__.noop)));
        };
        openBuffer();
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) { return buffer === null || buffer === void 0 ? void 0 : buffer.push(value); }, function () {
            buffer && subscriber.next(buffer);
            subscriber.complete();
        }, undefined, function () { return (buffer = closingSubscriber = null); }));
    });
}
//# sourceMappingURL=bufferWhen.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/catchError.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/catchError.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "catchError": () => (/* binding */ catchError)
/* harmony export */ });
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");



function catchError(selector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var innerSub = null;
        var syncUnsub = false;
        var handledResult;
        innerSub = source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, undefined, undefined, function (err) {
            handledResult = (0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(selector(err, catchError(selector)(source)));
            if (innerSub) {
                innerSub.unsubscribe();
                innerSub = null;
                handledResult.subscribe(subscriber);
            }
            else {
                syncUnsub = true;
            }
        }));
        if (syncUnsub) {
            innerSub.unsubscribe();
            innerSub = null;
            handledResult.subscribe(subscriber);
        }
    });
}
//# sourceMappingURL=catchError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/combineAll.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/combineAll.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "combineAll": () => (/* binding */ combineAll)
/* harmony export */ });
/* harmony import */ var _combineLatestAll__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combineLatestAll */ "./node_modules/rxjs/dist/esm5/internal/operators/combineLatestAll.js");

var combineAll = _combineLatestAll__WEBPACK_IMPORTED_MODULE_0__.combineLatestAll;
//# sourceMappingURL=combineAll.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/combineLatest.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/combineLatest.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "combineLatest": () => (/* binding */ combineLatest)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _observable_combineLatest__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../observable/combineLatest */ "./node_modules/rxjs/dist/esm5/internal/observable/combineLatest.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/argsOrArgArray */ "./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js");
/* harmony import */ var _util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/mapOneOrManyArgs */ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js");
/* harmony import */ var _util_pipe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/pipe */ "./node_modules/rxjs/dist/esm5/internal/util/pipe.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");







function combineLatest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popResultSelector)(args);
    return resultSelector
        ? (0,_util_pipe__WEBPACK_IMPORTED_MODULE_1__.pipe)(combineLatest.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__read)(args))), (0,_util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_3__.mapOneOrManyArgs)(resultSelector))
        : (0,_util_lift__WEBPACK_IMPORTED_MODULE_4__.operate)(function (source, subscriber) {
            (0,_observable_combineLatest__WEBPACK_IMPORTED_MODULE_5__.combineLatestInit)((0,tslib__WEBPACK_IMPORTED_MODULE_2__.__spreadArray)([source], (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__read)((0,_util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_6__.argsOrArgArray)(args))))(subscriber);
        });
}
//# sourceMappingURL=combineLatest.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/combineLatestAll.js":
/*!****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/combineLatestAll.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "combineLatestAll": () => (/* binding */ combineLatestAll)
/* harmony export */ });
/* harmony import */ var _observable_combineLatest__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/combineLatest */ "./node_modules/rxjs/dist/esm5/internal/observable/combineLatest.js");
/* harmony import */ var _joinAllInternals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./joinAllInternals */ "./node_modules/rxjs/dist/esm5/internal/operators/joinAllInternals.js");


function combineLatestAll(project) {
    return (0,_joinAllInternals__WEBPACK_IMPORTED_MODULE_0__.joinAllInternals)(_observable_combineLatest__WEBPACK_IMPORTED_MODULE_1__.combineLatest, project);
}
//# sourceMappingURL=combineLatestAll.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/combineLatestWith.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/combineLatestWith.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "combineLatestWith": () => (/* binding */ combineLatestWith)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _combineLatest__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./combineLatest */ "./node_modules/rxjs/dist/esm5/internal/operators/combineLatest.js");


function combineLatestWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return _combineLatest__WEBPACK_IMPORTED_MODULE_0__.combineLatest.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__read)(otherSources)));
}
//# sourceMappingURL=combineLatestWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/concat.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/concat.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "concat": () => (/* binding */ concat)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _concatAll__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./concatAll */ "./node_modules/rxjs/dist/esm5/internal/operators/concatAll.js");
/* harmony import */ var _observable_fromArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/fromArray */ "./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");





function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(args);
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
        (0,_concatAll__WEBPACK_IMPORTED_MODULE_2__.concatAll)()((0,_observable_fromArray__WEBPACK_IMPORTED_MODULE_3__.internalFromArray)((0,tslib__WEBPACK_IMPORTED_MODULE_4__.__spreadArray)([source], (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__read)(args)), scheduler)).subscribe(subscriber);
    });
}
//# sourceMappingURL=concat.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/concatAll.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/concatAll.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "concatAll": () => (/* binding */ concatAll)
/* harmony export */ });
/* harmony import */ var _mergeAll__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergeAll */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js");

function concatAll() {
    return (0,_mergeAll__WEBPACK_IMPORTED_MODULE_0__.mergeAll)(1);
}
//# sourceMappingURL=concatAll.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/concatMap.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/concatMap.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "concatMap": () => (/* binding */ concatMap)
/* harmony export */ });
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function concatMap(project, resultSelector) {
    return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(resultSelector) ? (0,_mergeMap__WEBPACK_IMPORTED_MODULE_1__.mergeMap)(project, resultSelector, 1) : (0,_mergeMap__WEBPACK_IMPORTED_MODULE_1__.mergeMap)(project, 1);
}
//# sourceMappingURL=concatMap.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/concatMapTo.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/concatMapTo.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "concatMapTo": () => (/* binding */ concatMapTo)
/* harmony export */ });
/* harmony import */ var _concatMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./concatMap */ "./node_modules/rxjs/dist/esm5/internal/operators/concatMap.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function concatMapTo(innerObservable, resultSelector) {
    return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(resultSelector) ? (0,_concatMap__WEBPACK_IMPORTED_MODULE_1__.concatMap)(function () { return innerObservable; }, resultSelector) : (0,_concatMap__WEBPACK_IMPORTED_MODULE_1__.concatMap)(function () { return innerObservable; });
}
//# sourceMappingURL=concatMapTo.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/concatWith.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/concatWith.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "concatWith": () => (/* binding */ concatWith)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./concat */ "./node_modules/rxjs/dist/esm5/internal/operators/concat.js");


function concatWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return _concat__WEBPACK_IMPORTED_MODULE_0__.concat.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__read)(otherSources)));
}
//# sourceMappingURL=concatWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/connect.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/connect.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "connect": () => (/* binding */ connect)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _observable_fromSubscribable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/fromSubscribable */ "./node_modules/rxjs/dist/esm5/internal/observable/fromSubscribable.js");




var DEFAULT_CONFIG = {
    connector: function () { return new _Subject__WEBPACK_IMPORTED_MODULE_0__.Subject(); },
};
function connect(selector, config) {
    if (config === void 0) { config = DEFAULT_CONFIG; }
    var connector = config.connector;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
        var subject = connector();
        (0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.from)(selector((0,_observable_fromSubscribable__WEBPACK_IMPORTED_MODULE_3__.fromSubscribable)(subject))).subscribe(subscriber);
        subscriber.add(source.subscribe(subject));
    });
}
//# sourceMappingURL=connect.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/count.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/count.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "count": () => (/* binding */ count)
/* harmony export */ });
/* harmony import */ var _reduce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reduce */ "./node_modules/rxjs/dist/esm5/internal/operators/reduce.js");

function count(predicate) {
    return (0,_reduce__WEBPACK_IMPORTED_MODULE_0__.reduce)(function (total, value, i) { return (!predicate || predicate(value, i) ? total + 1 : total); }, 0);
}
//# sourceMappingURL=count.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/debounce.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/debounce.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "debounce": () => (/* binding */ debounce)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");




function debounce(durationSelector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        var durationSubscriber = null;
        var emit = function () {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            durationSubscriber = null;
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            hasValue = true;
            lastValue = value;
            durationSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, emit, _util_noop__WEBPACK_IMPORTED_MODULE_2__.noop);
            (0,_observable_from__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(durationSelector(value)).subscribe(durationSubscriber);
        }, function () {
            emit();
            subscriber.complete();
        }, undefined, function () {
            lastValue = durationSubscriber = null;
        }));
    });
}
//# sourceMappingURL=debounce.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/debounceTime.js":
/*!************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/debounceTime.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "debounceTime": () => (/* binding */ debounceTime)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.asyncScheduler; }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
        var activeTask = null;
        var lastValue = null;
        var lastTime = null;
        var emit = function () {
            if (activeTask) {
                activeTask.unsubscribe();
                activeTask = null;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        function emitWhenIdle() {
            var targetTime = lastTime + dueTime;
            var now = scheduler.now();
            if (now < targetTime) {
                activeTask = this.schedule(undefined, targetTime - now);
                subscriber.add(activeTask);
                return;
            }
            emit();
        }
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
            lastValue = value;
            lastTime = scheduler.now();
            if (!activeTask) {
                activeTask = scheduler.schedule(emitWhenIdle, dueTime);
                subscriber.add(activeTask);
            }
        }, function () {
            emit();
            subscriber.complete();
        }, undefined, function () {
            lastValue = activeTask = null;
        }));
    });
}
//# sourceMappingURL=debounceTime.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defaultIfEmpty": () => (/* binding */ defaultIfEmpty)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function defaultIfEmpty(defaultValue) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var hasValue = false;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            subscriber.next(value);
        }, function () {
            if (!hasValue) {
                subscriber.next(defaultValue);
            }
            subscriber.complete();
        }));
    });
}
//# sourceMappingURL=defaultIfEmpty.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/delay.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/delay.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "delay": () => (/* binding */ delay)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _delayWhen__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./delayWhen */ "./node_modules/rxjs/dist/esm5/internal/operators/delayWhen.js");
/* harmony import */ var _observable_timer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/timer */ "./node_modules/rxjs/dist/esm5/internal/observable/timer.js");



function delay(due, scheduler) {
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.asyncScheduler; }
    var duration = (0,_observable_timer__WEBPACK_IMPORTED_MODULE_1__.timer)(due, scheduler);
    return (0,_delayWhen__WEBPACK_IMPORTED_MODULE_2__.delayWhen)(function () { return duration; });
}
//# sourceMappingURL=delay.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/delayWhen.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/delayWhen.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "delayWhen": () => (/* binding */ delayWhen)
/* harmony export */ });
/* harmony import */ var _observable_concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/concat */ "./node_modules/rxjs/dist/esm5/internal/observable/concat.js");
/* harmony import */ var _take__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./take */ "./node_modules/rxjs/dist/esm5/internal/operators/take.js");
/* harmony import */ var _ignoreElements__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ignoreElements */ "./node_modules/rxjs/dist/esm5/internal/operators/ignoreElements.js");
/* harmony import */ var _mapTo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mapTo */ "./node_modules/rxjs/dist/esm5/internal/operators/mapTo.js");
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");





function delayWhen(delayDurationSelector, subscriptionDelay) {
    if (subscriptionDelay) {
        return function (source) {
            return (0,_observable_concat__WEBPACK_IMPORTED_MODULE_0__.concat)(subscriptionDelay.pipe((0,_take__WEBPACK_IMPORTED_MODULE_1__.take)(1), (0,_ignoreElements__WEBPACK_IMPORTED_MODULE_2__.ignoreElements)()), source.pipe(delayWhen(delayDurationSelector)));
        };
    }
    return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_3__.mergeMap)(function (value, index) { return delayDurationSelector(value, index).pipe((0,_take__WEBPACK_IMPORTED_MODULE_1__.take)(1), (0,_mapTo__WEBPACK_IMPORTED_MODULE_4__.mapTo)(value)); });
}
//# sourceMappingURL=delayWhen.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/dematerialize.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/dematerialize.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dematerialize": () => (/* binding */ dematerialize)
/* harmony export */ });
/* harmony import */ var _Notification__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Notification */ "./node_modules/rxjs/dist/esm5/internal/Notification.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function dematerialize() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (notification) { return (0,_Notification__WEBPACK_IMPORTED_MODULE_2__.observeNotification)(notification, subscriber); }));
    });
}
//# sourceMappingURL=dematerialize.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/distinct.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/distinct.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "distinct": () => (/* binding */ distinct)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");



function distinct(keySelector, flushes) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var distinctKeys = new Set();
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            var key = keySelector ? keySelector(value) : value;
            if (!distinctKeys.has(key)) {
                distinctKeys.add(key);
                subscriber.next(value);
            }
        }));
        flushes === null || flushes === void 0 ? void 0 : flushes.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function () { return distinctKeys.clear(); }, _util_noop__WEBPACK_IMPORTED_MODULE_2__.noop));
    });
}
//# sourceMappingURL=distinct.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js":
/*!********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "distinctUntilChanged": () => (/* binding */ distinctUntilChanged)
/* harmony export */ });
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function distinctUntilChanged(comparator, keySelector) {
    if (keySelector === void 0) { keySelector = _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity; }
    comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
        var previousKey;
        var first = true;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
            var currentKey = keySelector(value);
            if (first || !comparator(previousKey, currentKey)) {
                first = false;
                previousKey = currentKey;
                subscriber.next(value);
            }
        }));
    });
}
function defaultCompare(a, b) {
    return a === b;
}
//# sourceMappingURL=distinctUntilChanged.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilKeyChanged.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilKeyChanged.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "distinctUntilKeyChanged": () => (/* binding */ distinctUntilKeyChanged)
/* harmony export */ });
/* harmony import */ var _distinctUntilChanged__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./distinctUntilChanged */ "./node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js");

function distinctUntilKeyChanged(key, compare) {
    return (0,_distinctUntilChanged__WEBPACK_IMPORTED_MODULE_0__.distinctUntilChanged)(function (x, y) { return compare ? compare(x[key], y[key]) : x[key] === y[key]; });
}
//# sourceMappingURL=distinctUntilKeyChanged.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/elementAt.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/elementAt.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "elementAt": () => (/* binding */ elementAt)
/* harmony export */ });
/* harmony import */ var _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/ArgumentOutOfRangeError */ "./node_modules/rxjs/dist/esm5/internal/util/ArgumentOutOfRangeError.js");
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filter */ "./node_modules/rxjs/dist/esm5/internal/operators/filter.js");
/* harmony import */ var _throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./throwIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defaultIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _take__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./take */ "./node_modules/rxjs/dist/esm5/internal/operators/take.js");





function elementAt(index, defaultValue) {
    if (index < 0) {
        throw new _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__.ArgumentOutOfRangeError();
    }
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe((0,_filter__WEBPACK_IMPORTED_MODULE_1__.filter)(function (v, i) { return i === index; }), (0,_take__WEBPACK_IMPORTED_MODULE_2__.take)(1), hasDefaultValue ? (0,_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__.defaultIfEmpty)(defaultValue) : (0,_throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__.throwIfEmpty)(function () { return new _util_ArgumentOutOfRangeError__WEBPACK_IMPORTED_MODULE_0__.ArgumentOutOfRangeError(); }));
    };
}
//# sourceMappingURL=elementAt.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/endWith.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/endWith.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "endWith": () => (/* binding */ endWith)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _observable_concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/concat */ "./node_modules/rxjs/dist/esm5/internal/observable/concat.js");
/* harmony import */ var _observable_of__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/of */ "./node_modules/rxjs/dist/esm5/internal/observable/of.js");



function endWith() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return function (source) { return (0,_observable_concat__WEBPACK_IMPORTED_MODULE_0__.concat)(source, _observable_of__WEBPACK_IMPORTED_MODULE_1__.of.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__read)(values)))); };
}
//# sourceMappingURL=endWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/every.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/every.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "every": () => (/* binding */ every)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function every(predicate, thisArg) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            if (!predicate.call(thisArg, value, index++, source)) {
                subscriber.next(false);
                subscriber.complete();
            }
        }, function () {
            subscriber.next(true);
            subscriber.complete();
        }));
    });
}
//# sourceMappingURL=every.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/exhaust.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/exhaust.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "exhaust": () => (/* binding */ exhaust)
/* harmony export */ });
/* harmony import */ var _exhaustAll__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./exhaustAll */ "./node_modules/rxjs/dist/esm5/internal/operators/exhaustAll.js");

var exhaust = _exhaustAll__WEBPACK_IMPORTED_MODULE_0__.exhaustAll;
//# sourceMappingURL=exhaust.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/exhaustAll.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/exhaustAll.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "exhaustAll": () => (/* binding */ exhaustAll)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function exhaustAll() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var isComplete = false;
        var innerSub = null;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (inner) {
            if (!innerSub) {
                innerSub = (0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(inner).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, undefined, function () {
                    innerSub = null;
                    isComplete && subscriber.complete();
                }));
            }
        }, function () {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=exhaustAll.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/exhaustMap.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/exhaustMap.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "exhaustMap": () => (/* binding */ exhaustMap)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");




function exhaustMap(project, resultSelector) {
    if (resultSelector) {
        return function (source) {
            return source.pipe(exhaustMap(function (a, i) { return (0,_observable_from__WEBPACK_IMPORTED_MODULE_0__.innerFrom)(project(a, i)).pipe((0,_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (b, ii) { return resultSelector(a, b, i, ii); })); }));
        };
    }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_2__.operate)(function (source, subscriber) {
        var index = 0;
        var innerSub = null;
        var isComplete = false;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subscriber, function (outerValue) {
            if (!innerSub) {
                innerSub = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subscriber, undefined, function () {
                    innerSub = null;
                    isComplete && subscriber.complete();
                });
                (0,_observable_from__WEBPACK_IMPORTED_MODULE_0__.innerFrom)(project(outerValue, index++)).subscribe(innerSub);
            }
        }, function () {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=exhaustMap.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/expand.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/expand.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "expand": () => (/* binding */ expand)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _mergeInternals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mergeInternals */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js");


function expand(project, concurrent, scheduler) {
    if (concurrent === void 0) { concurrent = Infinity; }
    concurrent = (concurrent || 0) < 1 ? Infinity : concurrent;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        return (0,_mergeInternals__WEBPACK_IMPORTED_MODULE_1__.mergeInternals)(source, subscriber, project, concurrent, undefined, true, scheduler);
    });
}
//# sourceMappingURL=expand.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/filter.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/filter.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filter": () => (/* binding */ filter)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function filter(predicate, thisArg) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
    });
}
//# sourceMappingURL=filter.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/finalize.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/finalize.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "finalize": () => (/* binding */ finalize)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");

function finalize(callback) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        try {
            source.subscribe(subscriber);
        }
        finally {
            subscriber.add(callback);
        }
    });
}
//# sourceMappingURL=finalize.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/find.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/find.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "find": () => (/* binding */ find),
/* harmony export */   "createFind": () => (/* binding */ createFind)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function find(predicate, thisArg) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(createFind(predicate, thisArg, 'value'));
}
function createFind(predicate, thisArg, emit) {
    var findIndex = emit === 'index';
    return function (source, subscriber) {
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            var i = index++;
            if (predicate.call(thisArg, value, i, source)) {
                subscriber.next(findIndex ? i : value);
                subscriber.complete();
            }
        }, function () {
            subscriber.next(findIndex ? -1 : undefined);
            subscriber.complete();
        }));
    };
}
//# sourceMappingURL=find.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/findIndex.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/findIndex.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "findIndex": () => (/* binding */ findIndex)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./find */ "./node_modules/rxjs/dist/esm5/internal/operators/find.js");


function findIndex(predicate, thisArg) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)((0,_find__WEBPACK_IMPORTED_MODULE_1__.createFind)(predicate, thisArg, 'index'));
}
//# sourceMappingURL=findIndex.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/first.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/first.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "first": () => (/* binding */ first)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/EmptyError */ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js");
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter */ "./node_modules/rxjs/dist/esm5/internal/operators/filter.js");
/* harmony import */ var _take__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./take */ "./node_modules/rxjs/dist/esm5/internal/operators/take.js");
/* harmony import */ var _defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defaultIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./throwIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");






function first(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(predicate ? (0,_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(function (v, i) { return predicate(v, i, source); }) : _util_identity__WEBPACK_IMPORTED_MODULE_1__.identity, (0,_take__WEBPACK_IMPORTED_MODULE_2__.take)(1), hasDefaultValue ? (0,_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__.defaultIfEmpty)(defaultValue) : (0,_throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__.throwIfEmpty)(function () { return new _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__.EmptyError(); }));
    };
}
//# sourceMappingURL=first.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/flatMap.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/flatMap.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "flatMap": () => (/* binding */ flatMap)
/* harmony export */ });
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");

var flatMap = _mergeMap__WEBPACK_IMPORTED_MODULE_0__.mergeMap;
//# sourceMappingURL=flatMap.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/groupBy.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/groupBy.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "groupBy": () => (/* binding */ groupBy)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");






function groupBy(keySelector, elementOrOptions, duration, connector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var element;
        if (!elementOrOptions || typeof elementOrOptions === 'function') {
            element = elementOrOptions;
        }
        else {
            (duration = elementOrOptions.duration, element = elementOrOptions.element, connector = elementOrOptions.connector);
        }
        var groups = new Map();
        var notify = function (cb) {
            groups.forEach(cb);
            cb(subscriber);
        };
        var handleError = function (err) { return notify(function (consumer) { return consumer.error(err); }); };
        var groupBySourceSubscriber = new GroupBySubscriber(subscriber, function (value) {
            try {
                var key_1 = keySelector(value);
                var group_1 = groups.get(key_1);
                if (!group_1) {
                    groups.set(key_1, (group_1 = connector ? connector() : new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject()));
                    var grouped = createGroupedObservable(key_1, group_1);
                    subscriber.next(grouped);
                    if (duration) {
                        var durationSubscriber_1 = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(group_1, function () {
                            group_1.complete();
                            durationSubscriber_1 === null || durationSubscriber_1 === void 0 ? void 0 : durationSubscriber_1.unsubscribe();
                        }, undefined, undefined, function () { return groups.delete(key_1); });
                        groupBySourceSubscriber.add((0,_observable_from__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(duration(grouped)).subscribe(durationSubscriber_1));
                    }
                }
                group_1.next(element ? element(value) : value);
            }
            catch (err) {
                handleError(err);
            }
        }, function () { return notify(function (consumer) { return consumer.complete(); }); }, handleError, function () { return groups.clear(); });
        source.subscribe(groupBySourceSubscriber);
        function createGroupedObservable(key, groupSubject) {
            var result = new _Observable__WEBPACK_IMPORTED_MODULE_4__.Observable(function (groupSubscriber) {
                groupBySourceSubscriber.activeGroups++;
                var innerSub = groupSubject.subscribe(groupSubscriber);
                return function () {
                    innerSub.unsubscribe();
                    --groupBySourceSubscriber.activeGroups === 0 &&
                        groupBySourceSubscriber.teardownAttempted &&
                        groupBySourceSubscriber.unsubscribe();
                };
            });
            result.key = key;
            return result;
        }
    });
}
var GroupBySubscriber = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__extends)(GroupBySubscriber, _super);
    function GroupBySubscriber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.activeGroups = 0;
        _this.teardownAttempted = false;
        return _this;
    }
    GroupBySubscriber.prototype.unsubscribe = function () {
        this.teardownAttempted = true;
        this.activeGroups === 0 && _super.prototype.unsubscribe.call(this);
    };
    return GroupBySubscriber;
}(_OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber));
//# sourceMappingURL=groupBy.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/ignoreElements.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/ignoreElements.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ignoreElements": () => (/* binding */ ignoreElements)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");



function ignoreElements() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, _util_noop__WEBPACK_IMPORTED_MODULE_2__.noop));
    });
}
//# sourceMappingURL=ignoreElements.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/isEmpty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/isEmpty.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isEmpty": () => (/* binding */ isEmpty)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function isEmpty() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function () {
            subscriber.next(false);
            subscriber.complete();
        }, function () {
            subscriber.next(true);
            subscriber.complete();
        }));
    });
}
//# sourceMappingURL=isEmpty.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/joinAllInternals.js":
/*!****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/joinAllInternals.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "joinAllInternals": () => (/* binding */ joinAllInternals)
/* harmony export */ });
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");
/* harmony import */ var _util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/mapOneOrManyArgs */ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js");
/* harmony import */ var _util_pipe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/pipe */ "./node_modules/rxjs/dist/esm5/internal/util/pipe.js");
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");
/* harmony import */ var _toArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toArray */ "./node_modules/rxjs/dist/esm5/internal/operators/toArray.js");





function joinAllInternals(joinFn, project) {
    return (0,_util_pipe__WEBPACK_IMPORTED_MODULE_0__.pipe)((0,_toArray__WEBPACK_IMPORTED_MODULE_1__.toArray)(), (0,_mergeMap__WEBPACK_IMPORTED_MODULE_2__.mergeMap)(function (sources) { return joinFn(sources); }), project ? (0,_util_mapOneOrManyArgs__WEBPACK_IMPORTED_MODULE_3__.mapOneOrManyArgs)(project) : _util_identity__WEBPACK_IMPORTED_MODULE_4__.identity);
}
//# sourceMappingURL=joinAllInternals.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/last.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/last.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "last": () => (/* binding */ last)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/EmptyError */ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js");
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter */ "./node_modules/rxjs/dist/esm5/internal/operators/filter.js");
/* harmony import */ var _takeLast__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./takeLast */ "./node_modules/rxjs/dist/esm5/internal/operators/takeLast.js");
/* harmony import */ var _throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./throwIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/throwIfEmpty.js");
/* harmony import */ var _defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./defaultIfEmpty */ "./node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");






function last(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(predicate ? (0,_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(function (v, i) { return predicate(v, i, source); }) : _util_identity__WEBPACK_IMPORTED_MODULE_1__.identity, (0,_takeLast__WEBPACK_IMPORTED_MODULE_2__.takeLast)(1), hasDefaultValue ? (0,_defaultIfEmpty__WEBPACK_IMPORTED_MODULE_3__.defaultIfEmpty)(defaultValue) : (0,_throwIfEmpty__WEBPACK_IMPORTED_MODULE_4__.throwIfEmpty)(function () { return new _util_EmptyError__WEBPACK_IMPORTED_MODULE_5__.EmptyError(); }));
    };
}
//# sourceMappingURL=last.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/map.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/map.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "map": () => (/* binding */ map)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function map(project, thisArg) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            subscriber.next(project.call(thisArg, value, index++));
        }));
    });
}
//# sourceMappingURL=map.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/mapTo.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/mapTo.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mapTo": () => (/* binding */ mapTo)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");

function mapTo(value) {
    return (0,_map__WEBPACK_IMPORTED_MODULE_0__.map)(function () { return value; });
}
//# sourceMappingURL=mapTo.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/materialize.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/materialize.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "materialize": () => (/* binding */ materialize)
/* harmony export */ });
/* harmony import */ var _Notification__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Notification */ "./node_modules/rxjs/dist/esm5/internal/Notification.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function materialize() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            subscriber.next(_Notification__WEBPACK_IMPORTED_MODULE_2__.Notification.createNext(value));
        }, function () {
            subscriber.next(_Notification__WEBPACK_IMPORTED_MODULE_2__.Notification.createComplete());
            subscriber.complete();
        }, function (err) {
            subscriber.next(_Notification__WEBPACK_IMPORTED_MODULE_2__.Notification.createError(err));
            subscriber.complete();
        }));
    });
}
//# sourceMappingURL=materialize.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/max.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/max.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "max": () => (/* binding */ max)
/* harmony export */ });
/* harmony import */ var _reduce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reduce */ "./node_modules/rxjs/dist/esm5/internal/operators/reduce.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function max(comparer) {
    return (0,_reduce__WEBPACK_IMPORTED_MODULE_0__.reduce)((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(comparer) ? function (x, y) { return (comparer(x, y) > 0 ? x : y); } : function (x, y) { return (x > y ? x : y); });
}
//# sourceMappingURL=max.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/merge.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/merge.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "merge": () => (/* binding */ merge)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/argsOrArgArray */ "./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js");
/* harmony import */ var _observable_fromArray__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../observable/fromArray */ "./node_modules/rxjs/dist/esm5/internal/observable/fromArray.js");
/* harmony import */ var _mergeAll__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mergeAll */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");






function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(args);
    var concurrent = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popNumber)(args, Infinity);
    args = (0,_util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_1__.argsOrArgArray)(args);
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_2__.operate)(function (source, subscriber) {
        (0,_mergeAll__WEBPACK_IMPORTED_MODULE_3__.mergeAll)(concurrent)((0,_observable_fromArray__WEBPACK_IMPORTED_MODULE_4__.internalFromArray)((0,tslib__WEBPACK_IMPORTED_MODULE_5__.__spreadArray)([source], (0,tslib__WEBPACK_IMPORTED_MODULE_5__.__read)(args)), scheduler)).subscribe(subscriber);
    });
}
//# sourceMappingURL=merge.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeAll": () => (/* binding */ mergeAll)
/* harmony export */ });
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");


function mergeAll(concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_0__.mergeMap)(_util_identity__WEBPACK_IMPORTED_MODULE_1__.identity, concurrent);
}
//# sourceMappingURL=mergeAll.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeInternals": () => (/* binding */ mergeInternals)
/* harmony export */ });
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalTeardown) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function () {
        if (isComplete && !buffer.length && !active) {
            subscriber.complete();
        }
    };
    var outerNext = function (value) { return (active < concurrent ? doInnerSub(value) : buffer.push(value)); };
    var doInnerSub = function (value) {
        expand && subscriber.next(value);
        active++;
        var innerComplete = false;
        (0,_observable_from__WEBPACK_IMPORTED_MODULE_0__.innerFrom)(project(value, index++)).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (innerValue) {
            onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
            if (expand) {
                outerNext(innerValue);
            }
            else {
                subscriber.next(innerValue);
            }
        }, function () {
            innerComplete = true;
        }, undefined, function () {
            if (innerComplete) {
                try {
                    active--;
                    var _loop_1 = function () {
                        var bufferedValue = buffer.shift();
                        innerSubScheduler ? subscriber.add(innerSubScheduler.schedule(function () { return doInnerSub(bufferedValue); })) : doInnerSub(bufferedValue);
                    };
                    while (buffer.length && active < concurrent) {
                        _loop_1();
                    }
                    checkComplete();
                }
                catch (err) {
                    subscriber.error(err);
                }
            }
        }));
    };
    source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, outerNext, function () {
        isComplete = true;
        checkComplete();
    }));
    return function () {
        additionalTeardown === null || additionalTeardown === void 0 ? void 0 : additionalTeardown();
    };
}
//# sourceMappingURL=mergeInternals.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeMap": () => (/* binding */ mergeMap)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _mergeInternals__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mergeInternals */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");





function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(resultSelector)) {
        return mergeMap(function (a, i) { return (0,_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (b, ii) { return resultSelector(a, b, i, ii); })((0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(project(a, i))); }, concurrent);
    }
    else if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_3__.operate)(function (source, subscriber) { return (0,_mergeInternals__WEBPACK_IMPORTED_MODULE_4__.mergeInternals)(source, subscriber, project, concurrent); });
}
//# sourceMappingURL=mergeMap.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMapTo.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/mergeMapTo.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeMapTo": () => (/* binding */ mergeMapTo)
/* harmony export */ });
/* harmony import */ var _mergeMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mergeMap */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function mergeMapTo(innerObservable, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(resultSelector)) {
        return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_1__.mergeMap)(function () { return innerObservable; }, resultSelector, concurrent);
    }
    if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return (0,_mergeMap__WEBPACK_IMPORTED_MODULE_1__.mergeMap)(function () { return innerObservable; }, concurrent);
}
//# sourceMappingURL=mergeMapTo.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/mergeScan.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/mergeScan.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeScan": () => (/* binding */ mergeScan)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _mergeInternals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mergeInternals */ "./node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js");


function mergeScan(accumulator, seed, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var state = seed;
        return (0,_mergeInternals__WEBPACK_IMPORTED_MODULE_1__.mergeInternals)(source, subscriber, function (value, index) { return accumulator(state, value, index); }, concurrent, function (value) {
            state = value;
        }, false, undefined, function () { return (state = null); });
    });
}
//# sourceMappingURL=mergeScan.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/mergeWith.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/mergeWith.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeWith": () => (/* binding */ mergeWith)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _merge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./merge */ "./node_modules/rxjs/dist/esm5/internal/operators/merge.js");


function mergeWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return _merge__WEBPACK_IMPORTED_MODULE_0__.merge.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__read)(otherSources)));
}
//# sourceMappingURL=mergeWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/min.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/min.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "min": () => (/* binding */ min)
/* harmony export */ });
/* harmony import */ var _reduce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reduce */ "./node_modules/rxjs/dist/esm5/internal/operators/reduce.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function min(comparer) {
    return (0,_reduce__WEBPACK_IMPORTED_MODULE_0__.reduce)((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(comparer) ? function (x, y) { return (comparer(x, y) < 0 ? x : y); } : function (x, y) { return (x < y ? x : y); });
}
//# sourceMappingURL=min.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/multicast.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/multicast.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "multicast": () => (/* binding */ multicast)
/* harmony export */ });
/* harmony import */ var _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/ConnectableObservable */ "./node_modules/rxjs/dist/esm5/internal/observable/ConnectableObservable.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _connect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connect */ "./node_modules/rxjs/dist/esm5/internal/operators/connect.js");



function multicast(subjectOrSubjectFactory, selector) {
    var subjectFactory = (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(subjectOrSubjectFactory) ? subjectOrSubjectFactory : function () { return subjectOrSubjectFactory; };
    if ((0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(selector)) {
        return (0,_connect__WEBPACK_IMPORTED_MODULE_1__.connect)(selector, {
            connector: subjectFactory,
        });
    }
    return function (source) { return new _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_2__.ConnectableObservable(source, subjectFactory); };
}
//# sourceMappingURL=multicast.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/observeOn.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/observeOn.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "observeOn": () => (/* binding */ observeOn)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) { return subscriber.add(scheduler.schedule(function () { return subscriber.next(value); }, delay)); }, function () { return subscriber.add(scheduler.schedule(function () { return subscriber.complete(); }, delay)); }, function (err) { return subscriber.add(scheduler.schedule(function () { return subscriber.error(err); }, delay)); }));
    });
}
//# sourceMappingURL=observeOn.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/onErrorResumeNext.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/onErrorResumeNext.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "onErrorResumeNext": () => (/* binding */ onErrorResumeNext)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/argsOrArgArray */ "./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");






function onErrorResumeNext() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var nextSources = (0,_util_argsOrArgArray__WEBPACK_IMPORTED_MODULE_0__.argsOrArgArray)(sources);
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
        var remaining = (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__spreadArray)([source], (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__read)(nextSources));
        var subscribeNext = function () {
            if (!subscriber.closed) {
                if (remaining.length > 0) {
                    var nextSource = void 0;
                    try {
                        nextSource = (0,_observable_from__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(remaining.shift());
                    }
                    catch (err) {
                        subscribeNext();
                        return;
                    }
                    var innerSub = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_4__.OperatorSubscriber(subscriber, undefined, _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop, _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop);
                    subscriber.add(nextSource.subscribe(innerSub));
                    innerSub.add(subscribeNext);
                }
                else {
                    subscriber.complete();
                }
            }
        };
        subscribeNext();
    });
}
//# sourceMappingURL=onErrorResumeNext.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/pairwise.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/pairwise.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pairwise": () => (/* binding */ pairwise)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function pairwise() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var prev;
        var hasPrev = false;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            var p = prev;
            prev = value;
            hasPrev && subscriber.next([p, value]);
            hasPrev = true;
        }));
    });
}
//# sourceMappingURL=pairwise.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/pluck.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/pluck.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pluck": () => (/* binding */ pluck)
/* harmony export */ });
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");

function pluck() {
    var properties = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        properties[_i] = arguments[_i];
    }
    var length = properties.length;
    if (length === 0) {
        throw new Error('list of properties cannot be empty.');
    }
    return (0,_map__WEBPACK_IMPORTED_MODULE_0__.map)(function (x) {
        var currentProp = x;
        for (var i = 0; i < length; i++) {
            var p = currentProp === null || currentProp === void 0 ? void 0 : currentProp[properties[i]];
            if (typeof p !== 'undefined') {
                currentProp = p;
            }
            else {
                return undefined;
            }
        }
        return currentProp;
    });
}
//# sourceMappingURL=pluck.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/publish.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/publish.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "publish": () => (/* binding */ publish)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _multicast__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./multicast */ "./node_modules/rxjs/dist/esm5/internal/operators/multicast.js");
/* harmony import */ var _connect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./connect */ "./node_modules/rxjs/dist/esm5/internal/operators/connect.js");



function publish(selector) {
    return selector ? function (source) { return (0,_connect__WEBPACK_IMPORTED_MODULE_0__.connect)(selector)(source); } : function (source) { return (0,_multicast__WEBPACK_IMPORTED_MODULE_1__.multicast)(new _Subject__WEBPACK_IMPORTED_MODULE_2__.Subject())(source); };
}
//# sourceMappingURL=publish.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/publishBehavior.js":
/*!***************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/publishBehavior.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "publishBehavior": () => (/* binding */ publishBehavior)
/* harmony export */ });
/* harmony import */ var _BehaviorSubject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BehaviorSubject */ "./node_modules/rxjs/dist/esm5/internal/BehaviorSubject.js");
/* harmony import */ var _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/ConnectableObservable */ "./node_modules/rxjs/dist/esm5/internal/observable/ConnectableObservable.js");


function publishBehavior(initialValue) {
    return function (source) {
        var subject = new _BehaviorSubject__WEBPACK_IMPORTED_MODULE_0__.BehaviorSubject(initialValue);
        return new _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__.ConnectableObservable(source, function () { return subject; });
    };
}
//# sourceMappingURL=publishBehavior.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/publishLast.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/publishLast.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "publishLast": () => (/* binding */ publishLast)
/* harmony export */ });
/* harmony import */ var _AsyncSubject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../AsyncSubject */ "./node_modules/rxjs/dist/esm5/internal/AsyncSubject.js");
/* harmony import */ var _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/ConnectableObservable */ "./node_modules/rxjs/dist/esm5/internal/observable/ConnectableObservable.js");


function publishLast() {
    return function (source) {
        var subject = new _AsyncSubject__WEBPACK_IMPORTED_MODULE_0__.AsyncSubject();
        return new _observable_ConnectableObservable__WEBPACK_IMPORTED_MODULE_1__.ConnectableObservable(source, function () { return subject; });
    };
}
//# sourceMappingURL=publishLast.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/publishReplay.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/publishReplay.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "publishReplay": () => (/* binding */ publishReplay)
/* harmony export */ });
/* harmony import */ var _ReplaySubject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ReplaySubject */ "./node_modules/rxjs/dist/esm5/internal/ReplaySubject.js");
/* harmony import */ var _multicast__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./multicast */ "./node_modules/rxjs/dist/esm5/internal/operators/multicast.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");



function publishReplay(bufferSize, windowTime, selectorOrScheduler, timestampProvider) {
    if (selectorOrScheduler && !(0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(selectorOrScheduler)) {
        timestampProvider = selectorOrScheduler;
    }
    var selector = (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(selectorOrScheduler) ? selectorOrScheduler : undefined;
    return function (source) { return (0,_multicast__WEBPACK_IMPORTED_MODULE_1__.multicast)(new _ReplaySubject__WEBPACK_IMPORTED_MODULE_2__.ReplaySubject(bufferSize, windowTime, timestampProvider), selector)(source); };
}
//# sourceMappingURL=publishReplay.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/raceWith.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/raceWith.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "raceWith": () => (/* binding */ raceWith)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _observable_race__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/race */ "./node_modules/rxjs/dist/esm5/internal/observable/race.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");




function raceWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return !otherSources.length
        ? _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity
        : (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            (0,_observable_race__WEBPACK_IMPORTED_MODULE_2__.raceInit)((0,tslib__WEBPACK_IMPORTED_MODULE_3__.__spreadArray)([source], (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__read)(otherSources)))(subscriber);
        });
}
//# sourceMappingURL=raceWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/reduce.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/reduce.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "reduce": () => (/* binding */ reduce)
/* harmony export */ });
/* harmony import */ var _scanInternals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scanInternals */ "./node_modules/rxjs/dist/esm5/internal/operators/scanInternals.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");


function reduce(accumulator, seed) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)((0,_scanInternals__WEBPACK_IMPORTED_MODULE_1__.scanInternals)(accumulator, seed, arguments.length >= 2, false, true));
}
//# sourceMappingURL=reduce.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/refCount.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/refCount.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "refCount": () => (/* binding */ refCount)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function refCount() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var connection = null;
        source._refCount++;
        var refCounter = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, undefined, undefined, undefined, function () {
            if (!source || source._refCount <= 0 || 0 < --source._refCount) {
                connection = null;
                return;
            }
            var sharedConnection = source._connection;
            var conn = connection;
            connection = null;
            if (sharedConnection && (!conn || sharedConnection === conn)) {
                sharedConnection.unsubscribe();
            }
            subscriber.unsubscribe();
        });
        source.subscribe(refCounter);
        if (!refCounter.closed) {
            connection = source.connect();
        }
    });
}
//# sourceMappingURL=refCount.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/repeat.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/repeat.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "repeat": () => (/* binding */ repeat)
/* harmony export */ });
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function repeat(count) {
    if (count === void 0) { count = Infinity; }
    return count <= 0
        ? function () { return _observable_empty__WEBPACK_IMPORTED_MODULE_0__.EMPTY; }
        : (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            var soFar = 0;
            var innerSub;
            var subscribeForRepeat = function () {
                var syncUnsub = false;
                innerSub = source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, undefined, function () {
                    if (++soFar < count) {
                        if (innerSub) {
                            innerSub.unsubscribe();
                            innerSub = null;
                            subscribeForRepeat();
                        }
                        else {
                            syncUnsub = true;
                        }
                    }
                    else {
                        subscriber.complete();
                    }
                }));
                if (syncUnsub) {
                    innerSub.unsubscribe();
                    innerSub = null;
                    subscribeForRepeat();
                }
            };
            subscribeForRepeat();
        });
}
//# sourceMappingURL=repeat.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/repeatWhen.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/repeatWhen.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "repeatWhen": () => (/* binding */ repeatWhen)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function repeatWhen(notifier) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var innerSub;
        var syncResub = false;
        var completions$;
        var isNotifierComplete = false;
        var isMainComplete = false;
        var checkComplete = function () { return isMainComplete && isNotifierComplete && (subscriber.complete(), true); };
        var getCompletionSubject = function () {
            if (!completions$) {
                completions$ = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
                notifier(completions$).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function () {
                    if (innerSub) {
                        subscribeForRepeatWhen();
                    }
                    else {
                        syncResub = true;
                    }
                }, function () {
                    isNotifierComplete = true;
                    checkComplete();
                }));
            }
            return completions$;
        };
        var subscribeForRepeatWhen = function () {
            isMainComplete = false;
            innerSub = source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, undefined, function () {
                isMainComplete = true;
                !checkComplete() && getCompletionSubject().next();
            }));
            if (syncResub) {
                innerSub.unsubscribe();
                innerSub = null;
                syncResub = false;
                subscribeForRepeatWhen();
            }
        };
        subscribeForRepeatWhen();
    });
}
//# sourceMappingURL=repeatWhen.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/retry.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/retry.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "retry": () => (/* binding */ retry)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");



function retry(configOrCount) {
    if (configOrCount === void 0) { configOrCount = Infinity; }
    var config;
    if (configOrCount && typeof configOrCount === 'object') {
        config = configOrCount;
    }
    else {
        config = {
            count: configOrCount,
        };
    }
    var count = config.count, _a = config.resetOnSuccess, resetOnSuccess = _a === void 0 ? false : _a;
    return count <= 0
        ? _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity
        : (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            var soFar = 0;
            var innerSub;
            var subscribeForRetry = function () {
                var syncUnsub = false;
                innerSub = source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
                    if (resetOnSuccess) {
                        soFar = 0;
                    }
                    subscriber.next(value);
                }, undefined, function (err) {
                    if (soFar++ < count) {
                        if (innerSub) {
                            innerSub.unsubscribe();
                            innerSub = null;
                            subscribeForRetry();
                        }
                        else {
                            syncUnsub = true;
                        }
                    }
                    else {
                        subscriber.error(err);
                    }
                }));
                if (syncUnsub) {
                    innerSub.unsubscribe();
                    innerSub = null;
                    subscribeForRetry();
                }
            };
            subscribeForRetry();
        });
}
//# sourceMappingURL=retry.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/retryWhen.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/retryWhen.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "retryWhen": () => (/* binding */ retryWhen)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function retryWhen(notifier) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var innerSub;
        var syncResub = false;
        var errors$;
        var subscribeForRetryWhen = function () {
            innerSub = source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, undefined, undefined, function (err) {
                if (!errors$) {
                    errors$ = new _Subject__WEBPACK_IMPORTED_MODULE_2__.Subject();
                    notifier(errors$).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function () {
                        return innerSub ? subscribeForRetryWhen() : (syncResub = true);
                    }));
                }
                if (errors$) {
                    errors$.next(err);
                }
            }));
            if (syncResub) {
                innerSub.unsubscribe();
                innerSub = null;
                syncResub = false;
                subscribeForRetryWhen();
            }
        };
        subscribeForRetryWhen();
    });
}
//# sourceMappingURL=retryWhen.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/sample.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/sample.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sample": () => (/* binding */ sample)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function sample(notifier) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            lastValue = value;
        }));
        var emit = function () {
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        notifier.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, emit, _util_noop__WEBPACK_IMPORTED_MODULE_2__.noop));
    });
}
//# sourceMappingURL=sample.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/sampleTime.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/sampleTime.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sampleTime": () => (/* binding */ sampleTime)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _sample__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sample */ "./node_modules/rxjs/dist/esm5/internal/operators/sample.js");
/* harmony import */ var _observable_interval__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/interval */ "./node_modules/rxjs/dist/esm5/internal/observable/interval.js");



function sampleTime(period, scheduler) {
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.asyncScheduler; }
    return (0,_sample__WEBPACK_IMPORTED_MODULE_1__.sample)((0,_observable_interval__WEBPACK_IMPORTED_MODULE_2__.interval)(period, scheduler));
}
//# sourceMappingURL=sampleTime.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/scan.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/scan.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scan": () => (/* binding */ scan)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _scanInternals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scanInternals */ "./node_modules/rxjs/dist/esm5/internal/operators/scanInternals.js");


function scan(accumulator, seed) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)((0,_scanInternals__WEBPACK_IMPORTED_MODULE_1__.scanInternals)(accumulator, seed, arguments.length >= 2, true));
}
//# sourceMappingURL=scan.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/scanInternals.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/scanInternals.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scanInternals": () => (/* binding */ scanInternals)
/* harmony export */ });
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");

function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
    return function (source, subscriber) {
        var hasState = hasSeed;
        var state = seed;
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_0__.OperatorSubscriber(subscriber, function (value) {
            var i = index++;
            state = hasState
                ?
                    accumulator(state, value, i)
                :
                    ((hasState = true), value);
            emitOnNext && subscriber.next(state);
        }, emitBeforeComplete &&
            (function () {
                hasState && subscriber.next(state);
                subscriber.complete();
            })));
    };
}
//# sourceMappingURL=scanInternals.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/sequenceEqual.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/sequenceEqual.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sequenceEqual": () => (/* binding */ sequenceEqual)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function sequenceEqual(compareTo, comparator) {
    if (comparator === void 0) { comparator = function (a, b) { return a === b; }; }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var aState = createState();
        var bState = createState();
        var emit = function (isEqual) {
            subscriber.next(isEqual);
            subscriber.complete();
        };
        var createSubscriber = function (selfState, otherState) {
            var sequenceEqualSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (a) {
                var buffer = otherState.buffer, complete = otherState.complete;
                if (buffer.length === 0) {
                    complete ? emit(false) : selfState.buffer.push(a);
                }
                else {
                    !comparator(a, buffer.shift()) && emit(false);
                }
            }, function () {
                selfState.complete = true;
                var complete = otherState.complete, buffer = otherState.buffer;
                complete && emit(buffer.length === 0);
                sequenceEqualSubscriber === null || sequenceEqualSubscriber === void 0 ? void 0 : sequenceEqualSubscriber.unsubscribe();
            });
            return sequenceEqualSubscriber;
        };
        source.subscribe(createSubscriber(aState, bState));
        compareTo.subscribe(createSubscriber(bState, aState));
    });
}
function createState() {
    return {
        buffer: [],
        complete: false,
    };
}
//# sourceMappingURL=sequenceEqual.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/share.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/share.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "share": () => (/* binding */ share)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _operators_take__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../operators/take */ "./node_modules/rxjs/dist/esm5/internal/operators/take.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ "./node_modules/rxjs/dist/esm5/internal/Subscriber.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");






function share(options) {
    if (options === void 0) { options = {}; }
    var _a = options.connector, connector = _a === void 0 ? function () { return new _Subject__WEBPACK_IMPORTED_MODULE_0__.Subject(); } : _a, _b = options.resetOnError, resetOnError = _b === void 0 ? true : _b, _c = options.resetOnComplete, resetOnComplete = _c === void 0 ? true : _c, _d = options.resetOnRefCountZero, resetOnRefCountZero = _d === void 0 ? true : _d;
    return function (wrapperSource) {
        var connection = null;
        var resetConnection = null;
        var subject = null;
        var refCount = 0;
        var hasCompleted = false;
        var hasErrored = false;
        var cancelReset = function () {
            resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
            resetConnection = null;
        };
        var reset = function () {
            cancelReset();
            connection = subject = null;
            hasCompleted = hasErrored = false;
        };
        var resetAndUnsubscribe = function () {
            var conn = connection;
            reset();
            conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
        };
        return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            refCount++;
            if (!hasErrored && !hasCompleted) {
                cancelReset();
            }
            var dest = (subject = subject !== null && subject !== void 0 ? subject : connector());
            subscriber.add(function () {
                refCount--;
                if (refCount === 0 && !hasErrored && !hasCompleted) {
                    resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
                }
            });
            dest.subscribe(subscriber);
            if (!connection) {
                connection = new _Subscriber__WEBPACK_IMPORTED_MODULE_2__.SafeSubscriber({
                    next: function (value) { return dest.next(value); },
                    error: function (err) {
                        hasErrored = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnError, err);
                        dest.error(err);
                    },
                    complete: function () {
                        hasCompleted = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnComplete);
                        dest.complete();
                    },
                });
                (0,_observable_from__WEBPACK_IMPORTED_MODULE_3__.from)(source).subscribe(connection);
            }
        })(wrapperSource);
    };
}
function handleReset(reset, on) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (on === true) {
        reset();
        return null;
    }
    if (on === false) {
        return null;
    }
    return on.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_4__.__read)(args))).pipe((0,_operators_take__WEBPACK_IMPORTED_MODULE_5__.take)(1))
        .subscribe(function () { return reset(); });
}
//# sourceMappingURL=share.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "shareReplay": () => (/* binding */ shareReplay)
/* harmony export */ });
/* harmony import */ var _ReplaySubject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ReplaySubject */ "./node_modules/rxjs/dist/esm5/internal/ReplaySubject.js");
/* harmony import */ var _share__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./share */ "./node_modules/rxjs/dist/esm5/internal/operators/share.js");


function shareReplay(configOrBufferSize, windowTime, scheduler) {
    var _a, _b;
    var bufferSize;
    var refCount = false;
    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
        bufferSize = (_a = configOrBufferSize.bufferSize) !== null && _a !== void 0 ? _a : Infinity;
        windowTime = (_b = configOrBufferSize.windowTime) !== null && _b !== void 0 ? _b : Infinity;
        refCount = !!configOrBufferSize.refCount;
        scheduler = configOrBufferSize.scheduler;
    }
    else {
        bufferSize = configOrBufferSize !== null && configOrBufferSize !== void 0 ? configOrBufferSize : Infinity;
    }
    return (0,_share__WEBPACK_IMPORTED_MODULE_0__.share)({
        connector: function () { return new _ReplaySubject__WEBPACK_IMPORTED_MODULE_1__.ReplaySubject(bufferSize, windowTime, scheduler); },
        resetOnError: true,
        resetOnComplete: false,
        resetOnRefCountZero: refCount
    });
}
//# sourceMappingURL=shareReplay.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/single.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/single.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "single": () => (/* binding */ single)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/EmptyError */ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js");
/* harmony import */ var _util_SequenceError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/SequenceError */ "./node_modules/rxjs/dist/esm5/internal/util/SequenceError.js");
/* harmony import */ var _util_NotFoundError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/NotFoundError */ "./node_modules/rxjs/dist/esm5/internal/util/NotFoundError.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");





function single(predicate) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var hasValue = false;
        var singleValue;
        var seenValue = false;
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            seenValue = true;
            if (!predicate || predicate(value, index++, source)) {
                hasValue && subscriber.error(new _util_SequenceError__WEBPACK_IMPORTED_MODULE_2__.SequenceError('Too many matching values'));
                hasValue = true;
                singleValue = value;
            }
        }, function () {
            if (hasValue) {
                subscriber.next(singleValue);
                subscriber.complete();
            }
            else {
                subscriber.error(seenValue ? new _util_NotFoundError__WEBPACK_IMPORTED_MODULE_3__.NotFoundError('No matching values') : new _util_EmptyError__WEBPACK_IMPORTED_MODULE_4__.EmptyError());
            }
        }));
    });
}
//# sourceMappingURL=single.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/skip.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/skip.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "skip": () => (/* binding */ skip)
/* harmony export */ });
/* harmony import */ var _filter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter */ "./node_modules/rxjs/dist/esm5/internal/operators/filter.js");

function skip(count) {
    return (0,_filter__WEBPACK_IMPORTED_MODULE_0__.filter)(function (_, index) { return count <= index; });
}
//# sourceMappingURL=skip.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/skipLast.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/skipLast.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "skipLast": () => (/* binding */ skipLast)
/* harmony export */ });
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function skipLast(skipCount) {
    return skipCount <= 0
        ?
            _util_identity__WEBPACK_IMPORTED_MODULE_0__.identity
        : (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            var ring = new Array(skipCount);
            var seen = 0;
            source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
                var valueIndex = seen++;
                if (valueIndex < skipCount) {
                    ring[valueIndex] = value;
                }
                else {
                    var index = valueIndex % skipCount;
                    var oldValue = ring[index];
                    ring[index] = value;
                    subscriber.next(oldValue);
                }
            }));
            return function () {
                ring = null;
            };
        });
}
//# sourceMappingURL=skipLast.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/skipUntil.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/skipUntil.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "skipUntil": () => (/* binding */ skipUntil)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");




function skipUntil(notifier) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var taking = false;
        var skipSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function () {
            skipSubscriber === null || skipSubscriber === void 0 ? void 0 : skipSubscriber.unsubscribe();
            taking = true;
        }, _util_noop__WEBPACK_IMPORTED_MODULE_2__.noop);
        (0,_observable_from__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(notifier).subscribe(skipSubscriber);
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) { return taking && subscriber.next(value); }));
    });
}
//# sourceMappingURL=skipUntil.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/skipWhile.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/skipWhile.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "skipWhile": () => (/* binding */ skipWhile)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function skipWhile(predicate) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var taking = false;
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) { return (taking || (taking = !predicate(value, index++))) && subscriber.next(value); }));
    });
}
//# sourceMappingURL=skipWhile.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/startWith.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/startWith.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "startWith": () => (/* binding */ startWith)
/* harmony export */ });
/* harmony import */ var _observable_concat__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/concat */ "./node_modules/rxjs/dist/esm5/internal/observable/concat.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");



function startWith() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var scheduler = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(values);
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
        (scheduler ? (0,_observable_concat__WEBPACK_IMPORTED_MODULE_2__.concat)(values, source, scheduler) : (0,_observable_concat__WEBPACK_IMPORTED_MODULE_2__.concat)(values, source)).subscribe(subscriber);
    });
}
//# sourceMappingURL=startWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "subscribeOn": () => (/* binding */ subscribeOn)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");

function subscribeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        subscriber.add(scheduler.schedule(function () { return source.subscribe(subscriber); }, delay));
    });
}
//# sourceMappingURL=subscribeOn.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/switchAll.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/switchAll.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "switchAll": () => (/* binding */ switchAll)
/* harmony export */ });
/* harmony import */ var _switchMap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./switchMap */ "./node_modules/rxjs/dist/esm5/internal/operators/switchMap.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");


function switchAll() {
    return (0,_switchMap__WEBPACK_IMPORTED_MODULE_0__.switchMap)(_util_identity__WEBPACK_IMPORTED_MODULE_1__.identity);
}
//# sourceMappingURL=switchAll.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/switchMap.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/switchMap.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "switchMap": () => (/* binding */ switchMap)
/* harmony export */ });
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function switchMap(project, resultSelector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var innerSubscriber = null;
        var index = 0;
        var isComplete = false;
        var checkComplete = function () { return isComplete && !innerSubscriber && subscriber.complete(); };
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
            var innerIndex = 0;
            var outerIndex = index++;
            (0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(project(value, outerIndex)).subscribe((innerSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (innerValue) { return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue); }, function () {
                innerSubscriber = null;
                checkComplete();
            })));
        }, function () {
            isComplete = true;
            checkComplete();
        }));
    });
}
//# sourceMappingURL=switchMap.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/switchMapTo.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/switchMapTo.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "switchMapTo": () => (/* binding */ switchMapTo)
/* harmony export */ });
/* harmony import */ var _switchMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./switchMap */ "./node_modules/rxjs/dist/esm5/internal/operators/switchMap.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function switchMapTo(innerObservable, resultSelector) {
    return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(resultSelector) ? (0,_switchMap__WEBPACK_IMPORTED_MODULE_1__.switchMap)(function () { return innerObservable; }, resultSelector) : (0,_switchMap__WEBPACK_IMPORTED_MODULE_1__.switchMap)(function () { return innerObservable; });
}
//# sourceMappingURL=switchMapTo.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/switchScan.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/switchScan.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "switchScan": () => (/* binding */ switchScan)
/* harmony export */ });
/* harmony import */ var _switchMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./switchMap */ "./node_modules/rxjs/dist/esm5/internal/operators/switchMap.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");


function switchScan(accumulator, seed) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var state = seed;
        (0,_switchMap__WEBPACK_IMPORTED_MODULE_1__.switchMap)(function (value, index) { return accumulator(state, value, index); }, function (_, innerValue) { return ((state = innerValue), innerValue); })(source).subscribe(subscriber);
        return function () {
            state = null;
        };
    });
}
//# sourceMappingURL=switchScan.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/take.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/take.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "take": () => (/* binding */ take)
/* harmony export */ });
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function take(count) {
    return count <= 0
        ?
            function () { return _observable_empty__WEBPACK_IMPORTED_MODULE_0__.EMPTY; }
        : (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            var seen = 0;
            source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
                if (++seen <= count) {
                    subscriber.next(value);
                    if (count <= seen) {
                        subscriber.complete();
                    }
                }
            }));
        });
}
//# sourceMappingURL=take.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/takeLast.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/takeLast.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "takeLast": () => (/* binding */ takeLast)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _observable_empty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../observable/empty */ "./node_modules/rxjs/dist/esm5/internal/observable/empty.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");




function takeLast(count) {
    return count <= 0
        ? function () { return _observable_empty__WEBPACK_IMPORTED_MODULE_0__.EMPTY; }
        : (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            var buffer = [];
            source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
                buffer.push(value);
                count < buffer.length && buffer.shift();
            }, function () {
                var e_1, _a;
                try {
                    for (var buffer_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__values)(buffer), buffer_1_1 = buffer_1.next(); !buffer_1_1.done; buffer_1_1 = buffer_1.next()) {
                        var value = buffer_1_1.value;
                        subscriber.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (buffer_1_1 && !buffer_1_1.done && (_a = buffer_1.return)) _a.call(buffer_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                subscriber.complete();
            }, undefined, function () {
                buffer = null;
            }));
        });
}
//# sourceMappingURL=takeLast.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "takeUntil": () => (/* binding */ takeUntil)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");




function takeUntil(notifier) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        (0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(notifier).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function () { return subscriber.complete(); }, _util_noop__WEBPACK_IMPORTED_MODULE_3__.noop));
        !subscriber.closed && source.subscribe(subscriber);
    });
}
//# sourceMappingURL=takeUntil.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/takeWhile.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/takeWhile.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "takeWhile": () => (/* binding */ takeWhile)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");


function takeWhile(predicate, inclusive) {
    if (inclusive === void 0) { inclusive = false; }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var index = 0;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            var result = predicate(value, index++);
            (result || inclusive) && subscriber.next(value);
            !result && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=takeWhile.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/tap.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/tap.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "tap": () => (/* binding */ tap)
/* harmony export */ });
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");




function tap(observerOrNext, error, complete) {
    var tapObserver = (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(observerOrNext) || error || complete ? { next: observerOrNext, error: error, complete: complete } : observerOrNext;
    return tapObserver
        ? (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
            source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
                var _a;
                (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                subscriber.next(value);
            }, function () {
                var _a;
                (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                subscriber.complete();
            }, function (err) {
                var _a;
                (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                subscriber.error(err);
            }));
        })
        :
            _util_identity__WEBPACK_IMPORTED_MODULE_3__.identity;
}
//# sourceMappingURL=tap.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/throttle.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/throttle.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defaultThrottleConfig": () => (/* binding */ defaultThrottleConfig),
/* harmony export */   "throttle": () => (/* binding */ throttle)
/* harmony export */ });
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");



var defaultThrottleConfig = {
    leading: true,
    trailing: false,
};
function throttle(durationSelector, _a) {
    var _b = _a === void 0 ? defaultThrottleConfig : _a, leading = _b.leading, trailing = _b.trailing;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var hasValue = false;
        var sendValue = null;
        var throttled = null;
        var isComplete = false;
        var endThrottling = function () {
            throttled === null || throttled === void 0 ? void 0 : throttled.unsubscribe();
            throttled = null;
            if (trailing) {
                send();
                isComplete && subscriber.complete();
            }
        };
        var cleanupThrottling = function () {
            throttled = null;
            isComplete && subscriber.complete();
        };
        var startThrottle = function (value) {
            return (throttled = (0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(durationSelector(value)).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, endThrottling, cleanupThrottling)));
        };
        var send = function () {
            if (hasValue) {
                hasValue = false;
                var value = sendValue;
                sendValue = null;
                subscriber.next(value);
                !isComplete && startThrottle(value);
            }
        };
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            sendValue = value;
            !(throttled && !throttled.closed) && (leading ? send() : startThrottle(value));
        }, function () {
            isComplete = true;
            !(trailing && hasValue && throttled && !throttled.closed) && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=throttle.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/throttleTime.js":
/*!************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/throttleTime.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "throttleTime": () => (/* binding */ throttleTime)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _throttle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./throttle */ "./node_modules/rxjs/dist/esm5/internal/operators/throttle.js");
/* harmony import */ var _observable_timer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/timer */ "./node_modules/rxjs/dist/esm5/internal/observable/timer.js");



function throttleTime(duration, scheduler, config) {
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.asyncScheduler; }
    if (config === void 0) { config = _throttle__WEBPACK_IMPORTED_MODULE_1__.defaultThrottleConfig; }
    var duration$ = (0,_observable_timer__WEBPACK_IMPORTED_MODULE_2__.timer)(duration, scheduler);
    return (0,_throttle__WEBPACK_IMPORTED_MODULE_1__.throttle)(function () { return duration$; }, config);
}
//# sourceMappingURL=throttleTime.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/throwIfEmpty.js":
/*!************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/throwIfEmpty.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "throwIfEmpty": () => (/* binding */ throwIfEmpty)
/* harmony export */ });
/* harmony import */ var _util_EmptyError__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/EmptyError */ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");



function throwIfEmpty(errorFactory) {
    if (errorFactory === void 0) { errorFactory = defaultErrorFactory; }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var hasValue = false;
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_1__.OperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            subscriber.next(value);
        }, function () { return (hasValue ? subscriber.complete() : subscriber.error(errorFactory())); }));
    });
}
function defaultErrorFactory() {
    return new _util_EmptyError__WEBPACK_IMPORTED_MODULE_2__.EmptyError();
}
//# sourceMappingURL=throwIfEmpty.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/timeInterval.js":
/*!************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/timeInterval.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "timeInterval": () => (/* binding */ timeInterval),
/* harmony export */   "TimeInterval": () => (/* binding */ TimeInterval)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _scan__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scan */ "./node_modules/rxjs/dist/esm5/internal/operators/scan.js");
/* harmony import */ var _observable_defer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/defer */ "./node_modules/rxjs/dist/esm5/internal/observable/defer.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");




function timeInterval(scheduler) {
    if (scheduler === void 0) { scheduler = _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async; }
    return function (source) {
        return (0,_observable_defer__WEBPACK_IMPORTED_MODULE_1__.defer)(function () {
            return source.pipe((0,_scan__WEBPACK_IMPORTED_MODULE_2__.scan)(function (_a, value) {
                var current = _a.current;
                return ({ value: value, current: scheduler.now(), last: current });
            }, {
                current: scheduler.now(),
                value: undefined,
                last: undefined,
            }), (0,_map__WEBPACK_IMPORTED_MODULE_3__.map)(function (_a) {
                var current = _a.current, last = _a.last, value = _a.value;
                return new TimeInterval(value, current - last);
            }));
        });
    };
}
var TimeInterval = (function () {
    function TimeInterval(value, interval) {
        this.value = value;
        this.interval = interval;
    }
    return TimeInterval;
}());

//# sourceMappingURL=timeInterval.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/timeout.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/timeout.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TimeoutError": () => (/* binding */ TimeoutError),
/* harmony export */   "timeout": () => (/* binding */ timeout)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _util_isDate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isDate */ "./node_modules/rxjs/dist/esm5/internal/util/isDate.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_createErrorClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/createErrorClass */ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js");
/* harmony import */ var _util_caughtSchedule__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/caughtSchedule */ "./node_modules/rxjs/dist/esm5/internal/util/caughtSchedule.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");







var TimeoutError = (0,_util_createErrorClass__WEBPACK_IMPORTED_MODULE_0__.createErrorClass)(function (_super) {
    return function TimeoutErrorImpl(info) {
        if (info === void 0) { info = null; }
        _super(this);
        this.message = 'Timeout has occurred';
        this.name = 'TimeoutError';
        this.info = info;
    };
});
function timeout(config, schedulerArg) {
    var _a = ((0,_util_isDate__WEBPACK_IMPORTED_MODULE_1__.isValidDate)(config)
        ? { first: config }
        : typeof config === 'number'
            ? { each: config }
            : config), first = _a.first, each = _a.each, _b = _a.with, _with = _b === void 0 ? timeoutErrorFactory : _b, _c = _a.scheduler, scheduler = _c === void 0 ? schedulerArg !== null && schedulerArg !== void 0 ? schedulerArg : _scheduler_async__WEBPACK_IMPORTED_MODULE_2__.asyncScheduler : _c, _d = _a.meta, meta = _d === void 0 ? null : _d;
    if (first == null && each == null) {
        throw new TypeError('No timeout provided.');
    }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_3__.operate)(function (source, subscriber) {
        var originalSourceSubscription;
        var timerSubscription;
        var lastValue = null;
        var seen = 0;
        var startTimer = function (delay) {
            timerSubscription = (0,_util_caughtSchedule__WEBPACK_IMPORTED_MODULE_4__.caughtSchedule)(subscriber, scheduler, function () {
                originalSourceSubscription.unsubscribe();
                (0,_observable_from__WEBPACK_IMPORTED_MODULE_5__.innerFrom)(_with({
                    meta: meta,
                    lastValue: lastValue,
                    seen: seen,
                })).subscribe(subscriber);
            }, delay);
        };
        originalSourceSubscription = source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_6__.OperatorSubscriber(subscriber, function (value) {
            timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
            seen++;
            subscriber.next((lastValue = value));
            each > 0 && startTimer(each);
        }, undefined, undefined, function () {
            if (!(timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.closed)) {
                timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
            }
            lastValue = null;
        }));
        startTimer(first != null ? (typeof first === 'number' ? first : +first - scheduler.now()) : each);
    });
}
function timeoutErrorFactory(info) {
    throw new TimeoutError(info);
}
//# sourceMappingURL=timeout.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/timeoutWith.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/timeoutWith.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "timeoutWith": () => (/* binding */ timeoutWith)
/* harmony export */ });
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _util_isDate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isDate */ "./node_modules/rxjs/dist/esm5/internal/util/isDate.js");
/* harmony import */ var _timeout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./timeout */ "./node_modules/rxjs/dist/esm5/internal/operators/timeout.js");



function timeoutWith(due, withObservable, scheduler) {
    var first;
    var each;
    var _with;
    scheduler = scheduler !== null && scheduler !== void 0 ? scheduler : _scheduler_async__WEBPACK_IMPORTED_MODULE_0__.async;
    if ((0,_util_isDate__WEBPACK_IMPORTED_MODULE_1__.isValidDate)(due)) {
        first = due;
    }
    else if (typeof due === 'number') {
        each = due;
    }
    if (withObservable) {
        _with = function () { return withObservable; };
    }
    else {
        throw new TypeError('No observable provided to switch to');
    }
    if (first == null && each == null) {
        throw new TypeError('No timeout provided.');
    }
    return (0,_timeout__WEBPACK_IMPORTED_MODULE_2__.timeout)({
        first: first,
        each: each,
        scheduler: scheduler,
        with: _with,
    });
}
//# sourceMappingURL=timeoutWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/timestamp.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/timestamp.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "timestamp": () => (/* binding */ timestamp)
/* harmony export */ });
/* harmony import */ var _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/dateTimestampProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");


function timestamp(timestampProvider) {
    if (timestampProvider === void 0) { timestampProvider = _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_0__.dateTimestampProvider; }
    return (0,_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (value) { return ({ value: value, timestamp: timestampProvider.now() }); });
}
//# sourceMappingURL=timestamp.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/toArray.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/toArray.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "toArray": () => (/* binding */ toArray)
/* harmony export */ });
/* harmony import */ var _reduce__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reduce */ "./node_modules/rxjs/dist/esm5/internal/operators/reduce.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");


var arrReducer = function (arr, value) { return (arr.push(value), arr); };
function toArray() {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        (0,_reduce__WEBPACK_IMPORTED_MODULE_1__.reduce)(arrReducer, [])(source).subscribe(subscriber);
    });
}
//# sourceMappingURL=toArray.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/window.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/window.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "window": () => (/* binding */ window)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");




function window(windowBoundaries) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var windowSubject = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
        subscriber.next(windowSubject.asObservable());
        var errorHandler = function (err) {
            windowSubject.error(err);
            subscriber.error(err);
        };
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) { return windowSubject === null || windowSubject === void 0 ? void 0 : windowSubject.next(value); }, function () {
            windowSubject.complete();
            subscriber.complete();
        }, errorHandler));
        windowBoundaries.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function () {
            windowSubject.complete();
            subscriber.next((windowSubject = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject()));
        }, _util_noop__WEBPACK_IMPORTED_MODULE_3__.noop, errorHandler));
        return function () {
            windowSubject === null || windowSubject === void 0 ? void 0 : windowSubject.unsubscribe();
            windowSubject = null;
        };
    });
}
//# sourceMappingURL=window.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/windowCount.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/windowCount.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "windowCount": () => (/* binding */ windowCount)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");




function windowCount(windowSize, startWindowEvery) {
    if (startWindowEvery === void 0) { startWindowEvery = 0; }
    var startEvery = startWindowEvery > 0 ? startWindowEvery : windowSize;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var windows = [new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject()];
        var starts = [];
        var count = 0;
        subscriber.next(windows[0].asObservable());
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            try {
                for (var windows_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_3__.__values)(windows), windows_1_1 = windows_1.next(); !windows_1_1.done; windows_1_1 = windows_1.next()) {
                    var window_1 = windows_1_1.value;
                    window_1.next(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (windows_1_1 && !windows_1_1.done && (_a = windows_1.return)) _a.call(windows_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var c = count - windowSize + 1;
            if (c >= 0 && c % startEvery === 0) {
                windows.shift().complete();
            }
            if (++count % startEvery === 0) {
                var window_2 = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
                windows.push(window_2);
                subscriber.next(window_2.asObservable());
            }
        }, function () {
            while (windows.length > 0) {
                windows.shift().complete();
            }
            subscriber.complete();
        }, function (err) {
            while (windows.length > 0) {
                windows.shift().error(err);
            }
            subscriber.error(err);
        }, function () {
            starts = null;
            windows = null;
        }));
    });
}
//# sourceMappingURL=windowCount.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/windowTime.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/windowTime.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "windowTime": () => (/* binding */ windowTime)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _scheduler_async__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scheduler/async */ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");







function windowTime(windowTimeSpan) {
    var _a, _b;
    var otherArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherArgs[_i - 1] = arguments[_i];
    }
    var scheduler = (_a = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popScheduler)(otherArgs)) !== null && _a !== void 0 ? _a : _scheduler_async__WEBPACK_IMPORTED_MODULE_1__.asyncScheduler;
    var windowCreationInterval = (_b = otherArgs[0]) !== null && _b !== void 0 ? _b : null;
    var maxWindowSize = otherArgs[1] || Infinity;
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_2__.operate)(function (source, subscriber) {
        var windowRecords = [];
        var restartOnClose = false;
        var closeWindow = function (record) {
            var window = record.window, subs = record.subs;
            window.complete();
            subs.unsubscribe();
            (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_3__.arrRemove)(windowRecords, record);
            restartOnClose && startWindow();
        };
        var startWindow = function () {
            if (windowRecords) {
                var subs = new _Subscription__WEBPACK_IMPORTED_MODULE_4__.Subscription();
                subscriber.add(subs);
                var window_1 = new _Subject__WEBPACK_IMPORTED_MODULE_5__.Subject();
                var record_1 = {
                    window: window_1,
                    subs: subs,
                    seen: 0,
                };
                windowRecords.push(record_1);
                subscriber.next(window_1.asObservable());
                subs.add(scheduler.schedule(function () { return closeWindow(record_1); }, windowTimeSpan));
            }
        };
        windowCreationInterval !== null && windowCreationInterval >= 0
            ?
                subscriber.add(scheduler.schedule(function () {
                    startWindow();
                    !this.closed && subscriber.add(this.schedule(null, windowCreationInterval));
                }, windowCreationInterval))
            : (restartOnClose = true);
        startWindow();
        var loop = function (cb) { return windowRecords.slice().forEach(cb); };
        var terminate = function (cb) {
            loop(function (_a) {
                var window = _a.window;
                return cb(window);
            });
            cb(subscriber);
            subscriber.unsubscribe();
        };
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_6__.OperatorSubscriber(subscriber, function (value) {
            loop(function (record) {
                record.window.next(value);
                maxWindowSize <= ++record.seen && closeWindow(record);
            });
        }, function () { return terminate(function (consumer) { return consumer.complete(); }); }, function (err) { return terminate(function (consumer) { return consumer.error(err); }); }));
        return function () {
            windowRecords = null;
        };
    });
}
//# sourceMappingURL=windowTime.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/windowToggle.js":
/*!************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/windowToggle.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "windowToggle": () => (/* binding */ windowToggle)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");








function windowToggle(openings, closingSelector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var windows = [];
        var handleError = function (err) {
            while (0 < windows.length) {
                windows.shift().error(err);
            }
            subscriber.error(err);
        };
        (0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(openings).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (openValue) {
            var window = new _Subject__WEBPACK_IMPORTED_MODULE_3__.Subject();
            windows.push(window);
            var closingSubscription = new _Subscription__WEBPACK_IMPORTED_MODULE_4__.Subscription();
            var closeWindow = function () {
                (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_5__.arrRemove)(windows, window);
                window.complete();
                closingSubscription.unsubscribe();
            };
            var closingNotifier;
            try {
                closingNotifier = (0,_observable_from__WEBPACK_IMPORTED_MODULE_1__.innerFrom)(closingSelector(openValue));
            }
            catch (err) {
                handleError(err);
                return;
            }
            subscriber.next(window.asObservable());
            closingSubscription.add(closingNotifier.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, closeWindow, _util_noop__WEBPACK_IMPORTED_MODULE_6__.noop, handleError)));
        }, _util_noop__WEBPACK_IMPORTED_MODULE_6__.noop));
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_2__.OperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            var windowsCopy = windows.slice();
            try {
                for (var windowsCopy_1 = (0,tslib__WEBPACK_IMPORTED_MODULE_7__.__values)(windowsCopy), windowsCopy_1_1 = windowsCopy_1.next(); !windowsCopy_1_1.done; windowsCopy_1_1 = windowsCopy_1.next()) {
                    var window_1 = windowsCopy_1_1.value;
                    window_1.next(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (windowsCopy_1_1 && !windowsCopy_1_1.done && (_a = windowsCopy_1.return)) _a.call(windowsCopy_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (0 < windows.length) {
                windows.shift().complete();
            }
            subscriber.complete();
        }, handleError, function () {
            while (0 < windows.length) {
                windows.shift().unsubscribe();
            }
        }));
    });
}
//# sourceMappingURL=windowToggle.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/windowWhen.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/windowWhen.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "windowWhen": () => (/* binding */ windowWhen)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subject */ "./node_modules/rxjs/dist/esm5/internal/Subject.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");




function windowWhen(closingSelector) {
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        var window;
        var closingSubscriber;
        var handleError = function (err) {
            window.error(err);
            subscriber.error(err);
        };
        var openWindow = function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            window === null || window === void 0 ? void 0 : window.complete();
            window = new _Subject__WEBPACK_IMPORTED_MODULE_1__.Subject();
            subscriber.next(window.asObservable());
            var closingNotifier;
            try {
                closingNotifier = (0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(closingSelector());
            }
            catch (err) {
                handleError(err);
                return;
            }
            closingNotifier.subscribe((closingSubscriber = new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subscriber, openWindow, openWindow, handleError)));
        };
        openWindow();
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subscriber, function (value) { return window.next(value); }, function () {
            window.complete();
            subscriber.complete();
        }, handleError, function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            window = null;
        }));
    });
}
//# sourceMappingURL=windowWhen.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/withLatestFrom.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/withLatestFrom.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "withLatestFrom": () => (/* binding */ withLatestFrom)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");
/* harmony import */ var _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./OperatorSubscriber */ "./node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js");
/* harmony import */ var _observable_from__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../observable/from */ "./node_modules/rxjs/dist/esm5/internal/observable/from.js");
/* harmony import */ var _util_identity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");
/* harmony import */ var _util_noop__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/noop */ "./node_modules/rxjs/dist/esm5/internal/util/noop.js");
/* harmony import */ var _util_args__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/args */ "./node_modules/rxjs/dist/esm5/internal/util/args.js");







function withLatestFrom() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    var project = (0,_util_args__WEBPACK_IMPORTED_MODULE_0__.popResultSelector)(inputs);
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)(function (source, subscriber) {
        var len = inputs.length;
        var otherValues = new Array(len);
        var hasValue = inputs.map(function () { return false; });
        var ready = false;
        var _loop_1 = function (i) {
            (0,_observable_from__WEBPACK_IMPORTED_MODULE_2__.innerFrom)(inputs[i]).subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subscriber, function (value) {
                otherValues[i] = value;
                if (!ready && !hasValue[i]) {
                    hasValue[i] = true;
                    (ready = hasValue.every(_util_identity__WEBPACK_IMPORTED_MODULE_4__.identity)) && (hasValue = null);
                }
            }, _util_noop__WEBPACK_IMPORTED_MODULE_5__.noop));
        };
        for (var i = 0; i < len; i++) {
            _loop_1(i);
        }
        source.subscribe(new _OperatorSubscriber__WEBPACK_IMPORTED_MODULE_3__.OperatorSubscriber(subscriber, function (value) {
            if (ready) {
                var values = (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__spreadArray)([value], (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__read)(otherValues));
                subscriber.next(project ? project.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_6__.__read)(values))) : values);
            }
        }));
    });
}
//# sourceMappingURL=withLatestFrom.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/zip.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/zip.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "zip": () => (/* binding */ zip)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _observable_zip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/zip */ "./node_modules/rxjs/dist/esm5/internal/observable/zip.js");
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/lift */ "./node_modules/rxjs/dist/esm5/internal/util/lift.js");



function zip() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_0__.operate)(function (source, subscriber) {
        _observable_zip__WEBPACK_IMPORTED_MODULE_1__.zip.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__spreadArray)([source], (0,tslib__WEBPACK_IMPORTED_MODULE_2__.__read)(sources))).subscribe(subscriber);
    });
}
//# sourceMappingURL=zip.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/zipAll.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/zipAll.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "zipAll": () => (/* binding */ zipAll)
/* harmony export */ });
/* harmony import */ var _observable_zip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../observable/zip */ "./node_modules/rxjs/dist/esm5/internal/observable/zip.js");
/* harmony import */ var _joinAllInternals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./joinAllInternals */ "./node_modules/rxjs/dist/esm5/internal/operators/joinAllInternals.js");


function zipAll(project) {
    return (0,_joinAllInternals__WEBPACK_IMPORTED_MODULE_0__.joinAllInternals)(_observable_zip__WEBPACK_IMPORTED_MODULE_1__.zip, project);
}
//# sourceMappingURL=zipAll.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/operators/zipWith.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/operators/zipWith.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "zipWith": () => (/* binding */ zipWith)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _zip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./zip */ "./node_modules/rxjs/dist/esm5/internal/operators/zip.js");


function zipWith() {
    var otherInputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherInputs[_i] = arguments[_i];
    }
    return _zip__WEBPACK_IMPORTED_MODULE_0__.zip.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__read)(otherInputs)));
}
//# sourceMappingURL=zipWith.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scheduleArray": () => (/* binding */ scheduleArray)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");

function scheduleArray(input, scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var i = 0;
        return scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
            }
            else {
                subscriber.next(input[i++]);
                if (!subscriber.closed) {
                    this.schedule();
                }
            }
        });
    });
}
//# sourceMappingURL=scheduleArray.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scheduleAsyncIterable": () => (/* binding */ scheduleAsyncIterable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");


function scheduleAsyncIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var sub = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
        sub.add(scheduler.schedule(function () {
            var iterator = input[Symbol.asyncIterator]();
            sub.add(scheduler.schedule(function () {
                var _this = this;
                iterator.next().then(function (result) {
                    if (result.done) {
                        subscriber.complete();
                    }
                    else {
                        subscriber.next(result.value);
                        _this.schedule();
                    }
                });
            }));
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleAsyncIterable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js":
/*!****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scheduleIterable": () => (/* binding */ scheduleIterable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _symbol_iterator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../symbol/iterator */ "./node_modules/rxjs/dist/esm5/internal/symbol/iterator.js");
/* harmony import */ var _util_isFunction__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _util_caughtSchedule__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/caughtSchedule */ "./node_modules/rxjs/dist/esm5/internal/util/caughtSchedule.js");




function scheduleIterable(input, scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var iterator;
        subscriber.add(scheduler.schedule(function () {
            iterator = input[_symbol_iterator__WEBPACK_IMPORTED_MODULE_1__.iterator]();
            (0,_util_caughtSchedule__WEBPACK_IMPORTED_MODULE_2__.caughtSchedule)(subscriber, scheduler, function () {
                var _a = iterator.next(), value = _a.value, done = _a.done;
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                    this.schedule();
                }
            });
        }));
        return function () { return (0,_util_isFunction__WEBPACK_IMPORTED_MODULE_3__.isFunction)(iterator === null || iterator === void 0 ? void 0 : iterator.return) && iterator.return(); };
    });
}
//# sourceMappingURL=scheduleIterable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleObservable.js":
/*!******************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleObservable.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scheduleObservable": () => (/* binding */ scheduleObservable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../symbol/observable */ "./node_modules/rxjs/dist/esm5/internal/symbol/observable.js");



function scheduleObservable(input, scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        var sub = new _Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription();
        sub.add(scheduler.schedule(function () {
            var observable = input[_symbol_observable__WEBPACK_IMPORTED_MODULE_2__.observable]();
            sub.add(observable.subscribe({
                next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
                error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
                complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
            }));
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleObservable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduled/schedulePromise.js":
/*!***************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduled/schedulePromise.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "schedulePromise": () => (/* binding */ schedulePromise)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");

function schedulePromise(input, scheduler) {
    return new _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable(function (subscriber) {
        return scheduler.schedule(function () {
            return input.then(function (value) {
                subscriber.add(scheduler.schedule(function () {
                    subscriber.next(value);
                    subscriber.add(scheduler.schedule(function () { return subscriber.complete(); }));
                }));
            }, function (err) {
                subscriber.add(scheduler.schedule(function () { return subscriber.error(err); }));
            });
        });
    });
}
//# sourceMappingURL=schedulePromise.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleReadableStreamLike.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleReadableStreamLike.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scheduleReadableStreamLike": () => (/* binding */ scheduleReadableStreamLike)
/* harmony export */ });
/* harmony import */ var _scheduleAsyncIterable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scheduleAsyncIterable */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js");
/* harmony import */ var _util_isReadableStreamLike__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/isReadableStreamLike */ "./node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js");


function scheduleReadableStreamLike(input, scheduler) {
    return (0,_scheduleAsyncIterable__WEBPACK_IMPORTED_MODULE_0__.scheduleAsyncIterable)((0,_util_isReadableStreamLike__WEBPACK_IMPORTED_MODULE_1__.readableStreamLikeToAsyncGenerator)(input), scheduler);
}
//# sourceMappingURL=scheduleReadableStreamLike.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scheduled": () => (/* binding */ scheduled)
/* harmony export */ });
/* harmony import */ var _scheduleObservable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scheduleObservable */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleObservable.js");
/* harmony import */ var _schedulePromise__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./schedulePromise */ "./node_modules/rxjs/dist/esm5/internal/scheduled/schedulePromise.js");
/* harmony import */ var _scheduleArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scheduleArray */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js");
/* harmony import */ var _scheduleIterable__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./scheduleIterable */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js");
/* harmony import */ var _scheduleAsyncIterable__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./scheduleAsyncIterable */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js");
/* harmony import */ var _util_isInteropObservable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/isInteropObservable */ "./node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js");
/* harmony import */ var _util_isPromise__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/isPromise */ "./node_modules/rxjs/dist/esm5/internal/util/isPromise.js");
/* harmony import */ var _util_isArrayLike__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/isArrayLike */ "./node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js");
/* harmony import */ var _util_isIterable__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../util/isIterable */ "./node_modules/rxjs/dist/esm5/internal/util/isIterable.js");
/* harmony import */ var _util_isAsyncIterable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/isAsyncIterable */ "./node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js");
/* harmony import */ var _util_throwUnobservableError__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../util/throwUnobservableError */ "./node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js");
/* harmony import */ var _util_isReadableStreamLike__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../util/isReadableStreamLike */ "./node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js");
/* harmony import */ var _scheduleReadableStreamLike__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./scheduleReadableStreamLike */ "./node_modules/rxjs/dist/esm5/internal/scheduled/scheduleReadableStreamLike.js");













function scheduled(input, scheduler) {
    if (input != null) {
        if ((0,_util_isInteropObservable__WEBPACK_IMPORTED_MODULE_0__.isInteropObservable)(input)) {
            return (0,_scheduleObservable__WEBPACK_IMPORTED_MODULE_1__.scheduleObservable)(input, scheduler);
        }
        if ((0,_util_isArrayLike__WEBPACK_IMPORTED_MODULE_2__.isArrayLike)(input)) {
            return (0,_scheduleArray__WEBPACK_IMPORTED_MODULE_3__.scheduleArray)(input, scheduler);
        }
        if ((0,_util_isPromise__WEBPACK_IMPORTED_MODULE_4__.isPromise)(input)) {
            return (0,_schedulePromise__WEBPACK_IMPORTED_MODULE_5__.schedulePromise)(input, scheduler);
        }
        if ((0,_util_isAsyncIterable__WEBPACK_IMPORTED_MODULE_6__.isAsyncIterable)(input)) {
            return (0,_scheduleAsyncIterable__WEBPACK_IMPORTED_MODULE_7__.scheduleAsyncIterable)(input, scheduler);
        }
        if ((0,_util_isIterable__WEBPACK_IMPORTED_MODULE_8__.isIterable)(input)) {
            return (0,_scheduleIterable__WEBPACK_IMPORTED_MODULE_9__.scheduleIterable)(input, scheduler);
        }
        if ((0,_util_isReadableStreamLike__WEBPACK_IMPORTED_MODULE_10__.isReadableStreamLike)(input)) {
            return (0,_scheduleReadableStreamLike__WEBPACK_IMPORTED_MODULE_11__.scheduleReadableStreamLike)(input, scheduler);
        }
    }
    throw (0,_util_throwUnobservableError__WEBPACK_IMPORTED_MODULE_12__.createInvalidObservableTypeError)(input);
}
//# sourceMappingURL=scheduled.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/Action.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/Action.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Action": () => (/* binding */ Action)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");


var Action = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        return this;
    };
    return Action;
}(_Subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription));

//# sourceMappingURL=Action.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/AnimationFrameAction.js":
/*!********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/AnimationFrameAction.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AnimationFrameAction": () => (/* binding */ AnimationFrameAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AsyncAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js");
/* harmony import */ var _animationFrameProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./animationFrameProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/animationFrameProvider.js");



var AnimationFrameAction = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AnimationFrameAction, _super);
    function AnimationFrameAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler._scheduled || (scheduler._scheduled = _animationFrameProvider__WEBPACK_IMPORTED_MODULE_1__.animationFrameProvider.requestAnimationFrame(function () { return scheduler.flush(undefined); }));
    };
    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            _animationFrameProvider__WEBPACK_IMPORTED_MODULE_1__.animationFrameProvider.cancelAnimationFrame(id);
            scheduler._scheduled = undefined;
        }
        return undefined;
    };
    return AnimationFrameAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_2__.AsyncAction));

//# sourceMappingURL=AnimationFrameAction.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/AnimationFrameScheduler.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/AnimationFrameScheduler.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AnimationFrameScheduler": () => (/* binding */ AnimationFrameScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js");


var AnimationFrameScheduler = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AnimationFrameScheduler, _super);
    function AnimationFrameScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimationFrameScheduler.prototype.flush = function (action) {
        this._active = true;
        this._scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        action = action || actions.shift();
        var count = actions.length;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this._active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AnimationFrameScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

//# sourceMappingURL=AnimationFrameScheduler.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsapAction.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/AsapAction.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsapAction": () => (/* binding */ AsapAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AsyncAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js");
/* harmony import */ var _immediateProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./immediateProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/immediateProvider.js");



var AsapAction = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AsapAction, _super);
    function AsapAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler._scheduled || (scheduler._scheduled = _immediateProvider__WEBPACK_IMPORTED_MODULE_1__.immediateProvider.setImmediate(scheduler.flush.bind(scheduler, undefined)));
    };
    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            _immediateProvider__WEBPACK_IMPORTED_MODULE_1__.immediateProvider.clearImmediate(id);
            scheduler._scheduled = undefined;
        }
        return undefined;
    };
    return AsapAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_2__.AsyncAction));

//# sourceMappingURL=AsapAction.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsapScheduler.js":
/*!*************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/AsapScheduler.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsapScheduler": () => (/* binding */ AsapScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js");


var AsapScheduler = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AsapScheduler, _super);
    function AsapScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsapScheduler.prototype.flush = function (action) {
        this._active = true;
        this._scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        action = action || actions.shift();
        var count = actions.length;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this._active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsapScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

//# sourceMappingURL=AsapScheduler.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsyncAction": () => (/* binding */ AsyncAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Action__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Action */ "./node_modules/rxjs/dist/esm5/internal/scheduler/Action.js");
/* harmony import */ var _intervalProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./intervalProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/intervalProvider.js");
/* harmony import */ var _util_arrRemove__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/arrRemove */ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js");




var AsyncAction = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, _id, delay) {
        if (delay === void 0) { delay = 0; }
        return _intervalProvider__WEBPACK_IMPORTED_MODULE_1__.intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (_scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay != null && this.delay === delay && this.pending === false) {
            return id;
        }
        _intervalProvider__WEBPACK_IMPORTED_MODULE_1__.intervalProvider.clearInterval(id);
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, _delay) {
        var errored = false;
        var errorValue;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = (!!e && e) || new Error(e);
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype.unsubscribe = function () {
        if (!this.closed) {
            var _a = this, id = _a.id, scheduler = _a.scheduler;
            var actions = scheduler.actions;
            this.work = this.state = this.scheduler = null;
            this.pending = false;
            (0,_util_arrRemove__WEBPACK_IMPORTED_MODULE_2__.arrRemove)(actions, this);
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
            _super.prototype.unsubscribe.call(this);
        }
    };
    return AsyncAction;
}(_Action__WEBPACK_IMPORTED_MODULE_3__.Action));

//# sourceMappingURL=AsyncAction.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsyncScheduler": () => (/* binding */ AsyncScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Scheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Scheduler */ "./node_modules/rxjs/dist/esm5/internal/Scheduler.js");


var AsyncScheduler = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) { now = _Scheduler__WEBPACK_IMPORTED_MODULE_1__.Scheduler.now; }
        var _this = _super.call(this, SchedulerAction, now) || this;
        _this.actions = [];
        _this._active = false;
        _this._scheduled = undefined;
        return _this;
    }
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this._active) {
            actions.push(action);
            return;
        }
        var error;
        this._active = true;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions.shift()));
        this._active = false;
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(_Scheduler__WEBPACK_IMPORTED_MODULE_1__.Scheduler));

//# sourceMappingURL=AsyncScheduler.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/QueueAction.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/QueueAction.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "QueueAction": () => (/* binding */ QueueAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js");


var QueueAction = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(QueueAction, _super);
    function QueueAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    QueueAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay > 0) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        this.scheduler.flush(this);
        return this;
    };
    QueueAction.prototype.execute = function (state, delay) {
        return (delay > 0 || this.closed) ?
            _super.prototype.execute.call(this, state, delay) :
            this._execute(state, delay);
    };
    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        return scheduler.flush(this);
    };
    return QueueAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_1__.AsyncAction));

//# sourceMappingURL=QueueAction.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/QueueScheduler.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/QueueScheduler.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "QueueScheduler": () => (/* binding */ QueueScheduler)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js");


var QueueScheduler = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(QueueScheduler, _super);
    function QueueScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QueueScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

//# sourceMappingURL=QueueScheduler.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/VirtualTimeScheduler.js":
/*!********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/VirtualTimeScheduler.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VirtualTimeScheduler": () => (/* binding */ VirtualTimeScheduler),
/* harmony export */   "VirtualAction": () => (/* binding */ VirtualAction)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AsyncAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js");




var VirtualTimeScheduler = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(VirtualTimeScheduler, _super);
    function VirtualTimeScheduler(schedulerActionCtor, maxFrames) {
        if (schedulerActionCtor === void 0) { schedulerActionCtor = VirtualAction; }
        if (maxFrames === void 0) { maxFrames = Infinity; }
        var _this = _super.call(this, schedulerActionCtor, function () { return _this.frame; }) || this;
        _this.maxFrames = maxFrames;
        _this.frame = 0;
        _this.index = -1;
        return _this;
    }
    VirtualTimeScheduler.prototype.flush = function () {
        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
        var error;
        var action;
        while ((action = actions[0]) && action.delay <= maxFrames) {
            actions.shift();
            this.frame = action.delay;
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        }
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    VirtualTimeScheduler.frameTimeFactor = 10;
    return VirtualTimeScheduler;
}(_AsyncScheduler__WEBPACK_IMPORTED_MODULE_1__.AsyncScheduler));

var VirtualAction = (function (_super) {
    (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__extends)(VirtualAction, _super);
    function VirtualAction(scheduler, work, index) {
        if (index === void 0) { index = (scheduler.index += 1); }
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.index = index;
        _this.active = true;
        _this.index = scheduler.index = index;
        return _this;
    }
    VirtualAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (Number.isFinite(delay)) {
            if (!this.id) {
                return _super.prototype.schedule.call(this, state, delay);
            }
            this.active = false;
            var action = new VirtualAction(this.scheduler, this.work);
            this.add(action);
            return action.schedule(state, delay);
        }
        else {
            return _Subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription.EMPTY;
        }
    };
    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        this.delay = scheduler.frame + delay;
        var actions = scheduler.actions;
        actions.push(this);
        actions.sort(VirtualAction.sortActions);
        return true;
    };
    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        return undefined;
    };
    VirtualAction.prototype._execute = function (state, delay) {
        if (this.active === true) {
            return _super.prototype._execute.call(this, state, delay);
        }
    };
    VirtualAction.sortActions = function (a, b) {
        if (a.delay === b.delay) {
            if (a.index === b.index) {
                return 0;
            }
            else if (a.index > b.index) {
                return 1;
            }
            else {
                return -1;
            }
        }
        else if (a.delay > b.delay) {
            return 1;
        }
        else {
            return -1;
        }
    };
    return VirtualAction;
}(_AsyncAction__WEBPACK_IMPORTED_MODULE_3__.AsyncAction));

//# sourceMappingURL=VirtualTimeScheduler.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/animationFrame.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/animationFrame.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "animationFrameScheduler": () => (/* binding */ animationFrameScheduler),
/* harmony export */   "animationFrame": () => (/* binding */ animationFrame)
/* harmony export */ });
/* harmony import */ var _AnimationFrameAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AnimationFrameAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AnimationFrameAction.js");
/* harmony import */ var _AnimationFrameScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AnimationFrameScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AnimationFrameScheduler.js");


var animationFrameScheduler = new _AnimationFrameScheduler__WEBPACK_IMPORTED_MODULE_0__.AnimationFrameScheduler(_AnimationFrameAction__WEBPACK_IMPORTED_MODULE_1__.AnimationFrameAction);
var animationFrame = animationFrameScheduler;
//# sourceMappingURL=animationFrame.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/animationFrameProvider.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/animationFrameProvider.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "animationFrameProvider": () => (/* binding */ animationFrameProvider)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _Subscription__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subscription */ "./node_modules/rxjs/dist/esm5/internal/Subscription.js");


var animationFrameProvider = {
    schedule: function (callback) {
        var request = requestAnimationFrame;
        var cancel = cancelAnimationFrame;
        var delegate = animationFrameProvider.delegate;
        if (delegate) {
            request = delegate.requestAnimationFrame;
            cancel = delegate.cancelAnimationFrame;
        }
        var handle = request(function (timestamp) {
            cancel = undefined;
            callback(timestamp);
        });
        return new _Subscription__WEBPACK_IMPORTED_MODULE_0__.Subscription(function () { return cancel === null || cancel === void 0 ? void 0 : cancel(handle); });
    },
    requestAnimationFrame: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = animationFrameProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.requestAnimationFrame) || requestAnimationFrame).apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__read)(args)));
    },
    cancelAnimationFrame: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = animationFrameProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.cancelAnimationFrame) || cancelAnimationFrame).apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__read)(args)));
    },
    delegate: undefined,
};
//# sourceMappingURL=animationFrameProvider.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/asap.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/asap.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "asapScheduler": () => (/* binding */ asapScheduler),
/* harmony export */   "asap": () => (/* binding */ asap)
/* harmony export */ });
/* harmony import */ var _AsapAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsapAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsapAction.js");
/* harmony import */ var _AsapScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AsapScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsapScheduler.js");


var asapScheduler = new _AsapScheduler__WEBPACK_IMPORTED_MODULE_0__.AsapScheduler(_AsapAction__WEBPACK_IMPORTED_MODULE_1__.AsapAction);
var asap = asapScheduler;
//# sourceMappingURL=asap.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/async.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/async.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "asyncScheduler": () => (/* binding */ asyncScheduler),
/* harmony export */   "async": () => (/* binding */ async)
/* harmony export */ });
/* harmony import */ var _AsyncAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AsyncAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js");
/* harmony import */ var _AsyncScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AsyncScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js");


var asyncScheduler = new _AsyncScheduler__WEBPACK_IMPORTED_MODULE_0__.AsyncScheduler(_AsyncAction__WEBPACK_IMPORTED_MODULE_1__.AsyncAction);
var async = asyncScheduler;
//# sourceMappingURL=async.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dateTimestampProvider": () => (/* binding */ dateTimestampProvider)
/* harmony export */ });
var dateTimestampProvider = {
    now: function () {
        return (dateTimestampProvider.delegate || Date).now();
    },
    delegate: undefined,
};
//# sourceMappingURL=dateTimestampProvider.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/immediateProvider.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/immediateProvider.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "immediateProvider": () => (/* binding */ immediateProvider)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _util_Immediate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/Immediate */ "./node_modules/rxjs/dist/esm5/internal/util/Immediate.js");


var setImmediate = _util_Immediate__WEBPACK_IMPORTED_MODULE_0__.Immediate.setImmediate, clearImmediate = _util_Immediate__WEBPACK_IMPORTED_MODULE_0__.Immediate.clearImmediate;
var immediateProvider = {
    setImmediate: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = immediateProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.setImmediate) || setImmediate).apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_1__.__read)(args)));
    },
    clearImmediate: function (handle) {
        var delegate = immediateProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearImmediate) || clearImmediate)(handle);
    },
    delegate: undefined,
};
//# sourceMappingURL=immediateProvider.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/intervalProvider.js":
/*!****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/intervalProvider.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "intervalProvider": () => (/* binding */ intervalProvider)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");

var intervalProvider = {
    setInterval: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = intervalProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) || setInterval).apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__read)(args)));
    },
    clearInterval: function (handle) {
        var delegate = intervalProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
    },
    delegate: undefined,
};
//# sourceMappingURL=intervalProvider.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/performanceTimestampProvider.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/performanceTimestampProvider.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "performanceTimestampProvider": () => (/* binding */ performanceTimestampProvider)
/* harmony export */ });
var performanceTimestampProvider = {
    now: function () {
        return (performanceTimestampProvider.delegate || performance).now();
    },
    delegate: undefined,
};
//# sourceMappingURL=performanceTimestampProvider.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/queue.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/queue.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "queueScheduler": () => (/* binding */ queueScheduler),
/* harmony export */   "queue": () => (/* binding */ queue)
/* harmony export */ });
/* harmony import */ var _QueueAction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./QueueAction */ "./node_modules/rxjs/dist/esm5/internal/scheduler/QueueAction.js");
/* harmony import */ var _QueueScheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./QueueScheduler */ "./node_modules/rxjs/dist/esm5/internal/scheduler/QueueScheduler.js");


var queueScheduler = new _QueueScheduler__WEBPACK_IMPORTED_MODULE_0__.QueueScheduler(_QueueAction__WEBPACK_IMPORTED_MODULE_1__.QueueAction);
var queue = queueScheduler;
//# sourceMappingURL=queue.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js":
/*!***************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "timeoutProvider": () => (/* binding */ timeoutProvider)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");

var timeoutProvider = {
    setTimeout: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) || setTimeout).apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__read)(args)));
    },
    clearTimeout: function (handle) {
        var delegate = timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: undefined,
};
//# sourceMappingURL=timeoutProvider.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/symbol/iterator.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/symbol/iterator.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getSymbolIterator": () => (/* binding */ getSymbolIterator),
/* harmony export */   "iterator": () => (/* binding */ iterator)
/* harmony export */ });
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
var iterator = getSymbolIterator();
//# sourceMappingURL=iterator.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/symbol/observable.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/symbol/observable.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "observable": () => (/* binding */ observable)
/* harmony export */ });
var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();
//# sourceMappingURL=observable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/ArgumentOutOfRangeError.js":
/*!******************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/ArgumentOutOfRangeError.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ArgumentOutOfRangeError": () => (/* binding */ ArgumentOutOfRangeError)
/* harmony export */ });
/* harmony import */ var _createErrorClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createErrorClass */ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js");

var ArgumentOutOfRangeError = (0,_createErrorClass__WEBPACK_IMPORTED_MODULE_0__.createErrorClass)(function (_super) {
    return function ArgumentOutOfRangeErrorImpl() {
        _super(this);
        this.name = 'ArgumentOutOfRangeError';
        this.message = 'argument out of range';
    };
});
//# sourceMappingURL=ArgumentOutOfRangeError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/EmptyError.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EmptyError": () => (/* binding */ EmptyError)
/* harmony export */ });
/* harmony import */ var _createErrorClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createErrorClass */ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js");

var EmptyError = (0,_createErrorClass__WEBPACK_IMPORTED_MODULE_0__.createErrorClass)(function (_super) { return function EmptyErrorImpl() {
    _super(this);
    this.name = 'EmptyError';
    this.message = 'no elements in sequence';
}; });
//# sourceMappingURL=EmptyError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/Immediate.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/Immediate.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Immediate": () => (/* binding */ Immediate),
/* harmony export */   "TestTools": () => (/* binding */ TestTools)
/* harmony export */ });
var nextHandle = 1;
var resolved;
var activeHandles = {};
function findAndClearHandle(handle) {
    if (handle in activeHandles) {
        delete activeHandles[handle];
        return true;
    }
    return false;
}
var Immediate = {
    setImmediate: function (cb) {
        var handle = nextHandle++;
        activeHandles[handle] = true;
        if (!resolved) {
            resolved = Promise.resolve();
        }
        resolved.then(function () { return findAndClearHandle(handle) && cb(); });
        return handle;
    },
    clearImmediate: function (handle) {
        findAndClearHandle(handle);
    },
};
var TestTools = {
    pending: function () {
        return Object.keys(activeHandles).length;
    }
};
//# sourceMappingURL=Immediate.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/NotFoundError.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/NotFoundError.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NotFoundError": () => (/* binding */ NotFoundError)
/* harmony export */ });
/* harmony import */ var _createErrorClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createErrorClass */ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js");

var NotFoundError = (0,_createErrorClass__WEBPACK_IMPORTED_MODULE_0__.createErrorClass)(function (_super) {
    return function NotFoundErrorImpl(message) {
        _super(this);
        this.name = 'NotFoundError';
        this.message = message;
    };
});
//# sourceMappingURL=NotFoundError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/ObjectUnsubscribedError.js":
/*!******************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/ObjectUnsubscribedError.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ObjectUnsubscribedError": () => (/* binding */ ObjectUnsubscribedError)
/* harmony export */ });
/* harmony import */ var _createErrorClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createErrorClass */ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js");

var ObjectUnsubscribedError = (0,_createErrorClass__WEBPACK_IMPORTED_MODULE_0__.createErrorClass)(function (_super) {
    return function ObjectUnsubscribedErrorImpl() {
        _super(this);
        this.name = 'ObjectUnsubscribedError';
        this.message = 'object unsubscribed';
    };
});
//# sourceMappingURL=ObjectUnsubscribedError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/SequenceError.js":
/*!********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/SequenceError.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SequenceError": () => (/* binding */ SequenceError)
/* harmony export */ });
/* harmony import */ var _createErrorClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createErrorClass */ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js");

var SequenceError = (0,_createErrorClass__WEBPACK_IMPORTED_MODULE_0__.createErrorClass)(function (_super) {
    return function SequenceErrorImpl(message) {
        _super(this);
        this.name = 'SequenceError';
        this.message = message;
    };
});
//# sourceMappingURL=SequenceError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "UnsubscriptionError": () => (/* binding */ UnsubscriptionError)
/* harmony export */ });
/* harmony import */ var _createErrorClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createErrorClass */ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js");

var UnsubscriptionError = (0,_createErrorClass__WEBPACK_IMPORTED_MODULE_0__.createErrorClass)(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});
//# sourceMappingURL=UnsubscriptionError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/args.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/args.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "popResultSelector": () => (/* binding */ popResultSelector),
/* harmony export */   "popScheduler": () => (/* binding */ popScheduler),
/* harmony export */   "popNumber": () => (/* binding */ popNumber)
/* harmony export */ });
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");
/* harmony import */ var _isScheduler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isScheduler */ "./node_modules/rxjs/dist/esm5/internal/util/isScheduler.js");


function last(arr) {
    return arr[arr.length - 1];
}
function popResultSelector(args) {
    return (0,_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(last(args)) ? args.pop() : undefined;
}
function popScheduler(args) {
    return (0,_isScheduler__WEBPACK_IMPORTED_MODULE_1__.isScheduler)(last(args)) ? args.pop() : undefined;
}
function popNumber(args, defaultValue) {
    return typeof last(args) === 'number' ? args.pop() : defaultValue;
}
//# sourceMappingURL=args.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/argsArgArrayOrObject.js":
/*!***************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/argsArgArrayOrObject.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "argsArgArrayOrObject": () => (/* binding */ argsArgArrayOrObject)
/* harmony export */ });
var isArray = Array.isArray;
var getPrototypeOf = Object.getPrototypeOf, objectProto = Object.prototype, getKeys = Object.keys;
function argsArgArrayOrObject(args) {
    if (args.length === 1) {
        var first_1 = args[0];
        if (isArray(first_1)) {
            return { args: first_1, keys: null };
        }
        if (isPOJO(first_1)) {
            var keys = getKeys(first_1);
            return {
                args: keys.map(function (key) { return first_1[key]; }),
                keys: keys,
            };
        }
    }
    return { args: args, keys: null };
}
function isPOJO(obj) {
    return obj && typeof obj === 'object' && getPrototypeOf(obj) === objectProto;
}
//# sourceMappingURL=argsArgArrayOrObject.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "argsOrArgArray": () => (/* binding */ argsOrArgArray)
/* harmony export */ });
var isArray = Array.isArray;
function argsOrArgArray(args) {
    return args.length === 1 && isArray(args[0]) ? args[0] : args;
}
//# sourceMappingURL=argsOrArgArray.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/arrRemove.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "arrRemove": () => (/* binding */ arrRemove)
/* harmony export */ });
function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}
//# sourceMappingURL=arrRemove.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/caughtSchedule.js":
/*!*********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/caughtSchedule.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "caughtSchedule": () => (/* binding */ caughtSchedule)
/* harmony export */ });
function caughtSchedule(subscriber, scheduler, execute, delay) {
    if (delay === void 0) { delay = 0; }
    var subscription = scheduler.schedule(function () {
        try {
            execute.call(this);
        }
        catch (err) {
            subscriber.error(err);
        }
    }, delay);
    subscriber.add(subscription);
    return subscription;
}
//# sourceMappingURL=caughtSchedule.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createErrorClass": () => (/* binding */ createErrorClass)
/* harmony export */ });
function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}
//# sourceMappingURL=createErrorClass.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/createObject.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/createObject.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createObject": () => (/* binding */ createObject)
/* harmony export */ });
function createObject(keys, values) {
    return keys.reduce(function (result, key, i) { return ((result[key] = values[i]), result); }, {});
}
//# sourceMappingURL=createObject.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/errorContext.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/errorContext.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "errorContext": () => (/* binding */ errorContext),
/* harmony export */   "captureError": () => (/* binding */ captureError)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config */ "./node_modules/rxjs/dist/esm5/internal/config.js");

var context = null;
function errorContext(cb) {
    if (_config__WEBPACK_IMPORTED_MODULE_0__.config.useDeprecatedSynchronousErrorHandling) {
        var isRoot = !context;
        if (isRoot) {
            context = { errorThrown: false, error: null };
        }
        cb();
        if (isRoot) {
            var _a = context, errorThrown = _a.errorThrown, error = _a.error;
            context = null;
            if (errorThrown) {
                throw error;
            }
        }
    }
    else {
        cb();
    }
}
function captureError(err) {
    if (_config__WEBPACK_IMPORTED_MODULE_0__.config.useDeprecatedSynchronousErrorHandling && context) {
        context.errorThrown = true;
        context.error = err;
    }
}
//# sourceMappingURL=errorContext.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/identity.js":
/*!***************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/identity.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "identity": () => (/* binding */ identity)
/* harmony export */ });
function identity(x) {
    return x;
}
//# sourceMappingURL=identity.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isArrayLike": () => (/* binding */ isArrayLike)
/* harmony export */ });
var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });
//# sourceMappingURL=isArrayLike.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js":
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isAsyncIterable": () => (/* binding */ isAsyncIterable)
/* harmony export */ });
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");

function isAsyncIterable(obj) {
    return Symbol.asyncIterator && (0,_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
//# sourceMappingURL=isAsyncIterable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isDate.js":
/*!*************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isDate.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isValidDate": () => (/* binding */ isValidDate)
/* harmony export */ });
function isValidDate(value) {
    return value instanceof Date && !isNaN(value);
}
//# sourceMappingURL=isDate.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isFunction.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isFunction": () => (/* binding */ isFunction)
/* harmony export */ });
function isFunction(value) {
    return typeof value === 'function';
}
//# sourceMappingURL=isFunction.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js":
/*!**************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isInteropObservable": () => (/* binding */ isInteropObservable)
/* harmony export */ });
/* harmony import */ var _symbol_observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../symbol/observable */ "./node_modules/rxjs/dist/esm5/internal/symbol/observable.js");
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function isInteropObservable(input) {
    return (0,_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(input[_symbol_observable__WEBPACK_IMPORTED_MODULE_1__.observable]);
}
//# sourceMappingURL=isInteropObservable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isIterable.js":
/*!*****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isIterable.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isIterable": () => (/* binding */ isIterable)
/* harmony export */ });
/* harmony import */ var _symbol_iterator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../symbol/iterator */ "./node_modules/rxjs/dist/esm5/internal/symbol/iterator.js");
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function isIterable(input) {
    return (0,_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(input === null || input === void 0 ? void 0 : input[_symbol_iterator__WEBPACK_IMPORTED_MODULE_1__.iterator]);
}
//# sourceMappingURL=isIterable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isObservable.js":
/*!*******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isObservable.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isObservable": () => (/* binding */ isObservable)
/* harmony export */ });
/* harmony import */ var _Observable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Observable */ "./node_modules/rxjs/dist/esm5/internal/Observable.js");
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function isObservable(obj) {
    return !!obj && (obj instanceof _Observable__WEBPACK_IMPORTED_MODULE_0__.Observable || ((0,_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(obj.lift) && (0,_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(obj.subscribe)));
}
//# sourceMappingURL=isObservable.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isPromise.js":
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isPromise.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isPromise": () => (/* binding */ isPromise)
/* harmony export */ });
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");

function isPromise(value) {
    return (0,_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(value === null || value === void 0 ? void 0 : value.then);
}
//# sourceMappingURL=isPromise.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js":
/*!***************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "readableStreamLikeToAsyncGenerator": () => (/* binding */ readableStreamLikeToAsyncGenerator),
/* harmony export */   "isReadableStreamLike": () => (/* binding */ isReadableStreamLike)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");


function readableStreamLikeToAsyncGenerator(readableStream) {
    return (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__asyncGenerator)(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
        var reader, _a, value, done;
        return (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__generator)(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = readableStream.getReader();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 9, 10]);
                    _b.label = 2;
                case 2:
                    if (false) {}
                    return [4, (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__await)(reader.read())];
                case 3:
                    _a = _b.sent(), value = _a.value, done = _a.done;
                    if (!done) return [3, 5];
                    return [4, (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__await)(void 0)];
                case 4: return [2, _b.sent()];
                case 5: return [4, (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__await)(value)];
                case 6: return [4, _b.sent()];
                case 7:
                    _b.sent();
                    return [3, 2];
                case 8: return [3, 10];
                case 9:
                    reader.releaseLock();
                    return [7];
                case 10: return [2];
            }
        });
    });
}
function isReadableStreamLike(obj) {
    return (0,_isFunction__WEBPACK_IMPORTED_MODULE_1__.isFunction)(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
//# sourceMappingURL=isReadableStreamLike.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/isScheduler.js":
/*!******************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/isScheduler.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isScheduler": () => (/* binding */ isScheduler)
/* harmony export */ });
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");

function isScheduler(value) {
    return value && (0,_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(value.schedule);
}
//# sourceMappingURL=isScheduler.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/lift.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/lift.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasLift": () => (/* binding */ hasLift),
/* harmony export */   "operate": () => (/* binding */ operate)
/* harmony export */ });
/* harmony import */ var _isFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction */ "./node_modules/rxjs/dist/esm5/internal/util/isFunction.js");

function hasLift(source) {
    return (0,_isFunction__WEBPACK_IMPORTED_MODULE_0__.isFunction)(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
    return function (source) {
        if (hasLift(source)) {
            return source.lift(function (liftedSource) {
                try {
                    return init(liftedSource, this);
                }
                catch (err) {
                    this.error(err);
                }
            });
        }
        throw new TypeError('Unable to lift unknown Observable type');
    };
}
//# sourceMappingURL=lift.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js":
/*!***********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mapOneOrManyArgs": () => (/* binding */ mapOneOrManyArgs)
/* harmony export */ });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _operators_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../operators/map */ "./node_modules/rxjs/dist/esm5/internal/operators/map.js");


var isArray = Array.isArray;
function callOrApply(fn, args) {
    return isArray(args) ? fn.apply(void 0, (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__spreadArray)([], (0,tslib__WEBPACK_IMPORTED_MODULE_0__.__read)(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
    return (0,_operators_map__WEBPACK_IMPORTED_MODULE_1__.map)(function (args) { return callOrApply(fn, args); });
}
//# sourceMappingURL=mapOneOrManyArgs.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/noop.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/noop.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "noop": () => (/* binding */ noop)
/* harmony export */ });
function noop() { }
//# sourceMappingURL=noop.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/not.js":
/*!**********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/not.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "not": () => (/* binding */ not)
/* harmony export */ });
function not(pred, thisArg) {
    return function (value, index) { return !pred.call(thisArg, value, index); };
}
//# sourceMappingURL=not.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/pipe.js":
/*!***********************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/pipe.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pipe": () => (/* binding */ pipe),
/* harmony export */   "pipeFromArray": () => (/* binding */ pipeFromArray)
/* harmony export */ });
/* harmony import */ var _identity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./identity */ "./node_modules/rxjs/dist/esm5/internal/util/identity.js");

function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
}
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return _identity__WEBPACK_IMPORTED_MODULE_0__.identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
//# sourceMappingURL=pipe.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js":
/*!***************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "reportUnhandledError": () => (/* binding */ reportUnhandledError)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config */ "./node_modules/rxjs/dist/esm5/internal/config.js");
/* harmony import */ var _scheduler_timeoutProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scheduler/timeoutProvider */ "./node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js");


function reportUnhandledError(err) {
    _scheduler_timeoutProvider__WEBPACK_IMPORTED_MODULE_0__.timeoutProvider.setTimeout(function () {
        var onUnhandledError = _config__WEBPACK_IMPORTED_MODULE_1__.config.onUnhandledError;
        if (onUnhandledError) {
            onUnhandledError(err);
        }
        else {
            throw err;
        }
    });
}
//# sourceMappingURL=reportUnhandledError.js.map

/***/ }),

/***/ "./node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createInvalidObservableTypeError": () => (/* binding */ createInvalidObservableTypeError)
/* harmony export */ });
function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
//# sourceMappingURL=throwUnobservableError.js.map

/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__extends": () => (/* binding */ __extends),
/* harmony export */   "__assign": () => (/* binding */ __assign),
/* harmony export */   "__rest": () => (/* binding */ __rest),
/* harmony export */   "__decorate": () => (/* binding */ __decorate),
/* harmony export */   "__param": () => (/* binding */ __param),
/* harmony export */   "__metadata": () => (/* binding */ __metadata),
/* harmony export */   "__awaiter": () => (/* binding */ __awaiter),
/* harmony export */   "__generator": () => (/* binding */ __generator),
/* harmony export */   "__createBinding": () => (/* binding */ __createBinding),
/* harmony export */   "__exportStar": () => (/* binding */ __exportStar),
/* harmony export */   "__values": () => (/* binding */ __values),
/* harmony export */   "__read": () => (/* binding */ __read),
/* harmony export */   "__spread": () => (/* binding */ __spread),
/* harmony export */   "__spreadArrays": () => (/* binding */ __spreadArrays),
/* harmony export */   "__spreadArray": () => (/* binding */ __spreadArray),
/* harmony export */   "__await": () => (/* binding */ __await),
/* harmony export */   "__asyncGenerator": () => (/* binding */ __asyncGenerator),
/* harmony export */   "__asyncDelegator": () => (/* binding */ __asyncDelegator),
/* harmony export */   "__asyncValues": () => (/* binding */ __asyncValues),
/* harmony export */   "__makeTemplateObject": () => (/* binding */ __makeTemplateObject),
/* harmony export */   "__importStar": () => (/* binding */ __importStar),
/* harmony export */   "__importDefault": () => (/* binding */ __importDefault),
/* harmony export */   "__classPrivateFieldGet": () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   "__classPrivateFieldSet": () => (/* binding */ __classPrivateFieldSet)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),

/***/ "./src/customers-store.js":
/*!********************************!*\
  !*** ./src/customers-store.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _codewithdan_observable_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @codewithdan/observable-store */ "./node_modules/@codewithdan/observable-store/dist/index.js");


class CustomersStore extends _codewithdan_observable_store__WEBPACK_IMPORTED_MODULE_0__.ObservableStore {

    constructor() {
        super({ trackStateHistory: true, logStateChanges: true });
    }

    fetchCustomers() {
        return fetch('./customers.json')
            .then(response => response.json())
            .then(customers => {
                this.setState({ customers }, CustomersStoreActions.GetCustomers);
                return customers;
            });
    }

    // Set state in the store by calling setState(stateObject, action). 
    // If you want to access the previous state you can also call 
    // setState((prevState) => stateObject, action) rather than calling getState()
    // first before calling setState().
    getCustomers() {
        let state = this.getState();
        // pull from store cache
        if (state && state.customers) {
            return this.createPromise(null, state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchCustomers();
        }
    }

    getCustomer(id) {
        return this.getCustomers()
            .then(custs => {
                let filteredCusts = custs.filter(cust => cust.id === id);
                const customer = (filteredCusts && filteredCusts.length) ? filteredCusts[0] : null;                
                this.setState({ customer }, CustomersStoreActions.GetCustomer);
                return customer;
            });
    }

    update(customer) {
        let customers = this.getState().customers;
        let index = customers.findIndex(c => c.id === customer.id);
        customers[index] = customer;
        this.setState({ customers }, CustomersStoreActions.UpdateCustomer);
    }

    delete(id) {
        let customers = this.getState().customers;
        let index = customers.findIndex(c => c.id === +id);
        customers.splice(index, 1);
        this.setState({ customers }, CustomersStoreActions.DeleteCustomer);
    }

    createPromise(err, result) {
        return new Promise((resolve, reject) => {
            return err ? reject(err) : resolve(result);
        });
    }
}

const CustomersStoreActions = {
    GetCustomers: 'GET_CUSTOMERS',
    GetCustomer: 'GET_CUSTOMER',
    UpdateCustomer: 'UPDATE_CUSTOMER',
    DeleteCustomer: 'DELETE_CUSTOMER'
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CustomersStore);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _customers_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./customers-store */ "./src/customers-store.js");


let customersStore = new _customers_store__WEBPACK_IMPORTED_MODULE_0__.default();
customersStore.getCustomers().then((customers) => {
    // Get customers via fetch
    alert('Fetch returned ' + customers.length + ' customers');
    // Get customers from store
    customersStore.getCustomers().then((customers) => {
        alert('Store returned ' + customers.length + ' customers');
    });
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9AY29kZXdpdGhkYW4vb2JzZXJ2YWJsZS1zdG9yZS9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL0Bjb2Rld2l0aGRhbi9vYnNlcnZhYmxlLXN0b3JlL2Rpc3Qvb2JzZXJ2YWJsZS1zdG9yZS1iYXNlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL0Bjb2Rld2l0aGRhbi9vYnNlcnZhYmxlLXN0b3JlL2Rpc3Qvb2JzZXJ2YWJsZS1zdG9yZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9AY29kZXdpdGhkYW4vb2JzZXJ2YWJsZS1zdG9yZS9kaXN0L3V0aWxpdGllcy9jbG9uZXIuc2VydmljZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbmRleC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9Bc3luY1N1YmplY3QuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvQmVoYXZpb3JTdWJqZWN0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL05vdGlmaWNhdGlvbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9Ob3RpZmljYXRpb25GYWN0b3JpZXMuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvT2JzZXJ2YWJsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9SZXBsYXlTdWJqZWN0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL1NjaGVkdWxlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9TdWJqZWN0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL1N1YnNjcmliZXIuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvU3Vic2NyaXB0aW9uLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL2NvbmZpZy5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9maXJzdFZhbHVlRnJvbS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9sYXN0VmFsdWVGcm9tLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvQ29ubmVjdGFibGVPYnNlcnZhYmxlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvYmluZENhbGxiYWNrLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvYmluZENhbGxiYWNrSW50ZXJuYWxzLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvYmluZE5vZGVDYWxsYmFjay5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL2NvbWJpbmVMYXRlc3QuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS9jb25jYXQuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS9jb25uZWN0YWJsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL2RlZmVyLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvZG9tL2FuaW1hdGlvbkZyYW1lcy5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL2VtcHR5LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvZm9ya0pvaW4uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS9mcm9tLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvZnJvbUFycmF5LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvZnJvbUV2ZW50LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvZnJvbUV2ZW50UGF0dGVybi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL2Zyb21TdWJzY3JpYmFibGUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS9nZW5lcmF0ZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL2lpZi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL2ludGVydmFsLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvbWVyZ2UuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS9uZXZlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL29mLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvb25FcnJvclJlc3VtZU5leHQuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS9wYWlycy5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL3BhcnRpdGlvbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL3JhY2UuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS9yYW5nZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL3Rocm93RXJyb3IuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb2JzZXJ2YWJsZS90aW1lci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vYnNlcnZhYmxlL3VzaW5nLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29ic2VydmFibGUvemlwLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9PcGVyYXRvclN1YnNjcmliZXIuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2F1ZGl0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9hdWRpdFRpbWUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2J1ZmZlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvYnVmZmVyQ291bnQuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2J1ZmZlclRpbWUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2J1ZmZlclRvZ2dsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvYnVmZmVyV2hlbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvY2F0Y2hFcnJvci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvY29tYmluZUFsbC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvY29tYmluZUxhdGVzdC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvY29tYmluZUxhdGVzdEFsbC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvY29tYmluZUxhdGVzdFdpdGguanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2NvbmNhdC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvY29uY2F0QWxsLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9jb25jYXRNYXAuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2NvbmNhdE1hcFRvLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9jb25jYXRXaXRoLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9jb25uZWN0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9jb3VudC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZGVib3VuY2UuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2RlYm91bmNlVGltZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZGVmYXVsdElmRW1wdHkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2RlbGF5LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9kZWxheVdoZW4uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2RlbWF0ZXJpYWxpemUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2Rpc3RpbmN0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9kaXN0aW5jdFVudGlsQ2hhbmdlZC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZGlzdGluY3RVbnRpbEtleUNoYW5nZWQuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2VsZW1lbnRBdC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZW5kV2l0aC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZXZlcnkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2V4aGF1c3QuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2V4aGF1c3RBbGwuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2V4aGF1c3RNYXAuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2V4cGFuZC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZmlsdGVyLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9maW5hbGl6ZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZmluZC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZmluZEluZGV4LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9maXJzdC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZmxhdE1hcC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvZ3JvdXBCeS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvaWdub3JlRWxlbWVudHMuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2lzRW1wdHkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2pvaW5BbGxJbnRlcm5hbHMuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL2xhc3QuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL21hcC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvbWFwVG8uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL21hdGVyaWFsaXplLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9tYXguanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL21lcmdlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9tZXJnZUFsbC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvbWVyZ2VJbnRlcm5hbHMuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL21lcmdlTWFwLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9tZXJnZU1hcFRvLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9tZXJnZVNjYW4uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL21lcmdlV2l0aC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvbWluLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9tdWx0aWNhc3QuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL29ic2VydmVPbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvb25FcnJvclJlc3VtZU5leHQuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3BhaXJ3aXNlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9wbHVjay5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvcHVibGlzaC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvcHVibGlzaEJlaGF2aW9yLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9wdWJsaXNoTGFzdC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvcHVibGlzaFJlcGxheS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvcmFjZVdpdGguanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3JlZHVjZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvcmVmQ291bnQuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3JlcGVhdC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvcmVwZWF0V2hlbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvcmV0cnkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3JldHJ5V2hlbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvc2FtcGxlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9zYW1wbGVUaW1lLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9zY2FuLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9zY2FuSW50ZXJuYWxzLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9zZXF1ZW5jZUVxdWFsLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9zaGFyZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvc2hhcmVSZXBsYXkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3NpbmdsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvc2tpcC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvc2tpcExhc3QuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3NraXBVbnRpbC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvc2tpcFdoaWxlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9zdGFydFdpdGguanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3N1YnNjcmliZU9uLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy9zd2l0Y2hBbGwuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3N3aXRjaE1hcC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvc3dpdGNoTWFwVG8uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3N3aXRjaFNjYW4uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3Rha2UuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3Rha2VMYXN0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy90YWtlVW50aWwuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3Rha2VXaGlsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvdGFwLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy90aHJvdHRsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvdGhyb3R0bGVUaW1lLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy90aHJvd0lmRW1wdHkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3RpbWVJbnRlcnZhbC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvdGltZW91dC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvdGltZW91dFdpdGguanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3RpbWVzdGFtcC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvdG9BcnJheS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvd2luZG93LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy93aW5kb3dDb3VudC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvd2luZG93VGltZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvd2luZG93VG9nZ2xlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy93aW5kb3dXaGVuLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy93aXRoTGF0ZXN0RnJvbS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9vcGVyYXRvcnMvemlwLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL29wZXJhdG9ycy96aXBBbGwuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvb3BlcmF0b3JzL3ppcFdpdGguanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVkL3NjaGVkdWxlQXJyYXkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVkL3NjaGVkdWxlQXN5bmNJdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZWQvc2NoZWR1bGVJdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZWQvc2NoZWR1bGVPYnNlcnZhYmxlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlZC9zY2hlZHVsZVByb21pc2UuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVkL3NjaGVkdWxlUmVhZGFibGVTdHJlYW1MaWtlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlZC9zY2hlZHVsZWQuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVyL0FjdGlvbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvQW5pbWF0aW9uRnJhbWVBY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVyL0FuaW1hdGlvbkZyYW1lU2NoZWR1bGVyLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9Bc2FwQWN0aW9uLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9Bc2FwU2NoZWR1bGVyLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9Bc3luY0FjdGlvbi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvQXN5bmNTY2hlZHVsZXIuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVyL1F1ZXVlQWN0aW9uLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9RdWV1ZVNjaGVkdWxlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvVmlydHVhbFRpbWVTY2hlZHVsZXIuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVyL2FuaW1hdGlvbkZyYW1lLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9hbmltYXRpb25GcmFtZVByb3ZpZGVyLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9hc2FwLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9hc3luYy5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvZGF0ZVRpbWVzdGFtcFByb3ZpZGVyLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3NjaGVkdWxlci9pbW1lZGlhdGVQcm92aWRlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvaW50ZXJ2YWxQcm92aWRlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvcGVyZm9ybWFuY2VUaW1lc3RhbXBQcm92aWRlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zY2hlZHVsZXIvcXVldWUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc2NoZWR1bGVyL3RpbWVvdXRQcm92aWRlci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC9zeW1ib2wvaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvc3ltYm9sL29ic2VydmFibGUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9Bcmd1bWVudE91dE9mUmFuZ2VFcnJvci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL0VtcHR5RXJyb3IuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9JbW1lZGlhdGUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9Ob3RGb3VuZEVycm9yLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3IuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9TZXF1ZW5jZUVycm9yLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvVW5zdWJzY3JpcHRpb25FcnJvci5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2FyZ3MuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9hcmdzQXJnQXJyYXlPck9iamVjdC5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2FyZ3NPckFyZ0FycmF5LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvYXJyUmVtb3ZlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvY2F1Z2h0U2NoZWR1bGUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9jcmVhdGVFcnJvckNsYXNzLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvY3JlYXRlT2JqZWN0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvZXJyb3JDb250ZXh0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvaWRlbnRpdHkuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9pc0FycmF5TGlrZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2lzQXN5bmNJdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2lzRGF0ZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2lzRnVuY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9pc0ludGVyb3BPYnNlcnZhYmxlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvaXNJdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2lzT2JzZXJ2YWJsZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2lzUHJvbWlzZS5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL2lzUmVhZGFibGVTdHJlYW1MaWtlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvaXNTY2hlZHVsZXIuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9saWZ0LmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvbWFwT25lT3JNYW55QXJncy5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL25vZGVfbW9kdWxlcy9yeGpzL2Rpc3QvZXNtNS9pbnRlcm5hbC91dGlsL25vb3AuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9ub3QuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC9waXBlLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3J4anMvZGlzdC9lc201L2ludGVybmFsL3V0aWwvcmVwb3J0VW5oYW5kbGVkRXJyb3IuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvLi9ub2RlX21vZHVsZXMvcnhqcy9kaXN0L2VzbTUvaW50ZXJuYWwvdXRpbC90aHJvd1Vub2JzZXJ2YWJsZUVycm9yLmpzIiwid2VicGFjazovL3JlYWN0LXN0b3JlLy4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL3NyYy9jdXN0b21lcnMtc3RvcmUuanMiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3JlYWN0LXN0b3JlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcmVhY3Qtc3RvcmUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9yZWFjdC1zdG9yZS8uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDhDQUE2QyxDQUFDLGNBQWMsRUFBQztBQUM3RCx1QkFBdUI7QUFDdkIseUJBQXlCLG1CQUFPLENBQUMsaUdBQW9CO0FBQ3JELG1EQUFrRCxDQUFDLHFDQUFxQywyQ0FBMkMsRUFBRSxFQUFFLEVBQUM7QUFDeEksaUM7Ozs7Ozs7Ozs7QUNKQTtBQUNBO0FBQ0EsZ0RBQWdELE9BQU87QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE2QyxDQUFDLGNBQWMsRUFBQztBQUM3RCxhQUFhLG1CQUFPLENBQUMsb0RBQU07QUFDM0IsdUJBQXVCLG1CQUFPLENBQUMsaUhBQTRCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLHFCQUFxQjtBQUMzRCxnREFBZ0QsK0JBQStCO0FBQy9FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3Qyx1QkFBdUI7QUFDL0Q7QUFDQTtBQUNBLG1EQUFtRDtBQUNuRDtBQUNBO0FBQ0EsbURBQW1EO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsZUFBZTtBQUNmLGlEOzs7Ozs7Ozs7O0FDcEZBO0FBQ0E7QUFDQSxnREFBZ0Qs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QUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUc7QUFDQSwrQkFBK0IsV0FBVztBQUMxQztBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixZQUFZO0FBQ25DOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFlBQVk7QUFDbkM7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlFQUFlLGNBQWMsRTs7Ozs7O1VDdkU3QjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0Esc0RBQXNELGtCQUFrQjtXQUN4RTtXQUNBLCtDQUErQyxjQUFjO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7QUNOK0M7O0FBRS9DLHlCQUF5QixxREFBYztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQyxFIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuT2JzZXJ2YWJsZVN0b3JlID0gdm9pZCAwO1xudmFyIG9ic2VydmFibGVfc3RvcmVfMSA9IHJlcXVpcmUoXCIuL29ic2VydmFibGUtc3RvcmVcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJPYnNlcnZhYmxlU3RvcmVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9ic2VydmFibGVfc3RvcmVfMS5PYnNlcnZhYmxlU3RvcmU7IH0gfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJ2YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHJ4anNfMSA9IHJlcXVpcmUoXCJyeGpzXCIpO1xudmFyIGNsb25lcl9zZXJ2aWNlXzEgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMvY2xvbmVyLnNlcnZpY2VcIik7XG4vLyBXaWxsIGJlIHVzZWQgdG8gY3JlYXRlIGEgc2luZ2xldG9uXG52YXIgT2JzZXJ2YWJsZVN0b3JlQmFzZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBPYnNlcnZhYmxlU3RvcmVCYXNlKCkge1xuICAgICAgICB0aGlzLl9zdG9yZVN0YXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY2xvbmVyU2VydmljZSA9IG5ldyBjbG9uZXJfc2VydmljZV8xLkNsb25lclNlcnZpY2UoKTtcbiAgICAgICAgdGhpcy5fZXh0ZW5zaW9ucyA9IFtdO1xuICAgICAgICB0aGlzLnNldHRpbmdzRGVmYXVsdHMgPSB7XG4gICAgICAgICAgICB0cmFja1N0YXRlSGlzdG9yeTogZmFsc2UsXG4gICAgICAgICAgICBsb2dTdGF0ZUNoYW5nZXM6IGZhbHNlLFxuICAgICAgICAgICAgLy8gZGVwcmVjYXRlZFxuICAgICAgICAgICAgaW5jbHVkZVN0YXRlQ2hhbmdlc09uU3Vic2NyaWJlOiBmYWxzZSxcbiAgICAgICAgICAgIHN0YXRlU2xpY2VTZWxlY3RvcjogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnN0YXRlSGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLmdsb2JhbFN0YXRlRGlzcGF0Y2hlciA9IG5ldyByeGpzXzEuQmVoYXZpb3JTdWJqZWN0KG51bGwpO1xuICAgICAgICB0aGlzLmdsb2JhbFN0YXRlV2l0aENoYW5nZXNEaXNwYXRjaGVyID0gbmV3IHJ4anNfMS5CZWhhdmlvclN1YmplY3QobnVsbCk7XG4gICAgICAgIHRoaXMuZ2xvYmFsU2V0dGluZ3MgPSBudWxsO1xuICAgICAgICB0aGlzLnNlcnZpY2VzID0gW107IC8vIFRyYWNrIGFsbCBzZXJ2aWNlcyByZWFkaW5nL3dyaXRpbmcgdG8gc3RvcmUuIFVzZWZ1bCBmb3IgZXh0ZW5zaW9ucyBsaWtlIERldlRvb2xzRXh0ZW5zaW9uLlxuICAgIH1cbiAgICBPYnNlcnZhYmxlU3RvcmVCYXNlLnByb3RvdHlwZS5pbml0aWFsaXplU3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3N0b3JlU3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgc3RvcmUgc3RhdGUgaGFzIGFscmVhZHkgYmVlbiBpbml0aWFsaXplZC4gaW5pdGlhbGl6ZVN0b3JlU3RhdGUoKSBjYW4gJyArXG4gICAgICAgICAgICAgICAgJ29ubHkgYmUgY2FsbGVkIG9uY2UgQkVGT1JFIGFueSBzdG9yZSBzdGF0ZSBoYXMgYmVlbiBzZXQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0U3RvcmVTdGF0ZShzdGF0ZSk7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlU3RvcmVCYXNlLnByb3RvdHlwZS5nZXRTdG9yZVN0YXRlID0gZnVuY3Rpb24gKHByb3BlcnR5TmFtZSwgZGVlcENsb25lUmV0dXJuZWRTdGF0ZSkge1xuICAgICAgICBpZiAocHJvcGVydHlOYW1lID09PSB2b2lkIDApIHsgcHJvcGVydHlOYW1lID0gbnVsbDsgfVxuICAgICAgICBpZiAoZGVlcENsb25lUmV0dXJuZWRTdGF0ZSA9PT0gdm9pZCAwKSB7IGRlZXBDbG9uZVJldHVybmVkU3RhdGUgPSB0cnVlOyB9XG4gICAgICAgIHZhciBzdGF0ZSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9zdG9yZVN0YXRlKSB7XG4gICAgICAgICAgICAvLyBTZWUgaWYgYSBzcGVjaWZpYyBwcm9wZXJ0eSBvZiB0aGUgc3RvcmUgc2hvdWxkIGJlIHJldHVybmVkIHZpYSBnZXRTdGF0ZVByb3BlcnR5PFQ+KClcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RvcmVTdGF0ZS5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlID0gdGhpcy5fc3RvcmVTdGF0ZVtwcm9wZXJ0eU5hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXRlID0gdGhpcy5fc3RvcmVTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGF0ZSAmJiBkZWVwQ2xvbmVSZXR1cm5lZFN0YXRlKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSB0aGlzLmRlZXBDbG9uZShzdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZVN0b3JlQmFzZS5wcm90b3R5cGUuc2V0U3RvcmVTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgZGVlcENsb25lU3RhdGUpIHtcbiAgICAgICAgaWYgKGRlZXBDbG9uZVN0YXRlID09PSB2b2lkIDApIHsgZGVlcENsb25lU3RhdGUgPSB0cnVlOyB9XG4gICAgICAgIHZhciBjdXJyZW50U3RvcmVTdGF0ZSA9IHRoaXMuZ2V0U3RvcmVTdGF0ZShudWxsLCBkZWVwQ2xvbmVTdGF0ZSk7XG4gICAgICAgIGlmIChkZWVwQ2xvbmVTdGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5fc3RvcmVTdGF0ZSA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBjdXJyZW50U3RvcmVTdGF0ZSksIHRoaXMuZGVlcENsb25lKHN0YXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zdG9yZVN0YXRlID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnRTdG9yZVN0YXRlKSwgc3RhdGUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlU3RvcmVCYXNlLnByb3RvdHlwZS5jbGVhclN0b3JlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3N0b3JlU3RhdGUgPSBudWxsO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZVN0b3JlQmFzZS5wcm90b3R5cGUuZGVlcENsb25lID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2xvbmVyU2VydmljZS5kZWVwQ2xvbmUob2JqKTtcbiAgICB9O1xuICAgIE9ic2VydmFibGVTdG9yZUJhc2UucHJvdG90eXBlLmFkZEV4dGVuc2lvbiA9IGZ1bmN0aW9uIChleHRlbnNpb24pIHtcbiAgICAgICAgdGhpcy5fZXh0ZW5zaW9ucy5wdXNoKGV4dGVuc2lvbik7XG4gICAgICAgIGV4dGVuc2lvbi5pbml0KCk7XG4gICAgfTtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVN0b3JlQmFzZTtcbn0oKSk7XG4vLyBDcmVhdGVkIG9uY2UgdG8gaW5pdGlhbGl6ZSBzaW5nbGV0b25cbmV4cG9ydHMuZGVmYXVsdCA9IG5ldyBPYnNlcnZhYmxlU3RvcmVCYXNlKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1vYnNlcnZhYmxlLXN0b3JlLWJhc2UuanMubWFwIiwidmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuT2JzZXJ2YWJsZVN0b3JlID0gdm9pZCAwO1xudmFyIHJ4anNfMSA9IHJlcXVpcmUoXCJyeGpzXCIpO1xudmFyIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xID0gcmVxdWlyZShcIi4vb2JzZXJ2YWJsZS1zdG9yZS1iYXNlXCIpO1xuLyoqXG4gKiBDb3JlIGZ1bmN0aW9uYWxpdHkgZm9yIE9ic2VydmFibGVTdG9yZVxuICogcHJvdmlkaW5nIGdldFN0YXRlKCksIHNldFN0YXRlKCkgYW5kIGFkZGl0aW9uYWwgZnVuY3Rpb25hbGl0eVxuICovXG52YXIgT2JzZXJ2YWJsZVN0b3JlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE9ic2VydmFibGVTdG9yZShzZXR0aW5ncykge1xuICAgICAgICB0aGlzLl9zdGF0ZURpc3BhdGNoZXIkID0gbmV3IHJ4anNfMS5CZWhhdmlvclN1YmplY3QobnVsbCk7XG4gICAgICAgIHRoaXMuX3N0YXRlV2l0aENoYW5nZXNEaXNwYXRjaGVyJCA9IG5ldyByeGpzXzEuQmVoYXZpb3JTdWJqZWN0KG51bGwpO1xuICAgICAgICB0aGlzLl9zZXR0aW5ncyA9IF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHt9LCBvYnNlcnZhYmxlX3N0b3JlX2Jhc2VfMS5kZWZhdWx0LnNldHRpbmdzRGVmYXVsdHMpLCBzZXR0aW5ncyksIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuZ2xvYmFsU2V0dGluZ3MpO1xuICAgICAgICB0aGlzLnN0YXRlQ2hhbmdlZCA9IHRoaXMuX3N0YXRlRGlzcGF0Y2hlciQuYXNPYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2xvYmFsU3RhdGVDaGFuZ2VkID0gb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5nbG9iYWxTdGF0ZURpc3BhdGNoZXIuYXNPYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMuc3RhdGVXaXRoUHJvcGVydHlDaGFuZ2VzID0gdGhpcy5fc3RhdGVXaXRoQ2hhbmdlc0Rpc3BhdGNoZXIkLmFzT2JzZXJ2YWJsZSgpO1xuICAgICAgICB0aGlzLmdsb2JhbFN0YXRlV2l0aFByb3BlcnR5Q2hhbmdlcyA9IG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuZ2xvYmFsU3RhdGVXaXRoQ2hhbmdlc0Rpc3BhdGNoZXIuYXNPYnNlcnZhYmxlKCk7XG4gICAgICAgIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuc2VydmljZXMucHVzaCh0aGlzKTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9ic2VydmFibGVTdG9yZS5wcm90b3R5cGUsIFwic3RhdGVIaXN0b3J5XCIsIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHJpZXZlIHN0YXRlIGhpc3RvcnkuIEFzc3VtZXMgdHJhY2tTdGF0ZUhpc3Rvcnkgc2V0dGluZyB3YXMgc2V0IG9uIHRoZSBzdG9yZS5cbiAgICAgICAgICovXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuc3RhdGVIaXN0b3J5O1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9ic2VydmFibGVTdG9yZSwgXCJnbG9iYWxTZXR0aW5nc1wiLCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBnZXQvc2V0IGdsb2JhbCBzZXR0aW5ncyB0aHJvdWdob3V0IHRoZSBhcHBsaWNhdGlvbiBmb3IgT2JzZXJ2YWJsZVN0b3JlLlxuICAgICAgICAgKiBTZWUgdGhlIFtPYnNlcnZhYmxlIFN0b3JlIFNldHRpbmdzXShodHRwczovL2dpdGh1Yi5jb20vZGFud2FobGluL29ic2VydmFibGUtc3RvcmUjc3RvcmUtc2V0dGluZ3MtcGVyLXNlcnZpY2UpIGRvY3VtZW50YXRpb25cbiAgICAgICAgICogZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uIE5vdGUgdGhhdCBnbG9iYWwgc2V0dGluZ3MgY2FuIG9ubHkgYmUgc2V0IG9uY2UgYXMgdGhlIGFwcGxpY2F0aW9uIGZpcnN0IGxvYWRzLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5nbG9iYWxTZXR0aW5ncztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICAgICAgICAgIC8vIE9ic2VydmFibGVTdG9yZVsnaXNUZXN0aW5nJ10gdXNlZCBzbyB0aGF0IHVuaXQgdGVzdHMgY2FuIHNldCBnbG9iYWxTZXR0aW5ncyBcbiAgICAgICAgICAgIC8vIG11bHRpcGxlIHRpbWVzIGR1cmluZyBhIHN1aXRlIG9mIHRlc3RzXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MgJiYgKE9ic2VydmFibGVTdG9yZVsnaXNUZXN0aW5nJ10gfHwgIW9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuZ2xvYmFsU2V0dGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5nbG9iYWxTZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIXNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgcHJvdmlkZSB0aGUgZ2xvYmFsIHNldHRpbmdzIHlvdSB3b3VsZCBsaWtlIHRvIGFwcGx5IHRvIE9ic2VydmFibGUgU3RvcmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNldHRpbmdzICYmIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuZ2xvYmFsU2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09ic2VydmFibGUgU3RvcmUgZ2xvYmFsIHNldHRpbmdzIG1heSBvbmx5IGJlIHNldCBvbmNlIHdoZW4gdGhlIGFwcGxpY2F0aW9uIGZpcnN0IGxvYWRzLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9ic2VydmFibGVTdG9yZSwgXCJhbGxTdG9yZVNlcnZpY2VzXCIsIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3ZpZGVzIGFjY2VzcyB0byBhbGwgc2VydmljZXMgdGhhdCBpbnRlcmFjdCB3aXRoIE9ic2VydmFibGVTdG9yZS4gVXNlZnVsIGZvciBleHRlbnNpb25zXG4gICAgICAgICAqIHRoYXQgbmVlZCB0byBiZSBhYmxlIHRvIGFjY2VzcyBhIHNwZWNpZmljIHNlcnZpY2UuXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBvYnNlcnZhYmxlX3N0b3JlX2Jhc2VfMS5kZWZhdWx0LnNlcnZpY2VzO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogVXNlZCB0byBhZGQgYW4gZXh0ZW5zaW9uIGludG8gT2JzZXJ2YWJsZVN0b3JlLiBUaGUgZXh0ZW5zaW9uIG11c3QgaW1wbGVtZW50IHRoZVxuICAgICAqIGBPYnNlcnZhYmxlU3RvcmVFeHRlbnNpb25gIGludGVyZmFjZS5cbiAgICAgKi9cbiAgICBPYnNlcnZhYmxlU3RvcmUuYWRkRXh0ZW5zaW9uID0gZnVuY3Rpb24gKGV4dGVuc2lvbikge1xuICAgICAgICBvYnNlcnZhYmxlX3N0b3JlX2Jhc2VfMS5kZWZhdWx0LmFkZEV4dGVuc2lvbihleHRlbnNpb24pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVXNlZCB0byBpbml0aWFsaXplIHRoZSBzdG9yZSdzIHN0YXJ0aW5nIHN0YXRlLiBBbiBlcnJvciB3aWxsIGJlIHRocm93biBpZiB0aGlzIGlzIGNhbGxlZCBhbmQgc3RvcmUgc3RhdGUgYWxyZWFkeSBleGlzdHMuXG4gICAgICogTm8gbm90aWZpY2F0aW9ucyBhcmUgc2VudCBvdXQgd2hlbiB0aGUgc3RvcmUgc3RhdGUgaXMgaW5pdGlhbGl6ZWQgYnkgY2FsbGluZyBpbml0aWFsaXplU3RvcmVTdGF0ZSgpLlxuICAgICAqL1xuICAgIE9ic2VydmFibGVTdG9yZS5pbml0aWFsaXplU3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5pbml0aWFsaXplU3RhdGUoc3RhdGUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVXNlZCB0byByZXNldCB0aGUgc3RhdGUgb2YgdGhlIHN0b3JlIHRvIGEgZGVzaXJlZCB2YWx1ZSBmb3IgYWxsIHNlcnZpY2VzIHRoYXQgZGVyaXZlXG4gICAgICogZnJvbSBPYnNlcnZhYmxlU3RvcmU8VD4gdG8gYSBkZXNpcmVkIHZhbHVlLlxuICAgICAqIEEgc3RhdGUgY2hhbmdlIG5vdGlmaWNhdGlvbiBhbmQgZ2xvYmFsIHN0YXRlIGNoYW5nZSBub3RpZmljYXRpb24gaXMgc2VudCBvdXQgdG8gc3Vic2NyaWJlcnMgaWYgdGhlIGRpc3BhdGNoU3RhdGUgcGFyYW1ldGVyIGlzIHRydWUgKHRoZSBkZWZhdWx0IHZhbHVlKS5cbiAgICAgKi9cbiAgICBPYnNlcnZhYmxlU3RvcmUucmVzZXRTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgZGlzcGF0Y2hTdGF0ZSkge1xuICAgICAgICBpZiAoZGlzcGF0Y2hTdGF0ZSA9PT0gdm9pZCAwKSB7IGRpc3BhdGNoU3RhdGUgPSB0cnVlOyB9XG4gICAgICAgIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuc2V0U3RvcmVTdGF0ZShzdGF0ZSk7XG4gICAgICAgIGlmIChkaXNwYXRjaFN0YXRlKSB7XG4gICAgICAgICAgICBPYnNlcnZhYmxlU3RvcmUuZGlzcGF0Y2hUb0FsbFNlcnZpY2VzKHN0YXRlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2xlYXIvbnVsbCB0aGUgc3RvcmUgc3RhdGUgZm9yIGFsbCBzZXJ2aWNlcyB0aGF0IHVzZSBpdC5cbiAgICAgKi9cbiAgICBPYnNlcnZhYmxlU3RvcmUuY2xlYXJTdGF0ZSA9IGZ1bmN0aW9uIChkaXNwYXRjaFN0YXRlKSB7XG4gICAgICAgIGlmIChkaXNwYXRjaFN0YXRlID09PSB2b2lkIDApIHsgZGlzcGF0Y2hTdGF0ZSA9IHRydWU7IH1cbiAgICAgICAgb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5jbGVhclN0b3JlU3RhdGUoKTtcbiAgICAgICAgaWYgKGRpc3BhdGNoU3RhdGUpIHtcbiAgICAgICAgICAgIE9ic2VydmFibGVTdG9yZS5kaXNwYXRjaFRvQWxsU2VydmljZXMobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE9ic2VydmFibGVTdG9yZS5kaXNwYXRjaFRvQWxsU2VydmljZXMgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgdmFyIHNlcnZpY2VzID0gT2JzZXJ2YWJsZVN0b3JlLmFsbFN0b3JlU2VydmljZXM7XG4gICAgICAgIGlmIChzZXJ2aWNlcykge1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBzZXJ2aWNlc18xID0gc2VydmljZXM7IF9pIDwgc2VydmljZXNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VydmljZSA9IHNlcnZpY2VzXzFbX2ldO1xuICAgICAgICAgICAgICAgIHNlcnZpY2UuZGlzcGF0Y2hTdGF0ZShzdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIHN0b3JlJ3Mgc3RhdGUuIElmIHVzaW5nIFR5cGVTY3JpcHQgKG9wdGlvbmFsKSB0aGVuIHRoZSBzdGF0ZSB0eXBlIGRlZmluZWQgd2hlbiB0aGUgc3RvcmVcbiAgICAgKiB3YXMgY3JlYXRlZCB3aWxsIGJlIHJldHVybmVkIHJhdGhlciB0aGFuIGBhbnlgLiBUaGUgZGVlcENsb25lUmV0dXJuZWRTdGF0ZSBib29sZWFuIHBhcmFtZXRlciAoZGVmYXVsdCBpcyB0cnVlKSBjYW4gYmUgdXNlZFxuICAgICAqIHRvIGRldGVybWluZSBpZiB0aGUgcmV0dXJuZWQgc3RhdGUgd2lsbCBiZSBkZWVwIGNsb25lZCBvciBub3QuIElmIHNldCB0byBmYWxzZSwgYSByZWZlcmVuY2UgdG8gdGhlIHN0b3JlIHN0YXRlIHdpbGxcbiAgICAgKiBiZSByZXR1cm5lZCBhbmQgaXQncyB1cCB0byB0aGUgdXNlciB0byBlbnN1cmUgdGhlIHN0YXRlIGlzbid0IGNoYW5nZSBmcm9tIG91dHNpZGUgdGhlIHN0b3JlLiBTZXR0aW5nIGl0IHRvIGZhbHNlIGNhbiBiZVxuICAgICAqIHVzZWZ1bCBpbiBjYXNlcyB3aGVyZSByZWFkLW9ubHkgY2FjaGVkIGRhdGEgaXMgc3RvcmVkIGFuZCBtdXN0IGJlIHJldHJpZXZlZCBhcyBxdWlja2x5IGFzIHBvc3NpYmxlIHdpdGhvdXQgYW55IGNsb25pbmcuXG4gICAgICovXG4gICAgT2JzZXJ2YWJsZVN0b3JlLnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uIChkZWVwQ2xvbmVSZXR1cm5lZFN0YXRlKSB7XG4gICAgICAgIGlmIChkZWVwQ2xvbmVSZXR1cm5lZFN0YXRlID09PSB2b2lkIDApIHsgZGVlcENsb25lUmV0dXJuZWRTdGF0ZSA9IHRydWU7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFN0YXRlT3JTbGljZShkZWVwQ2xvbmVSZXR1cm5lZFN0YXRlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGEgc3BlY2lmaWMgcHJvcGVydHkgZnJvbSB0aGUgc3RvcmUncyBzdGF0ZSB3aGljaCBjYW4gYmUgbW9yZSBlZmZpY2llbnQgdGhhbiBnZXRTdGF0ZSgpXG4gICAgICogc2luY2Ugb25seSB0aGUgZGVmaW5lZCBwcm9wZXJ0eSB2YWx1ZSB3aWxsIGJlIHJldHVybmVkIChhbmQgY2xvbmVkKSByYXRoZXIgdGhhbiB0aGUgZW50aXJlXG4gICAgICogc3RvcmUgdmFsdWUuIElmIHVzaW5nIFR5cGVTY3JpcHQgKG9wdGlvbmFsKSB0aGVuIHRoZSBnZW5lcmljIHByb3BlcnR5IHR5cGUgdXNlZCB3aXRoIHRoZVxuICAgICAqIGZ1bmN0aW9uIGNhbGwgd2lsbCBiZSB0aGUgcmV0dXJuIHR5cGUuXG4gICAgICovXG4gICAgT2JzZXJ2YWJsZVN0b3JlLnByb3RvdHlwZS5nZXRTdGF0ZVByb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5TmFtZSwgZGVlcENsb25lUmV0dXJuZWRTdGF0ZSkge1xuICAgICAgICBpZiAoZGVlcENsb25lUmV0dXJuZWRTdGF0ZSA9PT0gdm9pZCAwKSB7IGRlZXBDbG9uZVJldHVybmVkU3RhdGUgPSB0cnVlOyB9XG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlX3N0b3JlX2Jhc2VfMS5kZWZhdWx0LmdldFN0b3JlU3RhdGUocHJvcGVydHlOYW1lLCBkZWVwQ2xvbmVSZXR1cm5lZFN0YXRlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNldCBzdG9yZSBzdGF0ZS4gUGFzcyB0aGUgc3RhdGUgdG8gYmUgdXBkYXRlZCBhcyB3ZWxsIGFzIHRoZSBhY3Rpb24gdGhhdCBpcyBvY2N1cmluZy5cbiAgICAgKiBUaGUgc3RhdGUgdmFsdWUgY2FuIGJlIGEgZnVuY3Rpb24gWyhzZWUgZXhhbXBsZSldKGh0dHBzOi8vZ2l0aHViLmNvbS9kYW53YWhsaW4vb2JzZXJ2YWJsZS1zdG9yZSNzdG9yZS1hcGkpLlxuICAgICAqIFRoZSBsYXRlc3Qgc3RvcmUgc3RhdGUgaXMgcmV0dXJuZWQuXG4gICAgICogVGhlIGRpc3BhdGNoU3RhdGUgcGFyYW1ldGVyIGNhbiBiZSBzZXQgdG8gZmFsc2UgaWYgeW91IGRvIG5vdCB3YW50IHRvIHNlbmQgc3RhdGUgY2hhbmdlIG5vdGlmaWNhdGlvbnMgdG8gc3Vic2NyaWJlcnMuXG4gICAgICogVGhlIGRlZXBDbG9uZVJldHVybmVkU3RhdGUgYm9vbGVhbiBwYXJhbWV0ZXIgKGRlZmF1bHQgaXMgdHJ1ZSkgY2FuIGJlIHVzZWRcbiAgICAgKiB0byBkZXRlcm1pbmUgaWYgdGhlIHN0YXRlIHdpbGwgYmUgZGVlcCBjbG9uZWQgYmVmb3JlIGl0IGlzIGFkZGVkIHRvIHRoZSBzdG9yZS4gU2V0dGluZyBpdCB0byBmYWxzZSBjYW4gYmVcbiAgICAgKiB1c2VmdWwgaW4gY2FzZXMgd2hlcmUgcmVhZC1vbmx5IGNhY2hlZCBkYXRhIGlzIHN0b3JlZCBhbmQgbXVzdCBhZGRlZCB0byB0aGUgc3RvcmUgYXMgcXVpY2tseSBhcyBwb3NzaWJsZSB3aXRob3V0IGFueSBjbG9uaW5nLlxuICAgICAqL1xuICAgIE9ic2VydmFibGVTdG9yZS5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbiwgZGlzcGF0Y2hTdGF0ZSwgZGVlcENsb25lU3RhdGUpIHtcbiAgICAgICAgaWYgKGRpc3BhdGNoU3RhdGUgPT09IHZvaWQgMCkgeyBkaXNwYXRjaFN0YXRlID0gdHJ1ZTsgfVxuICAgICAgICBpZiAoZGVlcENsb25lU3RhdGUgPT09IHZvaWQgMCkgeyBkZWVwQ2xvbmVTdGF0ZSA9IHRydWU7IH1cbiAgICAgICAgLy8gTmVlZGVkIGZvciB0cmFja2luZyBiZWxvdyAoZG9uJ3QgbW92ZSBvciBkZWxldGUpXG4gICAgICAgIHZhciBwcmV2aW91c1N0YXRlID0gdGhpcy5nZXRTdGF0ZShkZWVwQ2xvbmVTdGF0ZSk7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICAgICAgdmFyIG5ld1N0YXRlID0gc3RhdGUodGhpcy5nZXRTdGF0ZShkZWVwQ2xvbmVTdGF0ZSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKG5ld1N0YXRlLCBkZWVwQ2xvbmVTdGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKHN0YXRlLCBkZWVwQ2xvbmVTdGF0ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKCdQYXNzIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uIGZvciB0aGUgc3RhdGUgcGFyYW1ldGVyIHdoZW4gY2FsbGluZyBzZXRTdGF0ZSgpLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9zZXR0aW5ncy50cmFja1N0YXRlSGlzdG9yeSkge1xuICAgICAgICAgICAgb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5zdGF0ZUhpc3RvcnkucHVzaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgICAgICAgICAgYmVnaW5TdGF0ZTogcHJldmlvdXNTdGF0ZSxcbiAgICAgICAgICAgICAgICBlbmRTdGF0ZTogdGhpcy5nZXRTdGF0ZShkZWVwQ2xvbmVTdGF0ZSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaXNwYXRjaFN0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoU3RhdGUoc3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9zZXR0aW5ncy5sb2dTdGF0ZUNoYW5nZXMpIHtcbiAgICAgICAgICAgIHZhciBjYWxsZXIgPSAodGhpcy5jb25zdHJ1Y3RvcikgPyAnXFxyXFxuQ2FsbGVyOiAnICsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIDogJyc7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnJWNTVEFURSBDSEFOR0VEJywgJ2ZvbnQtd2VpZ2h0OiBib2xkJywgJ1xcclxcbkFjdGlvbjogJywgYWN0aW9uLCBjYWxsZXIsICdcXHJcXG5TdGF0ZTogJywgc3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXRlKGRlZXBDbG9uZVN0YXRlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZCBhIGN1c3RvbSBzdGF0ZSB2YWx1ZSBhbmQgYWN0aW9uIGludG8gdGhlIHN0YXRlIGhpc3RvcnkuIEFzc3VtZXMgYHRyYWNrU3RhdGVIaXN0b3J5YCBzZXR0aW5nIHdhcyBzZXRcbiAgICAgKiBvbiBzdG9yZSBvciB1c2luZyB0aGUgZ2xvYmFsIHNldHRpbmdzLlxuICAgICAqL1xuICAgIE9ic2VydmFibGVTdG9yZS5wcm90b3R5cGUubG9nU3RhdGVBY3Rpb24gPSBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbikge1xuICAgICAgICBpZiAodGhpcy5fc2V0dGluZ3MudHJhY2tTdGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgICAgIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuc3RhdGVIaXN0b3J5LnB1c2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICAgICAgICAgIGJlZ2luU3RhdGU6IHRoaXMuZ2V0U3RhdGUoKSxcbiAgICAgICAgICAgICAgICBlbmRTdGF0ZTogb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5kZWVwQ2xvbmUoc3RhdGUpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogXHRSZXNldCB0aGUgc3RvcmUncyBzdGF0ZSBoaXN0b3J5IHRvIGFuIGVtcHR5IGFycmF5LlxuICAgICAqL1xuICAgIE9ic2VydmFibGVTdG9yZS5wcm90b3R5cGUucmVzZXRTdGF0ZUhpc3RvcnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuc3RhdGVIaXN0b3J5ID0gW107XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlU3RvcmUucHJvdG90eXBlLl91cGRhdGVTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgZGVlcENsb25lU3RhdGUpIHtcbiAgICAgICAgb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5zZXRTdG9yZVN0YXRlKHN0YXRlLCBkZWVwQ2xvbmVTdGF0ZSk7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlU3RvcmUucHJvdG90eXBlLl9nZXRTdGF0ZU9yU2xpY2UgPSBmdW5jdGlvbiAoZGVlcENsb25lUmV0dXJuZWRTdGF0ZSkge1xuICAgICAgICB2YXIgc3RvcmVTdGF0ZSA9IG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuZ2V0U3RvcmVTdGF0ZShudWxsLCBkZWVwQ2xvbmVSZXR1cm5lZFN0YXRlKTtcbiAgICAgICAgaWYgKHRoaXMuX3NldHRpbmdzLnN0YXRlU2xpY2VTZWxlY3Rvcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldHRpbmdzLnN0YXRlU2xpY2VTZWxlY3RvcihzdG9yZVN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RvcmVTdGF0ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIERpc3BhdGNoIHRoZSBzdG9yZSdzIHN0YXRlIHdpdGhvdXQgbW9kaWZ5aW5nIHRoZSBzdG9yZSBzdGF0ZS4gU2VydmljZSBzdGF0ZSBjYW4gYmUgZGlzcGF0Y2hlZCBhcyB3ZWxsIGFzIHRoZSBnbG9iYWwgc3RvcmUgc3RhdGUuXG4gICAgICogSWYgYGRpc3BhdGNoR2xvYmFsU3RhdGVgIGlzIGZhbHNlIHRoZW4gZ2xvYmFsIHN0YXRlIHdpbGwgbm90IGJlIGRpc3BhdGNoZWQgdG8gc3Vic2NyaWJlcnMgKGRlZmF1bHRzIHRvIGB0cnVlYCkuXG4gICAgICovXG4gICAgT2JzZXJ2YWJsZVN0b3JlLnByb3RvdHlwZS5kaXNwYXRjaFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlQ2hhbmdlcywgZGlzcGF0Y2hHbG9iYWxTdGF0ZSkge1xuICAgICAgICBpZiAoZGlzcGF0Y2hHbG9iYWxTdGF0ZSA9PT0gdm9pZCAwKSB7IGRpc3BhdGNoR2xvYmFsU3RhdGUgPSB0cnVlOyB9XG4gICAgICAgIC8vIEdldCBzdG9yZSBzdGF0ZSBvciBzbGljZSBvZiBzdGF0ZVxuICAgICAgICB2YXIgY2xvbmVkU3RhdGVPclNsaWNlID0gdGhpcy5fZ2V0U3RhdGVPclNsaWNlKHRydWUpO1xuICAgICAgICAvLyAgR2V0IGZ1bGwgc3RvcmUgc3RhdGVcbiAgICAgICAgdmFyIGNsb25lZEdsb2JhbFN0YXRlID0gb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5nZXRTdG9yZVN0YXRlKCk7XG4gICAgICAgIC8vIGluY2x1ZGVTdGF0ZUNoYW5nZXNPblN1YnNjcmliZSBpcyBkZXByZWNhdGVkXG4gICAgICAgIGlmICh0aGlzLl9zZXR0aW5ncy5pbmNsdWRlU3RhdGVDaGFuZ2VzT25TdWJzY3JpYmUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignaW5jbHVkZVN0YXRlQ2hhbmdlc09uU3Vic2NyaWJlIGlzIGRlcHJlY2F0ZWQuICcgK1xuICAgICAgICAgICAgICAgICdTdWJzY3JpYmUgdG8gc3RhdGVDaGFuZ2VkV2l0aENoYW5nZXMgb3IgZ2xvYmFsU3RhdGVDaGFuZ2VkV2l0aENoYW5nZXMgaW5zdGVhZC4nKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlRGlzcGF0Y2hlciQubmV4dCh7IHN0YXRlOiBjbG9uZWRTdGF0ZU9yU2xpY2UsIHN0YXRlQ2hhbmdlczogc3RhdGVDaGFuZ2VzIH0pO1xuICAgICAgICAgICAgb2JzZXJ2YWJsZV9zdG9yZV9iYXNlXzEuZGVmYXVsdC5nbG9iYWxTdGF0ZURpc3BhdGNoZXIubmV4dCh7IHN0YXRlOiBjbG9uZWRHbG9iYWxTdGF0ZSwgc3RhdGVDaGFuZ2VzOiBzdGF0ZUNoYW5nZXMgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0ZURpc3BhdGNoZXIkLm5leHQoY2xvbmVkU3RhdGVPclNsaWNlKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlV2l0aENoYW5nZXNEaXNwYXRjaGVyJC5uZXh0KHsgc3RhdGU6IGNsb25lZFN0YXRlT3JTbGljZSwgc3RhdGVDaGFuZ2VzOiBzdGF0ZUNoYW5nZXMgfSk7XG4gICAgICAgICAgICBpZiAoZGlzcGF0Y2hHbG9iYWxTdGF0ZSkge1xuICAgICAgICAgICAgICAgIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuZ2xvYmFsU3RhdGVEaXNwYXRjaGVyLm5leHQoY2xvbmVkR2xvYmFsU3RhdGUpO1xuICAgICAgICAgICAgICAgIG9ic2VydmFibGVfc3RvcmVfYmFzZV8xLmRlZmF1bHQuZ2xvYmFsU3RhdGVXaXRoQ2hhbmdlc0Rpc3BhdGNoZXIubmV4dCh7IHN0YXRlOiBjbG9uZWRHbG9iYWxTdGF0ZSwgc3RhdGVDaGFuZ2VzOiBzdGF0ZUNoYW5nZXMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBPYnNlcnZhYmxlU3RvcmU7XG59KCkpO1xuZXhwb3J0cy5PYnNlcnZhYmxlU3RvcmUgPSBPYnNlcnZhYmxlU3RvcmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1vYnNlcnZhYmxlLXN0b3JlLmpzLm1hcCIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9jb2RlYW5kY2F0cy9mYXN0LWNsb25lL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNsb25lclNlcnZpY2UgPSB2b2lkIDA7XG52YXIgQ2xvbmVyU2VydmljZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDbG9uZXJTZXJ2aWNlKCkge1xuICAgIH1cbiAgICBDbG9uZXJTZXJ2aWNlLnByb3RvdHlwZS5kZWVwQ2xvbmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgICAgICAvLyBudWxsIGFuZCB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuc2V0VGltZSh2YWx1ZS5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLm5ld1JlZ0V4cCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBNYXAodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgU2V0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZml4VHlwZXModmFsdWUsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBDbG9uZXJTZXJ2aWNlLnByb3RvdHlwZS5maXhQcm9wZXJ0eVZhbHVlID0gZnVuY3Rpb24gKG9yaWdpbmFsLCBjb3B5LCBrZXkpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSBvcmlnaW5hbFtrZXldO1xuICAgICAgICB2YXIgb3JpZ2luYWxUeXBlID0gdHlwZW9mIG9yaWdpbmFsVmFsdWU7XG4gICAgICAgIHN3aXRjaCAob3JpZ2luYWxUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbFZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZS5zZXRUaW1lKG9yaWdpbmFsVmFsdWUuZ2V0VGltZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgY29weVtrZXldID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsVmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgICAgICAgICAgY29weVtrZXldID0gdGhpcy5uZXdSZWdFeHAob3JpZ2luYWxWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsVmFsdWUgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgY29weVtrZXldID0gbmV3IE1hcChvcmlnaW5hbFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob3JpZ2luYWxWYWx1ZSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgICAgICAgICBjb3B5W2tleV0gPSBuZXcgU2V0KG9yaWdpbmFsVmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvcmlnaW5hbFZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29weVtrZXldID0gb3JpZ2luYWxWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZml4VHlwZXMob3JpZ2luYWxWYWx1ZSwgY29weVtrZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgIGlmIChpc05hTihvcmlnaW5hbFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjb3B5W2tleV0gPSBOYU47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yaWdpbmFsVmFsdWUgPT0gSW5maW5pdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29weVtrZXldID0gSW5maW5pdHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2xvbmVyU2VydmljZS5wcm90b3R5cGUuZml4VHlwZXMgPSBmdW5jdGlvbiAob3JpZ2luYWwsIGNvcHkpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKG9yaWdpbmFsIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBvcmlnaW5hbC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpeFByb3BlcnR5VmFsdWUob3JpZ2luYWwsIGNvcHksIGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob3JpZ2luYWwpO1xuICAgICAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5maXhQcm9wZXJ0eVZhbHVlKG9yaWdpbmFsLCBjb3B5LCBrZXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIENsb25lclNlcnZpY2UucHJvdG90eXBlLm5ld1JlZ0V4cCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgcmVnZXhwVGV4dCA9IFN0cmluZyh2YWx1ZSk7XG4gICAgICAgIHZhciBzbGFzaEluZGV4ID0gcmVnZXhwVGV4dC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleHBUZXh0LnNsaWNlKDEsIHNsYXNoSW5kZXgpLCByZWdleHBUZXh0LnNsaWNlKHNsYXNoSW5kZXggKyAxKSk7XG4gICAgfTtcbiAgICByZXR1cm4gQ2xvbmVyU2VydmljZTtcbn0oKSk7XG5leHBvcnRzLkNsb25lclNlcnZpY2UgPSBDbG9uZXJTZXJ2aWNlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2xvbmVyLnNlcnZpY2UuanMubWFwIiwiZXhwb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4vaW50ZXJuYWwvT2JzZXJ2YWJsZSc7XG5leHBvcnQgeyBDb25uZWN0YWJsZU9ic2VydmFibGUgfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvQ29ubmVjdGFibGVPYnNlcnZhYmxlJztcbmV4cG9ydCB7IG9ic2VydmFibGUgfSBmcm9tICcuL2ludGVybmFsL3N5bWJvbC9vYnNlcnZhYmxlJztcbmV4cG9ydCB7IGFuaW1hdGlvbkZyYW1lcyB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9kb20vYW5pbWF0aW9uRnJhbWVzJztcbmV4cG9ydCB7IFN1YmplY3QgfSBmcm9tICcuL2ludGVybmFsL1N1YmplY3QnO1xuZXhwb3J0IHsgQmVoYXZpb3JTdWJqZWN0IH0gZnJvbSAnLi9pbnRlcm5hbC9CZWhhdmlvclN1YmplY3QnO1xuZXhwb3J0IHsgUmVwbGF5U3ViamVjdCB9IGZyb20gJy4vaW50ZXJuYWwvUmVwbGF5U3ViamVjdCc7XG5leHBvcnQgeyBBc3luY1N1YmplY3QgfSBmcm9tICcuL2ludGVybmFsL0FzeW5jU3ViamVjdCc7XG5leHBvcnQgeyBhc2FwLCBhc2FwU2NoZWR1bGVyIH0gZnJvbSAnLi9pbnRlcm5hbC9zY2hlZHVsZXIvYXNhcCc7XG5leHBvcnQgeyBhc3luYywgYXN5bmNTY2hlZHVsZXIgfSBmcm9tICcuL2ludGVybmFsL3NjaGVkdWxlci9hc3luYyc7XG5leHBvcnQgeyBxdWV1ZSwgcXVldWVTY2hlZHVsZXIgfSBmcm9tICcuL2ludGVybmFsL3NjaGVkdWxlci9xdWV1ZSc7XG5leHBvcnQgeyBhbmltYXRpb25GcmFtZSwgYW5pbWF0aW9uRnJhbWVTY2hlZHVsZXIgfSBmcm9tICcuL2ludGVybmFsL3NjaGVkdWxlci9hbmltYXRpb25GcmFtZSc7XG5leHBvcnQgeyBWaXJ0dWFsVGltZVNjaGVkdWxlciwgVmlydHVhbEFjdGlvbiB9IGZyb20gJy4vaW50ZXJuYWwvc2NoZWR1bGVyL1ZpcnR1YWxUaW1lU2NoZWR1bGVyJztcbmV4cG9ydCB7IFNjaGVkdWxlciB9IGZyb20gJy4vaW50ZXJuYWwvU2NoZWR1bGVyJztcbmV4cG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJy4vaW50ZXJuYWwvU3Vic2NyaXB0aW9uJztcbmV4cG9ydCB7IFN1YnNjcmliZXIgfSBmcm9tICcuL2ludGVybmFsL1N1YnNjcmliZXInO1xuZXhwb3J0IHsgTm90aWZpY2F0aW9uLCBOb3RpZmljYXRpb25LaW5kIH0gZnJvbSAnLi9pbnRlcm5hbC9Ob3RpZmljYXRpb24nO1xuZXhwb3J0IHsgcGlwZSB9IGZyb20gJy4vaW50ZXJuYWwvdXRpbC9waXBlJztcbmV4cG9ydCB7IG5vb3AgfSBmcm9tICcuL2ludGVybmFsL3V0aWwvbm9vcCc7XG5leHBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4vaW50ZXJuYWwvdXRpbC9pZGVudGl0eSc7XG5leHBvcnQgeyBpc09ic2VydmFibGUgfSBmcm9tICcuL2ludGVybmFsL3V0aWwvaXNPYnNlcnZhYmxlJztcbmV4cG9ydCB7IGxhc3RWYWx1ZUZyb20gfSBmcm9tICcuL2ludGVybmFsL2xhc3RWYWx1ZUZyb20nO1xuZXhwb3J0IHsgZmlyc3RWYWx1ZUZyb20gfSBmcm9tICcuL2ludGVybmFsL2ZpcnN0VmFsdWVGcm9tJztcbmV4cG9ydCB7IEFyZ3VtZW50T3V0T2ZSYW5nZUVycm9yIH0gZnJvbSAnLi9pbnRlcm5hbC91dGlsL0FyZ3VtZW50T3V0T2ZSYW5nZUVycm9yJztcbmV4cG9ydCB7IEVtcHR5RXJyb3IgfSBmcm9tICcuL2ludGVybmFsL3V0aWwvRW1wdHlFcnJvcic7XG5leHBvcnQgeyBOb3RGb3VuZEVycm9yIH0gZnJvbSAnLi9pbnRlcm5hbC91dGlsL05vdEZvdW5kRXJyb3InO1xuZXhwb3J0IHsgT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3IgfSBmcm9tICcuL2ludGVybmFsL3V0aWwvT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3InO1xuZXhwb3J0IHsgU2VxdWVuY2VFcnJvciB9IGZyb20gJy4vaW50ZXJuYWwvdXRpbC9TZXF1ZW5jZUVycm9yJztcbmV4cG9ydCB7IFRpbWVvdXRFcnJvciB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3RpbWVvdXQnO1xuZXhwb3J0IHsgVW5zdWJzY3JpcHRpb25FcnJvciB9IGZyb20gJy4vaW50ZXJuYWwvdXRpbC9VbnN1YnNjcmlwdGlvbkVycm9yJztcbmV4cG9ydCB7IGJpbmRDYWxsYmFjayB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9iaW5kQ2FsbGJhY2snO1xuZXhwb3J0IHsgYmluZE5vZGVDYWxsYmFjayB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9iaW5kTm9kZUNhbGxiYWNrJztcbmV4cG9ydCB7IGNvbWJpbmVMYXRlc3QgfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvY29tYmluZUxhdGVzdCc7XG5leHBvcnQgeyBjb25jYXQgfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvY29uY2F0JztcbmV4cG9ydCB7IGNvbm5lY3RhYmxlIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL2Nvbm5lY3RhYmxlJztcbmV4cG9ydCB7IGRlZmVyIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL2RlZmVyJztcbmV4cG9ydCB7IGVtcHR5IH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL2VtcHR5JztcbmV4cG9ydCB7IGZvcmtKb2luIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL2ZvcmtKb2luJztcbmV4cG9ydCB7IGZyb20gfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvZnJvbSc7XG5leHBvcnQgeyBmcm9tRXZlbnQgfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvZnJvbUV2ZW50JztcbmV4cG9ydCB7IGZyb21FdmVudFBhdHRlcm4gfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvZnJvbUV2ZW50UGF0dGVybic7XG5leHBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9nZW5lcmF0ZSc7XG5leHBvcnQgeyBpaWYgfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvaWlmJztcbmV4cG9ydCB7IGludGVydmFsIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL2ludGVydmFsJztcbmV4cG9ydCB7IG1lcmdlIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL21lcmdlJztcbmV4cG9ydCB7IG5ldmVyIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL25ldmVyJztcbmV4cG9ydCB7IG9mIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL29mJztcbmV4cG9ydCB7IG9uRXJyb3JSZXN1bWVOZXh0IH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL29uRXJyb3JSZXN1bWVOZXh0JztcbmV4cG9ydCB7IHBhaXJzIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL3BhaXJzJztcbmV4cG9ydCB7IHBhcnRpdGlvbiB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9wYXJ0aXRpb24nO1xuZXhwb3J0IHsgcmFjZSB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9yYWNlJztcbmV4cG9ydCB7IHJhbmdlIH0gZnJvbSAnLi9pbnRlcm5hbC9vYnNlcnZhYmxlL3JhbmdlJztcbmV4cG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvdGhyb3dFcnJvcic7XG5leHBvcnQgeyB0aW1lciB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS90aW1lcic7XG5leHBvcnQgeyB1c2luZyB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS91c2luZyc7XG5leHBvcnQgeyB6aXAgfSBmcm9tICcuL2ludGVybmFsL29ic2VydmFibGUvemlwJztcbmV4cG9ydCB7IHNjaGVkdWxlZCB9IGZyb20gJy4vaW50ZXJuYWwvc2NoZWR1bGVkL3NjaGVkdWxlZCc7XG5leHBvcnQgeyBFTVBUWSB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9lbXB0eSc7XG5leHBvcnQgeyBORVZFUiB9IGZyb20gJy4vaW50ZXJuYWwvb2JzZXJ2YWJsZS9uZXZlcic7XG5leHBvcnQgKiBmcm9tICcuL2ludGVybmFsL3R5cGVzJztcbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vaW50ZXJuYWwvY29uZmlnJztcbmV4cG9ydCB7IGF1ZGl0IH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvYXVkaXQnO1xuZXhwb3J0IHsgYXVkaXRUaW1lIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvYXVkaXRUaW1lJztcbmV4cG9ydCB7IGJ1ZmZlciB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2J1ZmZlcic7XG5leHBvcnQgeyBidWZmZXJDb3VudCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2J1ZmZlckNvdW50JztcbmV4cG9ydCB7IGJ1ZmZlclRpbWUgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9idWZmZXJUaW1lJztcbmV4cG9ydCB7IGJ1ZmZlclRvZ2dsZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2J1ZmZlclRvZ2dsZSc7XG5leHBvcnQgeyBidWZmZXJXaGVuIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvYnVmZmVyV2hlbic7XG5leHBvcnQgeyBjYXRjaEVycm9yIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvY2F0Y2hFcnJvcic7XG5leHBvcnQgeyBjb21iaW5lQWxsIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvY29tYmluZUFsbCc7XG5leHBvcnQgeyBjb21iaW5lTGF0ZXN0QWxsIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvY29tYmluZUxhdGVzdEFsbCc7XG5leHBvcnQgeyBjb21iaW5lTGF0ZXN0V2l0aCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2NvbWJpbmVMYXRlc3RXaXRoJztcbmV4cG9ydCB7IGNvbmNhdEFsbCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2NvbmNhdEFsbCc7XG5leHBvcnQgeyBjb25jYXRNYXAgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9jb25jYXRNYXAnO1xuZXhwb3J0IHsgY29uY2F0TWFwVG8gfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9jb25jYXRNYXBUbyc7XG5leHBvcnQgeyBjb25jYXRXaXRoIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvY29uY2F0V2l0aCc7XG5leHBvcnQgeyBjb25uZWN0IH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvY29ubmVjdCc7XG5leHBvcnQgeyBjb3VudCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2NvdW50JztcbmV4cG9ydCB7IGRlYm91bmNlIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZGVib3VuY2UnO1xuZXhwb3J0IHsgZGVib3VuY2VUaW1lIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZGVib3VuY2VUaW1lJztcbmV4cG9ydCB7IGRlZmF1bHRJZkVtcHR5IH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZGVmYXVsdElmRW1wdHknO1xuZXhwb3J0IHsgZGVsYXkgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9kZWxheSc7XG5leHBvcnQgeyBkZWxheVdoZW4gfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9kZWxheVdoZW4nO1xuZXhwb3J0IHsgZGVtYXRlcmlhbGl6ZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2RlbWF0ZXJpYWxpemUnO1xuZXhwb3J0IHsgZGlzdGluY3QgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9kaXN0aW5jdCc7XG5leHBvcnQgeyBkaXN0aW5jdFVudGlsQ2hhbmdlZCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2Rpc3RpbmN0VW50aWxDaGFuZ2VkJztcbmV4cG9ydCB7IGRpc3RpbmN0VW50aWxLZXlDaGFuZ2VkIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZGlzdGluY3RVbnRpbEtleUNoYW5nZWQnO1xuZXhwb3J0IHsgZWxlbWVudEF0IH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZWxlbWVudEF0JztcbmV4cG9ydCB7IGVuZFdpdGggfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9lbmRXaXRoJztcbmV4cG9ydCB7IGV2ZXJ5IH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZXZlcnknO1xuZXhwb3J0IHsgZXhoYXVzdCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2V4aGF1c3QnO1xuZXhwb3J0IHsgZXhoYXVzdEFsbCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2V4aGF1c3RBbGwnO1xuZXhwb3J0IHsgZXhoYXVzdE1hcCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2V4aGF1c3RNYXAnO1xuZXhwb3J0IHsgZXhwYW5kIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZXhwYW5kJztcbmV4cG9ydCB7IGZpbHRlciB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2ZpbHRlcic7XG5leHBvcnQgeyBmaW5hbGl6ZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2ZpbmFsaXplJztcbmV4cG9ydCB7IGZpbmQgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9maW5kJztcbmV4cG9ydCB7IGZpbmRJbmRleCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2ZpbmRJbmRleCc7XG5leHBvcnQgeyBmaXJzdCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2ZpcnN0JztcbmV4cG9ydCB7IGdyb3VwQnkgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9ncm91cEJ5JztcbmV4cG9ydCB7IGlnbm9yZUVsZW1lbnRzIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvaWdub3JlRWxlbWVudHMnO1xuZXhwb3J0IHsgaXNFbXB0eSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2lzRW1wdHknO1xuZXhwb3J0IHsgbGFzdCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL2xhc3QnO1xuZXhwb3J0IHsgbWFwIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvbWFwJztcbmV4cG9ydCB7IG1hcFRvIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvbWFwVG8nO1xuZXhwb3J0IHsgbWF0ZXJpYWxpemUgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9tYXRlcmlhbGl6ZSc7XG5leHBvcnQgeyBtYXggfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9tYXgnO1xuZXhwb3J0IHsgbWVyZ2VBbGwgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9tZXJnZUFsbCc7XG5leHBvcnQgeyBmbGF0TWFwIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvZmxhdE1hcCc7XG5leHBvcnQgeyBtZXJnZU1hcCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL21lcmdlTWFwJztcbmV4cG9ydCB7IG1lcmdlTWFwVG8gfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9tZXJnZU1hcFRvJztcbmV4cG9ydCB7IG1lcmdlU2NhbiB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL21lcmdlU2Nhbic7XG5leHBvcnQgeyBtZXJnZVdpdGggfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9tZXJnZVdpdGgnO1xuZXhwb3J0IHsgbWluIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvbWluJztcbmV4cG9ydCB7IG11bHRpY2FzdCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL211bHRpY2FzdCc7XG5leHBvcnQgeyBvYnNlcnZlT24gfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9vYnNlcnZlT24nO1xuZXhwb3J0IHsgcGFpcndpc2UgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9wYWlyd2lzZSc7XG5leHBvcnQgeyBwbHVjayB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3BsdWNrJztcbmV4cG9ydCB7IHB1Ymxpc2ggfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9wdWJsaXNoJztcbmV4cG9ydCB7IHB1Ymxpc2hCZWhhdmlvciB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3B1Ymxpc2hCZWhhdmlvcic7XG5leHBvcnQgeyBwdWJsaXNoTGFzdCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3B1Ymxpc2hMYXN0JztcbmV4cG9ydCB7IHB1Ymxpc2hSZXBsYXkgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9wdWJsaXNoUmVwbGF5JztcbmV4cG9ydCB7IHJhY2VXaXRoIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvcmFjZVdpdGgnO1xuZXhwb3J0IHsgcmVkdWNlIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvcmVkdWNlJztcbmV4cG9ydCB7IHJlcGVhdCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3JlcGVhdCc7XG5leHBvcnQgeyByZXBlYXRXaGVuIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvcmVwZWF0V2hlbic7XG5leHBvcnQgeyByZXRyeSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3JldHJ5JztcbmV4cG9ydCB7IHJldHJ5V2hlbiB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3JldHJ5V2hlbic7XG5leHBvcnQgeyByZWZDb3VudCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3JlZkNvdW50JztcbmV4cG9ydCB7IHNhbXBsZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3NhbXBsZSc7XG5leHBvcnQgeyBzYW1wbGVUaW1lIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc2FtcGxlVGltZSc7XG5leHBvcnQgeyBzY2FuIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc2Nhbic7XG5leHBvcnQgeyBzZXF1ZW5jZUVxdWFsIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc2VxdWVuY2VFcXVhbCc7XG5leHBvcnQgeyBzaGFyZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3NoYXJlJztcbmV4cG9ydCB7IHNoYXJlUmVwbGF5IH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc2hhcmVSZXBsYXknO1xuZXhwb3J0IHsgc2luZ2xlIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc2luZ2xlJztcbmV4cG9ydCB7IHNraXAgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9za2lwJztcbmV4cG9ydCB7IHNraXBMYXN0IH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc2tpcExhc3QnO1xuZXhwb3J0IHsgc2tpcFVudGlsIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc2tpcFVudGlsJztcbmV4cG9ydCB7IHNraXBXaGlsZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3NraXBXaGlsZSc7XG5leHBvcnQgeyBzdGFydFdpdGggfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9zdGFydFdpdGgnO1xuZXhwb3J0IHsgc3Vic2NyaWJlT24gfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9zdWJzY3JpYmVPbic7XG5leHBvcnQgeyBzd2l0Y2hBbGwgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy9zd2l0Y2hBbGwnO1xuZXhwb3J0IHsgc3dpdGNoTWFwIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc3dpdGNoTWFwJztcbmV4cG9ydCB7IHN3aXRjaE1hcFRvIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvc3dpdGNoTWFwVG8nO1xuZXhwb3J0IHsgc3dpdGNoU2NhbiB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3N3aXRjaFNjYW4nO1xuZXhwb3J0IHsgdGFrZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3Rha2UnO1xuZXhwb3J0IHsgdGFrZUxhc3QgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy90YWtlTGFzdCc7XG5leHBvcnQgeyB0YWtlVW50aWwgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy90YWtlVW50aWwnO1xuZXhwb3J0IHsgdGFrZVdoaWxlIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvdGFrZVdoaWxlJztcbmV4cG9ydCB7IHRhcCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3RhcCc7XG5leHBvcnQgeyB0aHJvdHRsZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3Rocm90dGxlJztcbmV4cG9ydCB7IHRocm90dGxlVGltZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3Rocm90dGxlVGltZSc7XG5leHBvcnQgeyB0aHJvd0lmRW1wdHkgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy90aHJvd0lmRW1wdHknO1xuZXhwb3J0IHsgdGltZUludGVydmFsIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvdGltZUludGVydmFsJztcbmV4cG9ydCB7IHRpbWVvdXQgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy90aW1lb3V0JztcbmV4cG9ydCB7IHRpbWVvdXRXaXRoIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvdGltZW91dFdpdGgnO1xuZXhwb3J0IHsgdGltZXN0YW1wIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvdGltZXN0YW1wJztcbmV4cG9ydCB7IHRvQXJyYXkgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy90b0FycmF5JztcbmV4cG9ydCB7IHdpbmRvdyB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3dpbmRvdyc7XG5leHBvcnQgeyB3aW5kb3dDb3VudCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3dpbmRvd0NvdW50JztcbmV4cG9ydCB7IHdpbmRvd1RpbWUgfSBmcm9tICcuL2ludGVybmFsL29wZXJhdG9ycy93aW5kb3dUaW1lJztcbmV4cG9ydCB7IHdpbmRvd1RvZ2dsZSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3dpbmRvd1RvZ2dsZSc7XG5leHBvcnQgeyB3aW5kb3dXaGVuIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvd2luZG93V2hlbic7XG5leHBvcnQgeyB3aXRoTGF0ZXN0RnJvbSB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3dpdGhMYXRlc3RGcm9tJztcbmV4cG9ydCB7IHppcEFsbCB9IGZyb20gJy4vaW50ZXJuYWwvb3BlcmF0b3JzL3ppcEFsbCc7XG5leHBvcnQgeyB6aXBXaXRoIH0gZnJvbSAnLi9pbnRlcm5hbC9vcGVyYXRvcnMvemlwV2l0aCc7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICcuL1N1YmplY3QnO1xudmFyIEFzeW5jU3ViamVjdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFzeW5jU3ViamVjdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBBc3luY1N1YmplY3QoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5fdmFsdWUgPSBudWxsO1xuICAgICAgICBfdGhpcy5faGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuX2lzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBc3luY1N1YmplY3QucHJvdG90eXBlLl9jaGVja0ZpbmFsaXplZFN0YXR1c2VzID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIF9hID0gdGhpcywgaGFzRXJyb3IgPSBfYS5oYXNFcnJvciwgX2hhc1ZhbHVlID0gX2EuX2hhc1ZhbHVlLCBfdmFsdWUgPSBfYS5fdmFsdWUsIHRocm93bkVycm9yID0gX2EudGhyb3duRXJyb3IsIGlzU3RvcHBlZCA9IF9hLmlzU3RvcHBlZDtcbiAgICAgICAgaWYgKGhhc0Vycm9yKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmVycm9yKHRocm93bkVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIF9oYXNWYWx1ZSAmJiBzdWJzY3JpYmVyLm5leHQoX3ZhbHVlKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQXN5bmNTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9oYXNWYWx1ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEFzeW5jU3ViamVjdC5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIF9oYXNWYWx1ZSA9IF9hLl9oYXNWYWx1ZSwgX3ZhbHVlID0gX2EuX3ZhbHVlLCBfaXNDb21wbGV0ZSA9IF9hLl9pc0NvbXBsZXRlO1xuICAgICAgICBpZiAoIV9pc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIF9oYXNWYWx1ZSAmJiBfc3VwZXIucHJvdG90eXBlLm5leHQuY2FsbCh0aGlzLCBfdmFsdWUpO1xuICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5jb21wbGV0ZS5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNTdWJqZWN0O1xufShTdWJqZWN0KSk7XG5leHBvcnQgeyBBc3luY1N1YmplY3QgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFzeW5jU3ViamVjdC5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICcuL1N1YmplY3QnO1xudmFyIEJlaGF2aW9yU3ViamVjdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEJlaGF2aW9yU3ViamVjdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBCZWhhdmlvclN1YmplY3QoX3ZhbHVlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLl92YWx1ZSA9IF92YWx1ZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQmVoYXZpb3JTdWJqZWN0LnByb3RvdHlwZSwgXCJ2YWx1ZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIEJlaGF2aW9yU3ViamVjdC5wcm90b3R5cGUuX3N1YnNjcmliZSA9IGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBfc3VwZXIucHJvdG90eXBlLl9zdWJzY3JpYmUuY2FsbCh0aGlzLCBzdWJzY3JpYmVyKTtcbiAgICAgICAgIXN1YnNjcmlwdGlvbi5jbG9zZWQgJiYgc3Vic2NyaWJlci5uZXh0KHRoaXMuX3ZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgICB9O1xuICAgIEJlaGF2aW9yU3ViamVjdC5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIGhhc0Vycm9yID0gX2EuaGFzRXJyb3IsIHRocm93bkVycm9yID0gX2EudGhyb3duRXJyb3IsIF92YWx1ZSA9IF9hLl92YWx1ZTtcbiAgICAgICAgaWYgKGhhc0Vycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyB0aHJvd25FcnJvcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgIHJldHVybiBfdmFsdWU7XG4gICAgfTtcbiAgICBCZWhhdmlvclN1YmplY3QucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5uZXh0LmNhbGwodGhpcywgKHRoaXMuX3ZhbHVlID0gdmFsdWUpKTtcbiAgICB9O1xuICAgIHJldHVybiBCZWhhdmlvclN1YmplY3Q7XG59KFN1YmplY3QpKTtcbmV4cG9ydCB7IEJlaGF2aW9yU3ViamVjdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QmVoYXZpb3JTdWJqZWN0LmpzLm1hcCIsImltcG9ydCB7IEVNUFRZIH0gZnJvbSAnLi9vYnNlcnZhYmxlL2VtcHR5JztcbmltcG9ydCB7IG9mIH0gZnJvbSAnLi9vYnNlcnZhYmxlL29mJztcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuL29ic2VydmFibGUvdGhyb3dFcnJvcic7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlsL2lzRnVuY3Rpb24nO1xuZXhwb3J0IHZhciBOb3RpZmljYXRpb25LaW5kO1xuKGZ1bmN0aW9uIChOb3RpZmljYXRpb25LaW5kKSB7XG4gICAgTm90aWZpY2F0aW9uS2luZFtcIk5FWFRcIl0gPSBcIk5cIjtcbiAgICBOb3RpZmljYXRpb25LaW5kW1wiRVJST1JcIl0gPSBcIkVcIjtcbiAgICBOb3RpZmljYXRpb25LaW5kW1wiQ09NUExFVEVcIl0gPSBcIkNcIjtcbn0pKE5vdGlmaWNhdGlvbktpbmQgfHwgKE5vdGlmaWNhdGlvbktpbmQgPSB7fSkpO1xudmFyIE5vdGlmaWNhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTm90aWZpY2F0aW9uKGtpbmQsIHZhbHVlLCBlcnJvcikge1xuICAgICAgICB0aGlzLmtpbmQgPSBraW5kO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgdGhpcy5oYXNWYWx1ZSA9IGtpbmQgPT09ICdOJztcbiAgICB9XG4gICAgTm90aWZpY2F0aW9uLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24gKG9ic2VydmVyKSB7XG4gICAgICAgIHJldHVybiBvYnNlcnZlTm90aWZpY2F0aW9uKHRoaXMsIG9ic2VydmVyKTtcbiAgICB9O1xuICAgIE5vdGlmaWNhdGlvbi5wcm90b3R5cGUuZG8gPSBmdW5jdGlvbiAobmV4dEhhbmRsZXIsIGVycm9ySGFuZGxlciwgY29tcGxldGVIYW5kbGVyKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIGtpbmQgPSBfYS5raW5kLCB2YWx1ZSA9IF9hLnZhbHVlLCBlcnJvciA9IF9hLmVycm9yO1xuICAgICAgICByZXR1cm4ga2luZCA9PT0gJ04nID8gbmV4dEhhbmRsZXIgPT09IG51bGwgfHwgbmV4dEhhbmRsZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5leHRIYW5kbGVyKHZhbHVlKSA6IGtpbmQgPT09ICdFJyA/IGVycm9ySGFuZGxlciA9PT0gbnVsbCB8fCBlcnJvckhhbmRsZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVycm9ySGFuZGxlcihlcnJvcikgOiBjb21wbGV0ZUhhbmRsZXIgPT09IG51bGwgfHwgY29tcGxldGVIYW5kbGVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjb21wbGV0ZUhhbmRsZXIoKTtcbiAgICB9O1xuICAgIE5vdGlmaWNhdGlvbi5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKG5leHRPck9ic2VydmVyLCBlcnJvciwgY29tcGxldGUpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICByZXR1cm4gaXNGdW5jdGlvbigoX2EgPSBuZXh0T3JPYnNlcnZlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm5leHQpXG4gICAgICAgICAgICA/IHRoaXMub2JzZXJ2ZShuZXh0T3JPYnNlcnZlcilcbiAgICAgICAgICAgIDogdGhpcy5kbyhuZXh0T3JPYnNlcnZlciwgZXJyb3IsIGNvbXBsZXRlKTtcbiAgICB9O1xuICAgIE5vdGlmaWNhdGlvbi5wcm90b3R5cGUudG9PYnNlcnZhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2EgPSB0aGlzLCBraW5kID0gX2Eua2luZCwgdmFsdWUgPSBfYS52YWx1ZSwgZXJyb3IgPSBfYS5lcnJvcjtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGtpbmQgPT09ICdOJ1xuICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgIG9mKHZhbHVlKVxuICAgICAgICAgICAgOlxuICAgICAgICAgICAgICAgIGtpbmQgPT09ICdFJ1xuICAgICAgICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGVycm9yOyB9KVxuICAgICAgICAgICAgICAgICAgICA6XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kID09PSAnQydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVNUFRZXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwO1xuICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuZXhwZWN0ZWQgbm90aWZpY2F0aW9uIGtpbmQgXCIgKyBraW5kKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgTm90aWZpY2F0aW9uLmNyZWF0ZU5leHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBOb3RpZmljYXRpb24oJ04nLCB2YWx1ZSk7XG4gICAgfTtcbiAgICBOb3RpZmljYXRpb24uY3JlYXRlRXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBuZXcgTm90aWZpY2F0aW9uKCdFJywgdW5kZWZpbmVkLCBlcnIpO1xuICAgIH07XG4gICAgTm90aWZpY2F0aW9uLmNyZWF0ZUNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gTm90aWZpY2F0aW9uLmNvbXBsZXRlTm90aWZpY2F0aW9uO1xuICAgIH07XG4gICAgTm90aWZpY2F0aW9uLmNvbXBsZXRlTm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbignQycpO1xuICAgIHJldHVybiBOb3RpZmljYXRpb247XG59KCkpO1xuZXhwb3J0IHsgTm90aWZpY2F0aW9uIH07XG5leHBvcnQgZnVuY3Rpb24gb2JzZXJ2ZU5vdGlmaWNhdGlvbihub3RpZmljYXRpb24sIG9ic2VydmVyKSB7XG4gICAgdmFyIF9hLCBfYiwgX2M7XG4gICAgdmFyIF9kID0gbm90aWZpY2F0aW9uLCBraW5kID0gX2Qua2luZCwgdmFsdWUgPSBfZC52YWx1ZSwgZXJyb3IgPSBfZC5lcnJvcjtcbiAgICBpZiAodHlwZW9mIGtpbmQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbm90aWZpY2F0aW9uLCBtaXNzaW5nIFwia2luZFwiJyk7XG4gICAgfVxuICAgIGtpbmQgPT09ICdOJyA/IChfYSA9IG9ic2VydmVyLm5leHQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5jYWxsKG9ic2VydmVyLCB2YWx1ZSkgOiBraW5kID09PSAnRScgPyAoX2IgPSBvYnNlcnZlci5lcnJvcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmNhbGwob2JzZXJ2ZXIsIGVycm9yKSA6IChfYyA9IG9ic2VydmVyLmNvbXBsZXRlKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuY2FsbChvYnNlcnZlcik7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Ob3RpZmljYXRpb24uanMubWFwIiwiZXhwb3J0IHZhciBDT01QTEVURV9OT1RJRklDQVRJT04gPSAoZnVuY3Rpb24gKCkgeyByZXR1cm4gY3JlYXRlTm90aWZpY2F0aW9uKCdDJywgdW5kZWZpbmVkLCB1bmRlZmluZWQpOyB9KSgpO1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yTm90aWZpY2F0aW9uKGVycm9yKSB7XG4gICAgcmV0dXJuIGNyZWF0ZU5vdGlmaWNhdGlvbignRScsIHVuZGVmaW5lZCwgZXJyb3IpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG5leHROb3RpZmljYXRpb24odmFsdWUpIHtcbiAgICByZXR1cm4gY3JlYXRlTm90aWZpY2F0aW9uKCdOJywgdmFsdWUsIHVuZGVmaW5lZCk7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uKGtpbmQsIHZhbHVlLCBlcnJvcikge1xuICAgIHJldHVybiB7XG4gICAgICAgIGtpbmQ6IGtpbmQsXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Ob3RpZmljYXRpb25GYWN0b3JpZXMuanMubWFwIiwiaW1wb3J0IHsgU2FmZVN1YnNjcmliZXIsIFN1YnNjcmliZXIgfSBmcm9tICcuL1N1YnNjcmliZXInO1xuaW1wb3J0IHsgaXNTdWJzY3JpcHRpb24gfSBmcm9tICcuL1N1YnNjcmlwdGlvbic7XG5pbXBvcnQgeyBvYnNlcnZhYmxlIGFzIFN5bWJvbF9vYnNlcnZhYmxlIH0gZnJvbSAnLi9zeW1ib2wvb2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBwaXBlRnJvbUFycmF5IH0gZnJvbSAnLi91dGlsL3BpcGUnO1xuaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4vdXRpbC9pc0Z1bmN0aW9uJztcbmltcG9ydCB7IGVycm9yQ29udGV4dCB9IGZyb20gJy4vdXRpbC9lcnJvckNvbnRleHQnO1xudmFyIE9ic2VydmFibGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE9ic2VydmFibGUoc3Vic2NyaWJlKSB7XG4gICAgICAgIGlmIChzdWJzY3JpYmUpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZSA9IHN1YnNjcmliZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5saWZ0ID0gZnVuY3Rpb24gKG9wZXJhdG9yKSB7XG4gICAgICAgIHZhciBvYnNlcnZhYmxlID0gbmV3IE9ic2VydmFibGUoKTtcbiAgICAgICAgb2JzZXJ2YWJsZS5zb3VyY2UgPSB0aGlzO1xuICAgICAgICBvYnNlcnZhYmxlLm9wZXJhdG9yID0gb3BlcmF0b3I7XG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gKG9ic2VydmVyT3JOZXh0LCBlcnJvciwgY29tcGxldGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHN1YnNjcmliZXIgPSBpc1N1YnNjcmliZXIob2JzZXJ2ZXJPck5leHQpID8gb2JzZXJ2ZXJPck5leHQgOiBuZXcgU2FmZVN1YnNjcmliZXIob2JzZXJ2ZXJPck5leHQsIGVycm9yLCBjb21wbGV0ZSk7XG4gICAgICAgIGVycm9yQ29udGV4dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSBfdGhpcywgb3BlcmF0b3IgPSBfYS5vcGVyYXRvciwgc291cmNlID0gX2Euc291cmNlO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5hZGQob3BlcmF0b3JcbiAgICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yLmNhbGwoc3Vic2NyaWJlciwgc291cmNlKVxuICAgICAgICAgICAgICAgIDogc291cmNlXG4gICAgICAgICAgICAgICAgICAgID9cbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9zdWJzY3JpYmUoc3Vic2NyaWJlcilcbiAgICAgICAgICAgICAgICAgICAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3RyeVN1YnNjcmliZShzdWJzY3JpYmVyKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3Vic2NyaWJlcjtcbiAgICB9O1xuICAgIE9ic2VydmFibGUucHJvdG90eXBlLl90cnlTdWJzY3JpYmUgPSBmdW5jdGlvbiAoc2luaykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N1YnNjcmliZShzaW5rKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzaW5rLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE9ic2VydmFibGUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAobmV4dCwgcHJvbWlzZUN0b3IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgcHJvbWlzZUN0b3IgPSBnZXRQcm9taXNlQ3Rvcihwcm9taXNlQ3Rvcik7XG4gICAgICAgIHJldHVybiBuZXcgcHJvbWlzZUN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbjtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IF90aGlzLnN1YnNjcmliZShmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uID09PSBudWxsIHx8IHN1YnNjcmlwdGlvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgcmVqZWN0LCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICByZXR1cm4gKF9hID0gdGhpcy5zb3VyY2UpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfTtcbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZVtTeW1ib2xfb2JzZXJ2YWJsZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUucGlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIG9wZXJhdGlvbnNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3BlcmF0aW9ucy5sZW5ndGggPyBwaXBlRnJvbUFycmF5KG9wZXJhdGlvbnMpKHRoaXMpIDogdGhpcztcbiAgICB9O1xuICAgIE9ic2VydmFibGUucHJvdG90eXBlLnRvUHJvbWlzZSA9IGZ1bmN0aW9uIChwcm9taXNlQ3Rvcikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBwcm9taXNlQ3RvciA9IGdldFByb21pc2VDdG9yKHByb21pc2VDdG9yKTtcbiAgICAgICAgcmV0dXJuIG5ldyBwcm9taXNlQ3RvcihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgdmFsdWU7XG4gICAgICAgICAgICBfdGhpcy5zdWJzY3JpYmUoZnVuY3Rpb24gKHgpIHsgcmV0dXJuICh2YWx1ZSA9IHgpOyB9LCBmdW5jdGlvbiAoZXJyKSB7IHJldHVybiByZWplY3QoZXJyKTsgfSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVzb2x2ZSh2YWx1ZSk7IH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIE9ic2VydmFibGUuY3JlYXRlID0gZnVuY3Rpb24gKHN1YnNjcmliZSkge1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoc3Vic2NyaWJlKTtcbiAgICB9O1xuICAgIHJldHVybiBPYnNlcnZhYmxlO1xufSgpKTtcbmV4cG9ydCB7IE9ic2VydmFibGUgfTtcbmZ1bmN0aW9uIGdldFByb21pc2VDdG9yKHByb21pc2VDdG9yKSB7XG4gICAgdmFyIF9hO1xuICAgIHJldHVybiAoX2EgPSBwcm9taXNlQ3RvciAhPT0gbnVsbCAmJiBwcm9taXNlQ3RvciAhPT0gdm9pZCAwID8gcHJvbWlzZUN0b3IgOiBjb25maWcuUHJvbWlzZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogUHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGlzT2JzZXJ2ZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgaXNGdW5jdGlvbih2YWx1ZS5uZXh0KSAmJiBpc0Z1bmN0aW9uKHZhbHVlLmVycm9yKSAmJiBpc0Z1bmN0aW9uKHZhbHVlLmNvbXBsZXRlKTtcbn1cbmZ1bmN0aW9uIGlzU3Vic2NyaWJlcih2YWx1ZSkge1xuICAgIHJldHVybiAodmFsdWUgJiYgdmFsdWUgaW5zdGFuY2VvZiBTdWJzY3JpYmVyKSB8fCAoaXNPYnNlcnZlcih2YWx1ZSkgJiYgaXNTdWJzY3JpcHRpb24odmFsdWUpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU9ic2VydmFibGUuanMubWFwIiwiaW1wb3J0IHsgX19leHRlbmRzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAnLi9TdWJqZWN0JztcbmltcG9ydCB7IGRhdGVUaW1lc3RhbXBQcm92aWRlciB9IGZyb20gJy4vc2NoZWR1bGVyL2RhdGVUaW1lc3RhbXBQcm92aWRlcic7XG52YXIgUmVwbGF5U3ViamVjdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFJlcGxheVN1YmplY3QsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gUmVwbGF5U3ViamVjdChfYnVmZmVyU2l6ZSwgX3dpbmRvd1RpbWUsIF90aW1lc3RhbXBQcm92aWRlcikge1xuICAgICAgICBpZiAoX2J1ZmZlclNpemUgPT09IHZvaWQgMCkgeyBfYnVmZmVyU2l6ZSA9IEluZmluaXR5OyB9XG4gICAgICAgIGlmIChfd2luZG93VGltZSA9PT0gdm9pZCAwKSB7IF93aW5kb3dUaW1lID0gSW5maW5pdHk7IH1cbiAgICAgICAgaWYgKF90aW1lc3RhbXBQcm92aWRlciA9PT0gdm9pZCAwKSB7IF90aW1lc3RhbXBQcm92aWRlciA9IGRhdGVUaW1lc3RhbXBQcm92aWRlcjsgfVxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5fYnVmZmVyU2l6ZSA9IF9idWZmZXJTaXplO1xuICAgICAgICBfdGhpcy5fd2luZG93VGltZSA9IF93aW5kb3dUaW1lO1xuICAgICAgICBfdGhpcy5fdGltZXN0YW1wUHJvdmlkZXIgPSBfdGltZXN0YW1wUHJvdmlkZXI7XG4gICAgICAgIF90aGlzLl9idWZmZXIgPSBbXTtcbiAgICAgICAgX3RoaXMuX2luZmluaXRlVGltZVdpbmRvdyA9IHRydWU7XG4gICAgICAgIF90aGlzLl9pbmZpbml0ZVRpbWVXaW5kb3cgPSBfd2luZG93VGltZSA9PT0gSW5maW5pdHk7XG4gICAgICAgIF90aGlzLl9idWZmZXJTaXplID0gTWF0aC5tYXgoMSwgX2J1ZmZlclNpemUpO1xuICAgICAgICBfdGhpcy5fd2luZG93VGltZSA9IE1hdGgubWF4KDEsIF93aW5kb3dUaW1lKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBSZXBsYXlTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIGlzU3RvcHBlZCA9IF9hLmlzU3RvcHBlZCwgX2J1ZmZlciA9IF9hLl9idWZmZXIsIF9pbmZpbml0ZVRpbWVXaW5kb3cgPSBfYS5faW5maW5pdGVUaW1lV2luZG93LCBfdGltZXN0YW1wUHJvdmlkZXIgPSBfYS5fdGltZXN0YW1wUHJvdmlkZXIsIF93aW5kb3dUaW1lID0gX2EuX3dpbmRvd1RpbWU7XG4gICAgICAgIGlmICghaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICBfYnVmZmVyLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgIV9pbmZpbml0ZVRpbWVXaW5kb3cgJiYgX2J1ZmZlci5wdXNoKF90aW1lc3RhbXBQcm92aWRlci5ub3coKSArIF93aW5kb3dUaW1lKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl90cmltQnVmZmVyKCk7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUubmV4dC5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICB9O1xuICAgIFJlcGxheVN1YmplY3QucHJvdG90eXBlLl9zdWJzY3JpYmUgPSBmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICB0aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgIHRoaXMuX3RyaW1CdWZmZXIoKTtcbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IHRoaXMuX2lubmVyU3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgICB2YXIgX2EgPSB0aGlzLCBfaW5maW5pdGVUaW1lV2luZG93ID0gX2EuX2luZmluaXRlVGltZVdpbmRvdywgX2J1ZmZlciA9IF9hLl9idWZmZXI7XG4gICAgICAgIHZhciBjb3B5ID0gX2J1ZmZlci5zbGljZSgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcHkubGVuZ3RoICYmICFzdWJzY3JpYmVyLmNsb3NlZDsgaSArPSBfaW5maW5pdGVUaW1lV2luZG93ID8gMSA6IDIpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChjb3B5W2ldKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jaGVja0ZpbmFsaXplZFN0YXR1c2VzKHN1YnNjcmliZXIpO1xuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICAgIH07XG4gICAgUmVwbGF5U3ViamVjdC5wcm90b3R5cGUuX3RyaW1CdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIF9idWZmZXJTaXplID0gX2EuX2J1ZmZlclNpemUsIF90aW1lc3RhbXBQcm92aWRlciA9IF9hLl90aW1lc3RhbXBQcm92aWRlciwgX2J1ZmZlciA9IF9hLl9idWZmZXIsIF9pbmZpbml0ZVRpbWVXaW5kb3cgPSBfYS5faW5maW5pdGVUaW1lV2luZG93O1xuICAgICAgICB2YXIgYWRqdXN0ZWRCdWZmZXJTaXplID0gKF9pbmZpbml0ZVRpbWVXaW5kb3cgPyAxIDogMikgKiBfYnVmZmVyU2l6ZTtcbiAgICAgICAgX2J1ZmZlclNpemUgPCBJbmZpbml0eSAmJiBhZGp1c3RlZEJ1ZmZlclNpemUgPCBfYnVmZmVyLmxlbmd0aCAmJiBfYnVmZmVyLnNwbGljZSgwLCBfYnVmZmVyLmxlbmd0aCAtIGFkanVzdGVkQnVmZmVyU2l6ZSk7XG4gICAgICAgIGlmICghX2luZmluaXRlVGltZVdpbmRvdykge1xuICAgICAgICAgICAgdmFyIG5vdyA9IF90aW1lc3RhbXBQcm92aWRlci5ub3coKTtcbiAgICAgICAgICAgIHZhciBsYXN0ID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgX2J1ZmZlci5sZW5ndGggJiYgX2J1ZmZlcltpXSA8PSBub3c7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgIGxhc3QgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdCAmJiBfYnVmZmVyLnNwbGljZSgwLCBsYXN0ICsgMSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBSZXBsYXlTdWJqZWN0O1xufShTdWJqZWN0KSk7XG5leHBvcnQgeyBSZXBsYXlTdWJqZWN0IH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1SZXBsYXlTdWJqZWN0LmpzLm1hcCIsImltcG9ydCB7IGRhdGVUaW1lc3RhbXBQcm92aWRlciB9IGZyb20gJy4vc2NoZWR1bGVyL2RhdGVUaW1lc3RhbXBQcm92aWRlcic7XG52YXIgU2NoZWR1bGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTY2hlZHVsZXIoc2NoZWR1bGVyQWN0aW9uQ3Rvciwgbm93KSB7XG4gICAgICAgIGlmIChub3cgPT09IHZvaWQgMCkgeyBub3cgPSBTY2hlZHVsZXIubm93OyB9XG4gICAgICAgIHRoaXMuc2NoZWR1bGVyQWN0aW9uQ3RvciA9IHNjaGVkdWxlckFjdGlvbkN0b3I7XG4gICAgICAgIHRoaXMubm93ID0gbm93O1xuICAgIH1cbiAgICBTY2hlZHVsZXIucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKHdvcmssIGRlbGF5LCBzdGF0ZSkge1xuICAgICAgICBpZiAoZGVsYXkgPT09IHZvaWQgMCkgeyBkZWxheSA9IDA7IH1cbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLnNjaGVkdWxlckFjdGlvbkN0b3IodGhpcywgd29yaykuc2NoZWR1bGUoc3RhdGUsIGRlbGF5KTtcbiAgICB9O1xuICAgIFNjaGVkdWxlci5ub3cgPSBkYXRlVGltZXN0YW1wUHJvdmlkZXIubm93O1xuICAgIHJldHVybiBTY2hlZHVsZXI7XG59KCkpO1xuZXhwb3J0IHsgU2NoZWR1bGVyIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TY2hlZHVsZXIuanMubWFwIiwiaW1wb3J0IHsgX19leHRlbmRzLCBfX3ZhbHVlcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24sIEVNUFRZX1NVQlNDUklQVElPTiB9IGZyb20gJy4vU3Vic2NyaXB0aW9uJztcbmltcG9ydCB7IE9iamVjdFVuc3Vic2NyaWJlZEVycm9yIH0gZnJvbSAnLi91dGlsL09iamVjdFVuc3Vic2NyaWJlZEVycm9yJztcbmltcG9ydCB7IGFyclJlbW92ZSB9IGZyb20gJy4vdXRpbC9hcnJSZW1vdmUnO1xuaW1wb3J0IHsgZXJyb3JDb250ZXh0IH0gZnJvbSAnLi91dGlsL2Vycm9yQ29udGV4dCc7XG52YXIgU3ViamVjdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFN1YmplY3QsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU3ViamVjdCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuY2xvc2VkID0gZmFsc2U7XG4gICAgICAgIF90aGlzLm9ic2VydmVycyA9IFtdO1xuICAgICAgICBfdGhpcy5pc1N0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuaGFzRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMudGhyb3duRXJyb3IgPSBudWxsO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFN1YmplY3QucHJvdG90eXBlLmxpZnQgPSBmdW5jdGlvbiAob3BlcmF0b3IpIHtcbiAgICAgICAgdmFyIHN1YmplY3QgPSBuZXcgQW5vbnltb3VzU3ViamVjdCh0aGlzLCB0aGlzKTtcbiAgICAgICAgc3ViamVjdC5vcGVyYXRvciA9IG9wZXJhdG9yO1xuICAgICAgICByZXR1cm4gc3ViamVjdDtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLl90aHJvd0lmQ2xvc2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBPYmplY3RVbnN1YnNjcmliZWRFcnJvcigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGVycm9yQ29udGV4dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIF90aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIHZhciBjb3B5ID0gX3RoaXMub2JzZXJ2ZXJzLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgY29weV8xID0gX192YWx1ZXMoY29weSksIGNvcHlfMV8xID0gY29weV8xLm5leHQoKTsgIWNvcHlfMV8xLmRvbmU7IGNvcHlfMV8xID0gY29weV8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9ic2VydmVyID0gY29weV8xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvcHlfMV8xICYmICFjb3B5XzFfMS5kb25lICYmIChfYSA9IGNvcHlfMS5yZXR1cm4pKSBfYS5jYWxsKGNvcHlfMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgZXJyb3JDb250ZXh0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLl90aHJvd0lmQ2xvc2VkKCk7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmhhc0Vycm9yID0gX3RoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfdGhpcy50aHJvd25FcnJvciA9IGVycjtcbiAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gX3RoaXMub2JzZXJ2ZXJzO1xuICAgICAgICAgICAgICAgIHdoaWxlIChvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVycy5zaGlmdCgpLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBlcnJvckNvbnRleHQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuX3Rocm93SWZDbG9zZWQoKTtcbiAgICAgICAgICAgIGlmICghX3RoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gX3RoaXMub2JzZXJ2ZXJzO1xuICAgICAgICAgICAgICAgIHdoaWxlIChvYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVycy5zaGlmdCgpLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFN1YmplY3QucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzU3RvcHBlZCA9IHRoaXMuY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSBudWxsO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN1YmplY3QucHJvdG90eXBlLCBcIm9ic2VydmVkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICByZXR1cm4gKChfYSA9IHRoaXMub2JzZXJ2ZXJzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubGVuZ3RoKSA+IDA7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dJZkNsb3NlZCgpO1xuICAgICAgICByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS5fdHJ5U3Vic2NyaWJlLmNhbGwodGhpcywgc3Vic2NyaWJlcik7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdGhpcy5fdGhyb3dJZkNsb3NlZCgpO1xuICAgICAgICB0aGlzLl9jaGVja0ZpbmFsaXplZFN0YXR1c2VzKHN1YnNjcmliZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5faW5uZXJTdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5faW5uZXJTdWJzY3JpYmUgPSBmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgX2EgPSB0aGlzLCBoYXNFcnJvciA9IF9hLmhhc0Vycm9yLCBpc1N0b3BwZWQgPSBfYS5pc1N0b3BwZWQsIG9ic2VydmVycyA9IF9hLm9ic2VydmVycztcbiAgICAgICAgcmV0dXJuIGhhc0Vycm9yIHx8IGlzU3RvcHBlZFxuICAgICAgICAgICAgPyBFTVBUWV9TVUJTQ1JJUFRJT05cbiAgICAgICAgICAgIDogKG9ic2VydmVycy5wdXNoKHN1YnNjcmliZXIpLCBuZXcgU3Vic2NyaXB0aW9uKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyclJlbW92ZShvYnNlcnZlcnMsIHN1YnNjcmliZXIpOyB9KSk7XG4gICAgfTtcbiAgICBTdWJqZWN0LnByb3RvdHlwZS5fY2hlY2tGaW5hbGl6ZWRTdGF0dXNlcyA9IGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBfYSA9IHRoaXMsIGhhc0Vycm9yID0gX2EuaGFzRXJyb3IsIHRocm93bkVycm9yID0gX2EudGhyb3duRXJyb3IsIGlzU3RvcHBlZCA9IF9hLmlzU3RvcHBlZDtcbiAgICAgICAgaWYgKGhhc0Vycm9yKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmVycm9yKHRocm93bkVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3ViamVjdC5wcm90b3R5cGUuYXNPYnNlcnZhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICAgIG9ic2VydmFibGUuc291cmNlID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGU7XG4gICAgfTtcbiAgICBTdWJqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uIChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgQW5vbnltb3VzU3ViamVjdChkZXN0aW5hdGlvbiwgc291cmNlKTtcbiAgICB9O1xuICAgIHJldHVybiBTdWJqZWN0O1xufShPYnNlcnZhYmxlKSk7XG5leHBvcnQgeyBTdWJqZWN0IH07XG52YXIgQW5vbnltb3VzU3ViamVjdCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFub255bW91c1N1YmplY3QsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQW5vbnltb3VzU3ViamVjdChkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XG4gICAgICAgIF90aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIChfYiA9IChfYSA9IHRoaXMuZGVzdGluYXRpb24pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5uZXh0KSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSwgdmFsdWUpO1xuICAgIH07XG4gICAgQW5vbnltb3VzU3ViamVjdC5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIChfYiA9IChfYSA9IHRoaXMuZGVzdGluYXRpb24pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5lcnJvcikgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmNhbGwoX2EsIGVycik7XG4gICAgfTtcbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgKF9iID0gKF9hID0gdGhpcy5kZXN0aW5hdGlvbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNvbXBsZXRlKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbChfYSk7XG4gICAgfTtcbiAgICBBbm9ueW1vdXNTdWJqZWN0LnByb3RvdHlwZS5fc3Vic2NyaWJlID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIF9hLCBfYjtcbiAgICAgICAgcmV0dXJuIChfYiA9IChfYSA9IHRoaXMuc291cmNlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3Vic2NyaWJlKHN1YnNjcmliZXIpKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBFTVBUWV9TVUJTQ1JJUFRJT047XG4gICAgfTtcbiAgICByZXR1cm4gQW5vbnltb3VzU3ViamVjdDtcbn0oU3ViamVjdCkpO1xuZXhwb3J0IHsgQW5vbnltb3VzU3ViamVjdCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U3ViamVjdC5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMsIF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4vdXRpbC9pc0Z1bmN0aW9uJztcbmltcG9ydCB7IGlzU3Vic2NyaXB0aW9uLCBTdWJzY3JpcHRpb24gfSBmcm9tICcuL1N1YnNjcmlwdGlvbic7XG5pbXBvcnQgeyBjb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyByZXBvcnRVbmhhbmRsZWRFcnJvciB9IGZyb20gJy4vdXRpbC9yZXBvcnRVbmhhbmRsZWRFcnJvcic7XG5pbXBvcnQgeyBub29wIH0gZnJvbSAnLi91dGlsL25vb3AnO1xuaW1wb3J0IHsgbmV4dE5vdGlmaWNhdGlvbiwgZXJyb3JOb3RpZmljYXRpb24sIENPTVBMRVRFX05PVElGSUNBVElPTiB9IGZyb20gJy4vTm90aWZpY2F0aW9uRmFjdG9yaWVzJztcbmltcG9ydCB7IHRpbWVvdXRQcm92aWRlciB9IGZyb20gJy4vc2NoZWR1bGVyL3RpbWVvdXRQcm92aWRlcic7XG5pbXBvcnQgeyBjYXB0dXJlRXJyb3IgfSBmcm9tICcuL3V0aWwvZXJyb3JDb250ZXh0JztcbnZhciBTdWJzY3JpYmVyID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU3Vic2NyaWJlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTdWJzY3JpYmVyKGRlc3RpbmF0aW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmlzU3RvcHBlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoZGVzdGluYXRpb24pIHtcbiAgICAgICAgICAgIF90aGlzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XG4gICAgICAgICAgICBpZiAoaXNTdWJzY3JpcHRpb24oZGVzdGluYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24uYWRkKF90aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLmRlc3RpbmF0aW9uID0gRU1QVFlfT0JTRVJWRVI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBTdWJzY3JpYmVyLmNyZWF0ZSA9IGZ1bmN0aW9uIChuZXh0LCBlcnJvciwgY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTYWZlU3Vic2NyaWJlcihuZXh0LCBlcnJvciwgY29tcGxldGUpO1xuICAgIH07XG4gICAgU3Vic2NyaWJlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5pc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIGhhbmRsZVN0b3BwZWROb3RpZmljYXRpb24obmV4dE5vdGlmaWNhdGlvbih2YWx1ZSksIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbmV4dCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmliZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZiAodGhpcy5pc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIGhhbmRsZVN0b3BwZWROb3RpZmljYXRpb24oZXJyb3JOb3RpZmljYXRpb24oZXJyKSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzU3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTdG9wcGVkKSB7XG4gICAgICAgICAgICBoYW5kbGVTdG9wcGVkTm90aWZpY2F0aW9uKENPTVBMRVRFX05PVElGSUNBVElPTiwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzU3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNsb3NlZCkge1xuICAgICAgICAgICAgdGhpcy5pc1N0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS51bnN1YnNjcmliZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmliZXIucHJvdG90eXBlLl9uZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGVzdGluYXRpb24ubmV4dCh2YWx1ZSk7XG4gICAgfTtcbiAgICBTdWJzY3JpYmVyLnByb3RvdHlwZS5fZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmRlc3RpbmF0aW9uLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmliZXIucHJvdG90eXBlLl9jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuZGVzdGluYXRpb24uY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIFN1YnNjcmliZXI7XG59KFN1YnNjcmlwdGlvbikpO1xuZXhwb3J0IHsgU3Vic2NyaWJlciB9O1xudmFyIFNhZmVTdWJzY3JpYmVyID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU2FmZVN1YnNjcmliZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2FmZVN1YnNjcmliZXIob2JzZXJ2ZXJPck5leHQsIGVycm9yLCBjb21wbGV0ZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICB2YXIgbmV4dDtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24ob2JzZXJ2ZXJPck5leHQpKSB7XG4gICAgICAgICAgICBuZXh0ID0gb2JzZXJ2ZXJPck5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JzZXJ2ZXJPck5leHQpIHtcbiAgICAgICAgICAgIChuZXh0ID0gb2JzZXJ2ZXJPck5leHQubmV4dCwgZXJyb3IgPSBvYnNlcnZlck9yTmV4dC5lcnJvciwgY29tcGxldGUgPSBvYnNlcnZlck9yTmV4dC5jb21wbGV0ZSk7XG4gICAgICAgICAgICB2YXIgY29udGV4dF8xO1xuICAgICAgICAgICAgaWYgKF90aGlzICYmIGNvbmZpZy51c2VEZXByZWNhdGVkTmV4dENvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0XzEgPSBPYmplY3QuY3JlYXRlKG9ic2VydmVyT3JOZXh0KTtcbiAgICAgICAgICAgICAgICBjb250ZXh0XzEudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy51bnN1YnNjcmliZSgpOyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dF8xID0gb2JzZXJ2ZXJPck5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXh0ID0gbmV4dCA9PT0gbnVsbCB8fCBuZXh0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBuZXh0LmJpbmQoY29udGV4dF8xKTtcbiAgICAgICAgICAgIGVycm9yID0gZXJyb3IgPT09IG51bGwgfHwgZXJyb3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVycm9yLmJpbmQoY29udGV4dF8xKTtcbiAgICAgICAgICAgIGNvbXBsZXRlID0gY29tcGxldGUgPT09IG51bGwgfHwgY29tcGxldGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNvbXBsZXRlLmJpbmQoY29udGV4dF8xKTtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy5kZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICAgIG5leHQ6IG5leHQgPyB3cmFwRm9yRXJyb3JIYW5kbGluZyhuZXh0LCBfdGhpcykgOiBub29wLFxuICAgICAgICAgICAgZXJyb3I6IHdyYXBGb3JFcnJvckhhbmRsaW5nKGVycm9yICE9PSBudWxsICYmIGVycm9yICE9PSB2b2lkIDAgPyBlcnJvciA6IGRlZmF1bHRFcnJvckhhbmRsZXIsIF90aGlzKSxcbiAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSA/IHdyYXBGb3JFcnJvckhhbmRsaW5nKGNvbXBsZXRlLCBfdGhpcykgOiBub29wLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIHJldHVybiBTYWZlU3Vic2NyaWJlcjtcbn0oU3Vic2NyaWJlcikpO1xuZXhwb3J0IHsgU2FmZVN1YnNjcmliZXIgfTtcbmZ1bmN0aW9uIHdyYXBGb3JFcnJvckhhbmRsaW5nKGhhbmRsZXIsIGluc3RhbmNlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhcmdzKSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChjb25maWcudXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZykge1xuICAgICAgICAgICAgICAgIGNhcHR1cmVFcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVwb3J0VW5oYW5kbGVkRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBkZWZhdWx0RXJyb3JIYW5kbGVyKGVycikge1xuICAgIHRocm93IGVycjtcbn1cbmZ1bmN0aW9uIGhhbmRsZVN0b3BwZWROb3RpZmljYXRpb24obm90aWZpY2F0aW9uLCBzdWJzY3JpYmVyKSB7XG4gICAgdmFyIG9uU3RvcHBlZE5vdGlmaWNhdGlvbiA9IGNvbmZpZy5vblN0b3BwZWROb3RpZmljYXRpb247XG4gICAgb25TdG9wcGVkTm90aWZpY2F0aW9uICYmIHRpbWVvdXRQcm92aWRlci5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9uU3RvcHBlZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb24sIHN1YnNjcmliZXIpOyB9KTtcbn1cbmV4cG9ydCB2YXIgRU1QVFlfT0JTRVJWRVIgPSB7XG4gICAgY2xvc2VkOiB0cnVlLFxuICAgIG5leHQ6IG5vb3AsXG4gICAgZXJyb3I6IGRlZmF1bHRFcnJvckhhbmRsZXIsXG4gICAgY29tcGxldGU6IG5vb3AsXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U3Vic2NyaWJlci5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXksIF9fdmFsdWVzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnLi91dGlsL2lzRnVuY3Rpb24nO1xuaW1wb3J0IHsgVW5zdWJzY3JpcHRpb25FcnJvciB9IGZyb20gJy4vdXRpbC9VbnN1YnNjcmlwdGlvbkVycm9yJztcbmltcG9ydCB7IGFyclJlbW92ZSB9IGZyb20gJy4vdXRpbC9hcnJSZW1vdmUnO1xudmFyIFN1YnNjcmlwdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3Vic2NyaXB0aW9uKGluaXRpYWxUZWFyZG93bikge1xuICAgICAgICB0aGlzLmluaXRpYWxUZWFyZG93biA9IGluaXRpYWxUZWFyZG93bjtcbiAgICAgICAgdGhpcy5jbG9zZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdGVhcmRvd25zID0gbnVsbDtcbiAgICB9XG4gICAgU3Vic2NyaXB0aW9uLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVfMSwgX2EsIGVfMiwgX2I7XG4gICAgICAgIHZhciBlcnJvcnM7XG4gICAgICAgIGlmICghdGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfcGFyZW50YWdlID0gdGhpcy5fcGFyZW50YWdlO1xuICAgICAgICAgICAgaWYgKF9wYXJlbnRhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJlbnRhZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KF9wYXJlbnRhZ2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfcGFyZW50YWdlXzEgPSBfX3ZhbHVlcyhfcGFyZW50YWdlKSwgX3BhcmVudGFnZV8xXzEgPSBfcGFyZW50YWdlXzEubmV4dCgpOyAhX3BhcmVudGFnZV8xXzEuZG9uZTsgX3BhcmVudGFnZV8xXzEgPSBfcGFyZW50YWdlXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudF8xID0gX3BhcmVudGFnZV8xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50XzEucmVtb3ZlKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3BhcmVudGFnZV8xXzEgJiYgIV9wYXJlbnRhZ2VfMV8xLmRvbmUgJiYgKF9hID0gX3BhcmVudGFnZV8xLnJldHVybikpIF9hLmNhbGwoX3BhcmVudGFnZV8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3BhcmVudGFnZS5yZW1vdmUodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGluaXRpYWxUZWFyZG93biA9IHRoaXMuaW5pdGlhbFRlYXJkb3duO1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oaW5pdGlhbFRlYXJkb3duKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxUZWFyZG93bigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcnMgPSBlIGluc3RhbmNlb2YgVW5zdWJzY3JpcHRpb25FcnJvciA/IGUuZXJyb3JzIDogW2VdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfdGVhcmRvd25zID0gdGhpcy5fdGVhcmRvd25zO1xuICAgICAgICAgICAgaWYgKF90ZWFyZG93bnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90ZWFyZG93bnMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF90ZWFyZG93bnNfMSA9IF9fdmFsdWVzKF90ZWFyZG93bnMpLCBfdGVhcmRvd25zXzFfMSA9IF90ZWFyZG93bnNfMS5uZXh0KCk7ICFfdGVhcmRvd25zXzFfMS5kb25lOyBfdGVhcmRvd25zXzFfMSA9IF90ZWFyZG93bnNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZWFyZG93bl8xID0gX3RlYXJkb3duc18xXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWNUZWFyZG93bih0ZWFyZG93bl8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgPSBlcnJvcnMgIT09IG51bGwgJiYgZXJyb3JzICE9PSB2b2lkIDAgPyBlcnJvcnMgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVW5zdWJzY3JpcHRpb25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgPSBfX3NwcmVhZEFycmF5KF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChlcnJvcnMpKSwgX19yZWFkKGVyci5lcnJvcnMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlXzJfMSkgeyBlXzIgPSB7IGVycm9yOiBlXzJfMSB9OyB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RlYXJkb3duc18xXzEgJiYgIV90ZWFyZG93bnNfMV8xLmRvbmUgJiYgKF9iID0gX3RlYXJkb3duc18xLnJldHVybikpIF9iLmNhbGwoX3RlYXJkb3duc18xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVycm9ycykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBVbnN1YnNjcmlwdGlvbkVycm9yKGVycm9ycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmlwdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHRlYXJkb3duKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgaWYgKHRlYXJkb3duICYmIHRlYXJkb3duICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgICBleGVjVGVhcmRvd24odGVhcmRvd24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRlYXJkb3duIGluc3RhbmNlb2YgU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZWFyZG93bi5jbG9zZWQgfHwgdGVhcmRvd24uX2hhc1BhcmVudCh0aGlzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRlYXJkb3duLl9hZGRQYXJlbnQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICh0aGlzLl90ZWFyZG93bnMgPSAoX2EgPSB0aGlzLl90ZWFyZG93bnMpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFtdKS5wdXNoKHRlYXJkb3duKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5faGFzUGFyZW50ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICB2YXIgX3BhcmVudGFnZSA9IHRoaXMuX3BhcmVudGFnZTtcbiAgICAgICAgcmV0dXJuIF9wYXJlbnRhZ2UgPT09IHBhcmVudCB8fCAoQXJyYXkuaXNBcnJheShfcGFyZW50YWdlKSAmJiBfcGFyZW50YWdlLmluY2x1ZGVzKHBhcmVudCkpO1xuICAgIH07XG4gICAgU3Vic2NyaXB0aW9uLnByb3RvdHlwZS5fYWRkUGFyZW50ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICB2YXIgX3BhcmVudGFnZSA9IHRoaXMuX3BhcmVudGFnZTtcbiAgICAgICAgdGhpcy5fcGFyZW50YWdlID0gQXJyYXkuaXNBcnJheShfcGFyZW50YWdlKSA/IChfcGFyZW50YWdlLnB1c2gocGFyZW50KSwgX3BhcmVudGFnZSkgOiBfcGFyZW50YWdlID8gW19wYXJlbnRhZ2UsIHBhcmVudF0gOiBwYXJlbnQ7XG4gICAgfTtcbiAgICBTdWJzY3JpcHRpb24ucHJvdG90eXBlLl9yZW1vdmVQYXJlbnQgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gICAgICAgIHZhciBfcGFyZW50YWdlID0gdGhpcy5fcGFyZW50YWdlO1xuICAgICAgICBpZiAoX3BhcmVudGFnZSA9PT0gcGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnRhZ2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoX3BhcmVudGFnZSkpIHtcbiAgICAgICAgICAgIGFyclJlbW92ZShfcGFyZW50YWdlLCBwYXJlbnQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdWJzY3JpcHRpb24ucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICh0ZWFyZG93bikge1xuICAgICAgICB2YXIgX3RlYXJkb3ducyA9IHRoaXMuX3RlYXJkb3ducztcbiAgICAgICAgX3RlYXJkb3ducyAmJiBhcnJSZW1vdmUoX3RlYXJkb3ducywgdGVhcmRvd24pO1xuICAgICAgICBpZiAodGVhcmRvd24gaW5zdGFuY2VvZiBTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRlYXJkb3duLl9yZW1vdmVQYXJlbnQodGhpcyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN1YnNjcmlwdGlvbi5FTVBUWSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBlbXB0eSA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgZW1wdHkuY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGVtcHR5O1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIFN1YnNjcmlwdGlvbjtcbn0oKSk7XG5leHBvcnQgeyBTdWJzY3JpcHRpb24gfTtcbmV4cG9ydCB2YXIgRU1QVFlfU1VCU0NSSVBUSU9OID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3Vic2NyaXB0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuICh2YWx1ZSBpbnN0YW5jZW9mIFN1YnNjcmlwdGlvbiB8fFxuICAgICAgICAodmFsdWUgJiYgJ2Nsb3NlZCcgaW4gdmFsdWUgJiYgaXNGdW5jdGlvbih2YWx1ZS5yZW1vdmUpICYmIGlzRnVuY3Rpb24odmFsdWUuYWRkKSAmJiBpc0Z1bmN0aW9uKHZhbHVlLnVuc3Vic2NyaWJlKSkpO1xufVxuZnVuY3Rpb24gZXhlY1RlYXJkb3duKHRlYXJkb3duKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odGVhcmRvd24pKSB7XG4gICAgICAgIHRlYXJkb3duKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0ZWFyZG93bi51bnN1YnNjcmliZSgpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVN1YnNjcmlwdGlvbi5qcy5tYXAiLCJleHBvcnQgdmFyIGNvbmZpZyA9IHtcbiAgICBvblVuaGFuZGxlZEVycm9yOiBudWxsLFxuICAgIG9uU3RvcHBlZE5vdGlmaWNhdGlvbjogbnVsbCxcbiAgICBQcm9taXNlOiB1bmRlZmluZWQsXG4gICAgdXNlRGVwcmVjYXRlZFN5bmNocm9ub3VzRXJyb3JIYW5kbGluZzogZmFsc2UsXG4gICAgdXNlRGVwcmVjYXRlZE5leHRDb250ZXh0OiBmYWxzZSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25maWcuanMubWFwIiwiaW1wb3J0IHsgRW1wdHlFcnJvciB9IGZyb20gJy4vdXRpbC9FbXB0eUVycm9yJztcbmltcG9ydCB7IFNhZmVTdWJzY3JpYmVyIH0gZnJvbSAnLi9TdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBmaXJzdFZhbHVlRnJvbShzb3VyY2UsIGNvbmZpZykge1xuICAgIHZhciBoYXNDb25maWcgPSB0eXBlb2YgY29uZmlnID09PSAnb2JqZWN0JztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgc3Vic2NyaWJlciA9IG5ldyBTYWZlU3Vic2NyaWJlcih7XG4gICAgICAgICAgICBuZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IHJlamVjdCxcbiAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc0NvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNvbmZpZy5kZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFbXB0eUVycm9yKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Zmlyc3RWYWx1ZUZyb20uanMubWFwIiwiaW1wb3J0IHsgRW1wdHlFcnJvciB9IGZyb20gJy4vdXRpbC9FbXB0eUVycm9yJztcbmV4cG9ydCBmdW5jdGlvbiBsYXN0VmFsdWVGcm9tKHNvdXJjZSwgY29uZmlnKSB7XG4gICAgdmFyIGhhc0NvbmZpZyA9IHR5cGVvZiBjb25maWcgPT09ICdvYmplY3QnO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciBfaGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgdmFyIF92YWx1ZTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZSh7XG4gICAgICAgICAgICBuZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBfaGFzVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiByZWplY3QsXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChfaGFzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShfdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChoYXNDb25maWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb25maWcuZGVmYXVsdFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRW1wdHlFcnJvcigpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxhc3RWYWx1ZUZyb20uanMubWFwIiwiaW1wb3J0IHsgX19leHRlbmRzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICcuLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgcmVmQ291bnQgYXMgaGlnaGVyT3JkZXJSZWZDb3VudCB9IGZyb20gJy4uL29wZXJhdG9ycy9yZWZDb3VudCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuLi9vcGVyYXRvcnMvT3BlcmF0b3JTdWJzY3JpYmVyJztcbmltcG9ydCB7IGhhc0xpZnQgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xudmFyIENvbm5lY3RhYmxlT2JzZXJ2YWJsZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKENvbm5lY3RhYmxlT2JzZXJ2YWJsZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBDb25uZWN0YWJsZU9ic2VydmFibGUoc291cmNlLCBzdWJqZWN0RmFjdG9yeSkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIF90aGlzLnN1YmplY3RGYWN0b3J5ID0gc3ViamVjdEZhY3Rvcnk7XG4gICAgICAgIF90aGlzLl9zdWJqZWN0ID0gbnVsbDtcbiAgICAgICAgX3RoaXMuX3JlZkNvdW50ID0gMDtcbiAgICAgICAgX3RoaXMuX2Nvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICBpZiAoaGFzTGlmdChzb3VyY2UpKSB7XG4gICAgICAgICAgICBfdGhpcy5saWZ0ID0gc291cmNlLmxpZnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBDb25uZWN0YWJsZU9ic2VydmFibGUucHJvdG90eXBlLl9zdWJzY3JpYmUgPSBmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdWJqZWN0KCkuc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgIH07XG4gICAgQ29ubmVjdGFibGVPYnNlcnZhYmxlLnByb3RvdHlwZS5nZXRTdWJqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3ViamVjdCA9IHRoaXMuX3N1YmplY3Q7XG4gICAgICAgIGlmICghc3ViamVjdCB8fCBzdWJqZWN0LmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgdGhpcy5fc3ViamVjdCA9IHRoaXMuc3ViamVjdEZhY3RvcnkoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fc3ViamVjdDtcbiAgICB9O1xuICAgIENvbm5lY3RhYmxlT2JzZXJ2YWJsZS5wcm90b3R5cGUuX3RlYXJkb3duID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9yZWZDb3VudCA9IDA7XG4gICAgICAgIHZhciBfY29ubmVjdGlvbiA9IHRoaXMuX2Nvbm5lY3Rpb247XG4gICAgICAgIHRoaXMuX3N1YmplY3QgPSB0aGlzLl9jb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgX2Nvbm5lY3Rpb24gPT09IG51bGwgfHwgX2Nvbm5lY3Rpb24gPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jb25uZWN0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfTtcbiAgICBDb25uZWN0YWJsZU9ic2VydmFibGUucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBjb25uZWN0aW9uID0gdGhpcy5fY29ubmVjdGlvbjtcbiAgICAgICAgaWYgKCFjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICBjb25uZWN0aW9uID0gdGhpcy5fY29ubmVjdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgIHZhciBzdWJqZWN0XzEgPSB0aGlzLmdldFN1YmplY3QoKTtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24uYWRkKHRoaXMuc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YmplY3RfMSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3RlYXJkb3duKCk7XG4gICAgICAgICAgICAgICAgc3ViamVjdF8xLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3RlYXJkb3duKCk7XG4gICAgICAgICAgICAgICAgc3ViamVjdF8xLmVycm9yKGVycik7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5fdGVhcmRvd24oKTsgfSkpKTtcbiAgICAgICAgICAgIGlmIChjb25uZWN0aW9uLmNsb3NlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gICAgfTtcbiAgICBDb25uZWN0YWJsZU9ic2VydmFibGUucHJvdG90eXBlLnJlZkNvdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gaGlnaGVyT3JkZXJSZWZDb3VudCgpKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIENvbm5lY3RhYmxlT2JzZXJ2YWJsZTtcbn0oT2JzZXJ2YWJsZSkpO1xuZXhwb3J0IHsgQ29ubmVjdGFibGVPYnNlcnZhYmxlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Db25uZWN0YWJsZU9ic2VydmFibGUuanMubWFwIiwiaW1wb3J0IHsgYmluZENhbGxiYWNrSW50ZXJuYWxzIH0gZnJvbSAnLi9iaW5kQ2FsbGJhY2tJbnRlcm5hbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFjayhjYWxsYmFja0Z1bmMsIHJlc3VsdFNlbGVjdG9yLCBzY2hlZHVsZXIpIHtcbiAgICByZXR1cm4gYmluZENhbGxiYWNrSW50ZXJuYWxzKGZhbHNlLCBjYWxsYmFja0Z1bmMsIHJlc3VsdFNlbGVjdG9yLCBzY2hlZHVsZXIpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmluZENhbGxiYWNrLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgaXNTY2hlZHVsZXIgfSBmcm9tICcuLi91dGlsL2lzU2NoZWR1bGVyJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICcuLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IHN1YnNjcmliZU9uIH0gZnJvbSAnLi4vb3BlcmF0b3JzL3N1YnNjcmliZU9uJztcbmltcG9ydCB7IG1hcE9uZU9yTWFueUFyZ3MgfSBmcm9tICcuLi91dGlsL21hcE9uZU9yTWFueUFyZ3MnO1xuaW1wb3J0IHsgb2JzZXJ2ZU9uIH0gZnJvbSAnLi4vb3BlcmF0b3JzL29ic2VydmVPbic7XG5pbXBvcnQgeyBBc3luY1N1YmplY3QgfSBmcm9tICcuLi9Bc3luY1N1YmplY3QnO1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRDYWxsYmFja0ludGVybmFscyhpc05vZGVTdHlsZSwgY2FsbGJhY2tGdW5jLCByZXN1bHRTZWxlY3Rvciwgc2NoZWR1bGVyKSB7XG4gICAgaWYgKHJlc3VsdFNlbGVjdG9yKSB7XG4gICAgICAgIGlmIChpc1NjaGVkdWxlcihyZXN1bHRTZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHNjaGVkdWxlciA9IHJlc3VsdFNlbGVjdG9yO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJpbmRDYWxsYmFja0ludGVybmFscyhpc05vZGVTdHlsZSwgY2FsbGJhY2tGdW5jLCBzY2hlZHVsZXIpXG4gICAgICAgICAgICAgICAgICAgIC5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgICAgICAgICAgICAgICAucGlwZShtYXBPbmVPck1hbnlBcmdzKHJlc3VsdFNlbGVjdG9yKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzY2hlZHVsZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBiaW5kQ2FsbGJhY2tJbnRlcm5hbHMoaXNOb2RlU3R5bGUsIGNhbGxiYWNrRnVuYylcbiAgICAgICAgICAgICAgICAuYXBwbHkodGhpcywgYXJncylcbiAgICAgICAgICAgICAgICAucGlwZShzdWJzY3JpYmVPbihzY2hlZHVsZXIpLCBvYnNlcnZlT24oc2NoZWR1bGVyKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN1YmplY3QgPSBuZXcgQXN5bmNTdWJqZWN0KCk7XG4gICAgICAgIHZhciB1bmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgICAgICB2YXIgc3VicyA9IHN1YmplY3Quc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgICAgICAgaWYgKHVuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICB1bmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGlzQXN5bmNfMSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciBpc0NvbXBsZXRlXzEgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0Z1bmMuYXBwbHkoX3RoaXMsIF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGFyZ3MpKSwgW1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNOb2RlU3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVzdWx0cy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0LmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0Lm5leHQoMSA8IHJlc3VsdHMubGVuZ3RoID8gcmVzdWx0cyA6IHJlc3VsdHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wbGV0ZV8xID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0FzeW5jXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSkpO1xuICAgICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpc0FzeW5jXzEgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1YnM7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1iaW5kQ2FsbGJhY2tJbnRlcm5hbHMuanMubWFwIiwiaW1wb3J0IHsgYmluZENhbGxiYWNrSW50ZXJuYWxzIH0gZnJvbSAnLi9iaW5kQ2FsbGJhY2tJbnRlcm5hbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmROb2RlQ2FsbGJhY2soY2FsbGJhY2tGdW5jLCByZXN1bHRTZWxlY3Rvciwgc2NoZWR1bGVyKSB7XG4gICAgcmV0dXJuIGJpbmRDYWxsYmFja0ludGVybmFscyh0cnVlLCBjYWxsYmFja0Z1bmMsIHJlc3VsdFNlbGVjdG9yLCBzY2hlZHVsZXIpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YmluZE5vZGVDYWxsYmFjay5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBhcmdzQXJnQXJyYXlPck9iamVjdCB9IGZyb20gJy4uL3V0aWwvYXJnc0FyZ0FycmF5T3JPYmplY3QnO1xuaW1wb3J0IHsgZnJvbSB9IGZyb20gJy4vZnJvbSc7XG5pbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4uL3V0aWwvaWRlbnRpdHknO1xuaW1wb3J0IHsgbWFwT25lT3JNYW55QXJncyB9IGZyb20gJy4uL3V0aWwvbWFwT25lT3JNYW55QXJncyc7XG5pbXBvcnQgeyBwb3BSZXN1bHRTZWxlY3RvciwgcG9wU2NoZWR1bGVyIH0gZnJvbSAnLi4vdXRpbC9hcmdzJztcbmltcG9ydCB7IGNyZWF0ZU9iamVjdCB9IGZyb20gJy4uL3V0aWwvY3JlYXRlT2JqZWN0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4uL29wZXJhdG9ycy9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVMYXRlc3QoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHZhciBzY2hlZHVsZXIgPSBwb3BTY2hlZHVsZXIoYXJncyk7XG4gICAgdmFyIHJlc3VsdFNlbGVjdG9yID0gcG9wUmVzdWx0U2VsZWN0b3IoYXJncyk7XG4gICAgdmFyIF9hID0gYXJnc0FyZ0FycmF5T3JPYmplY3QoYXJncyksIG9ic2VydmFibGVzID0gX2EuYXJncywga2V5cyA9IF9hLmtleXM7XG4gICAgaWYgKG9ic2VydmFibGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZnJvbShbXSwgc2NoZWR1bGVyKTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBPYnNlcnZhYmxlKGNvbWJpbmVMYXRlc3RJbml0KG9ic2VydmFibGVzLCBzY2hlZHVsZXIsIGtleXNcbiAgICAgICAgP1xuICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlcykgeyByZXR1cm4gY3JlYXRlT2JqZWN0KGtleXMsIHZhbHVlcyk7IH1cbiAgICAgICAgOlxuICAgICAgICAgICAgaWRlbnRpdHkpKTtcbiAgICByZXR1cm4gcmVzdWx0U2VsZWN0b3IgPyByZXN1bHQucGlwZShtYXBPbmVPck1hbnlBcmdzKHJlc3VsdFNlbGVjdG9yKSkgOiByZXN1bHQ7XG59XG5leHBvcnQgZnVuY3Rpb24gY29tYmluZUxhdGVzdEluaXQob2JzZXJ2YWJsZXMsIHNjaGVkdWxlciwgdmFsdWVUcmFuc2Zvcm0pIHtcbiAgICBpZiAodmFsdWVUcmFuc2Zvcm0gPT09IHZvaWQgMCkgeyB2YWx1ZVRyYW5zZm9ybSA9IGlkZW50aXR5OyB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIG1heWJlU2NoZWR1bGUoc2NoZWR1bGVyLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gb2JzZXJ2YWJsZXMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgdmFyIGFjdGl2ZSA9IGxlbmd0aDtcbiAgICAgICAgICAgIHZhciByZW1haW5pbmdGaXJzdFZhbHVlcyA9IGxlbmd0aDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICBtYXliZVNjaGVkdWxlKHNjaGVkdWxlciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc291cmNlID0gZnJvbShvYnNlcnZhYmxlc1tpXSwgc2NoZWR1bGVyKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhhc0ZpcnN0VmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2ldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhhc0ZpcnN0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNGaXJzdFZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdGaXJzdFZhbHVlcy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZW1haW5pbmdGaXJzdFZhbHVlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZVRyYW5zZm9ybSh2YWx1ZXMuc2xpY2UoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIS0tYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSwgc3Vic2NyaWJlcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIF9sb29wXzEoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHN1YnNjcmliZXIpO1xuICAgIH07XG59XG5mdW5jdGlvbiBtYXliZVNjaGVkdWxlKHNjaGVkdWxlciwgZXhlY3V0ZSwgc3Vic2NyaXB0aW9uKSB7XG4gICAgaWYgKHNjaGVkdWxlcikge1xuICAgICAgICBzdWJzY3JpcHRpb24uYWRkKHNjaGVkdWxlci5zY2hlZHVsZShleGVjdXRlKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBleGVjdXRlKCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tYmluZUxhdGVzdC5qcy5tYXAiLCJpbXBvcnQgeyBjb25jYXRBbGwgfSBmcm9tICcuLi9vcGVyYXRvcnMvY29uY2F0QWxsJztcbmltcG9ydCB7IGludGVybmFsRnJvbUFycmF5IH0gZnJvbSAnLi9mcm9tQXJyYXknO1xuaW1wb3J0IHsgcG9wU2NoZWR1bGVyIH0gZnJvbSAnLi4vdXRpbC9hcmdzJztcbmV4cG9ydCBmdW5jdGlvbiBjb25jYXQoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHJldHVybiBjb25jYXRBbGwoKShpbnRlcm5hbEZyb21BcnJheShhcmdzLCBwb3BTY2hlZHVsZXIoYXJncykpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbmNhdC5qcy5tYXAiLCJpbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAnLi4vU3ViamVjdCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBkZWZlciB9IGZyb20gJy4vZGVmZXInO1xudmFyIERFRkFVTFRfQ09ORklHID0ge1xuICAgIGNvbm5lY3RvcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IFN1YmplY3QoKTsgfSxcbiAgICByZXNldE9uRGlzY29ubmVjdDogdHJ1ZSxcbn07XG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdGFibGUoc291cmNlLCBjb25maWcpIHtcbiAgICBpZiAoY29uZmlnID09PSB2b2lkIDApIHsgY29uZmlnID0gREVGQVVMVF9DT05GSUc7IH1cbiAgICB2YXIgY29ubmVjdGlvbiA9IG51bGw7XG4gICAgdmFyIGNvbm5lY3RvciA9IGNvbmZpZy5jb25uZWN0b3IsIF9hID0gY29uZmlnLnJlc2V0T25EaXNjb25uZWN0LCByZXNldE9uRGlzY29ubmVjdCA9IF9hID09PSB2b2lkIDAgPyB0cnVlIDogX2E7XG4gICAgdmFyIHN1YmplY3QgPSBjb25uZWN0b3IoKTtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgcmV0dXJuIHN1YmplY3Quc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgIH0pO1xuICAgIHJlc3VsdC5jb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIWNvbm5lY3Rpb24gfHwgY29ubmVjdGlvbi5jbG9zZWQpIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24gPSBkZWZlcihmdW5jdGlvbiAoKSB7IHJldHVybiBzb3VyY2U7IH0pLnN1YnNjcmliZShzdWJqZWN0KTtcbiAgICAgICAgICAgIGlmIChyZXNldE9uRGlzY29ubmVjdCkge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24uYWRkKGZ1bmN0aW9uICgpIHsgcmV0dXJuIChzdWJqZWN0ID0gY29ubmVjdG9yKCkpOyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgICB9O1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25uZWN0YWJsZS5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuL2Zyb20nO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmVyKG9ic2VydmFibGVGYWN0b3J5KSB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIGlubmVyRnJvbShvYnNlcnZhYmxlRmFjdG9yeSgpKS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWZlci5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICcuLi8uLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgcGVyZm9ybWFuY2VUaW1lc3RhbXBQcm92aWRlciB9IGZyb20gJy4uLy4uL3NjaGVkdWxlci9wZXJmb3JtYW5jZVRpbWVzdGFtcFByb3ZpZGVyJztcbmltcG9ydCB7IGFuaW1hdGlvbkZyYW1lUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9zY2hlZHVsZXIvYW5pbWF0aW9uRnJhbWVQcm92aWRlcic7XG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0aW9uRnJhbWVzKHRpbWVzdGFtcFByb3ZpZGVyKSB7XG4gICAgcmV0dXJuIHRpbWVzdGFtcFByb3ZpZGVyID8gYW5pbWF0aW9uRnJhbWVzRmFjdG9yeSh0aW1lc3RhbXBQcm92aWRlcikgOiBERUZBVUxUX0FOSU1BVElPTl9GUkFNRVM7XG59XG5mdW5jdGlvbiBhbmltYXRpb25GcmFtZXNGYWN0b3J5KHRpbWVzdGFtcFByb3ZpZGVyKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gYW5pbWF0aW9uRnJhbWVQcm92aWRlci5zY2hlZHVsZTtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgdmFyIHByb3ZpZGVyID0gdGltZXN0YW1wUHJvdmlkZXIgfHwgcGVyZm9ybWFuY2VUaW1lc3RhbXBQcm92aWRlcjtcbiAgICAgICAgdmFyIHN0YXJ0ID0gcHJvdmlkZXIubm93KCk7XG4gICAgICAgIHZhciBydW4gPSBmdW5jdGlvbiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gcHJvdmlkZXIubm93KCk7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoe1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wUHJvdmlkZXIgPyBub3cgOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgZWxhcHNlZDogbm93IC0gc3RhcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFzdWJzY3JpYmVyLmNsb3NlZCkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5hZGQoc2NoZWR1bGUocnVuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHN1YnNjcmlwdGlvbi5hZGQoc2NoZWR1bGUocnVuKSk7XG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gICAgfSk7XG59XG52YXIgREVGQVVMVF9BTklNQVRJT05fRlJBTUVTID0gYW5pbWF0aW9uRnJhbWVzRmFjdG9yeSgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YW5pbWF0aW9uRnJhbWVzLmpzLm1hcCIsImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICcuLi9PYnNlcnZhYmxlJztcbmV4cG9ydCB2YXIgRU1QVFkgPSBuZXcgT2JzZXJ2YWJsZShmdW5jdGlvbiAoc3Vic2NyaWJlcikgeyByZXR1cm4gc3Vic2NyaWJlci5jb21wbGV0ZSgpOyB9KTtcbmV4cG9ydCBmdW5jdGlvbiBlbXB0eShzY2hlZHVsZXIpIHtcbiAgICByZXR1cm4gc2NoZWR1bGVyID8gZW1wdHlTY2hlZHVsZWQoc2NoZWR1bGVyKSA6IEVNUFRZO1xufVxuZnVuY3Rpb24gZW1wdHlTY2hlZHVsZWQoc2NoZWR1bGVyKSB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7IHJldHVybiBzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkgeyByZXR1cm4gc3Vic2NyaWJlci5jb21wbGV0ZSgpOyB9KTsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbXB0eS5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBhcmdzQXJnQXJyYXlPck9iamVjdCB9IGZyb20gJy4uL3V0aWwvYXJnc0FyZ0FycmF5T3JPYmplY3QnO1xuaW1wb3J0IHsgaW5uZXJGcm9tIH0gZnJvbSAnLi9mcm9tJztcbmltcG9ydCB7IHBvcFJlc3VsdFNlbGVjdG9yIH0gZnJvbSAnLi4vdXRpbC9hcmdzJztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4uL29wZXJhdG9ycy9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgbWFwT25lT3JNYW55QXJncyB9IGZyb20gJy4uL3V0aWwvbWFwT25lT3JNYW55QXJncyc7XG5pbXBvcnQgeyBjcmVhdGVPYmplY3QgfSBmcm9tICcuLi91dGlsL2NyZWF0ZU9iamVjdCc7XG5leHBvcnQgZnVuY3Rpb24gZm9ya0pvaW4oKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHZhciByZXN1bHRTZWxlY3RvciA9IHBvcFJlc3VsdFNlbGVjdG9yKGFyZ3MpO1xuICAgIHZhciBfYSA9IGFyZ3NBcmdBcnJheU9yT2JqZWN0KGFyZ3MpLCBzb3VyY2VzID0gX2EuYXJncywga2V5cyA9IF9hLmtleXM7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aDtcbiAgICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgICAgIHZhciByZW1haW5pbmdDb21wbGV0aW9ucyA9IGxlbmd0aDtcbiAgICAgICAgdmFyIHJlbWFpbmluZ0VtaXNzaW9ucyA9IGxlbmd0aDtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoc291cmNlSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBoYXNWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaW5uZXJGcm9tKHNvdXJjZXNbc291cmNlSW5kZXhdKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nRW1pc3Npb25zLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlc1tzb3VyY2VJbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIS0tcmVtYWluaW5nQ29tcGxldGlvbnMgfHwgIWhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVtYWluaW5nRW1pc3Npb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoa2V5cyA/IGNyZWF0ZU9iamVjdChrZXlzLCB2YWx1ZXMpIDogdmFsdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBzb3VyY2VJbmRleCA9IDA7IHNvdXJjZUluZGV4IDwgbGVuZ3RoOyBzb3VyY2VJbmRleCsrKSB7XG4gICAgICAgICAgICBfbG9vcF8xKHNvdXJjZUluZGV4KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRTZWxlY3RvciA/IHJlc3VsdC5waXBlKG1hcE9uZU9yTWFueUFyZ3MocmVzdWx0U2VsZWN0b3IpKSA6IHJlc3VsdDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvcmtKb2luLmpzLm1hcCIsImltcG9ydCB7IF9fYXN5bmNWYWx1ZXMsIF9fYXdhaXRlciwgX19nZW5lcmF0b3IsIF9fdmFsdWVzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBpc0FycmF5TGlrZSB9IGZyb20gJy4uL3V0aWwvaXNBcnJheUxpa2UnO1xuaW1wb3J0IHsgaXNQcm9taXNlIH0gZnJvbSAnLi4vdXRpbC9pc1Byb21pc2UnO1xuaW1wb3J0IHsgb2JzZXJ2YWJsZSBhcyBTeW1ib2xfb2JzZXJ2YWJsZSB9IGZyb20gJy4uL3N5bWJvbC9vYnNlcnZhYmxlJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICcuLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IHNjaGVkdWxlZCB9IGZyb20gJy4uL3NjaGVkdWxlZC9zY2hlZHVsZWQnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyByZXBvcnRVbmhhbmRsZWRFcnJvciB9IGZyb20gJy4uL3V0aWwvcmVwb3J0VW5oYW5kbGVkRXJyb3InO1xuaW1wb3J0IHsgaXNJbnRlcm9wT2JzZXJ2YWJsZSB9IGZyb20gJy4uL3V0aWwvaXNJbnRlcm9wT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBpc0FzeW5jSXRlcmFibGUgfSBmcm9tICcuLi91dGlsL2lzQXN5bmNJdGVyYWJsZSc7XG5pbXBvcnQgeyBjcmVhdGVJbnZhbGlkT2JzZXJ2YWJsZVR5cGVFcnJvciB9IGZyb20gJy4uL3V0aWwvdGhyb3dVbm9ic2VydmFibGVFcnJvcic7XG5pbXBvcnQgeyBpc0l0ZXJhYmxlIH0gZnJvbSAnLi4vdXRpbC9pc0l0ZXJhYmxlJztcbmltcG9ydCB7IGlzUmVhZGFibGVTdHJlYW1MaWtlLCByZWFkYWJsZVN0cmVhbUxpa2VUb0FzeW5jR2VuZXJhdG9yIH0gZnJvbSAnLi4vdXRpbC9pc1JlYWRhYmxlU3RyZWFtTGlrZSc7XG5leHBvcnQgZnVuY3Rpb24gZnJvbShpbnB1dCwgc2NoZWR1bGVyKSB7XG4gICAgcmV0dXJuIHNjaGVkdWxlciA/IHNjaGVkdWxlZChpbnB1dCwgc2NoZWR1bGVyKSA6IGlubmVyRnJvbShpbnB1dCk7XG59XG5leHBvcnQgZnVuY3Rpb24gaW5uZXJGcm9tKGlucHV0KSB7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgT2JzZXJ2YWJsZSkge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChpc0ludGVyb3BPYnNlcnZhYmxlKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZyb21JbnRlcm9wT2JzZXJ2YWJsZShpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXlMaWtlKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1Byb21pc2UoaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZnJvbVByb21pc2UoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0FzeW5jSXRlcmFibGUoaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZnJvbUFzeW5jSXRlcmFibGUoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0l0ZXJhYmxlKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZyb21JdGVyYWJsZShpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUmVhZGFibGVTdHJlYW1MaWtlKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZyb21SZWFkYWJsZVN0cmVhbUxpa2UoaW5wdXQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRocm93IGNyZWF0ZUludmFsaWRPYnNlcnZhYmxlVHlwZUVycm9yKGlucHV0KTtcbn1cbmZ1bmN0aW9uIGZyb21JbnRlcm9wT2JzZXJ2YWJsZShvYmopIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIG9icyA9IG9ialtTeW1ib2xfb2JzZXJ2YWJsZV0oKTtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24ob2JzLnN1YnNjcmliZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBvYnMuc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb3ZpZGVkIG9iamVjdCBkb2VzIG5vdCBjb3JyZWN0bHkgaW1wbGVtZW50IFN5bWJvbC5vYnNlcnZhYmxlJyk7XG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZnJvbUFycmF5TGlrZShhcnJheSkge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aCAmJiAhc3Vic2NyaWJlci5jbG9zZWQ7IGkrKykge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KGFycmF5W2ldKTtcbiAgICAgICAgfVxuICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmcm9tUHJvbWlzZShwcm9taXNlKSB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHByb21pc2VcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFzdWJzY3JpYmVyLmNsb3NlZCkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7IHJldHVybiBzdWJzY3JpYmVyLmVycm9yKGVycik7IH0pXG4gICAgICAgICAgICAudGhlbihudWxsLCByZXBvcnRVbmhhbmRsZWRFcnJvcik7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmcm9tSXRlcmFibGUoaXRlcmFibGUpIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpdGVyYWJsZV8xID0gX192YWx1ZXMoaXRlcmFibGUpLCBpdGVyYWJsZV8xXzEgPSBpdGVyYWJsZV8xLm5leHQoKTsgIWl0ZXJhYmxlXzFfMS5kb25lOyBpdGVyYWJsZV8xXzEgPSBpdGVyYWJsZV8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGl0ZXJhYmxlXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpYmVyLmNsb3NlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlcmFibGVfMV8xICYmICFpdGVyYWJsZV8xXzEuZG9uZSAmJiAoX2EgPSBpdGVyYWJsZV8xLnJldHVybikpIF9hLmNhbGwoaXRlcmFibGVfMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgIH1cbiAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZnJvbUFzeW5jSXRlcmFibGUoYXN5bmNJdGVyYWJsZSkge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICBwcm9jZXNzKGFzeW5jSXRlcmFibGUsIHN1YnNjcmliZXIpLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHsgcmV0dXJuIHN1YnNjcmliZXIuZXJyb3IoZXJyKTsgfSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmcm9tUmVhZGFibGVTdHJlYW1MaWtlKHJlYWRhYmxlU3RyZWFtKSB7XG4gICAgcmV0dXJuIGZyb21Bc3luY0l0ZXJhYmxlKHJlYWRhYmxlU3RyZWFtTGlrZVRvQXN5bmNHZW5lcmF0b3IocmVhZGFibGVTdHJlYW0pKTtcbn1cbmZ1bmN0aW9uIHByb2Nlc3MoYXN5bmNJdGVyYWJsZSwgc3Vic2NyaWJlcikge1xuICAgIHZhciBhc3luY0l0ZXJhYmxlXzEsIGFzeW5jSXRlcmFibGVfMV8xO1xuICAgIHZhciBlXzIsIF9hO1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHZhbHVlLCBlXzJfMTtcbiAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYikge1xuICAgICAgICAgICAgc3dpdGNoIChfYi5sYWJlbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgX2IudHJ5cy5wdXNoKFswLCA1LCA2LCAxMV0pO1xuICAgICAgICAgICAgICAgICAgICBhc3luY0l0ZXJhYmxlXzEgPSBfX2FzeW5jVmFsdWVzKGFzeW5jSXRlcmFibGUpO1xuICAgICAgICAgICAgICAgICAgICBfYi5sYWJlbCA9IDE7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gWzQsIGFzeW5jSXRlcmFibGVfMS5uZXh0KCldO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoYXN5bmNJdGVyYWJsZV8xXzEgPSBfYi5zZW50KCksICFhc3luY0l0ZXJhYmxlXzFfMS5kb25lKSkgcmV0dXJuIFszLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBhc3luY0l0ZXJhYmxlXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnNjcmliZXIuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzJdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF9iLmxhYmVsID0gMztcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMywgMV07XG4gICAgICAgICAgICAgICAgY2FzZSA0OiByZXR1cm4gWzMsIDExXTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgIGVfMl8xID0gX2Iuc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICBlXzIgPSB7IGVycm9yOiBlXzJfMSB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMsIDExXTtcbiAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgIF9iLnRyeXMucHVzaChbNiwgLCA5LCAxMF0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShhc3luY0l0ZXJhYmxlXzFfMSAmJiAhYXN5bmNJdGVyYWJsZV8xXzEuZG9uZSAmJiAoX2EgPSBhc3luY0l0ZXJhYmxlXzEucmV0dXJuKSkpIHJldHVybiBbMywgOF07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCwgX2EuY2FsbChhc3luY0l0ZXJhYmxlXzEpXTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICAgICAgICAgIF9iLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgX2IubGFiZWwgPSA4O1xuICAgICAgICAgICAgICAgIGNhc2UgODogcmV0dXJuIFszLCAxMF07XG4gICAgICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgICAgICBpZiAoZV8yKSB0aHJvdyBlXzIuZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbN107XG4gICAgICAgICAgICAgICAgY2FzZSAxMDogcmV0dXJuIFs3XTtcbiAgICAgICAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbMl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZnJvbS5qcy5tYXAiLCJpbXBvcnQgeyBzY2hlZHVsZUFycmF5IH0gZnJvbSAnLi4vc2NoZWR1bGVkL3NjaGVkdWxlQXJyYXknO1xuaW1wb3J0IHsgZnJvbUFycmF5TGlrZSB9IGZyb20gJy4vZnJvbSc7XG5leHBvcnQgZnVuY3Rpb24gaW50ZXJuYWxGcm9tQXJyYXkoaW5wdXQsIHNjaGVkdWxlcikge1xuICAgIHJldHVybiBzY2hlZHVsZXIgPyBzY2hlZHVsZUFycmF5KGlucHV0LCBzY2hlZHVsZXIpIDogZnJvbUFycmF5TGlrZShpbnB1dCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mcm9tQXJyYXkuanMubWFwIiwiaW1wb3J0IHsgX19yZWFkIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBtZXJnZU1hcCB9IGZyb20gJy4uL29wZXJhdG9ycy9tZXJnZU1hcCc7XG5pbXBvcnQgeyBpc0FycmF5TGlrZSB9IGZyb20gJy4uL3V0aWwvaXNBcnJheUxpa2UnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBtYXBPbmVPck1hbnlBcmdzIH0gZnJvbSAnLi4vdXRpbC9tYXBPbmVPck1hbnlBcmdzJztcbmltcG9ydCB7IGludGVybmFsRnJvbUFycmF5IH0gZnJvbSAnLi9mcm9tQXJyYXknO1xudmFyIG5vZGVFdmVudEVtaXR0ZXJNZXRob2RzID0gWydhZGRMaXN0ZW5lcicsICdyZW1vdmVMaXN0ZW5lciddO1xudmFyIGV2ZW50VGFyZ2V0TWV0aG9kcyA9IFsnYWRkRXZlbnRMaXN0ZW5lcicsICdyZW1vdmVFdmVudExpc3RlbmVyJ107XG52YXIganF1ZXJ5TWV0aG9kcyA9IFsnb24nLCAnb2ZmJ107XG5leHBvcnQgZnVuY3Rpb24gZnJvbUV2ZW50KHRhcmdldCwgZXZlbnROYW1lLCBvcHRpb25zLCByZXN1bHRTZWxlY3Rvcikge1xuICAgIGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICAgIHJlc3VsdFNlbGVjdG9yID0gb3B0aW9ucztcbiAgICAgICAgb3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHJlc3VsdFNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBmcm9tRXZlbnQodGFyZ2V0LCBldmVudE5hbWUsIG9wdGlvbnMpLnBpcGUobWFwT25lT3JNYW55QXJncyhyZXN1bHRTZWxlY3RvcikpO1xuICAgIH1cbiAgICB2YXIgX2EgPSBfX3JlYWQoaXNFdmVudFRhcmdldCh0YXJnZXQpXG4gICAgICAgID8gZXZlbnRUYXJnZXRNZXRob2RzLm1hcChmdW5jdGlvbiAobWV0aG9kTmFtZSkgeyByZXR1cm4gZnVuY3Rpb24gKGhhbmRsZXIpIHsgcmV0dXJuIHRhcmdldFttZXRob2ROYW1lXShldmVudE5hbWUsIGhhbmRsZXIsIG9wdGlvbnMpOyB9OyB9KVxuICAgICAgICA6XG4gICAgICAgICAgICBpc05vZGVTdHlsZUV2ZW50RW1pdHRlcih0YXJnZXQpXG4gICAgICAgICAgICAgICAgPyBub2RlRXZlbnRFbWl0dGVyTWV0aG9kcy5tYXAodG9Db21tb25IYW5kbGVyUmVnaXN0cnkodGFyZ2V0LCBldmVudE5hbWUpKVxuICAgICAgICAgICAgICAgIDogaXNKUXVlcnlTdHlsZUV2ZW50RW1pdHRlcih0YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgID8ganF1ZXJ5TWV0aG9kcy5tYXAodG9Db21tb25IYW5kbGVyUmVnaXN0cnkodGFyZ2V0LCBldmVudE5hbWUpKVxuICAgICAgICAgICAgICAgICAgICA6IFtdLCAyKSwgYWRkID0gX2FbMF0sIHJlbW92ZSA9IF9hWzFdO1xuICAgIGlmICghYWRkKSB7XG4gICAgICAgIGlmIChpc0FycmF5TGlrZSh0YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VNYXAoZnVuY3Rpb24gKHN1YlRhcmdldCkgeyByZXR1cm4gZnJvbUV2ZW50KHN1YlRhcmdldCwgZXZlbnROYW1lLCBvcHRpb25zKTsgfSkoaW50ZXJuYWxGcm9tQXJyYXkodGFyZ2V0KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFhZGQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBldmVudCB0YXJnZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN1YnNjcmliZXIubmV4dCgxIDwgYXJncy5sZW5ndGggPyBhcmdzIDogYXJnc1swXSk7XG4gICAgICAgIH07XG4gICAgICAgIGFkZChoYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlbW92ZShoYW5kbGVyKTsgfTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIHRvQ29tbW9uSGFuZGxlclJlZ2lzdHJ5KHRhcmdldCwgZXZlbnROYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7IHJldHVybiBmdW5jdGlvbiAoaGFuZGxlcikgeyByZXR1cm4gdGFyZ2V0W21ldGhvZE5hbWVdKGV2ZW50TmFtZSwgaGFuZGxlcik7IH07IH07XG59XG5mdW5jdGlvbiBpc05vZGVTdHlsZUV2ZW50RW1pdHRlcih0YXJnZXQpIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbih0YXJnZXQuYWRkTGlzdGVuZXIpICYmIGlzRnVuY3Rpb24odGFyZ2V0LnJlbW92ZUxpc3RlbmVyKTtcbn1cbmZ1bmN0aW9uIGlzSlF1ZXJ5U3R5bGVFdmVudEVtaXR0ZXIodGFyZ2V0KSB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24odGFyZ2V0Lm9uKSAmJiBpc0Z1bmN0aW9uKHRhcmdldC5vZmYpO1xufVxuZnVuY3Rpb24gaXNFdmVudFRhcmdldCh0YXJnZXQpIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbih0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikgJiYgaXNGdW5jdGlvbih0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcik7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mcm9tRXZlbnQuanMubWFwIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBtYXBPbmVPck1hbnlBcmdzIH0gZnJvbSAnLi4vdXRpbC9tYXBPbmVPck1hbnlBcmdzJztcbmV4cG9ydCBmdW5jdGlvbiBmcm9tRXZlbnRQYXR0ZXJuKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIsIHJlc3VsdFNlbGVjdG9yKSB7XG4gICAgaWYgKHJlc3VsdFNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBmcm9tRXZlbnRQYXR0ZXJuKGFkZEhhbmRsZXIsIHJlbW92ZUhhbmRsZXIpLnBpcGUobWFwT25lT3JNYW55QXJncyhyZXN1bHRTZWxlY3RvcikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZSA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICBlW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3Vic2NyaWJlci5uZXh0KGUubGVuZ3RoID09PSAxID8gZVswXSA6IGUpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgcmV0VmFsdWUgPSBhZGRIYW5kbGVyKGhhbmRsZXIpO1xuICAgICAgICByZXR1cm4gaXNGdW5jdGlvbihyZW1vdmVIYW5kbGVyKSA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlbW92ZUhhbmRsZXIoaGFuZGxlciwgcmV0VmFsdWUpOyB9IDogdW5kZWZpbmVkO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZnJvbUV2ZW50UGF0dGVybi5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5leHBvcnQgZnVuY3Rpb24gZnJvbVN1YnNjcmliYWJsZShzdWJzY3JpYmFibGUpIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHsgcmV0dXJuIHN1YnNjcmliYWJsZS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7IH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZnJvbVN1YnNjcmliYWJsZS5qcy5tYXAiLCJpbXBvcnQgeyBfX2dlbmVyYXRvciB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgaWRlbnRpdHkgfSBmcm9tICcuLi91dGlsL2lkZW50aXR5JztcbmltcG9ydCB7IGlzU2NoZWR1bGVyIH0gZnJvbSAnLi4vdXRpbC9pc1NjaGVkdWxlcic7XG5pbXBvcnQgeyBkZWZlciB9IGZyb20gJy4vZGVmZXInO1xuaW1wb3J0IHsgc2NoZWR1bGVJdGVyYWJsZSB9IGZyb20gJy4uL3NjaGVkdWxlZC9zY2hlZHVsZUl0ZXJhYmxlJztcbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZShpbml0aWFsU3RhdGVPck9wdGlvbnMsIGNvbmRpdGlvbiwgaXRlcmF0ZSwgcmVzdWx0U2VsZWN0b3JPclNjaGVkdWxlciwgc2NoZWR1bGVyKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgcmVzdWx0U2VsZWN0b3I7XG4gICAgdmFyIGluaXRpYWxTdGF0ZTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAoX2EgPSBpbml0aWFsU3RhdGVPck9wdGlvbnMsIGluaXRpYWxTdGF0ZSA9IF9hLmluaXRpYWxTdGF0ZSwgY29uZGl0aW9uID0gX2EuY29uZGl0aW9uLCBpdGVyYXRlID0gX2EuaXRlcmF0ZSwgX2IgPSBfYS5yZXN1bHRTZWxlY3RvciwgcmVzdWx0U2VsZWN0b3IgPSBfYiA9PT0gdm9pZCAwID8gaWRlbnRpdHkgOiBfYiwgc2NoZWR1bGVyID0gX2Euc2NoZWR1bGVyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGluaXRpYWxTdGF0ZSA9IGluaXRpYWxTdGF0ZU9yT3B0aW9ucztcbiAgICAgICAgaWYgKCFyZXN1bHRTZWxlY3Rvck9yU2NoZWR1bGVyIHx8IGlzU2NoZWR1bGVyKHJlc3VsdFNlbGVjdG9yT3JTY2hlZHVsZXIpKSB7XG4gICAgICAgICAgICByZXN1bHRTZWxlY3RvciA9IGlkZW50aXR5O1xuICAgICAgICAgICAgc2NoZWR1bGVyID0gcmVzdWx0U2VsZWN0b3JPclNjaGVkdWxlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFNlbGVjdG9yID0gcmVzdWx0U2VsZWN0b3JPclNjaGVkdWxlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgIHZhciBzdGF0ZTtcbiAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBpbml0aWFsU3RhdGU7XG4gICAgICAgICAgICAgICAgICAgIF9hLmxhYmVsID0gMTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKCFjb25kaXRpb24gfHwgY29uZGl0aW9uKHN0YXRlKSkpIHJldHVybiBbMywgNF07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCwgcmVzdWx0U2VsZWN0b3Ioc3RhdGUpXTtcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgX2EubGFiZWwgPSAzO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBpdGVyYXRlKHN0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszLCAxXTtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHJldHVybiBbMl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXIoKHNjaGVkdWxlclxuICAgICAgICA/XG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBzY2hlZHVsZUl0ZXJhYmxlKGdlbigpLCBzY2hlZHVsZXIpOyB9XG4gICAgICAgIDpcbiAgICAgICAgICAgIGdlbikpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2VuZXJhdGUuanMubWFwIiwiaW1wb3J0IHsgZGVmZXIgfSBmcm9tICcuL2RlZmVyJztcbmV4cG9ydCBmdW5jdGlvbiBpaWYoY29uZGl0aW9uLCB0cnVlUmVzdWx0LCBmYWxzZVJlc3VsdCkge1xuICAgIHJldHVybiBkZWZlcihmdW5jdGlvbiAoKSB7IHJldHVybiAoY29uZGl0aW9uKCkgPyB0cnVlUmVzdWx0IDogZmFsc2VSZXN1bHQpOyB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlpZi5qcy5tYXAiLCJpbXBvcnQgeyBhc3luY1NjaGVkdWxlciB9IGZyb20gJy4uL3NjaGVkdWxlci9hc3luYyc7XG5pbXBvcnQgeyB0aW1lciB9IGZyb20gJy4vdGltZXInO1xuZXhwb3J0IGZ1bmN0aW9uIGludGVydmFsKHBlcmlvZCwgc2NoZWR1bGVyKSB7XG4gICAgaWYgKHBlcmlvZCA9PT0gdm9pZCAwKSB7IHBlcmlvZCA9IDA7IH1cbiAgICBpZiAoc2NoZWR1bGVyID09PSB2b2lkIDApIHsgc2NoZWR1bGVyID0gYXN5bmNTY2hlZHVsZXI7IH1cbiAgICBpZiAocGVyaW9kIDwgMCkge1xuICAgICAgICBwZXJpb2QgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gdGltZXIocGVyaW9kLCBwZXJpb2QsIHNjaGVkdWxlcik7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnRlcnZhbC5qcy5tYXAiLCJpbXBvcnQgeyBtZXJnZUFsbCB9IGZyb20gJy4uL29wZXJhdG9ycy9tZXJnZUFsbCc7XG5pbXBvcnQgeyBpbnRlcm5hbEZyb21BcnJheSB9IGZyb20gJy4vZnJvbUFycmF5JztcbmltcG9ydCB7IGlubmVyRnJvbSB9IGZyb20gJy4vZnJvbSc7XG5pbXBvcnQgeyBFTVBUWSB9IGZyb20gJy4vZW1wdHknO1xuaW1wb3J0IHsgcG9wTnVtYmVyLCBwb3BTY2hlZHVsZXIgfSBmcm9tICcuLi91dGlsL2FyZ3MnO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlKCkge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgc2NoZWR1bGVyID0gcG9wU2NoZWR1bGVyKGFyZ3MpO1xuICAgIHZhciBjb25jdXJyZW50ID0gcG9wTnVtYmVyKGFyZ3MsIEluZmluaXR5KTtcbiAgICB2YXIgc291cmNlcyA9IGFyZ3M7XG4gICAgcmV0dXJuICFzb3VyY2VzLmxlbmd0aFxuICAgICAgICA/XG4gICAgICAgICAgICBFTVBUWVxuICAgICAgICA6IHNvdXJjZXMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgaW5uZXJGcm9tKHNvdXJjZXNbMF0pXG4gICAgICAgICAgICA6XG4gICAgICAgICAgICAgICAgbWVyZ2VBbGwoY29uY3VycmVudCkoaW50ZXJuYWxGcm9tQXJyYXkoc291cmNlcywgc2NoZWR1bGVyKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXJnZS5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBub29wIH0gZnJvbSAnLi4vdXRpbC9ub29wJztcbmV4cG9ydCB2YXIgTkVWRVIgPSBuZXcgT2JzZXJ2YWJsZShub29wKTtcbmV4cG9ydCBmdW5jdGlvbiBuZXZlcigpIHtcbiAgICByZXR1cm4gTkVWRVI7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXZlci5qcy5tYXAiLCJpbXBvcnQgeyBpbnRlcm5hbEZyb21BcnJheSB9IGZyb20gJy4vZnJvbUFycmF5JztcbmltcG9ydCB7IHNjaGVkdWxlQXJyYXkgfSBmcm9tICcuLi9zY2hlZHVsZWQvc2NoZWR1bGVBcnJheSc7XG5pbXBvcnQgeyBwb3BTY2hlZHVsZXIgfSBmcm9tICcuLi91dGlsL2FyZ3MnO1xuZXhwb3J0IGZ1bmN0aW9uIG9mKCkge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgc2NoZWR1bGVyID0gcG9wU2NoZWR1bGVyKGFyZ3MpO1xuICAgIHJldHVybiBzY2hlZHVsZXIgPyBzY2hlZHVsZUFycmF5KGFyZ3MsIHNjaGVkdWxlcikgOiBpbnRlcm5hbEZyb21BcnJheShhcmdzKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW9mLmpzLm1hcCIsImltcG9ydCB7IEVNUFRZIH0gZnJvbSAnLi9lbXB0eSc7XG5pbXBvcnQgeyBvbkVycm9yUmVzdW1lTmV4dCBhcyBvbkVycm9yUmVzdW1lTmV4dFdpdGggfSBmcm9tICcuLi9vcGVyYXRvcnMvb25FcnJvclJlc3VtZU5leHQnO1xuaW1wb3J0IHsgYXJnc09yQXJnQXJyYXkgfSBmcm9tICcuLi91dGlsL2FyZ3NPckFyZ0FycmF5JztcbmV4cG9ydCBmdW5jdGlvbiBvbkVycm9yUmVzdW1lTmV4dCgpIHtcbiAgICB2YXIgc291cmNlcyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHNvdXJjZXNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgcmV0dXJuIG9uRXJyb3JSZXN1bWVOZXh0V2l0aChhcmdzT3JBcmdBcnJheShzb3VyY2VzKSkoRU1QVFkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9b25FcnJvclJlc3VtZU5leHQuanMubWFwIiwiaW1wb3J0IHsgZnJvbSB9IGZyb20gJy4vZnJvbSc7XG5leHBvcnQgZnVuY3Rpb24gcGFpcnMob2JqLCBzY2hlZHVsZXIpIHtcbiAgICByZXR1cm4gZnJvbShPYmplY3QuZW50cmllcyhvYmopLCBzY2hlZHVsZXIpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFpcnMuanMubWFwIiwiaW1wb3J0IHsgbm90IH0gZnJvbSAnLi4vdXRpbC9ub3QnO1xuaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSAnLi4vb3BlcmF0b3JzL2ZpbHRlcic7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuL2Zyb20nO1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpdGlvbihzb3VyY2UsIHByZWRpY2F0ZSwgdGhpc0FyZykge1xuICAgIHJldHVybiBbZmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZykoaW5uZXJGcm9tKHNvdXJjZSkpLCBmaWx0ZXIobm90KHByZWRpY2F0ZSwgdGhpc0FyZykpKGlubmVyRnJvbShzb3VyY2UpKV07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0aXRpb24uanMubWFwIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgaW5uZXJGcm9tIH0gZnJvbSAnLi9mcm9tJztcbmltcG9ydCB7IGFyZ3NPckFyZ0FycmF5IH0gZnJvbSAnLi4vdXRpbC9hcmdzT3JBcmdBcnJheSc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuLi9vcGVyYXRvcnMvT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiByYWNlKCkge1xuICAgIHZhciBzb3VyY2VzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgc291cmNlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICBzb3VyY2VzID0gYXJnc09yQXJnQXJyYXkoc291cmNlcyk7XG4gICAgcmV0dXJuIHNvdXJjZXMubGVuZ3RoID09PSAxID8gaW5uZXJGcm9tKHNvdXJjZXNbMF0pIDogbmV3IE9ic2VydmFibGUocmFjZUluaXQoc291cmNlcykpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJhY2VJbml0KHNvdXJjZXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKGlubmVyRnJvbShzb3VyY2VzW2ldKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBzID0gMDsgcyA8IHN1YnNjcmlwdGlvbnMubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgIT09IGkgJiYgc3Vic2NyaXB0aW9uc1tzXS51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IHN1YnNjcmlwdGlvbnMgJiYgIXN1YnNjcmliZXIuY2xvc2VkICYmIGkgPCBzb3VyY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBfbG9vcF8xKGkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJhY2UuanMubWFwIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgRU1QVFkgfSBmcm9tICcuL2VtcHR5JztcbmV4cG9ydCBmdW5jdGlvbiByYW5nZShzdGFydCwgY291bnQsIHNjaGVkdWxlcikge1xuICAgIGlmIChjb3VudCA9PSBudWxsKSB7XG4gICAgICAgIGNvdW50ID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgaWYgKGNvdW50IDw9IDApIHtcbiAgICAgICAgcmV0dXJuIEVNUFRZO1xuICAgIH1cbiAgICB2YXIgZW5kID0gY291bnQgKyBzdGFydDtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoc2NoZWR1bGVyXG4gICAgICAgID9cbiAgICAgICAgICAgIGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSBzdGFydDtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG4gPCBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChuKyspO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2hlZHVsZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIDpcbiAgICAgICAgICAgIGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSBzdGFydDtcbiAgICAgICAgICAgICAgICB3aGlsZSAobiA8IGVuZCAmJiAhc3Vic2NyaWJlci5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KG4rKyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmFuZ2UuanMubWFwIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWwvaXNGdW5jdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcihlcnJvck9yRXJyb3JGYWN0b3J5LCBzY2hlZHVsZXIpIHtcbiAgICB2YXIgZXJyb3JGYWN0b3J5ID0gaXNGdW5jdGlvbihlcnJvck9yRXJyb3JGYWN0b3J5KSA/IGVycm9yT3JFcnJvckZhY3RvcnkgOiBmdW5jdGlvbiAoKSB7IHJldHVybiBlcnJvck9yRXJyb3JGYWN0b3J5OyB9O1xuICAgIHZhciBpbml0ID0gZnVuY3Rpb24gKHN1YnNjcmliZXIpIHsgcmV0dXJuIHN1YnNjcmliZXIuZXJyb3IoZXJyb3JGYWN0b3J5KCkpOyB9O1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShzY2hlZHVsZXIgPyBmdW5jdGlvbiAoc3Vic2NyaWJlcikgeyByZXR1cm4gc2NoZWR1bGVyLnNjaGVkdWxlKGluaXQsIDAsIHN1YnNjcmliZXIpOyB9IDogaW5pdCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aHJvd0Vycm9yLmpzLm1hcCIsImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICcuLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IGFzeW5jIGFzIGFzeW5jU2NoZWR1bGVyIH0gZnJvbSAnLi4vc2NoZWR1bGVyL2FzeW5jJztcbmltcG9ydCB7IGlzU2NoZWR1bGVyIH0gZnJvbSAnLi4vdXRpbC9pc1NjaGVkdWxlcic7XG5pbXBvcnQgeyBpc1ZhbGlkRGF0ZSB9IGZyb20gJy4uL3V0aWwvaXNEYXRlJztcbmV4cG9ydCBmdW5jdGlvbiB0aW1lcihkdWVUaW1lLCBpbnRlcnZhbE9yU2NoZWR1bGVyLCBzY2hlZHVsZXIpIHtcbiAgICBpZiAoZHVlVGltZSA9PT0gdm9pZCAwKSB7IGR1ZVRpbWUgPSAwOyB9XG4gICAgaWYgKHNjaGVkdWxlciA9PT0gdm9pZCAwKSB7IHNjaGVkdWxlciA9IGFzeW5jU2NoZWR1bGVyOyB9XG4gICAgdmFyIGludGVydmFsRHVyYXRpb24gPSAtMTtcbiAgICBpZiAoaW50ZXJ2YWxPclNjaGVkdWxlciAhPSBudWxsKSB7XG4gICAgICAgIGlmIChpc1NjaGVkdWxlcihpbnRlcnZhbE9yU2NoZWR1bGVyKSkge1xuICAgICAgICAgICAgc2NoZWR1bGVyID0gaW50ZXJ2YWxPclNjaGVkdWxlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGludGVydmFsRHVyYXRpb24gPSBpbnRlcnZhbE9yU2NoZWR1bGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgZHVlID0gaXNWYWxpZERhdGUoZHVlVGltZSkgPyArZHVlVGltZSAtIHNjaGVkdWxlci5ub3coKSA6IGR1ZVRpbWU7XG4gICAgICAgIGlmIChkdWUgPCAwKSB7XG4gICAgICAgICAgICBkdWUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuID0gMDtcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXN1YnNjcmliZXIuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KG4rKyk7XG4gICAgICAgICAgICAgICAgaWYgKDAgPD0gaW50ZXJ2YWxEdXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlKHVuZGVmaW5lZCwgaW50ZXJ2YWxEdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBkdWUpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGltZXIuanMubWFwIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgaW5uZXJGcm9tIH0gZnJvbSAnLi9mcm9tJztcbmltcG9ydCB7IEVNUFRZIH0gZnJvbSAnLi9lbXB0eSc7XG5leHBvcnQgZnVuY3Rpb24gdXNpbmcocmVzb3VyY2VGYWN0b3J5LCBvYnNlcnZhYmxlRmFjdG9yeSkge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgcmVzb3VyY2UgPSByZXNvdXJjZUZhY3RvcnkoKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG9ic2VydmFibGVGYWN0b3J5KHJlc291cmNlKTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IHJlc3VsdCA/IGlubmVyRnJvbShyZXN1bHQpIDogRU1QVFk7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAocmVzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNpbmcuanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuL2Zyb20nO1xuaW1wb3J0IHsgYXJnc09yQXJnQXJyYXkgfSBmcm9tICcuLi91dGlsL2FyZ3NPckFyZ0FycmF5JztcbmltcG9ydCB7IEVNUFRZIH0gZnJvbSAnLi9lbXB0eSc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuLi9vcGVyYXRvcnMvT3BlcmF0b3JTdWJzY3JpYmVyJztcbmltcG9ydCB7IHBvcFJlc3VsdFNlbGVjdG9yIH0gZnJvbSAnLi4vdXRpbC9hcmdzJztcbmV4cG9ydCBmdW5jdGlvbiB6aXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHZhciByZXN1bHRTZWxlY3RvciA9IHBvcFJlc3VsdFNlbGVjdG9yKGFyZ3MpO1xuICAgIHZhciBzb3VyY2VzID0gYXJnc09yQXJnQXJyYXkoYXJncyk7XG4gICAgcmV0dXJuIHNvdXJjZXMubGVuZ3RoXG4gICAgICAgID8gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgICAgIHZhciBidWZmZXJzID0gc291cmNlcy5tYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gW107IH0pO1xuICAgICAgICAgICAgdmFyIGNvbXBsZXRlZCA9IHNvdXJjZXMubWFwKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9KTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBidWZmZXJzID0gY29tcGxldGVkID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoc291cmNlSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBpbm5lckZyb20oc291cmNlc1tzb3VyY2VJbmRleF0pLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXJzW3NvdXJjZUluZGV4XS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ1ZmZlcnMuZXZlcnkoZnVuY3Rpb24gKGJ1ZmZlcikgeyByZXR1cm4gYnVmZmVyLmxlbmd0aDsgfSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBidWZmZXJzLm1hcChmdW5jdGlvbiAoYnVmZmVyKSB7IHJldHVybiBidWZmZXIuc2hpZnQoKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQocmVzdWx0U2VsZWN0b3IgPyByZXN1bHRTZWxlY3Rvci5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChyZXN1bHQpKSkgOiByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ1ZmZlcnMuc29tZShmdW5jdGlvbiAoYnVmZmVyLCBpKSB7IHJldHVybiAhYnVmZmVyLmxlbmd0aCAmJiBjb21wbGV0ZWRbaV07IH0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRbc291cmNlSW5kZXhdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgIWJ1ZmZlcnNbc291cmNlSW5kZXhdLmxlbmd0aCAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIHNvdXJjZUluZGV4ID0gMDsgIXN1YnNjcmliZXIuY2xvc2VkICYmIHNvdXJjZUluZGV4IDwgc291cmNlcy5sZW5ndGg7IHNvdXJjZUluZGV4KyspIHtcbiAgICAgICAgICAgICAgICBfbG9vcF8xKHNvdXJjZUluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYnVmZmVycyA9IGNvbXBsZXRlZCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgICA6IEVNUFRZO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9emlwLmpzLm1hcCIsImltcG9ydCB7IF9fZXh0ZW5kcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgU3Vic2NyaWJlciB9IGZyb20gJy4uL1N1YnNjcmliZXInO1xudmFyIE9wZXJhdG9yU3Vic2NyaWJlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE9wZXJhdG9yU3Vic2NyaWJlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBPcGVyYXRvclN1YnNjcmliZXIoZGVzdGluYXRpb24sIG9uTmV4dCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25GaW5hbGl6ZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBkZXN0aW5hdGlvbikgfHwgdGhpcztcbiAgICAgICAgX3RoaXMub25GaW5hbGl6ZSA9IG9uRmluYWxpemU7XG4gICAgICAgIF90aGlzLl9uZXh0ID0gb25OZXh0XG4gICAgICAgICAgICA/IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG9uTmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24uZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IF9zdXBlci5wcm90b3R5cGUuX25leHQ7XG4gICAgICAgIF90aGlzLl9lcnJvciA9IG9uRXJyb3JcbiAgICAgICAgICAgID8gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogX3N1cGVyLnByb3RvdHlwZS5fZXJyb3I7XG4gICAgICAgIF90aGlzLl9jb21wbGV0ZSA9IG9uQ29tcGxldGVcbiAgICAgICAgICAgID8gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogX3N1cGVyLnByb3RvdHlwZS5fY29tcGxldGU7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgT3BlcmF0b3JTdWJzY3JpYmVyLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgY2xvc2VkID0gdGhpcy5jbG9zZWQ7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUudW5zdWJzY3JpYmUuY2FsbCh0aGlzKTtcbiAgICAgICAgIWNsb3NlZCAmJiAoKF9hID0gdGhpcy5vbkZpbmFsaXplKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2FsbCh0aGlzKSk7XG4gICAgfTtcbiAgICByZXR1cm4gT3BlcmF0b3JTdWJzY3JpYmVyO1xufShTdWJzY3JpYmVyKSk7XG5leHBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU9wZXJhdG9yU3Vic2NyaWJlci5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGlubmVyRnJvbSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbSc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gYXVkaXQoZHVyYXRpb25TZWxlY3Rvcikge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGhhc1ZhbHVlID0gZmFsc2U7XG4gICAgICAgIHZhciBsYXN0VmFsdWUgPSBudWxsO1xuICAgICAgICB2YXIgZHVyYXRpb25TdWJzY3JpYmVyID0gbnVsbDtcbiAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVuZER1cmF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZHVyYXRpb25TdWJzY3JpYmVyID09PSBudWxsIHx8IGR1cmF0aW9uU3Vic2NyaWJlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogZHVyYXRpb25TdWJzY3JpYmVyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICBkdXJhdGlvblN1YnNjcmliZXIgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXN0VmFsdWU7XG4gICAgICAgICAgICAgICAgbGFzdFZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXNDb21wbGV0ZSAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBjbGVhbnVwRHVyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkdXJhdGlvblN1YnNjcmliZXIgPSBudWxsO1xuICAgICAgICAgICAgaXNDb21wbGV0ZSAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIGxhc3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgaWYgKCFkdXJhdGlvblN1YnNjcmliZXIpIHtcbiAgICAgICAgICAgICAgICBpbm5lckZyb20oZHVyYXRpb25TZWxlY3Rvcih2YWx1ZSkpLnN1YnNjcmliZSgoZHVyYXRpb25TdWJzY3JpYmVyID0gbmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBlbmREdXJhdGlvbiwgY2xlYW51cER1cmF0aW9uKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpc0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICghaGFzVmFsdWUgfHwgIWR1cmF0aW9uU3Vic2NyaWJlciB8fCBkdXJhdGlvblN1YnNjcmliZXIuY2xvc2VkKSAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1ZGl0LmpzLm1hcCIsImltcG9ydCB7IGFzeW5jIH0gZnJvbSAnLi4vc2NoZWR1bGVyL2FzeW5jJztcbmltcG9ydCB7IGF1ZGl0IH0gZnJvbSAnLi9hdWRpdCc7XG5pbXBvcnQgeyB0aW1lciB9IGZyb20gJy4uL29ic2VydmFibGUvdGltZXInO1xuZXhwb3J0IGZ1bmN0aW9uIGF1ZGl0VGltZShkdXJhdGlvbiwgc2NoZWR1bGVyKSB7XG4gICAgaWYgKHNjaGVkdWxlciA9PT0gdm9pZCAwKSB7IHNjaGVkdWxlciA9IGFzeW5jOyB9XG4gICAgcmV0dXJuIGF1ZGl0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRpbWVyKGR1cmF0aW9uLCBzY2hlZHVsZXIpOyB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1ZGl0VGltZS5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuLi91dGlsL25vb3AnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlcihjbG9zaW5nTm90aWZpZXIpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBjdXJyZW50QnVmZmVyID0gW107XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIGN1cnJlbnRCdWZmZXIucHVzaCh2YWx1ZSk7IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChjdXJyZW50QnVmZmVyKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSkpO1xuICAgICAgICBjbG9zaW5nTm90aWZpZXIuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGIgPSBjdXJyZW50QnVmZmVyO1xuICAgICAgICAgICAgY3VycmVudEJ1ZmZlciA9IFtdO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KGIpO1xuICAgICAgICB9LCBub29wKSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjdXJyZW50QnVmZmVyID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJ1ZmZlci5qcy5tYXAiLCJpbXBvcnQgeyBfX3ZhbHVlcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBhcnJSZW1vdmUgfSBmcm9tICcuLi91dGlsL2FyclJlbW92ZSc7XG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyQ291bnQoYnVmZmVyU2l6ZSwgc3RhcnRCdWZmZXJFdmVyeSkge1xuICAgIGlmIChzdGFydEJ1ZmZlckV2ZXJ5ID09PSB2b2lkIDApIHsgc3RhcnRCdWZmZXJFdmVyeSA9IG51bGw7IH1cbiAgICBzdGFydEJ1ZmZlckV2ZXJ5ID0gc3RhcnRCdWZmZXJFdmVyeSAhPT0gbnVsbCAmJiBzdGFydEJ1ZmZlckV2ZXJ5ICE9PSB2b2lkIDAgPyBzdGFydEJ1ZmZlckV2ZXJ5IDogYnVmZmVyU2l6ZTtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBidWZmZXJzID0gW107XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hLCBlXzIsIF9iO1xuICAgICAgICAgICAgdmFyIHRvRW1pdCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoY291bnQrKyAlIHN0YXJ0QnVmZmVyRXZlcnkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBidWZmZXJzLnB1c2goW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBidWZmZXJzXzEgPSBfX3ZhbHVlcyhidWZmZXJzKSwgYnVmZmVyc18xXzEgPSBidWZmZXJzXzEubmV4dCgpOyAhYnVmZmVyc18xXzEuZG9uZTsgYnVmZmVyc18xXzEgPSBidWZmZXJzXzEubmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBidWZmZXIgPSBidWZmZXJzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnVmZmVyU2l6ZSA8PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b0VtaXQgPSB0b0VtaXQgIT09IG51bGwgJiYgdG9FbWl0ICE9PSB2b2lkIDAgPyB0b0VtaXQgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvRW1pdC5wdXNoKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ1ZmZlcnNfMV8xICYmICFidWZmZXJzXzFfMS5kb25lICYmIChfYSA9IGJ1ZmZlcnNfMS5yZXR1cm4pKSBfYS5jYWxsKGJ1ZmZlcnNfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b0VtaXQpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciB0b0VtaXRfMSA9IF9fdmFsdWVzKHRvRW1pdCksIHRvRW1pdF8xXzEgPSB0b0VtaXRfMS5uZXh0KCk7ICF0b0VtaXRfMV8xLmRvbmU7IHRvRW1pdF8xXzEgPSB0b0VtaXRfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBidWZmZXIgPSB0b0VtaXRfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyUmVtb3ZlKGJ1ZmZlcnMsIGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoYnVmZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZV8yXzEpIHsgZV8yID0geyBlcnJvcjogZV8yXzEgfTsgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvRW1pdF8xXzEgJiYgIXRvRW1pdF8xXzEuZG9uZSAmJiAoX2IgPSB0b0VtaXRfMS5yZXR1cm4pKSBfYi5jYWxsKHRvRW1pdF8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMikgdGhyb3cgZV8yLmVycm9yOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZV8zLCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYnVmZmVyc18yID0gX192YWx1ZXMoYnVmZmVycyksIGJ1ZmZlcnNfMl8xID0gYnVmZmVyc18yLm5leHQoKTsgIWJ1ZmZlcnNfMl8xLmRvbmU7IGJ1ZmZlcnNfMl8xID0gYnVmZmVyc18yLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gYnVmZmVyc18yXzEudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChidWZmZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzNfMSkgeyBlXzMgPSB7IGVycm9yOiBlXzNfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnVmZmVyc18yXzEgJiYgIWJ1ZmZlcnNfMl8xLmRvbmUgJiYgKF9hID0gYnVmZmVyc18yLnJldHVybikpIF9hLmNhbGwoYnVmZmVyc18yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzMpIHRocm93IGVfMy5lcnJvcjsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCB1bmRlZmluZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJ1ZmZlcnMgPSBudWxsO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1idWZmZXJDb3VudC5qcy5tYXAiLCJpbXBvcnQgeyBfX3ZhbHVlcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAnLi4vU3Vic2NyaXB0aW9uJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgYXJyUmVtb3ZlIH0gZnJvbSAnLi4vdXRpbC9hcnJSZW1vdmUnO1xuaW1wb3J0IHsgYXN5bmNTY2hlZHVsZXIgfSBmcm9tICcuLi9zY2hlZHVsZXIvYXN5bmMnO1xuaW1wb3J0IHsgcG9wU2NoZWR1bGVyIH0gZnJvbSAnLi4vdXRpbC9hcmdzJztcbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUaW1lKGJ1ZmZlclRpbWVTcGFuKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgb3RoZXJBcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgb3RoZXJBcmdzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgc2NoZWR1bGVyID0gKF9hID0gcG9wU2NoZWR1bGVyKG90aGVyQXJncykpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IGFzeW5jU2NoZWR1bGVyO1xuICAgIHZhciBidWZmZXJDcmVhdGlvbkludGVydmFsID0gKF9iID0gb3RoZXJBcmdzWzBdKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBudWxsO1xuICAgIHZhciBtYXhCdWZmZXJTaXplID0gb3RoZXJBcmdzWzFdIHx8IEluZmluaXR5O1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGJ1ZmZlclJlY29yZHMgPSBbXTtcbiAgICAgICAgdmFyIHJlc3RhcnRPbkVtaXQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVtaXQgPSBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgICAgICAgICB2YXIgYnVmZmVyID0gcmVjb3JkLmJ1ZmZlciwgc3VicyA9IHJlY29yZC5zdWJzO1xuICAgICAgICAgICAgc3Vicy51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgYXJyUmVtb3ZlKGJ1ZmZlclJlY29yZHMsIHJlY29yZCk7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoYnVmZmVyKTtcbiAgICAgICAgICAgIHJlc3RhcnRPbkVtaXQgJiYgc3RhcnRCdWZmZXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN0YXJ0QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGJ1ZmZlclJlY29yZHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VicyA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmFkZChzdWJzKTtcbiAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gW107XG4gICAgICAgICAgICAgICAgdmFyIHJlY29yZF8xID0ge1xuICAgICAgICAgICAgICAgICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgICAgc3Viczogc3VicyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJ1ZmZlclJlY29yZHMucHVzaChyZWNvcmRfMSk7XG4gICAgICAgICAgICAgICAgc3Vicy5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGVtaXQocmVjb3JkXzEpOyB9LCBidWZmZXJUaW1lU3BhbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBidWZmZXJDcmVhdGlvbkludGVydmFsICE9PSBudWxsICYmIGJ1ZmZlckNyZWF0aW9uSW50ZXJ2YWwgPj0gMFxuICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuYWRkKHNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0QnVmZmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmNsb3NlZCAmJiBzdWJzY3JpYmVyLmFkZCh0aGlzLnNjaGVkdWxlKG51bGwsIGJ1ZmZlckNyZWF0aW9uSW50ZXJ2YWwpKTtcbiAgICAgICAgICAgICAgICB9LCBidWZmZXJDcmVhdGlvbkludGVydmFsKSlcbiAgICAgICAgICAgIDogKHJlc3RhcnRPbkVtaXQgPSB0cnVlKTtcbiAgICAgICAgc3RhcnRCdWZmZXIoKTtcbiAgICAgICAgdmFyIGJ1ZmZlclRpbWVTdWJzY3JpYmVyID0gbmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgdmFyIHJlY29yZHNDb3B5ID0gYnVmZmVyUmVjb3Jkcy5zbGljZSgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciByZWNvcmRzQ29weV8xID0gX192YWx1ZXMocmVjb3Jkc0NvcHkpLCByZWNvcmRzQ29weV8xXzEgPSByZWNvcmRzQ29weV8xLm5leHQoKTsgIXJlY29yZHNDb3B5XzFfMS5kb25lOyByZWNvcmRzQ29weV8xXzEgPSByZWNvcmRzQ29weV8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjb3JkID0gcmVjb3Jkc0NvcHlfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gcmVjb3JkLmJ1ZmZlcjtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBtYXhCdWZmZXJTaXplIDw9IGJ1ZmZlci5sZW5ndGggJiYgZW1pdChyZWNvcmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlXzFfMSkgeyBlXzEgPSB7IGVycm9yOiBlXzFfMSB9OyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVjb3Jkc0NvcHlfMV8xICYmICFyZWNvcmRzQ29weV8xXzEuZG9uZSAmJiAoX2EgPSByZWNvcmRzQ29weV8xLnJldHVybikpIF9hLmNhbGwocmVjb3Jkc0NvcHlfMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkgeyBpZiAoZV8xKSB0aHJvdyBlXzEuZXJyb3I7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2hpbGUgKGJ1ZmZlclJlY29yZHMgPT09IG51bGwgfHwgYnVmZmVyUmVjb3JkcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogYnVmZmVyUmVjb3Jkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoYnVmZmVyUmVjb3Jkcy5zaGlmdCgpLmJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidWZmZXJUaW1lU3Vic2NyaWJlciA9PT0gbnVsbCB8fCBidWZmZXJUaW1lU3Vic2NyaWJlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogYnVmZmVyVGltZVN1YnNjcmliZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7IHJldHVybiAoYnVmZmVyUmVjb3JkcyA9IG51bGwpOyB9KTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShidWZmZXJUaW1lU3Vic2NyaWJlcik7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1idWZmZXJUaW1lLmpzLm1hcCIsImltcG9ydCB7IF9fdmFsdWVzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICcuLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5pbXBvcnQgeyBhcnJSZW1vdmUgfSBmcm9tICcuLi91dGlsL2FyclJlbW92ZSc7XG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyVG9nZ2xlKG9wZW5pbmdzLCBjbG9zaW5nU2VsZWN0b3IpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBidWZmZXJzID0gW107XG4gICAgICAgIGlubmVyRnJvbShvcGVuaW5ncykuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKG9wZW5WYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IFtdO1xuICAgICAgICAgICAgYnVmZmVycy5wdXNoKGJ1ZmZlcik7XG4gICAgICAgICAgICB2YXIgY2xvc2luZ1N1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgIHZhciBlbWl0QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGFyclJlbW92ZShidWZmZXJzLCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChidWZmZXIpO1xuICAgICAgICAgICAgICAgIGNsb3NpbmdTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjbG9zaW5nU3Vic2NyaXB0aW9uLmFkZChpbm5lckZyb20oY2xvc2luZ1NlbGVjdG9yKG9wZW5WYWx1ZSkpLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGVtaXRCdWZmZXIsIG5vb3ApKSk7XG4gICAgICAgIH0sIG5vb3ApKTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGVfMSwgX2E7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGJ1ZmZlcnNfMSA9IF9fdmFsdWVzKGJ1ZmZlcnMpLCBidWZmZXJzXzFfMSA9IGJ1ZmZlcnNfMS5uZXh0KCk7ICFidWZmZXJzXzFfMS5kb25lOyBidWZmZXJzXzFfMSA9IGJ1ZmZlcnNfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IGJ1ZmZlcnNfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChidWZmZXJzXzFfMSAmJiAhYnVmZmVyc18xXzEuZG9uZSAmJiAoX2EgPSBidWZmZXJzXzEucmV0dXJuKSkgX2EuY2FsbChidWZmZXJzXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdoaWxlIChidWZmZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoYnVmZmVycy5zaGlmdCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YnVmZmVyVG9nZ2xlLmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlcldoZW4oY2xvc2luZ1NlbGVjdG9yKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgYnVmZmVyID0gbnVsbDtcbiAgICAgICAgdmFyIGNsb3NpbmdTdWJzY3JpYmVyID0gbnVsbDtcbiAgICAgICAgdmFyIG9wZW5CdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjbG9zaW5nU3Vic2NyaWJlciA9PT0gbnVsbCB8fCBjbG9zaW5nU3Vic2NyaWJlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2xvc2luZ1N1YnNjcmliZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHZhciBiID0gYnVmZmVyO1xuICAgICAgICAgICAgYnVmZmVyID0gW107XG4gICAgICAgICAgICBiICYmIHN1YnNjcmliZXIubmV4dChiKTtcbiAgICAgICAgICAgIGlubmVyRnJvbShjbG9zaW5nU2VsZWN0b3IoKSkuc3Vic2NyaWJlKChjbG9zaW5nU3Vic2NyaWJlciA9IG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgb3BlbkJ1ZmZlciwgbm9vcCkpKTtcbiAgICAgICAgfTtcbiAgICAgICAgb3BlbkJ1ZmZlcigpO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiBidWZmZXIgPT09IG51bGwgfHwgYnVmZmVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBidWZmZXIucHVzaCh2YWx1ZSk7IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJ1ZmZlciAmJiBzdWJzY3JpYmVyLm5leHQoYnVmZmVyKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7IHJldHVybiAoYnVmZmVyID0gY2xvc2luZ1N1YnNjcmliZXIgPSBudWxsKTsgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YnVmZmVyV2hlbi5qcy5tYXAiLCJpbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5leHBvcnQgZnVuY3Rpb24gY2F0Y2hFcnJvcihzZWxlY3Rvcikge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgdmFyIHN5bmNVbnN1YiA9IGZhbHNlO1xuICAgICAgICB2YXIgaGFuZGxlZFJlc3VsdDtcbiAgICAgICAgaW5uZXJTdWIgPSBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGhhbmRsZWRSZXN1bHQgPSBpbm5lckZyb20oc2VsZWN0b3IoZXJyLCBjYXRjaEVycm9yKHNlbGVjdG9yKShzb3VyY2UpKSk7XG4gICAgICAgICAgICBpZiAoaW5uZXJTdWIpIHtcbiAgICAgICAgICAgICAgICBpbm5lclN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgICAgICAgICBoYW5kbGVkUmVzdWx0LnN1YnNjcmliZShzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN5bmNVbnN1YiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgaWYgKHN5bmNVbnN1Yikge1xuICAgICAgICAgICAgaW5uZXJTdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgICAgIGhhbmRsZWRSZXN1bHQuc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYXRjaEVycm9yLmpzLm1hcCIsImltcG9ydCB7IGNvbWJpbmVMYXRlc3RBbGwgfSBmcm9tICcuL2NvbWJpbmVMYXRlc3RBbGwnO1xuZXhwb3J0IHZhciBjb21iaW5lQWxsID0gY29tYmluZUxhdGVzdEFsbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbWJpbmVBbGwuanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBjb21iaW5lTGF0ZXN0SW5pdCB9IGZyb20gJy4uL29ic2VydmFibGUvY29tYmluZUxhdGVzdCc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGFyZ3NPckFyZ0FycmF5IH0gZnJvbSAnLi4vdXRpbC9hcmdzT3JBcmdBcnJheSc7XG5pbXBvcnQgeyBtYXBPbmVPck1hbnlBcmdzIH0gZnJvbSAnLi4vdXRpbC9tYXBPbmVPck1hbnlBcmdzJztcbmltcG9ydCB7IHBpcGUgfSBmcm9tICcuLi91dGlsL3BpcGUnO1xuaW1wb3J0IHsgcG9wUmVzdWx0U2VsZWN0b3IgfSBmcm9tICcuLi91dGlsL2FyZ3MnO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVMYXRlc3QoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHZhciByZXN1bHRTZWxlY3RvciA9IHBvcFJlc3VsdFNlbGVjdG9yKGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHRTZWxlY3RvclxuICAgICAgICA/IHBpcGUoY29tYmluZUxhdGVzdC5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhcmdzKSkpLCBtYXBPbmVPck1hbnlBcmdzKHJlc3VsdFNlbGVjdG9yKSlcbiAgICAgICAgOiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgICAgIGNvbWJpbmVMYXRlc3RJbml0KF9fc3ByZWFkQXJyYXkoW3NvdXJjZV0sIF9fcmVhZChhcmdzT3JBcmdBcnJheShhcmdzKSkpKShzdWJzY3JpYmVyKTtcbiAgICAgICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21iaW5lTGF0ZXN0LmpzLm1hcCIsImltcG9ydCB7IGNvbWJpbmVMYXRlc3QgfSBmcm9tICcuLi9vYnNlcnZhYmxlL2NvbWJpbmVMYXRlc3QnO1xuaW1wb3J0IHsgam9pbkFsbEludGVybmFscyB9IGZyb20gJy4vam9pbkFsbEludGVybmFscyc7XG5leHBvcnQgZnVuY3Rpb24gY29tYmluZUxhdGVzdEFsbChwcm9qZWN0KSB7XG4gICAgcmV0dXJuIGpvaW5BbGxJbnRlcm5hbHMoY29tYmluZUxhdGVzdCwgcHJvamVjdCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21iaW5lTGF0ZXN0QWxsLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgY29tYmluZUxhdGVzdCB9IGZyb20gJy4vY29tYmluZUxhdGVzdCc7XG5leHBvcnQgZnVuY3Rpb24gY29tYmluZUxhdGVzdFdpdGgoKSB7XG4gICAgdmFyIG90aGVyU291cmNlcyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIG90aGVyU291cmNlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gY29tYmluZUxhdGVzdC5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChvdGhlclNvdXJjZXMpKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21iaW5lTGF0ZXN0V2l0aC5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXkgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgY29uY2F0QWxsIH0gZnJvbSAnLi9jb25jYXRBbGwnO1xuaW1wb3J0IHsgaW50ZXJuYWxGcm9tQXJyYXkgfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb21BcnJheSc7XG5pbXBvcnQgeyBwb3BTY2hlZHVsZXIgfSBmcm9tICcuLi91dGlsL2FyZ3MnO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdCgpIHtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgdmFyIHNjaGVkdWxlciA9IHBvcFNjaGVkdWxlcihhcmdzKTtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIGNvbmNhdEFsbCgpKGludGVybmFsRnJvbUFycmF5KF9fc3ByZWFkQXJyYXkoW3NvdXJjZV0sIF9fcmVhZChhcmdzKSksIHNjaGVkdWxlcikpLnN1YnNjcmliZShzdWJzY3JpYmVyKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbmNhdC5qcy5tYXAiLCJpbXBvcnQgeyBtZXJnZUFsbCB9IGZyb20gJy4vbWVyZ2VBbGwnO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdEFsbCgpIHtcbiAgICByZXR1cm4gbWVyZ2VBbGwoMSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25jYXRBbGwuanMubWFwIiwiaW1wb3J0IHsgbWVyZ2VNYXAgfSBmcm9tICcuL21lcmdlTWFwJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuLi91dGlsL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdE1hcChwcm9qZWN0LCByZXN1bHRTZWxlY3Rvcikge1xuICAgIHJldHVybiBpc0Z1bmN0aW9uKHJlc3VsdFNlbGVjdG9yKSA/IG1lcmdlTWFwKHByb2plY3QsIHJlc3VsdFNlbGVjdG9yLCAxKSA6IG1lcmdlTWFwKHByb2plY3QsIDEpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uY2F0TWFwLmpzLm1hcCIsImltcG9ydCB7IGNvbmNhdE1hcCB9IGZyb20gJy4vY29uY2F0TWFwJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuLi91dGlsL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdE1hcFRvKGlubmVyT2JzZXJ2YWJsZSwgcmVzdWx0U2VsZWN0b3IpIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbihyZXN1bHRTZWxlY3RvcikgPyBjb25jYXRNYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gaW5uZXJPYnNlcnZhYmxlOyB9LCByZXN1bHRTZWxlY3RvcikgOiBjb25jYXRNYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gaW5uZXJPYnNlcnZhYmxlOyB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbmNhdE1hcFRvLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgY29uY2F0IH0gZnJvbSAnLi9jb25jYXQnO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdFdpdGgoKSB7XG4gICAgdmFyIG90aGVyU291cmNlcyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIG90aGVyU291cmNlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gY29uY2F0LmFwcGx5KHZvaWQgMCwgX19zcHJlYWRBcnJheShbXSwgX19yZWFkKG90aGVyU291cmNlcykpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbmNhdFdpdGguanMubWFwIiwiaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJy4uL1N1YmplY3QnO1xuaW1wb3J0IHsgZnJvbSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGZyb21TdWJzY3JpYmFibGUgfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb21TdWJzY3JpYmFibGUnO1xudmFyIERFRkFVTFRfQ09ORklHID0ge1xuICAgIGNvbm5lY3RvcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IFN1YmplY3QoKTsgfSxcbn07XG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdChzZWxlY3RvciwgY29uZmlnKSB7XG4gICAgaWYgKGNvbmZpZyA9PT0gdm9pZCAwKSB7IGNvbmZpZyA9IERFRkFVTFRfQ09ORklHOyB9XG4gICAgdmFyIGNvbm5lY3RvciA9IGNvbmZpZy5jb25uZWN0b3I7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgc3ViamVjdCA9IGNvbm5lY3RvcigpO1xuICAgICAgICBmcm9tKHNlbGVjdG9yKGZyb21TdWJzY3JpYmFibGUoc3ViamVjdCkpKS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgIHN1YnNjcmliZXIuYWRkKHNvdXJjZS5zdWJzY3JpYmUoc3ViamVjdCkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29ubmVjdC5qcy5tYXAiLCJpbXBvcnQgeyByZWR1Y2UgfSBmcm9tICcuL3JlZHVjZSc7XG5leHBvcnQgZnVuY3Rpb24gY291bnQocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIHJlZHVjZShmdW5jdGlvbiAodG90YWwsIHZhbHVlLCBpKSB7IHJldHVybiAoIXByZWRpY2F0ZSB8fCBwcmVkaWNhdGUodmFsdWUsIGkpID8gdG90YWwgKyAxIDogdG90YWwpOyB9LCAwKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvdW50LmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuZXhwb3J0IGZ1bmN0aW9uIGRlYm91bmNlKGR1cmF0aW9uU2VsZWN0b3IpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBoYXNWYWx1ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgbGFzdFZhbHVlID0gbnVsbDtcbiAgICAgICAgdmFyIGR1cmF0aW9uU3Vic2NyaWJlciA9IG51bGw7XG4gICAgICAgIHZhciBlbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZHVyYXRpb25TdWJzY3JpYmVyID09PSBudWxsIHx8IGR1cmF0aW9uU3Vic2NyaWJlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogZHVyYXRpb25TdWJzY3JpYmVyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICBkdXJhdGlvblN1YnNjcmliZXIgPSBudWxsO1xuICAgICAgICAgICAgaWYgKGhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXN0VmFsdWU7XG4gICAgICAgICAgICAgICAgbGFzdFZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBkdXJhdGlvblN1YnNjcmliZXIgPT09IG51bGwgfHwgZHVyYXRpb25TdWJzY3JpYmVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkdXJhdGlvblN1YnNjcmliZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIGxhc3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgZHVyYXRpb25TdWJzY3JpYmVyID0gbmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBlbWl0LCBub29wKTtcbiAgICAgICAgICAgIGlubmVyRnJvbShkdXJhdGlvblNlbGVjdG9yKHZhbHVlKSkuc3Vic2NyaWJlKGR1cmF0aW9uU3Vic2NyaWJlcik7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVtaXQoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsYXN0VmFsdWUgPSBkdXJhdGlvblN1YnNjcmliZXIgPSBudWxsO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWJvdW5jZS5qcy5tYXAiLCJpbXBvcnQgeyBhc3luY1NjaGVkdWxlciB9IGZyb20gJy4uL3NjaGVkdWxlci9hc3luYyc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZVRpbWUoZHVlVGltZSwgc2NoZWR1bGVyKSB7XG4gICAgaWYgKHNjaGVkdWxlciA9PT0gdm9pZCAwKSB7IHNjaGVkdWxlciA9IGFzeW5jU2NoZWR1bGVyOyB9XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgYWN0aXZlVGFzayA9IG51bGw7XG4gICAgICAgIHZhciBsYXN0VmFsdWUgPSBudWxsO1xuICAgICAgICB2YXIgbGFzdFRpbWUgPSBudWxsO1xuICAgICAgICB2YXIgZW1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhY3RpdmVUYXNrKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlVGFzay51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIGFjdGl2ZVRhc2sgPSBudWxsO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGxhc3RWYWx1ZTtcbiAgICAgICAgICAgICAgICBsYXN0VmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZ1bmN0aW9uIGVtaXRXaGVuSWRsZSgpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXRUaW1lID0gbGFzdFRpbWUgKyBkdWVUaW1lO1xuICAgICAgICAgICAgdmFyIG5vdyA9IHNjaGVkdWxlci5ub3coKTtcbiAgICAgICAgICAgIGlmIChub3cgPCB0YXJnZXRUaW1lKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlVGFzayA9IHRoaXMuc2NoZWR1bGUodW5kZWZpbmVkLCB0YXJnZXRUaW1lIC0gbm93KTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmFkZChhY3RpdmVUYXNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbWl0KCk7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgbGFzdFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICBsYXN0VGltZSA9IHNjaGVkdWxlci5ub3coKTtcbiAgICAgICAgICAgIGlmICghYWN0aXZlVGFzaykge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVRhc2sgPSBzY2hlZHVsZXIuc2NoZWR1bGUoZW1pdFdoZW5JZGxlLCBkdWVUaW1lKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmFkZChhY3RpdmVUYXNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZW1pdCgpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCB1bmRlZmluZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxhc3RWYWx1ZSA9IGFjdGl2ZVRhc2sgPSBudWxsO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWJvdW5jZVRpbWUuanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdElmRW1wdHkoZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgaGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaGFzVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFoYXNWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChkZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWZhdWx0SWZFbXB0eS5qcy5tYXAiLCJpbXBvcnQgeyBhc3luY1NjaGVkdWxlciB9IGZyb20gJy4uL3NjaGVkdWxlci9hc3luYyc7XG5pbXBvcnQgeyBkZWxheVdoZW4gfSBmcm9tICcuL2RlbGF5V2hlbic7XG5pbXBvcnQgeyB0aW1lciB9IGZyb20gJy4uL29ic2VydmFibGUvdGltZXInO1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGF5KGR1ZSwgc2NoZWR1bGVyKSB7XG4gICAgaWYgKHNjaGVkdWxlciA9PT0gdm9pZCAwKSB7IHNjaGVkdWxlciA9IGFzeW5jU2NoZWR1bGVyOyB9XG4gICAgdmFyIGR1cmF0aW9uID0gdGltZXIoZHVlLCBzY2hlZHVsZXIpO1xuICAgIHJldHVybiBkZWxheVdoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gZHVyYXRpb247IH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVsYXkuanMubWFwIiwiaW1wb3J0IHsgY29uY2F0IH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9jb25jYXQnO1xuaW1wb3J0IHsgdGFrZSB9IGZyb20gJy4vdGFrZSc7XG5pbXBvcnQgeyBpZ25vcmVFbGVtZW50cyB9IGZyb20gJy4vaWdub3JlRWxlbWVudHMnO1xuaW1wb3J0IHsgbWFwVG8gfSBmcm9tICcuL21hcFRvJztcbmltcG9ydCB7IG1lcmdlTWFwIH0gZnJvbSAnLi9tZXJnZU1hcCc7XG5leHBvcnQgZnVuY3Rpb24gZGVsYXlXaGVuKGRlbGF5RHVyYXRpb25TZWxlY3Rvciwgc3Vic2NyaXB0aW9uRGVsYXkpIHtcbiAgICBpZiAoc3Vic2NyaXB0aW9uRGVsYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBjb25jYXQoc3Vic2NyaXB0aW9uRGVsYXkucGlwZSh0YWtlKDEpLCBpZ25vcmVFbGVtZW50cygpKSwgc291cmNlLnBpcGUoZGVsYXlXaGVuKGRlbGF5RHVyYXRpb25TZWxlY3RvcikpKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlTWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHsgcmV0dXJuIGRlbGF5RHVyYXRpb25TZWxlY3Rvcih2YWx1ZSwgaW5kZXgpLnBpcGUodGFrZSgxKSwgbWFwVG8odmFsdWUpKTsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kZWxheVdoZW4uanMubWFwIiwiaW1wb3J0IHsgb2JzZXJ2ZU5vdGlmaWNhdGlvbiB9IGZyb20gJy4uL05vdGlmaWNhdGlvbic7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBkZW1hdGVyaWFsaXplKCkge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uIChub3RpZmljYXRpb24pIHsgcmV0dXJuIG9ic2VydmVOb3RpZmljYXRpb24obm90aWZpY2F0aW9uLCBzdWJzY3JpYmVyKTsgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGVtYXRlcmlhbGl6ZS5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuLi91dGlsL25vb3AnO1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RpbmN0KGtleVNlbGVjdG9yLCBmbHVzaGVzKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgZGlzdGluY3RLZXlzID0gbmV3IFNldCgpO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5U2VsZWN0b3IgPyBrZXlTZWxlY3Rvcih2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgICAgIGlmICghZGlzdGluY3RLZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgZGlzdGluY3RLZXlzLmFkZChrZXkpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgZmx1c2hlcyA9PT0gbnVsbCB8fCBmbHVzaGVzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmbHVzaGVzLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRpc3RpbmN0S2V5cy5jbGVhcigpOyB9LCBub29wKSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXN0aW5jdC5qcy5tYXAiLCJpbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4uL3V0aWwvaWRlbnRpdHknO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gZGlzdGluY3RVbnRpbENoYW5nZWQoY29tcGFyYXRvciwga2V5U2VsZWN0b3IpIHtcbiAgICBpZiAoa2V5U2VsZWN0b3IgPT09IHZvaWQgMCkgeyBrZXlTZWxlY3RvciA9IGlkZW50aXR5OyB9XG4gICAgY29tcGFyYXRvciA9IGNvbXBhcmF0b3IgIT09IG51bGwgJiYgY29tcGFyYXRvciAhPT0gdm9pZCAwID8gY29tcGFyYXRvciA6IGRlZmF1bHRDb21wYXJlO1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHByZXZpb3VzS2V5O1xuICAgICAgICB2YXIgZmlyc3QgPSB0cnVlO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudEtleSA9IGtleVNlbGVjdG9yKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChmaXJzdCB8fCAhY29tcGFyYXRvcihwcmV2aW91c0tleSwgY3VycmVudEtleSkpIHtcbiAgICAgICAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHByZXZpb3VzS2V5ID0gY3VycmVudEtleTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q29tcGFyZShhLCBiKSB7XG4gICAgcmV0dXJuIGEgPT09IGI7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXN0aW5jdFVudGlsQ2hhbmdlZC5qcy5tYXAiLCJpbXBvcnQgeyBkaXN0aW5jdFVudGlsQ2hhbmdlZCB9IGZyb20gJy4vZGlzdGluY3RVbnRpbENoYW5nZWQnO1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RpbmN0VW50aWxLZXlDaGFuZ2VkKGtleSwgY29tcGFyZSkge1xuICAgIHJldHVybiBkaXN0aW5jdFVudGlsQ2hhbmdlZChmdW5jdGlvbiAoeCwgeSkgeyByZXR1cm4gY29tcGFyZSA/IGNvbXBhcmUoeFtrZXldLCB5W2tleV0pIDogeFtrZXldID09PSB5W2tleV07IH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlzdGluY3RVbnRpbEtleUNoYW5nZWQuanMubWFwIiwiaW1wb3J0IHsgQXJndW1lbnRPdXRPZlJhbmdlRXJyb3IgfSBmcm9tICcuLi91dGlsL0FyZ3VtZW50T3V0T2ZSYW5nZUVycm9yJztcbmltcG9ydCB7IGZpbHRlciB9IGZyb20gJy4vZmlsdGVyJztcbmltcG9ydCB7IHRocm93SWZFbXB0eSB9IGZyb20gJy4vdGhyb3dJZkVtcHR5JztcbmltcG9ydCB7IGRlZmF1bHRJZkVtcHR5IH0gZnJvbSAnLi9kZWZhdWx0SWZFbXB0eSc7XG5pbXBvcnQgeyB0YWtlIH0gZnJvbSAnLi90YWtlJztcbmV4cG9ydCBmdW5jdGlvbiBlbGVtZW50QXQoaW5kZXgsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50T3V0T2ZSYW5nZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBoYXNEZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID49IDI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5waXBlKGZpbHRlcihmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gaSA9PT0gaW5kZXg7IH0pLCB0YWtlKDEpLCBoYXNEZWZhdWx0VmFsdWUgPyBkZWZhdWx0SWZFbXB0eShkZWZhdWx0VmFsdWUpIDogdGhyb3dJZkVtcHR5KGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBBcmd1bWVudE91dE9mUmFuZ2VFcnJvcigpOyB9KSk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVsZW1lbnRBdC5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXkgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IGNvbmNhdCB9IGZyb20gJy4uL29ic2VydmFibGUvY29uY2F0JztcbmltcG9ydCB7IG9mIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9vZic7XG5leHBvcnQgZnVuY3Rpb24gZW5kV2l0aCgpIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFsdWVzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlKSB7IHJldHVybiBjb25jYXQoc291cmNlLCBvZi5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZCh2YWx1ZXMpKSkpOyB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW5kV2l0aC5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBldmVyeShwcmVkaWNhdGUsIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghcHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4KyssIHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHRydWUpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldmVyeS5qcy5tYXAiLCJpbXBvcnQgeyBleGhhdXN0QWxsIH0gZnJvbSAnLi9leGhhdXN0QWxsJztcbmV4cG9ydCB2YXIgZXhoYXVzdCA9IGV4aGF1c3RBbGw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1leGhhdXN0LmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgaW5uZXJGcm9tIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9mcm9tJztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBleGhhdXN0QWxsKCkge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uIChpbm5lcikge1xuICAgICAgICAgICAgaWYgKCFpbm5lclN1Yikge1xuICAgICAgICAgICAgICAgIGlubmVyU3ViID0gaW5uZXJGcm9tKGlubmVyKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCB1bmRlZmluZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJTdWIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpc0NvbXBsZXRlICYmIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlzQ29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgIWlubmVyU3ViICYmIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXhoYXVzdEFsbC5qcy5tYXAiLCJpbXBvcnQgeyBtYXAgfSBmcm9tICcuL21hcCc7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gZXhoYXVzdE1hcChwcm9qZWN0LCByZXN1bHRTZWxlY3Rvcikge1xuICAgIGlmIChyZXN1bHRTZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZS5waXBlKGV4aGF1c3RNYXAoZnVuY3Rpb24gKGEsIGkpIHsgcmV0dXJuIGlubmVyRnJvbShwcm9qZWN0KGEsIGkpKS5waXBlKG1hcChmdW5jdGlvbiAoYiwgaWkpIHsgcmV0dXJuIHJlc3VsdFNlbGVjdG9yKGEsIGIsIGksIGlpKTsgfSkpOyB9KSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgdmFyIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uIChvdXRlclZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWlubmVyU3ViKSB7XG4gICAgICAgICAgICAgICAgaW5uZXJTdWIgPSBuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpbm5lclN1YiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlzQ29tcGxldGUgJiYgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlubmVyRnJvbShwcm9qZWN0KG91dGVyVmFsdWUsIGluZGV4KyspKS5zdWJzY3JpYmUoaW5uZXJTdWIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpc0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICFpbm5lclN1YiAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV4aGF1c3RNYXAuanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBtZXJnZUludGVybmFscyB9IGZyb20gJy4vbWVyZ2VJbnRlcm5hbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZChwcm9qZWN0LCBjb25jdXJyZW50LCBzY2hlZHVsZXIpIHtcbiAgICBpZiAoY29uY3VycmVudCA9PT0gdm9pZCAwKSB7IGNvbmN1cnJlbnQgPSBJbmZpbml0eTsgfVxuICAgIGNvbmN1cnJlbnQgPSAoY29uY3VycmVudCB8fCAwKSA8IDEgPyBJbmZpbml0eSA6IGNvbmN1cnJlbnQ7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICByZXR1cm4gbWVyZ2VJbnRlcm5hbHMoc291cmNlLCBzdWJzY3JpYmVyLCBwcm9qZWN0LCBjb25jdXJyZW50LCB1bmRlZmluZWQsIHRydWUsIHNjaGVkdWxlcik7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1leHBhbmQuanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyKHByZWRpY2F0ZSwgdGhpc0FyZykge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gcHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4KyspICYmIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7IH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZpbHRlci5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmV4cG9ydCBmdW5jdGlvbiBmaW5hbGl6ZShjYWxsYmFjaykge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNvdXJjZS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmFkZChjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZpbmFsaXplLmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmQocHJlZGljYXRlLCB0aGlzQXJnKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoY3JlYXRlRmluZChwcmVkaWNhdGUsIHRoaXNBcmcsICd2YWx1ZScpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGaW5kKHByZWRpY2F0ZSwgdGhpc0FyZywgZW1pdCkge1xuICAgIHZhciBmaW5kSW5kZXggPSBlbWl0ID09PSAnaW5kZXgnO1xuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBpID0gaW5kZXgrKztcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgc291cmNlKSkge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChmaW5kSW5kZXggPyBpIDogdmFsdWUpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KGZpbmRJbmRleCA/IC0xIDogdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSkpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1maW5kLmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgY3JlYXRlRmluZCB9IGZyb20gJy4vZmluZCc7XG5leHBvcnQgZnVuY3Rpb24gZmluZEluZGV4KHByZWRpY2F0ZSwgdGhpc0FyZykge1xuICAgIHJldHVybiBvcGVyYXRlKGNyZWF0ZUZpbmQocHJlZGljYXRlLCB0aGlzQXJnLCAnaW5kZXgnKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1maW5kSW5kZXguanMubWFwIiwiaW1wb3J0IHsgRW1wdHlFcnJvciB9IGZyb20gJy4uL3V0aWwvRW1wdHlFcnJvcic7XG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICcuL2ZpbHRlcic7XG5pbXBvcnQgeyB0YWtlIH0gZnJvbSAnLi90YWtlJztcbmltcG9ydCB7IGRlZmF1bHRJZkVtcHR5IH0gZnJvbSAnLi9kZWZhdWx0SWZFbXB0eSc7XG5pbXBvcnQgeyB0aHJvd0lmRW1wdHkgfSBmcm9tICcuL3Rocm93SWZFbXB0eSc7XG5pbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4uL3V0aWwvaWRlbnRpdHknO1xuZXhwb3J0IGZ1bmN0aW9uIGZpcnN0KHByZWRpY2F0ZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgdmFyIGhhc0RlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPj0gMjtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgICByZXR1cm4gc291cmNlLnBpcGUocHJlZGljYXRlID8gZmlsdGVyKGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiBwcmVkaWNhdGUodiwgaSwgc291cmNlKTsgfSkgOiBpZGVudGl0eSwgdGFrZSgxKSwgaGFzRGVmYXVsdFZhbHVlID8gZGVmYXVsdElmRW1wdHkoZGVmYXVsdFZhbHVlKSA6IHRocm93SWZFbXB0eShmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgRW1wdHlFcnJvcigpOyB9KSk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZpcnN0LmpzLm1hcCIsImltcG9ydCB7IG1lcmdlTWFwIH0gZnJvbSAnLi9tZXJnZU1hcCc7XG5leHBvcnQgdmFyIGZsYXRNYXAgPSBtZXJnZU1hcDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZsYXRNYXAuanMubWFwIiwiaW1wb3J0IHsgX19leHRlbmRzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJy4uL1N1YmplY3QnO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBCeShrZXlTZWxlY3RvciwgZWxlbWVudE9yT3B0aW9ucywgZHVyYXRpb24sIGNvbm5lY3Rvcikge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQ7XG4gICAgICAgIGlmICghZWxlbWVudE9yT3B0aW9ucyB8fCB0eXBlb2YgZWxlbWVudE9yT3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnRPck9wdGlvbnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAoZHVyYXRpb24gPSBlbGVtZW50T3JPcHRpb25zLmR1cmF0aW9uLCBlbGVtZW50ID0gZWxlbWVudE9yT3B0aW9ucy5lbGVtZW50LCBjb25uZWN0b3IgPSBlbGVtZW50T3JPcHRpb25zLmNvbm5lY3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdyb3VwcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdmFyIG5vdGlmeSA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgZ3JvdXBzLmZvckVhY2goY2IpO1xuICAgICAgICAgICAgY2Ioc3Vic2NyaWJlcik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBoYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChlcnIpIHsgcmV0dXJuIG5vdGlmeShmdW5jdGlvbiAoY29uc3VtZXIpIHsgcmV0dXJuIGNvbnN1bWVyLmVycm9yKGVycik7IH0pOyB9O1xuICAgICAgICB2YXIgZ3JvdXBCeVNvdXJjZVN1YnNjcmliZXIgPSBuZXcgR3JvdXBCeVN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBrZXlfMSA9IGtleVNlbGVjdG9yKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXBfMSA9IGdyb3Vwcy5nZXQoa2V5XzEpO1xuICAgICAgICAgICAgICAgIGlmICghZ3JvdXBfMSkge1xuICAgICAgICAgICAgICAgICAgICBncm91cHMuc2V0KGtleV8xLCAoZ3JvdXBfMSA9IGNvbm5lY3RvciA/IGNvbm5lY3RvcigpIDogbmV3IFN1YmplY3QoKSkpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvdXBlZCA9IGNyZWF0ZUdyb3VwZWRPYnNlcnZhYmxlKGtleV8xLCBncm91cF8xKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KGdyb3VwZWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkdXJhdGlvblN1YnNjcmliZXJfMSA9IG5ldyBPcGVyYXRvclN1YnNjcmliZXIoZ3JvdXBfMSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwXzEuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvblN1YnNjcmliZXJfMSA9PT0gbnVsbCB8fCBkdXJhdGlvblN1YnNjcmliZXJfMSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZHVyYXRpb25TdWJzY3JpYmVyXzEudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7IHJldHVybiBncm91cHMuZGVsZXRlKGtleV8xKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cEJ5U291cmNlU3Vic2NyaWJlci5hZGQoaW5uZXJGcm9tKGR1cmF0aW9uKGdyb3VwZWQpKS5zdWJzY3JpYmUoZHVyYXRpb25TdWJzY3JpYmVyXzEpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBncm91cF8xLm5leHQoZWxlbWVudCA/IGVsZW1lbnQodmFsdWUpIDogdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGhhbmRsZUVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5vdGlmeShmdW5jdGlvbiAoY29uc3VtZXIpIHsgcmV0dXJuIGNvbnN1bWVyLmNvbXBsZXRlKCk7IH0pOyB9LCBoYW5kbGVFcnJvciwgZnVuY3Rpb24gKCkgeyByZXR1cm4gZ3JvdXBzLmNsZWFyKCk7IH0pO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKGdyb3VwQnlTb3VyY2VTdWJzY3JpYmVyKTtcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR3JvdXBlZE9ic2VydmFibGUoa2V5LCBncm91cFN1YmplY3QpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgT2JzZXJ2YWJsZShmdW5jdGlvbiAoZ3JvdXBTdWJzY3JpYmVyKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXBCeVNvdXJjZVN1YnNjcmliZXIuYWN0aXZlR3JvdXBzKys7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyU3ViID0gZ3JvdXBTdWJqZWN0LnN1YnNjcmliZShncm91cFN1YnNjcmliZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlubmVyU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICAgIC0tZ3JvdXBCeVNvdXJjZVN1YnNjcmliZXIuYWN0aXZlR3JvdXBzID09PSAwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cEJ5U291cmNlU3Vic2NyaWJlci50ZWFyZG93bkF0dGVtcHRlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBCeVNvdXJjZVN1YnNjcmliZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN1bHQua2V5ID0ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxudmFyIEdyb3VwQnlTdWJzY3JpYmVyID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoR3JvdXBCeVN1YnNjcmliZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gR3JvdXBCeVN1YnNjcmliZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5hY3RpdmVHcm91cHMgPSAwO1xuICAgICAgICBfdGhpcy50ZWFyZG93bkF0dGVtcHRlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIEdyb3VwQnlTdWJzY3JpYmVyLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50ZWFyZG93bkF0dGVtcHRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuYWN0aXZlR3JvdXBzID09PSAwICYmIF9zdXBlci5wcm90b3R5cGUudW5zdWJzY3JpYmUuY2FsbCh0aGlzKTtcbiAgICB9O1xuICAgIHJldHVybiBHcm91cEJ5U3Vic2NyaWJlcjtcbn0oT3BlcmF0b3JTdWJzY3JpYmVyKSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ncm91cEJ5LmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5leHBvcnQgZnVuY3Rpb24gaWdub3JlRWxlbWVudHMoKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgbm9vcCkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aWdub3JlRWxlbWVudHMuanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoZmFsc2UpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzRW1wdHkuanMubWFwIiwiaW1wb3J0IHsgaWRlbnRpdHkgfSBmcm9tICcuLi91dGlsL2lkZW50aXR5JztcbmltcG9ydCB7IG1hcE9uZU9yTWFueUFyZ3MgfSBmcm9tICcuLi91dGlsL21hcE9uZU9yTWFueUFyZ3MnO1xuaW1wb3J0IHsgcGlwZSB9IGZyb20gJy4uL3V0aWwvcGlwZSc7XG5pbXBvcnQgeyBtZXJnZU1hcCB9IGZyb20gJy4vbWVyZ2VNYXAnO1xuaW1wb3J0IHsgdG9BcnJheSB9IGZyb20gJy4vdG9BcnJheSc7XG5leHBvcnQgZnVuY3Rpb24gam9pbkFsbEludGVybmFscyhqb2luRm4sIHByb2plY3QpIHtcbiAgICByZXR1cm4gcGlwZSh0b0FycmF5KCksIG1lcmdlTWFwKGZ1bmN0aW9uIChzb3VyY2VzKSB7IHJldHVybiBqb2luRm4oc291cmNlcyk7IH0pLCBwcm9qZWN0ID8gbWFwT25lT3JNYW55QXJncyhwcm9qZWN0KSA6IGlkZW50aXR5KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWpvaW5BbGxJbnRlcm5hbHMuanMubWFwIiwiaW1wb3J0IHsgRW1wdHlFcnJvciB9IGZyb20gJy4uL3V0aWwvRW1wdHlFcnJvcic7XG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICcuL2ZpbHRlcic7XG5pbXBvcnQgeyB0YWtlTGFzdCB9IGZyb20gJy4vdGFrZUxhc3QnO1xuaW1wb3J0IHsgdGhyb3dJZkVtcHR5IH0gZnJvbSAnLi90aHJvd0lmRW1wdHknO1xuaW1wb3J0IHsgZGVmYXVsdElmRW1wdHkgfSBmcm9tICcuL2RlZmF1bHRJZkVtcHR5JztcbmltcG9ydCB7IGlkZW50aXR5IH0gZnJvbSAnLi4vdXRpbC9pZGVudGl0eSc7XG5leHBvcnQgZnVuY3Rpb24gbGFzdChwcmVkaWNhdGUsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHZhciBoYXNEZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID49IDI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHNvdXJjZS5waXBlKHByZWRpY2F0ZSA/IGZpbHRlcihmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gcHJlZGljYXRlKHYsIGksIHNvdXJjZSk7IH0pIDogaWRlbnRpdHksIHRha2VMYXN0KDEpLCBoYXNEZWZhdWx0VmFsdWUgPyBkZWZhdWx0SWZFbXB0eShkZWZhdWx0VmFsdWUpIDogdGhyb3dJZkVtcHR5KGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBFbXB0eUVycm9yKCk7IH0pKTtcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bGFzdC5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBtYXAocHJvamVjdCwgdGhpc0FyZykge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHByb2plY3QuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaW5kZXgrKykpO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXAuanMubWFwIiwiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi9tYXAnO1xuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvKHZhbHVlKSB7XG4gICAgcmV0dXJuIG1hcChmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBUby5qcy5tYXAiLCJpbXBvcnQgeyBOb3RpZmljYXRpb24gfSBmcm9tICcuLi9Ob3RpZmljYXRpb24nO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gbWF0ZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoTm90aWZpY2F0aW9uLmNyZWF0ZU5leHQodmFsdWUpKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KE5vdGlmaWNhdGlvbi5jcmVhdGVDb21wbGV0ZSgpKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KE5vdGlmaWNhdGlvbi5jcmVhdGVFcnJvcihlcnIpKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0ZXJpYWxpemUuanMubWFwIiwiaW1wb3J0IHsgcmVkdWNlIH0gZnJvbSAnLi9yZWR1Y2UnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWwvaXNGdW5jdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gbWF4KGNvbXBhcmVyKSB7XG4gICAgcmV0dXJuIHJlZHVjZShpc0Z1bmN0aW9uKGNvbXBhcmVyKSA/IGZ1bmN0aW9uICh4LCB5KSB7IHJldHVybiAoY29tcGFyZXIoeCwgeSkgPiAwID8geCA6IHkpOyB9IDogZnVuY3Rpb24gKHgsIHkpIHsgcmV0dXJuICh4ID4geSA/IHggOiB5KTsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXguanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGFyZ3NPckFyZ0FycmF5IH0gZnJvbSAnLi4vdXRpbC9hcmdzT3JBcmdBcnJheSc7XG5pbXBvcnQgeyBpbnRlcm5hbEZyb21BcnJheSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbUFycmF5JztcbmltcG9ydCB7IG1lcmdlQWxsIH0gZnJvbSAnLi9tZXJnZUFsbCc7XG5pbXBvcnQgeyBwb3BOdW1iZXIsIHBvcFNjaGVkdWxlciB9IGZyb20gJy4uL3V0aWwvYXJncyc7XG5leHBvcnQgZnVuY3Rpb24gbWVyZ2UoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHZhciBzY2hlZHVsZXIgPSBwb3BTY2hlZHVsZXIoYXJncyk7XG4gICAgdmFyIGNvbmN1cnJlbnQgPSBwb3BOdW1iZXIoYXJncywgSW5maW5pdHkpO1xuICAgIGFyZ3MgPSBhcmdzT3JBcmdBcnJheShhcmdzKTtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIG1lcmdlQWxsKGNvbmN1cnJlbnQpKGludGVybmFsRnJvbUFycmF5KF9fc3ByZWFkQXJyYXkoW3NvdXJjZV0sIF9fcmVhZChhcmdzKSksIHNjaGVkdWxlcikpLnN1YnNjcmliZShzdWJzY3JpYmVyKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lcmdlLmpzLm1hcCIsImltcG9ydCB7IG1lcmdlTWFwIH0gZnJvbSAnLi9tZXJnZU1hcCc7XG5pbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4uL3V0aWwvaWRlbnRpdHknO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQWxsKGNvbmN1cnJlbnQpIHtcbiAgICBpZiAoY29uY3VycmVudCA9PT0gdm9pZCAwKSB7IGNvbmN1cnJlbnQgPSBJbmZpbml0eTsgfVxuICAgIHJldHVybiBtZXJnZU1hcChpZGVudGl0eSwgY29uY3VycmVudCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXJnZUFsbC5qcy5tYXAiLCJpbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlSW50ZXJuYWxzKHNvdXJjZSwgc3Vic2NyaWJlciwgcHJvamVjdCwgY29uY3VycmVudCwgb25CZWZvcmVOZXh0LCBleHBhbmQsIGlubmVyU3ViU2NoZWR1bGVyLCBhZGRpdGlvbmFsVGVhcmRvd24pIHtcbiAgICB2YXIgYnVmZmVyID0gW107XG4gICAgdmFyIGFjdGl2ZSA9IDA7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgaXNDb21wbGV0ZSA9IGZhbHNlO1xuICAgIHZhciBjaGVja0NvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoaXNDb21wbGV0ZSAmJiAhYnVmZmVyLmxlbmd0aCAmJiAhYWN0aXZlKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciBvdXRlck5leHQgPSBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIChhY3RpdmUgPCBjb25jdXJyZW50ID8gZG9Jbm5lclN1Yih2YWx1ZSkgOiBidWZmZXIucHVzaCh2YWx1ZSkpOyB9O1xuICAgIHZhciBkb0lubmVyU3ViID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGV4cGFuZCAmJiBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICBhY3RpdmUrKztcbiAgICAgICAgdmFyIGlubmVyQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgaW5uZXJGcm9tKHByb2plY3QodmFsdWUsIGluZGV4KyspKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAoaW5uZXJWYWx1ZSkge1xuICAgICAgICAgICAgb25CZWZvcmVOZXh0ID09PSBudWxsIHx8IG9uQmVmb3JlTmV4dCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25CZWZvcmVOZXh0KGlubmVyVmFsdWUpO1xuICAgICAgICAgICAgaWYgKGV4cGFuZCkge1xuICAgICAgICAgICAgICAgIG91dGVyTmV4dChpbm5lclZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChpbm5lclZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaW5uZXJDb21wbGV0ZSA9IHRydWU7XG4gICAgICAgIH0sIHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGlubmVyQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmUtLTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYnVmZmVyZWRWYWx1ZSA9IGJ1ZmZlci5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJTdWJTY2hlZHVsZXIgPyBzdWJzY3JpYmVyLmFkZChpbm5lclN1YlNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7IHJldHVybiBkb0lubmVyU3ViKGJ1ZmZlcmVkVmFsdWUpOyB9KSkgOiBkb0lubmVyU3ViKGJ1ZmZlcmVkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoYnVmZmVyLmxlbmd0aCAmJiBhY3RpdmUgPCBjb25jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfbG9vcF8xKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tDb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9O1xuICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBvdXRlck5leHQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXNDb21wbGV0ZSA9IHRydWU7XG4gICAgICAgIGNoZWNrQ29tcGxldGUoKTtcbiAgICB9KSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWRkaXRpb25hbFRlYXJkb3duID09PSBudWxsIHx8IGFkZGl0aW9uYWxUZWFyZG93biA9PT0gdm9pZCAwID8gdm9pZCAwIDogYWRkaXRpb25hbFRlYXJkb3duKCk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lcmdlSW50ZXJuYWxzLmpzLm1hcCIsImltcG9ydCB7IG1hcCB9IGZyb20gJy4vbWFwJztcbmltcG9ydCB7IGlubmVyRnJvbSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IG1lcmdlSW50ZXJuYWxzIH0gZnJvbSAnLi9tZXJnZUludGVybmFscyc7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnLi4vdXRpbC9pc0Z1bmN0aW9uJztcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU1hcChwcm9qZWN0LCByZXN1bHRTZWxlY3RvciwgY29uY3VycmVudCkge1xuICAgIGlmIChjb25jdXJyZW50ID09PSB2b2lkIDApIHsgY29uY3VycmVudCA9IEluZmluaXR5OyB9XG4gICAgaWYgKGlzRnVuY3Rpb24ocmVzdWx0U2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBtZXJnZU1hcChmdW5jdGlvbiAoYSwgaSkgeyByZXR1cm4gbWFwKGZ1bmN0aW9uIChiLCBpaSkgeyByZXR1cm4gcmVzdWx0U2VsZWN0b3IoYSwgYiwgaSwgaWkpOyB9KShpbm5lckZyb20ocHJvamVjdChhLCBpKSkpOyB9LCBjb25jdXJyZW50KTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHJlc3VsdFNlbGVjdG9yID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25jdXJyZW50ID0gcmVzdWx0U2VsZWN0b3I7XG4gICAgfVxuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHsgcmV0dXJuIG1lcmdlSW50ZXJuYWxzKHNvdXJjZSwgc3Vic2NyaWJlciwgcHJvamVjdCwgY29uY3VycmVudCk7IH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWVyZ2VNYXAuanMubWFwIiwiaW1wb3J0IHsgbWVyZ2VNYXAgfSBmcm9tICcuL21lcmdlTWFwJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuLi91dGlsL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlTWFwVG8oaW5uZXJPYnNlcnZhYmxlLCByZXN1bHRTZWxlY3RvciwgY29uY3VycmVudCkge1xuICAgIGlmIChjb25jdXJyZW50ID09PSB2b2lkIDApIHsgY29uY3VycmVudCA9IEluZmluaXR5OyB9XG4gICAgaWYgKGlzRnVuY3Rpb24ocmVzdWx0U2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBtZXJnZU1hcChmdW5jdGlvbiAoKSB7IHJldHVybiBpbm5lck9ic2VydmFibGU7IH0sIHJlc3VsdFNlbGVjdG9yLCBjb25jdXJyZW50KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXN1bHRTZWxlY3RvciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uY3VycmVudCA9IHJlc3VsdFNlbGVjdG9yO1xuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VNYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gaW5uZXJPYnNlcnZhYmxlOyB9LCBjb25jdXJyZW50KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lcmdlTWFwVG8uanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBtZXJnZUludGVybmFscyB9IGZyb20gJy4vbWVyZ2VJbnRlcm5hbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlU2NhbihhY2N1bXVsYXRvciwgc2VlZCwgY29uY3VycmVudCkge1xuICAgIGlmIChjb25jdXJyZW50ID09PSB2b2lkIDApIHsgY29uY3VycmVudCA9IEluZmluaXR5OyB9XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgc3RhdGUgPSBzZWVkO1xuICAgICAgICByZXR1cm4gbWVyZ2VJbnRlcm5hbHMoc291cmNlLCBzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7IHJldHVybiBhY2N1bXVsYXRvcihzdGF0ZSwgdmFsdWUsIGluZGV4KTsgfSwgY29uY3VycmVudCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBzdGF0ZSA9IHZhbHVlO1xuICAgICAgICB9LCBmYWxzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7IHJldHVybiAoc3RhdGUgPSBudWxsKTsgfSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXJnZVNjYW4uanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gJy4vbWVyZ2UnO1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlV2l0aCgpIHtcbiAgICB2YXIgb3RoZXJTb3VyY2VzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgb3RoZXJTb3VyY2VzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHJldHVybiBtZXJnZS5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChvdGhlclNvdXJjZXMpKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXJnZVdpdGguanMubWFwIiwiaW1wb3J0IHsgcmVkdWNlIH0gZnJvbSAnLi9yZWR1Y2UnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWwvaXNGdW5jdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gbWluKGNvbXBhcmVyKSB7XG4gICAgcmV0dXJuIHJlZHVjZShpc0Z1bmN0aW9uKGNvbXBhcmVyKSA/IGZ1bmN0aW9uICh4LCB5KSB7IHJldHVybiAoY29tcGFyZXIoeCwgeSkgPCAwID8geCA6IHkpOyB9IDogZnVuY3Rpb24gKHgsIHkpIHsgcmV0dXJuICh4IDwgeSA/IHggOiB5KTsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1taW4uanMubWFwIiwiaW1wb3J0IHsgQ29ubmVjdGFibGVPYnNlcnZhYmxlIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9Db25uZWN0YWJsZU9ic2VydmFibGUnO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4uL3V0aWwvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAnLi9jb25uZWN0JztcbmV4cG9ydCBmdW5jdGlvbiBtdWx0aWNhc3Qoc3ViamVjdE9yU3ViamVjdEZhY3RvcnksIHNlbGVjdG9yKSB7XG4gICAgdmFyIHN1YmplY3RGYWN0b3J5ID0gaXNGdW5jdGlvbihzdWJqZWN0T3JTdWJqZWN0RmFjdG9yeSkgPyBzdWJqZWN0T3JTdWJqZWN0RmFjdG9yeSA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHN1YmplY3RPclN1YmplY3RGYWN0b3J5OyB9O1xuICAgIGlmIChpc0Z1bmN0aW9uKHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gY29ubmVjdChzZWxlY3Rvciwge1xuICAgICAgICAgICAgY29ubmVjdG9yOiBzdWJqZWN0RmFjdG9yeSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlKSB7IHJldHVybiBuZXcgQ29ubmVjdGFibGVPYnNlcnZhYmxlKHNvdXJjZSwgc3ViamVjdEZhY3RvcnkpOyB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bXVsdGljYXN0LmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmVPbihzY2hlZHVsZXIsIGRlbGF5KSB7XG4gICAgaWYgKGRlbGF5ID09PSB2b2lkIDApIHsgZGVsYXkgPSAwOyB9XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiBzdWJzY3JpYmVyLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkgeyByZXR1cm4gc3Vic2NyaWJlci5uZXh0KHZhbHVlKTsgfSwgZGVsYXkpKTsgfSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gc3Vic2NyaWJlci5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHN1YnNjcmliZXIuY29tcGxldGUoKTsgfSwgZGVsYXkpKTsgfSwgZnVuY3Rpb24gKGVycikgeyByZXR1cm4gc3Vic2NyaWJlci5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHN1YnNjcmliZXIuZXJyb3IoZXJyKTsgfSwgZGVsYXkpKTsgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9b2JzZXJ2ZU9uLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgYXJnc09yQXJnQXJyYXkgfSBmcm9tICcuLi91dGlsL2FyZ3NPckFyZ0FycmF5JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuLi91dGlsL25vb3AnO1xuZXhwb3J0IGZ1bmN0aW9uIG9uRXJyb3JSZXN1bWVOZXh0KCkge1xuICAgIHZhciBzb3VyY2VzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgc291cmNlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgbmV4dFNvdXJjZXMgPSBhcmdzT3JBcmdBcnJheShzb3VyY2VzKTtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciByZW1haW5pbmcgPSBfX3NwcmVhZEFycmF5KFtzb3VyY2VdLCBfX3JlYWQobmV4dFNvdXJjZXMpKTtcbiAgICAgICAgdmFyIHN1YnNjcmliZU5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXN1YnNjcmliZXIuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0U291cmNlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFNvdXJjZSA9IGlubmVyRnJvbShyZW1haW5pbmcuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlTmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbm5lclN1YiA9IG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgdW5kZWZpbmVkLCBub29wLCBub29wKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5hZGQobmV4dFNvdXJjZS5zdWJzY3JpYmUoaW5uZXJTdWIpKTtcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJTdWIuYWRkKHN1YnNjcmliZU5leHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgc3Vic2NyaWJlTmV4dCgpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9b25FcnJvclJlc3VtZU5leHQuanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gcGFpcndpc2UoKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgcHJldjtcbiAgICAgICAgdmFyIGhhc1ByZXYgPSBmYWxzZTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHAgPSBwcmV2O1xuICAgICAgICAgICAgcHJldiA9IHZhbHVlO1xuICAgICAgICAgICAgaGFzUHJldiAmJiBzdWJzY3JpYmVyLm5leHQoW3AsIHZhbHVlXSk7XG4gICAgICAgICAgICBoYXNQcmV2ID0gdHJ1ZTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFpcndpc2UuanMubWFwIiwiaW1wb3J0IHsgbWFwIH0gZnJvbSAnLi9tYXAnO1xuZXhwb3J0IGZ1bmN0aW9uIHBsdWNrKCkge1xuICAgIHZhciBwcm9wZXJ0aWVzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgcHJvcGVydGllc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gcHJvcGVydGllcy5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xpc3Qgb2YgcHJvcGVydGllcyBjYW5ub3QgYmUgZW1wdHkuJyk7XG4gICAgfVxuICAgIHJldHVybiBtYXAoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRQcm9wID0geDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHAgPSBjdXJyZW50UHJvcCA9PT0gbnVsbCB8fCBjdXJyZW50UHJvcCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY3VycmVudFByb3BbcHJvcGVydGllc1tpXV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHAgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFByb3AgPSBwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3VycmVudFByb3A7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wbHVjay5qcy5tYXAiLCJpbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAnLi4vU3ViamVjdCc7XG5pbXBvcnQgeyBtdWx0aWNhc3QgfSBmcm9tICcuL211bHRpY2FzdCc7XG5pbXBvcnQgeyBjb25uZWN0IH0gZnJvbSAnLi9jb25uZWN0JztcbmV4cG9ydCBmdW5jdGlvbiBwdWJsaXNoKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yID8gZnVuY3Rpb24gKHNvdXJjZSkgeyByZXR1cm4gY29ubmVjdChzZWxlY3Rvcikoc291cmNlKTsgfSA6IGZ1bmN0aW9uIChzb3VyY2UpIHsgcmV0dXJuIG11bHRpY2FzdChuZXcgU3ViamVjdCgpKShzb3VyY2UpOyB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHVibGlzaC5qcy5tYXAiLCJpbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgfSBmcm9tICcuLi9CZWhhdmlvclN1YmplY3QnO1xuaW1wb3J0IHsgQ29ubmVjdGFibGVPYnNlcnZhYmxlIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9Db25uZWN0YWJsZU9ic2VydmFibGUnO1xuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hCZWhhdmlvcihpbml0aWFsVmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgICB2YXIgc3ViamVjdCA9IG5ldyBCZWhhdmlvclN1YmplY3QoaW5pdGlhbFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBDb25uZWN0YWJsZU9ic2VydmFibGUoc291cmNlLCBmdW5jdGlvbiAoKSB7IHJldHVybiBzdWJqZWN0OyB9KTtcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHVibGlzaEJlaGF2aW9yLmpzLm1hcCIsImltcG9ydCB7IEFzeW5jU3ViamVjdCB9IGZyb20gJy4uL0FzeW5jU3ViamVjdCc7XG5pbXBvcnQgeyBDb25uZWN0YWJsZU9ic2VydmFibGUgfSBmcm9tICcuLi9vYnNlcnZhYmxlL0Nvbm5lY3RhYmxlT2JzZXJ2YWJsZSc7XG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaExhc3QoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgdmFyIHN1YmplY3QgPSBuZXcgQXN5bmNTdWJqZWN0KCk7XG4gICAgICAgIHJldHVybiBuZXcgQ29ubmVjdGFibGVPYnNlcnZhYmxlKHNvdXJjZSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gc3ViamVjdDsgfSk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXB1Ymxpc2hMYXN0LmpzLm1hcCIsImltcG9ydCB7IFJlcGxheVN1YmplY3QgfSBmcm9tICcuLi9SZXBsYXlTdWJqZWN0JztcbmltcG9ydCB7IG11bHRpY2FzdCB9IGZyb20gJy4vbXVsdGljYXN0JztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuLi91dGlsL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIHB1Ymxpc2hSZXBsYXkoYnVmZmVyU2l6ZSwgd2luZG93VGltZSwgc2VsZWN0b3JPclNjaGVkdWxlciwgdGltZXN0YW1wUHJvdmlkZXIpIHtcbiAgICBpZiAoc2VsZWN0b3JPclNjaGVkdWxlciAmJiAhaXNGdW5jdGlvbihzZWxlY3Rvck9yU2NoZWR1bGVyKSkge1xuICAgICAgICB0aW1lc3RhbXBQcm92aWRlciA9IHNlbGVjdG9yT3JTY2hlZHVsZXI7XG4gICAgfVxuICAgIHZhciBzZWxlY3RvciA9IGlzRnVuY3Rpb24oc2VsZWN0b3JPclNjaGVkdWxlcikgPyBzZWxlY3Rvck9yU2NoZWR1bGVyIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlKSB7IHJldHVybiBtdWx0aWNhc3QobmV3IFJlcGxheVN1YmplY3QoYnVmZmVyU2l6ZSwgd2luZG93VGltZSwgdGltZXN0YW1wUHJvdmlkZXIpLCBzZWxlY3Rvcikoc291cmNlKTsgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXB1Ymxpc2hSZXBsYXkuanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyByYWNlSW5pdCB9IGZyb20gJy4uL29ic2VydmFibGUvcmFjZSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGlkZW50aXR5IH0gZnJvbSAnLi4vdXRpbC9pZGVudGl0eSc7XG5leHBvcnQgZnVuY3Rpb24gcmFjZVdpdGgoKSB7XG4gICAgdmFyIG90aGVyU291cmNlcyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIG90aGVyU291cmNlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gIW90aGVyU291cmNlcy5sZW5ndGhcbiAgICAgICAgPyBpZGVudGl0eVxuICAgICAgICA6IG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICAgICAgcmFjZUluaXQoX19zcHJlYWRBcnJheShbc291cmNlXSwgX19yZWFkKG90aGVyU291cmNlcykpKShzdWJzY3JpYmVyKTtcbiAgICAgICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yYWNlV2l0aC5qcy5tYXAiLCJpbXBvcnQgeyBzY2FuSW50ZXJuYWxzIH0gZnJvbSAnLi9zY2FuSW50ZXJuYWxzJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZShhY2N1bXVsYXRvciwgc2VlZCkge1xuICAgIHJldHVybiBvcGVyYXRlKHNjYW5JbnRlcm5hbHMoYWNjdW11bGF0b3IsIHNlZWQsIGFyZ3VtZW50cy5sZW5ndGggPj0gMiwgZmFsc2UsIHRydWUpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZHVjZS5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiByZWZDb3VudCgpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBjb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgc291cmNlLl9yZWZDb3VudCsrO1xuICAgICAgICB2YXIgcmVmQ291bnRlciA9IG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFzb3VyY2UgfHwgc291cmNlLl9yZWZDb3VudCA8PSAwIHx8IDAgPCAtLXNvdXJjZS5fcmVmQ291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2hhcmVkQ29ubmVjdGlvbiA9IHNvdXJjZS5fY29ubmVjdGlvbjtcbiAgICAgICAgICAgIHZhciBjb25uID0gY29ubmVjdGlvbjtcbiAgICAgICAgICAgIGNvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgaWYgKHNoYXJlZENvbm5lY3Rpb24gJiYgKCFjb25uIHx8IHNoYXJlZENvbm5lY3Rpb24gPT09IGNvbm4pKSB7XG4gICAgICAgICAgICAgICAgc2hhcmVkQ29ubmVjdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Vic2NyaWJlci51bnN1YnNjcmliZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShyZWZDb3VudGVyKTtcbiAgICAgICAgaWYgKCFyZWZDb3VudGVyLmNsb3NlZCkge1xuICAgICAgICAgICAgY29ubmVjdGlvbiA9IHNvdXJjZS5jb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZkNvdW50LmpzLm1hcCIsImltcG9ydCB7IEVNUFRZIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9lbXB0eSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiByZXBlYXQoY291bnQpIHtcbiAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IEluZmluaXR5OyB9XG4gICAgcmV0dXJuIGNvdW50IDw9IDBcbiAgICAgICAgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBFTVBUWTsgfVxuICAgICAgICA6IG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICAgICAgdmFyIHNvRmFyID0gMDtcbiAgICAgICAgICAgIHZhciBpbm5lclN1YjtcbiAgICAgICAgICAgIHZhciBzdWJzY3JpYmVGb3JSZXBlYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN5bmNVbnN1YiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlubmVyU3ViID0gc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKytzb0ZhciA8IGNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXJTdWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lclN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVGb3JSZXBlYXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bmNVbnN1YiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmNVbnN1Yikge1xuICAgICAgICAgICAgICAgICAgICBpbm5lclN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICBpbm5lclN1YiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZUZvclJlcGVhdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzdWJzY3JpYmVGb3JSZXBlYXQoKTtcbiAgICAgICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXBlYXQuanMubWFwIiwiaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJy4uL1N1YmplY3QnO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gcmVwZWF0V2hlbihub3RpZmllcikge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGlubmVyU3ViO1xuICAgICAgICB2YXIgc3luY1Jlc3ViID0gZmFsc2U7XG4gICAgICAgIHZhciBjb21wbGV0aW9ucyQ7XG4gICAgICAgIHZhciBpc05vdGlmaWVyQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGlzTWFpbkNvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIHZhciBjaGVja0NvbXBsZXRlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaXNNYWluQ29tcGxldGUgJiYgaXNOb3RpZmllckNvbXBsZXRlICYmIChzdWJzY3JpYmVyLmNvbXBsZXRlKCksIHRydWUpOyB9O1xuICAgICAgICB2YXIgZ2V0Q29tcGxldGlvblN1YmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWNvbXBsZXRpb25zJCkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRpb25zJCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgICAgICAgICAgICAgbm90aWZpZXIoY29tcGxldGlvbnMkKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lclN1Yikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlRm9yUmVwZWF0V2hlbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3luY1Jlc3ViID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNOb3RpZmllckNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tDb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb21wbGV0aW9ucyQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzdWJzY3JpYmVGb3JSZXBlYXRXaGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaXNNYWluQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlubmVyU3ViID0gc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlzTWFpbkNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAhY2hlY2tDb21wbGV0ZSgpICYmIGdldENvbXBsZXRpb25TdWJqZWN0KCkubmV4dCgpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaWYgKHN5bmNSZXN1Yikge1xuICAgICAgICAgICAgICAgIGlubmVyU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgaW5uZXJTdWIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHN5bmNSZXN1YiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZUZvclJlcGVhdFdoZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgc3Vic2NyaWJlRm9yUmVwZWF0V2hlbigpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVwZWF0V2hlbi5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmltcG9ydCB7IGlkZW50aXR5IH0gZnJvbSAnLi4vdXRpbC9pZGVudGl0eSc7XG5leHBvcnQgZnVuY3Rpb24gcmV0cnkoY29uZmlnT3JDb3VudCkge1xuICAgIGlmIChjb25maWdPckNvdW50ID09PSB2b2lkIDApIHsgY29uZmlnT3JDb3VudCA9IEluZmluaXR5OyB9XG4gICAgdmFyIGNvbmZpZztcbiAgICBpZiAoY29uZmlnT3JDb3VudCAmJiB0eXBlb2YgY29uZmlnT3JDb3VudCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uZmlnID0gY29uZmlnT3JDb3VudDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgIGNvdW50OiBjb25maWdPckNvdW50LFxuICAgICAgICB9O1xuICAgIH1cbiAgICB2YXIgY291bnQgPSBjb25maWcuY291bnQsIF9hID0gY29uZmlnLnJlc2V0T25TdWNjZXNzLCByZXNldE9uU3VjY2VzcyA9IF9hID09PSB2b2lkIDAgPyBmYWxzZSA6IF9hO1xuICAgIHJldHVybiBjb3VudCA8PSAwXG4gICAgICAgID8gaWRlbnRpdHlcbiAgICAgICAgOiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgICAgIHZhciBzb0ZhciA9IDA7XG4gICAgICAgICAgICB2YXIgaW5uZXJTdWI7XG4gICAgICAgICAgICB2YXIgc3Vic2NyaWJlRm9yUmV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN5bmNVbnN1YiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlubmVyU3ViID0gc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzZXRPblN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvRmFyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH0sIHVuZGVmaW5lZCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc29GYXIrKyA8IGNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXJTdWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lclN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVGb3JSZXRyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3luY1Vuc3ViID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBpZiAoc3luY1Vuc3ViKSB7XG4gICAgICAgICAgICAgICAgICAgIGlubmVyU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlubmVyU3ViID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlRm9yUmV0cnkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc3Vic2NyaWJlRm9yUmV0cnkoKTtcbiAgICAgICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXRyeS5qcy5tYXAiLCJpbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAnLi4vU3ViamVjdCc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiByZXRyeVdoZW4obm90aWZpZXIpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBpbm5lclN1YjtcbiAgICAgICAgdmFyIHN5bmNSZXN1YiA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3JzJDtcbiAgICAgICAgdmFyIHN1YnNjcmliZUZvclJldHJ5V2hlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlubmVyU3ViID0gc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvcnMkKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ycyQgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBub3RpZmllcihlcnJvcnMkKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5uZXJTdWIgPyBzdWJzY3JpYmVGb3JSZXRyeVdoZW4oKSA6IChzeW5jUmVzdWIgPSB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JzJCkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcnMkLm5leHQoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBpZiAoc3luY1Jlc3ViKSB7XG4gICAgICAgICAgICAgICAgaW5uZXJTdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICBpbm5lclN1YiA9IG51bGw7XG4gICAgICAgICAgICAgICAgc3luY1Jlc3ViID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlRm9yUmV0cnlXaGVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHN1YnNjcmliZUZvclJldHJ5V2hlbigpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmV0cnlXaGVuLmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gc2FtcGxlKG5vdGlmaWVyKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgaGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGxhc3RWYWx1ZSA9IG51bGw7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIGxhc3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgICB9KSk7XG4gICAgICAgIHZhciBlbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGhhc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaGFzVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsYXN0VmFsdWU7XG4gICAgICAgICAgICAgICAgbGFzdFZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBub3RpZmllci5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBlbWl0LCBub29wKSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zYW1wbGUuanMubWFwIiwiaW1wb3J0IHsgYXN5bmNTY2hlZHVsZXIgfSBmcm9tICcuLi9zY2hlZHVsZXIvYXN5bmMnO1xuaW1wb3J0IHsgc2FtcGxlIH0gZnJvbSAnLi9zYW1wbGUnO1xuaW1wb3J0IHsgaW50ZXJ2YWwgfSBmcm9tICcuLi9vYnNlcnZhYmxlL2ludGVydmFsJztcbmV4cG9ydCBmdW5jdGlvbiBzYW1wbGVUaW1lKHBlcmlvZCwgc2NoZWR1bGVyKSB7XG4gICAgaWYgKHNjaGVkdWxlciA9PT0gdm9pZCAwKSB7IHNjaGVkdWxlciA9IGFzeW5jU2NoZWR1bGVyOyB9XG4gICAgcmV0dXJuIHNhbXBsZShpbnRlcnZhbChwZXJpb2QsIHNjaGVkdWxlcikpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2FtcGxlVGltZS5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IHNjYW5JbnRlcm5hbHMgfSBmcm9tICcuL3NjYW5JbnRlcm5hbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIHNjYW4oYWNjdW11bGF0b3IsIHNlZWQpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShzY2FuSW50ZXJuYWxzKGFjY3VtdWxhdG9yLCBzZWVkLCBhcmd1bWVudHMubGVuZ3RoID49IDIsIHRydWUpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNjYW4uanMubWFwIiwiaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIHNjYW5JbnRlcm5hbHMoYWNjdW11bGF0b3IsIHNlZWQsIGhhc1NlZWQsIGVtaXRPbk5leHQsIGVtaXRCZWZvcmVDb21wbGV0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBoYXNTdGF0ZSA9IGhhc1NlZWQ7XG4gICAgICAgIHZhciBzdGF0ZSA9IHNlZWQ7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBpID0gaW5kZXgrKztcbiAgICAgICAgICAgIHN0YXRlID0gaGFzU3RhdGVcbiAgICAgICAgICAgICAgICA/XG4gICAgICAgICAgICAgICAgICAgIGFjY3VtdWxhdG9yKHN0YXRlLCB2YWx1ZSwgaSlcbiAgICAgICAgICAgICAgICA6XG4gICAgICAgICAgICAgICAgICAgICgoaGFzU3RhdGUgPSB0cnVlKSwgdmFsdWUpO1xuICAgICAgICAgICAgZW1pdE9uTmV4dCAmJiBzdWJzY3JpYmVyLm5leHQoc3RhdGUpO1xuICAgICAgICB9LCBlbWl0QmVmb3JlQ29tcGxldGUgJiZcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaGFzU3RhdGUgJiYgc3Vic2NyaWJlci5uZXh0KHN0YXRlKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9KSkpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zY2FuSW50ZXJuYWxzLmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIHNlcXVlbmNlRXF1YWwoY29tcGFyZVRvLCBjb21wYXJhdG9yKSB7XG4gICAgaWYgKGNvbXBhcmF0b3IgPT09IHZvaWQgMCkgeyBjb21wYXJhdG9yID0gZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEgPT09IGI7IH07IH1cbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBhU3RhdGUgPSBjcmVhdGVTdGF0ZSgpO1xuICAgICAgICB2YXIgYlN0YXRlID0gY3JlYXRlU3RhdGUoKTtcbiAgICAgICAgdmFyIGVtaXQgPSBmdW5jdGlvbiAoaXNFcXVhbCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KGlzRXF1YWwpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgY3JlYXRlU3Vic2NyaWJlciA9IGZ1bmN0aW9uIChzZWxmU3RhdGUsIG90aGVyU3RhdGUpIHtcbiAgICAgICAgICAgIHZhciBzZXF1ZW5jZUVxdWFsU3Vic2NyaWJlciA9IG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gb3RoZXJTdGF0ZS5idWZmZXIsIGNvbXBsZXRlID0gb3RoZXJTdGF0ZS5jb21wbGV0ZTtcbiAgICAgICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSA/IGVtaXQoZmFsc2UpIDogc2VsZlN0YXRlLmJ1ZmZlci5wdXNoKGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIWNvbXBhcmF0b3IoYSwgYnVmZmVyLnNoaWZ0KCkpICYmIGVtaXQoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmU3RhdGUuY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBjb21wbGV0ZSA9IG90aGVyU3RhdGUuY29tcGxldGUsIGJ1ZmZlciA9IG90aGVyU3RhdGUuYnVmZmVyO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlICYmIGVtaXQoYnVmZmVyLmxlbmd0aCA9PT0gMCk7XG4gICAgICAgICAgICAgICAgc2VxdWVuY2VFcXVhbFN1YnNjcmliZXIgPT09IG51bGwgfHwgc2VxdWVuY2VFcXVhbFN1YnNjcmliZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNlcXVlbmNlRXF1YWxTdWJzY3JpYmVyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzZXF1ZW5jZUVxdWFsU3Vic2NyaWJlcjtcbiAgICAgICAgfTtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShjcmVhdGVTdWJzY3JpYmVyKGFTdGF0ZSwgYlN0YXRlKSk7XG4gICAgICAgIGNvbXBhcmVUby5zdWJzY3JpYmUoY3JlYXRlU3Vic2NyaWJlcihiU3RhdGUsIGFTdGF0ZSkpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gY3JlYXRlU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYnVmZmVyOiBbXSxcbiAgICAgICAgY29tcGxldGU6IGZhbHNlLFxuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXF1ZW5jZUVxdWFsLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgZnJvbSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbSc7XG5pbXBvcnQgeyB0YWtlIH0gZnJvbSAnLi4vb3BlcmF0b3JzL3Rha2UnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJy4uL1N1YmplY3QnO1xuaW1wb3J0IHsgU2FmZVN1YnNjcmliZXIgfSBmcm9tICcuLi9TdWJzY3JpYmVyJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuZXhwb3J0IGZ1bmN0aW9uIHNoYXJlKG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxuICAgIHZhciBfYSA9IG9wdGlvbnMuY29ubmVjdG9yLCBjb25uZWN0b3IgPSBfYSA9PT0gdm9pZCAwID8gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IFN1YmplY3QoKTsgfSA6IF9hLCBfYiA9IG9wdGlvbnMucmVzZXRPbkVycm9yLCByZXNldE9uRXJyb3IgPSBfYiA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9iLCBfYyA9IG9wdGlvbnMucmVzZXRPbkNvbXBsZXRlLCByZXNldE9uQ29tcGxldGUgPSBfYyA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9jLCBfZCA9IG9wdGlvbnMucmVzZXRPblJlZkNvdW50WmVybywgcmVzZXRPblJlZkNvdW50WmVybyA9IF9kID09PSB2b2lkIDAgPyB0cnVlIDogX2Q7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh3cmFwcGVyU291cmNlKSB7XG4gICAgICAgIHZhciBjb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgdmFyIHJlc2V0Q29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgIHZhciBzdWJqZWN0ID0gbnVsbDtcbiAgICAgICAgdmFyIHJlZkNvdW50ID0gMDtcbiAgICAgICAgdmFyIGhhc0NvbXBsZXRlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgaGFzRXJyb3JlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgY2FuY2VsUmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXNldENvbm5lY3Rpb24gPT09IG51bGwgfHwgcmVzZXRDb25uZWN0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZXNldENvbm5lY3Rpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHJlc2V0Q29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbmNlbFJlc2V0KCk7XG4gICAgICAgICAgICBjb25uZWN0aW9uID0gc3ViamVjdCA9IG51bGw7XG4gICAgICAgICAgICBoYXNDb21wbGV0ZWQgPSBoYXNFcnJvcmVkID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXNldEFuZFVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNvbm4gPSBjb25uZWN0aW9uO1xuICAgICAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgICAgIGNvbm4gPT09IG51bGwgfHwgY29ubiA9PT0gdm9pZCAwID8gdm9pZCAwIDogY29ubi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgICAgICByZWZDb3VudCsrO1xuICAgICAgICAgICAgaWYgKCFoYXNFcnJvcmVkICYmICFoYXNDb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICBjYW5jZWxSZXNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRlc3QgPSAoc3ViamVjdCA9IHN1YmplY3QgIT09IG51bGwgJiYgc3ViamVjdCAhPT0gdm9pZCAwID8gc3ViamVjdCA6IGNvbm5lY3RvcigpKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZWZDb3VudC0tO1xuICAgICAgICAgICAgICAgIGlmIChyZWZDb3VudCA9PT0gMCAmJiAhaGFzRXJyb3JlZCAmJiAhaGFzQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0Q29ubmVjdGlvbiA9IGhhbmRsZVJlc2V0KHJlc2V0QW5kVW5zdWJzY3JpYmUsIHJlc2V0T25SZWZDb3VudFplcm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVzdC5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgICAgICBpZiAoIWNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uID0gbmV3IFNhZmVTdWJzY3JpYmVyKHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiBkZXN0Lm5leHQodmFsdWUpOyB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxSZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDb25uZWN0aW9uID0gaGFuZGxlUmVzZXQocmVzZXQsIHJlc2V0T25FcnJvciwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3QuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbXBsZXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxSZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRDb25uZWN0aW9uID0gaGFuZGxlUmVzZXQocmVzZXQsIHJlc2V0T25Db21wbGV0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZnJvbShzb3VyY2UpLnN1YnNjcmliZShjb25uZWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkod3JhcHBlclNvdXJjZSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGhhbmRsZVJlc2V0KHJlc2V0LCBvbikge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgYXJnc1tfaSAtIDJdID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgaWYgKG9uID09PSB0cnVlKSB7XG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAob24gPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb24uYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYXJncykpKS5waXBlKHRha2UoMSkpXG4gICAgICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVzZXQoKTsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaGFyZS5qcy5tYXAiLCJpbXBvcnQgeyBSZXBsYXlTdWJqZWN0IH0gZnJvbSAnLi4vUmVwbGF5U3ViamVjdCc7XG5pbXBvcnQgeyBzaGFyZSB9IGZyb20gJy4vc2hhcmUnO1xuZXhwb3J0IGZ1bmN0aW9uIHNoYXJlUmVwbGF5KGNvbmZpZ09yQnVmZmVyU2l6ZSwgd2luZG93VGltZSwgc2NoZWR1bGVyKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgYnVmZmVyU2l6ZTtcbiAgICB2YXIgcmVmQ291bnQgPSBmYWxzZTtcbiAgICBpZiAoY29uZmlnT3JCdWZmZXJTaXplICYmIHR5cGVvZiBjb25maWdPckJ1ZmZlclNpemUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGJ1ZmZlclNpemUgPSAoX2EgPSBjb25maWdPckJ1ZmZlclNpemUuYnVmZmVyU2l6ZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogSW5maW5pdHk7XG4gICAgICAgIHdpbmRvd1RpbWUgPSAoX2IgPSBjb25maWdPckJ1ZmZlclNpemUud2luZG93VGltZSkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogSW5maW5pdHk7XG4gICAgICAgIHJlZkNvdW50ID0gISFjb25maWdPckJ1ZmZlclNpemUucmVmQ291bnQ7XG4gICAgICAgIHNjaGVkdWxlciA9IGNvbmZpZ09yQnVmZmVyU2l6ZS5zY2hlZHVsZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBidWZmZXJTaXplID0gY29uZmlnT3JCdWZmZXJTaXplICE9PSBudWxsICYmIGNvbmZpZ09yQnVmZmVyU2l6ZSAhPT0gdm9pZCAwID8gY29uZmlnT3JCdWZmZXJTaXplIDogSW5maW5pdHk7XG4gICAgfVxuICAgIHJldHVybiBzaGFyZSh7XG4gICAgICAgIGNvbm5lY3RvcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IFJlcGxheVN1YmplY3QoYnVmZmVyU2l6ZSwgd2luZG93VGltZSwgc2NoZWR1bGVyKTsgfSxcbiAgICAgICAgcmVzZXRPbkVycm9yOiB0cnVlLFxuICAgICAgICByZXNldE9uQ29tcGxldGU6IGZhbHNlLFxuICAgICAgICByZXNldE9uUmVmQ291bnRaZXJvOiByZWZDb3VudFxuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2hhcmVSZXBsYXkuanMubWFwIiwiaW1wb3J0IHsgRW1wdHlFcnJvciB9IGZyb20gJy4uL3V0aWwvRW1wdHlFcnJvcic7XG5pbXBvcnQgeyBTZXF1ZW5jZUVycm9yIH0gZnJvbSAnLi4vdXRpbC9TZXF1ZW5jZUVycm9yJztcbmltcG9ydCB7IE5vdEZvdW5kRXJyb3IgfSBmcm9tICcuLi91dGlsL05vdEZvdW5kRXJyb3InO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gc2luZ2xlKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGhhc1ZhbHVlID0gZmFsc2U7XG4gICAgICAgIHZhciBzaW5nbGVWYWx1ZTtcbiAgICAgICAgdmFyIHNlZW5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBzZWVuVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFwcmVkaWNhdGUgfHwgcHJlZGljYXRlKHZhbHVlLCBpbmRleCsrLCBzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgaGFzVmFsdWUgJiYgc3Vic2NyaWJlci5lcnJvcihuZXcgU2VxdWVuY2VFcnJvcignVG9vIG1hbnkgbWF0Y2hpbmcgdmFsdWVzJykpO1xuICAgICAgICAgICAgICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzaW5nbGVWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoaGFzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoc2luZ2xlVmFsdWUpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuZXJyb3Ioc2VlblZhbHVlID8gbmV3IE5vdEZvdW5kRXJyb3IoJ05vIG1hdGNoaW5nIHZhbHVlcycpIDogbmV3IEVtcHR5RXJyb3IoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpbmdsZS5qcy5tYXAiLCJpbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICcuL2ZpbHRlcic7XG5leHBvcnQgZnVuY3Rpb24gc2tpcChjb3VudCkge1xuICAgIHJldHVybiBmaWx0ZXIoZnVuY3Rpb24gKF8sIGluZGV4KSB7IHJldHVybiBjb3VudCA8PSBpbmRleDsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1za2lwLmpzLm1hcCIsImltcG9ydCB7IGlkZW50aXR5IH0gZnJvbSAnLi4vdXRpbC9pZGVudGl0eSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiBza2lwTGFzdChza2lwQ291bnQpIHtcbiAgICByZXR1cm4gc2tpcENvdW50IDw9IDBcbiAgICAgICAgP1xuICAgICAgICAgICAgaWRlbnRpdHlcbiAgICAgICAgOiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgICAgIHZhciByaW5nID0gbmV3IEFycmF5KHNraXBDb3VudCk7XG4gICAgICAgICAgICB2YXIgc2VlbiA9IDA7XG4gICAgICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlSW5kZXggPSBzZWVuKys7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlSW5kZXggPCBza2lwQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmluZ1t2YWx1ZUluZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdmFsdWVJbmRleCAlIHNraXBDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFZhbHVlID0gcmluZ1tpbmRleF07XG4gICAgICAgICAgICAgICAgICAgIHJpbmdbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChvbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByaW5nID0gbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2tpcExhc3QuanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5leHBvcnQgZnVuY3Rpb24gc2tpcFVudGlsKG5vdGlmaWVyKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgdGFraW5nID0gZmFsc2U7XG4gICAgICAgIHZhciBza2lwU3Vic2NyaWJlciA9IG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2tpcFN1YnNjcmliZXIgPT09IG51bGwgfHwgc2tpcFN1YnNjcmliZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNraXBTdWJzY3JpYmVyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB0YWtpbmcgPSB0cnVlO1xuICAgICAgICB9LCBub29wKTtcbiAgICAgICAgaW5uZXJGcm9tKG5vdGlmaWVyKS5zdWJzY3JpYmUoc2tpcFN1YnNjcmliZXIpO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0YWtpbmcgJiYgc3Vic2NyaWJlci5uZXh0KHZhbHVlKTsgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2tpcFVudGlsLmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIHNraXBXaGlsZShwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciB0YWtpbmcgPSBmYWxzZTtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gKHRha2luZyB8fCAodGFraW5nID0gIXByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgrKykpKSAmJiBzdWJzY3JpYmVyLm5leHQodmFsdWUpOyB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1za2lwV2hpbGUuanMubWFwIiwiaW1wb3J0IHsgY29uY2F0IH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9jb25jYXQnO1xuaW1wb3J0IHsgcG9wU2NoZWR1bGVyIH0gZnJvbSAnLi4vdXRpbC9hcmdzJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0V2l0aCgpIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFsdWVzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHZhciBzY2hlZHVsZXIgPSBwb3BTY2hlZHVsZXIodmFsdWVzKTtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIChzY2hlZHVsZXIgPyBjb25jYXQodmFsdWVzLCBzb3VyY2UsIHNjaGVkdWxlcikgOiBjb25jYXQodmFsdWVzLCBzb3VyY2UpKS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdGFydFdpdGguanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5leHBvcnQgZnVuY3Rpb24gc3Vic2NyaWJlT24oc2NoZWR1bGVyLCBkZWxheSkge1xuICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7IGRlbGF5ID0gMDsgfVxuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgc3Vic2NyaWJlci5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHNvdXJjZS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7IH0sIGRlbGF5KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdWJzY3JpYmVPbi5qcy5tYXAiLCJpbXBvcnQgeyBzd2l0Y2hNYXAgfSBmcm9tICcuL3N3aXRjaE1hcCc7XG5pbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJy4uL3V0aWwvaWRlbnRpdHknO1xuZXhwb3J0IGZ1bmN0aW9uIHN3aXRjaEFsbCgpIHtcbiAgICByZXR1cm4gc3dpdGNoTWFwKGlkZW50aXR5KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN3aXRjaEFsbC5qcy5tYXAiLCJpbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gc3dpdGNoTWFwKHByb2plY3QsIHJlc3VsdFNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgaW5uZXJTdWJzY3JpYmVyID0gbnVsbDtcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGNoZWNrQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBpc0NvbXBsZXRlICYmICFpbm5lclN1YnNjcmliZXIgJiYgc3Vic2NyaWJlci5jb21wbGV0ZSgpOyB9O1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpbm5lclN1YnNjcmliZXIgPT09IG51bGwgfHwgaW5uZXJTdWJzY3JpYmVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbm5lclN1YnNjcmliZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHZhciBpbm5lckluZGV4ID0gMDtcbiAgICAgICAgICAgIHZhciBvdXRlckluZGV4ID0gaW5kZXgrKztcbiAgICAgICAgICAgIGlubmVyRnJvbShwcm9qZWN0KHZhbHVlLCBvdXRlckluZGV4KSkuc3Vic2NyaWJlKChpbm5lclN1YnNjcmliZXIgPSBuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uIChpbm5lclZhbHVlKSB7IHJldHVybiBzdWJzY3JpYmVyLm5leHQocmVzdWx0U2VsZWN0b3IgPyByZXN1bHRTZWxlY3Rvcih2YWx1ZSwgaW5uZXJWYWx1ZSwgb3V0ZXJJbmRleCwgaW5uZXJJbmRleCsrKSA6IGlubmVyVmFsdWUpOyB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaW5uZXJTdWJzY3JpYmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjaGVja0NvbXBsZXRlKCk7XG4gICAgICAgICAgICB9KSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpc0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNoZWNrQ29tcGxldGUoKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3dpdGNoTWFwLmpzLm1hcCIsImltcG9ydCB7IHN3aXRjaE1hcCB9IGZyb20gJy4vc3dpdGNoTWFwJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuLi91dGlsL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIHN3aXRjaE1hcFRvKGlubmVyT2JzZXJ2YWJsZSwgcmVzdWx0U2VsZWN0b3IpIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbihyZXN1bHRTZWxlY3RvcikgPyBzd2l0Y2hNYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gaW5uZXJPYnNlcnZhYmxlOyB9LCByZXN1bHRTZWxlY3RvcikgOiBzd2l0Y2hNYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gaW5uZXJPYnNlcnZhYmxlOyB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN3aXRjaE1hcFRvLmpzLm1hcCIsImltcG9ydCB7IHN3aXRjaE1hcCB9IGZyb20gJy4vc3dpdGNoTWFwJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuZXhwb3J0IGZ1bmN0aW9uIHN3aXRjaFNjYW4oYWNjdW11bGF0b3IsIHNlZWQpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IHNlZWQ7XG4gICAgICAgIHN3aXRjaE1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7IHJldHVybiBhY2N1bXVsYXRvcihzdGF0ZSwgdmFsdWUsIGluZGV4KTsgfSwgZnVuY3Rpb24gKF8sIGlubmVyVmFsdWUpIHsgcmV0dXJuICgoc3RhdGUgPSBpbm5lclZhbHVlKSwgaW5uZXJWYWx1ZSk7IH0pKHNvdXJjZSkuc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3RhdGUgPSBudWxsO1xuICAgICAgICB9O1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3dpdGNoU2Nhbi5qcy5tYXAiLCJpbXBvcnQgeyBFTVBUWSB9IGZyb20gJy4uL29ic2VydmFibGUvZW1wdHknO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gdGFrZShjb3VudCkge1xuICAgIHJldHVybiBjb3VudCA8PSAwXG4gICAgICAgID9cbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIEVNUFRZOyB9XG4gICAgICAgIDogb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgICAgICB2YXIgc2VlbiA9IDA7XG4gICAgICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCsrc2VlbiA8PSBjb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQgPD0gc2Vlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRha2UuanMubWFwIiwiaW1wb3J0IHsgX192YWx1ZXMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEVNUFRZIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9lbXB0eSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmV4cG9ydCBmdW5jdGlvbiB0YWtlTGFzdChjb3VudCkge1xuICAgIHJldHVybiBjb3VudCA8PSAwXG4gICAgICAgID8gZnVuY3Rpb24gKCkgeyByZXR1cm4gRU1QVFk7IH1cbiAgICAgICAgOiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBbXTtcbiAgICAgICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgY291bnQgPCBidWZmZXIubGVuZ3RoICYmIGJ1ZmZlci5zaGlmdCgpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBlXzEsIF9hO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGJ1ZmZlcl8xID0gX192YWx1ZXMoYnVmZmVyKSwgYnVmZmVyXzFfMSA9IGJ1ZmZlcl8xLm5leHQoKTsgIWJ1ZmZlcl8xXzEuZG9uZTsgYnVmZmVyXzFfMSA9IGJ1ZmZlcl8xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gYnVmZmVyXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChidWZmZXJfMV8xICYmICFidWZmZXJfMV8xLmRvbmUgJiYgKF9hID0gYnVmZmVyXzEucmV0dXJuKSkgX2EuY2FsbChidWZmZXJfMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7IGlmIChlXzEpIHRocm93IGVfMS5lcnJvcjsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9LCB1bmRlZmluZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSBudWxsO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRha2VMYXN0LmpzLm1hcCIsImltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgaW5uZXJGcm9tIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9mcm9tJztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuLi91dGlsL25vb3AnO1xuZXhwb3J0IGZ1bmN0aW9uIHRha2VVbnRpbChub3RpZmllcikge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgaW5uZXJGcm9tKG5vdGlmaWVyKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAoKSB7IHJldHVybiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7IH0sIG5vb3ApKTtcbiAgICAgICAgIXN1YnNjcmliZXIuY2xvc2VkICYmIHNvdXJjZS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10YWtlVW50aWwuanMubWFwIiwiaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgZnVuY3Rpb24gdGFrZVdoaWxlKHByZWRpY2F0ZSwgaW5jbHVzaXZlKSB7XG4gICAgaWYgKGluY2x1c2l2ZSA9PT0gdm9pZCAwKSB7IGluY2x1c2l2ZSA9IGZhbHNlOyB9XG4gICAgcmV0dXJuIG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gcHJlZGljYXRlKHZhbHVlLCBpbmRleCsrKTtcbiAgICAgICAgICAgIChyZXN1bHQgfHwgaW5jbHVzaXZlKSAmJiBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgIXJlc3VsdCAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRha2VXaGlsZS5qcy5tYXAiLCJpbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnLi4vdXRpbC9pc0Z1bmN0aW9uJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgaWRlbnRpdHkgfSBmcm9tICcuLi91dGlsL2lkZW50aXR5JztcbmV4cG9ydCBmdW5jdGlvbiB0YXAob2JzZXJ2ZXJPck5leHQsIGVycm9yLCBjb21wbGV0ZSkge1xuICAgIHZhciB0YXBPYnNlcnZlciA9IGlzRnVuY3Rpb24ob2JzZXJ2ZXJPck5leHQpIHx8IGVycm9yIHx8IGNvbXBsZXRlID8geyBuZXh0OiBvYnNlcnZlck9yTmV4dCwgZXJyb3I6IGVycm9yLCBjb21wbGV0ZTogY29tcGxldGUgfSA6IG9ic2VydmVyT3JOZXh0O1xuICAgIHJldHVybiB0YXBPYnNlcnZlclxuICAgICAgICA/IG9wZXJhdGUoZnVuY3Rpb24gKHNvdXJjZSwgc3Vic2NyaWJlcikge1xuICAgICAgICAgICAgc291cmNlLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAoX2EgPSB0YXBPYnNlcnZlci5uZXh0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2FsbCh0YXBPYnNlcnZlciwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgICAgIChfYSA9IHRhcE9ic2VydmVyLmNvbXBsZXRlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2FsbCh0YXBPYnNlcnZlcik7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAoX2EgPSB0YXBPYnNlcnZlci5lcnJvcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNhbGwodGFwT2JzZXJ2ZXIsIGVycik7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KVxuICAgICAgICA6XG4gICAgICAgICAgICBpZGVudGl0eTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRhcC5qcy5tYXAiLCJpbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IE9wZXJhdG9yU3Vic2NyaWJlciB9IGZyb20gJy4vT3BlcmF0b3JTdWJzY3JpYmVyJztcbmltcG9ydCB7IGlubmVyRnJvbSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbSc7XG5leHBvcnQgdmFyIGRlZmF1bHRUaHJvdHRsZUNvbmZpZyA9IHtcbiAgICBsZWFkaW5nOiB0cnVlLFxuICAgIHRyYWlsaW5nOiBmYWxzZSxcbn07XG5leHBvcnQgZnVuY3Rpb24gdGhyb3R0bGUoZHVyYXRpb25TZWxlY3RvciwgX2EpIHtcbiAgICB2YXIgX2IgPSBfYSA9PT0gdm9pZCAwID8gZGVmYXVsdFRocm90dGxlQ29uZmlnIDogX2EsIGxlYWRpbmcgPSBfYi5sZWFkaW5nLCB0cmFpbGluZyA9IF9iLnRyYWlsaW5nO1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGhhc1ZhbHVlID0gZmFsc2U7XG4gICAgICAgIHZhciBzZW5kVmFsdWUgPSBudWxsO1xuICAgICAgICB2YXIgdGhyb3R0bGVkID0gbnVsbDtcbiAgICAgICAgdmFyIGlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVuZFRocm90dGxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdHRsZWQgPT09IG51bGwgfHwgdGhyb3R0bGVkID09PSB2b2lkIDAgPyB2b2lkIDAgOiB0aHJvdHRsZWQudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHRocm90dGxlZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAodHJhaWxpbmcpIHtcbiAgICAgICAgICAgICAgICBzZW5kKCk7XG4gICAgICAgICAgICAgICAgaXNDb21wbGV0ZSAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBjbGVhbnVwVGhyb3R0bGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRocm90dGxlZCA9IG51bGw7XG4gICAgICAgICAgICBpc0NvbXBsZXRlICYmIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN0YXJ0VGhyb3R0bGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhyb3R0bGVkID0gaW5uZXJGcm9tKGR1cmF0aW9uU2VsZWN0b3IodmFsdWUpKS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBlbmRUaHJvdHRsaW5nLCBjbGVhbnVwVGhyb3R0bGluZykpKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoaGFzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBoYXNWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbmRWYWx1ZTtcbiAgICAgICAgICAgICAgICBzZW5kVmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgIWlzQ29tcGxldGUgJiYgc3RhcnRUaHJvdHRsZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbmRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgISh0aHJvdHRsZWQgJiYgIXRocm90dGxlZC5jbG9zZWQpICYmIChsZWFkaW5nID8gc2VuZCgpIDogc3RhcnRUaHJvdHRsZSh2YWx1ZSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpc0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICEodHJhaWxpbmcgJiYgaGFzVmFsdWUgJiYgdGhyb3R0bGVkICYmICF0aHJvdHRsZWQuY2xvc2VkKSAmJiBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRocm90dGxlLmpzLm1hcCIsImltcG9ydCB7IGFzeW5jU2NoZWR1bGVyIH0gZnJvbSAnLi4vc2NoZWR1bGVyL2FzeW5jJztcbmltcG9ydCB7IGRlZmF1bHRUaHJvdHRsZUNvbmZpZywgdGhyb3R0bGUgfSBmcm9tICcuL3Rocm90dGxlJztcbmltcG9ydCB7IHRpbWVyIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS90aW1lcic7XG5leHBvcnQgZnVuY3Rpb24gdGhyb3R0bGVUaW1lKGR1cmF0aW9uLCBzY2hlZHVsZXIsIGNvbmZpZykge1xuICAgIGlmIChzY2hlZHVsZXIgPT09IHZvaWQgMCkgeyBzY2hlZHVsZXIgPSBhc3luY1NjaGVkdWxlcjsgfVxuICAgIGlmIChjb25maWcgPT09IHZvaWQgMCkgeyBjb25maWcgPSBkZWZhdWx0VGhyb3R0bGVDb25maWc7IH1cbiAgICB2YXIgZHVyYXRpb24kID0gdGltZXIoZHVyYXRpb24sIHNjaGVkdWxlcik7XG4gICAgcmV0dXJuIHRocm90dGxlKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGR1cmF0aW9uJDsgfSwgY29uZmlnKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRocm90dGxlVGltZS5qcy5tYXAiLCJpbXBvcnQgeyBFbXB0eUVycm9yIH0gZnJvbSAnLi4vdXRpbC9FbXB0eUVycm9yJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIHRocm93SWZFbXB0eShlcnJvckZhY3RvcnkpIHtcbiAgICBpZiAoZXJyb3JGYWN0b3J5ID09PSB2b2lkIDApIHsgZXJyb3JGYWN0b3J5ID0gZGVmYXVsdEVycm9yRmFjdG9yeTsgfVxuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGhhc1ZhbHVlID0gZmFsc2U7XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGhhc1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIChoYXNWYWx1ZSA/IHN1YnNjcmliZXIuY29tcGxldGUoKSA6IHN1YnNjcmliZXIuZXJyb3IoZXJyb3JGYWN0b3J5KCkpKTsgfSkpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZGVmYXVsdEVycm9yRmFjdG9yeSgpIHtcbiAgICByZXR1cm4gbmV3IEVtcHR5RXJyb3IoKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRocm93SWZFbXB0eS5qcy5tYXAiLCJpbXBvcnQgeyBhc3luYyB9IGZyb20gJy4uL3NjaGVkdWxlci9hc3luYyc7XG5pbXBvcnQgeyBzY2FuIH0gZnJvbSAnLi9zY2FuJztcbmltcG9ydCB7IGRlZmVyIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9kZWZlcic7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICcuL21hcCc7XG5leHBvcnQgZnVuY3Rpb24gdGltZUludGVydmFsKHNjaGVkdWxlcikge1xuICAgIGlmIChzY2hlZHVsZXIgPT09IHZvaWQgMCkgeyBzY2hlZHVsZXIgPSBhc3luYzsgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgIHJldHVybiBkZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gc291cmNlLnBpcGUoc2NhbihmdW5jdGlvbiAoX2EsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBfYS5jdXJyZW50O1xuICAgICAgICAgICAgICAgIHJldHVybiAoeyB2YWx1ZTogdmFsdWUsIGN1cnJlbnQ6IHNjaGVkdWxlci5ub3coKSwgbGFzdDogY3VycmVudCB9KTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50OiBzY2hlZHVsZXIubm93KCksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBsYXN0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9KSwgbWFwKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50ID0gX2EuY3VycmVudCwgbGFzdCA9IF9hLmxhc3QsIHZhbHVlID0gX2EudmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lSW50ZXJ2YWwodmFsdWUsIGN1cnJlbnQgLSBsYXN0KTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cbnZhciBUaW1lSW50ZXJ2YWwgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFRpbWVJbnRlcnZhbCh2YWx1ZSwgaW50ZXJ2YWwpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgfVxuICAgIHJldHVybiBUaW1lSW50ZXJ2YWw7XG59KCkpO1xuZXhwb3J0IHsgVGltZUludGVydmFsIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aW1lSW50ZXJ2YWwuanMubWFwIiwiaW1wb3J0IHsgYXN5bmNTY2hlZHVsZXIgfSBmcm9tICcuLi9zY2hlZHVsZXIvYXN5bmMnO1xuaW1wb3J0IHsgaXNWYWxpZERhdGUgfSBmcm9tICcuLi91dGlsL2lzRGF0ZSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGlubmVyRnJvbSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbSc7XG5pbXBvcnQgeyBjcmVhdGVFcnJvckNsYXNzIH0gZnJvbSAnLi4vdXRpbC9jcmVhdGVFcnJvckNsYXNzJztcbmltcG9ydCB7IGNhdWdodFNjaGVkdWxlIH0gZnJvbSAnLi4vdXRpbC9jYXVnaHRTY2hlZHVsZSc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5leHBvcnQgdmFyIFRpbWVvdXRFcnJvciA9IGNyZWF0ZUVycm9yQ2xhc3MoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiBUaW1lb3V0RXJyb3JJbXBsKGluZm8pIHtcbiAgICAgICAgaWYgKGluZm8gPT09IHZvaWQgMCkgeyBpbmZvID0gbnVsbDsgfVxuICAgICAgICBfc3VwZXIodGhpcyk7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9ICdUaW1lb3V0IGhhcyBvY2N1cnJlZCc7XG4gICAgICAgIHRoaXMubmFtZSA9ICdUaW1lb3V0RXJyb3InO1xuICAgICAgICB0aGlzLmluZm8gPSBpbmZvO1xuICAgIH07XG59KTtcbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0KGNvbmZpZywgc2NoZWR1bGVyQXJnKSB7XG4gICAgdmFyIF9hID0gKGlzVmFsaWREYXRlKGNvbmZpZylcbiAgICAgICAgPyB7IGZpcnN0OiBjb25maWcgfVxuICAgICAgICA6IHR5cGVvZiBjb25maWcgPT09ICdudW1iZXInXG4gICAgICAgICAgICA/IHsgZWFjaDogY29uZmlnIH1cbiAgICAgICAgICAgIDogY29uZmlnKSwgZmlyc3QgPSBfYS5maXJzdCwgZWFjaCA9IF9hLmVhY2gsIF9iID0gX2Eud2l0aCwgX3dpdGggPSBfYiA9PT0gdm9pZCAwID8gdGltZW91dEVycm9yRmFjdG9yeSA6IF9iLCBfYyA9IF9hLnNjaGVkdWxlciwgc2NoZWR1bGVyID0gX2MgPT09IHZvaWQgMCA/IHNjaGVkdWxlckFyZyAhPT0gbnVsbCAmJiBzY2hlZHVsZXJBcmcgIT09IHZvaWQgMCA/IHNjaGVkdWxlckFyZyA6IGFzeW5jU2NoZWR1bGVyIDogX2MsIF9kID0gX2EubWV0YSwgbWV0YSA9IF9kID09PSB2b2lkIDAgPyBudWxsIDogX2Q7XG4gICAgaWYgKGZpcnN0ID09IG51bGwgJiYgZWFjaCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ05vIHRpbWVvdXQgcHJvdmlkZWQuJyk7XG4gICAgfVxuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsU291cmNlU3Vic2NyaXB0aW9uO1xuICAgICAgICB2YXIgdGltZXJTdWJzY3JpcHRpb247XG4gICAgICAgIHZhciBsYXN0VmFsdWUgPSBudWxsO1xuICAgICAgICB2YXIgc2VlbiA9IDA7XG4gICAgICAgIHZhciBzdGFydFRpbWVyID0gZnVuY3Rpb24gKGRlbGF5KSB7XG4gICAgICAgICAgICB0aW1lclN1YnNjcmlwdGlvbiA9IGNhdWdodFNjaGVkdWxlKHN1YnNjcmliZXIsIHNjaGVkdWxlciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsU291cmNlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgICAgaW5uZXJGcm9tKF93aXRoKHtcbiAgICAgICAgICAgICAgICAgICAgbWV0YTogbWV0YSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdFZhbHVlOiBsYXN0VmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHNlZW46IHNlZW4sXG4gICAgICAgICAgICAgICAgfSkpLnN1YnNjcmliZShzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfTtcbiAgICAgICAgb3JpZ2luYWxTb3VyY2VTdWJzY3JpcHRpb24gPSBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aW1lclN1YnNjcmlwdGlvbiA9PT0gbnVsbCB8fCB0aW1lclN1YnNjcmlwdGlvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogdGltZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHNlZW4rKztcbiAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCgobGFzdFZhbHVlID0gdmFsdWUpKTtcbiAgICAgICAgICAgIGVhY2ggPiAwICYmIHN0YXJ0VGltZXIoZWFjaCk7XG4gICAgICAgIH0sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoISh0aW1lclN1YnNjcmlwdGlvbiA9PT0gbnVsbCB8fCB0aW1lclN1YnNjcmlwdGlvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogdGltZXJTdWJzY3JpcHRpb24uY2xvc2VkKSkge1xuICAgICAgICAgICAgICAgIHRpbWVyU3Vic2NyaXB0aW9uID09PSBudWxsIHx8IHRpbWVyU3Vic2NyaXB0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiB0aW1lclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFZhbHVlID0gbnVsbDtcbiAgICAgICAgfSkpO1xuICAgICAgICBzdGFydFRpbWVyKGZpcnN0ICE9IG51bGwgPyAodHlwZW9mIGZpcnN0ID09PSAnbnVtYmVyJyA/IGZpcnN0IDogK2ZpcnN0IC0gc2NoZWR1bGVyLm5vdygpKSA6IGVhY2gpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gdGltZW91dEVycm9yRmFjdG9yeShpbmZvKSB7XG4gICAgdGhyb3cgbmV3IFRpbWVvdXRFcnJvcihpbmZvKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpbWVvdXQuanMubWFwIiwiaW1wb3J0IHsgYXN5bmMgfSBmcm9tICcuLi9zY2hlZHVsZXIvYXN5bmMnO1xuaW1wb3J0IHsgaXNWYWxpZERhdGUgfSBmcm9tICcuLi91dGlsL2lzRGF0ZSc7XG5pbXBvcnQgeyB0aW1lb3V0IH0gZnJvbSAnLi90aW1lb3V0JztcbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0V2l0aChkdWUsIHdpdGhPYnNlcnZhYmxlLCBzY2hlZHVsZXIpIHtcbiAgICB2YXIgZmlyc3Q7XG4gICAgdmFyIGVhY2g7XG4gICAgdmFyIF93aXRoO1xuICAgIHNjaGVkdWxlciA9IHNjaGVkdWxlciAhPT0gbnVsbCAmJiBzY2hlZHVsZXIgIT09IHZvaWQgMCA/IHNjaGVkdWxlciA6IGFzeW5jO1xuICAgIGlmIChpc1ZhbGlkRGF0ZShkdWUpKSB7XG4gICAgICAgIGZpcnN0ID0gZHVlO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICBlYWNoID0gZHVlO1xuICAgIH1cbiAgICBpZiAod2l0aE9ic2VydmFibGUpIHtcbiAgICAgICAgX3dpdGggPSBmdW5jdGlvbiAoKSB7IHJldHVybiB3aXRoT2JzZXJ2YWJsZTsgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ05vIG9ic2VydmFibGUgcHJvdmlkZWQgdG8gc3dpdGNoIHRvJyk7XG4gICAgfVxuICAgIGlmIChmaXJzdCA9PSBudWxsICYmIGVhY2ggPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdObyB0aW1lb3V0IHByb3ZpZGVkLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGltZW91dCh7XG4gICAgICAgIGZpcnN0OiBmaXJzdCxcbiAgICAgICAgZWFjaDogZWFjaCxcbiAgICAgICAgc2NoZWR1bGVyOiBzY2hlZHVsZXIsXG4gICAgICAgIHdpdGg6IF93aXRoLFxuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGltZW91dFdpdGguanMubWFwIiwiaW1wb3J0IHsgZGF0ZVRpbWVzdGFtcFByb3ZpZGVyIH0gZnJvbSAnLi4vc2NoZWR1bGVyL2RhdGVUaW1lc3RhbXBQcm92aWRlcic7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICcuL21hcCc7XG5leHBvcnQgZnVuY3Rpb24gdGltZXN0YW1wKHRpbWVzdGFtcFByb3ZpZGVyKSB7XG4gICAgaWYgKHRpbWVzdGFtcFByb3ZpZGVyID09PSB2b2lkIDApIHsgdGltZXN0YW1wUHJvdmlkZXIgPSBkYXRlVGltZXN0YW1wUHJvdmlkZXI7IH1cbiAgICByZXR1cm4gbWFwKGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gKHsgdmFsdWU6IHZhbHVlLCB0aW1lc3RhbXA6IHRpbWVzdGFtcFByb3ZpZGVyLm5vdygpIH0pOyB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpbWVzdGFtcC5qcy5tYXAiLCJpbXBvcnQgeyByZWR1Y2UgfSBmcm9tICcuL3JlZHVjZSc7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbnZhciBhcnJSZWR1Y2VyID0gZnVuY3Rpb24gKGFyciwgdmFsdWUpIHsgcmV0dXJuIChhcnIucHVzaCh2YWx1ZSksIGFycik7IH07XG5leHBvcnQgZnVuY3Rpb24gdG9BcnJheSgpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHJlZHVjZShhcnJSZWR1Y2VyLCBbXSkoc291cmNlKS5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD10b0FycmF5LmpzLm1hcCIsImltcG9ydCB7IFN1YmplY3QgfSBmcm9tICcuLi9TdWJqZWN0JztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgbm9vcCB9IGZyb20gJy4uL3V0aWwvbm9vcCc7XG5leHBvcnQgZnVuY3Rpb24gd2luZG93KHdpbmRvd0JvdW5kYXJpZXMpIHtcbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciB3aW5kb3dTdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgc3Vic2NyaWJlci5uZXh0KHdpbmRvd1N1YmplY3QuYXNPYnNlcnZhYmxlKCkpO1xuICAgICAgICB2YXIgZXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgd2luZG93U3ViamVjdC5lcnJvcihlcnIpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5lcnJvcihlcnIpO1xuICAgICAgICB9O1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB3aW5kb3dTdWJqZWN0ID09PSBudWxsIHx8IHdpbmRvd1N1YmplY3QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbmRvd1N1YmplY3QubmV4dCh2YWx1ZSk7IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvd1N1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSwgZXJyb3JIYW5kbGVyKSk7XG4gICAgICAgIHdpbmRvd0JvdW5kYXJpZXMuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93U3ViamVjdC5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KCh3aW5kb3dTdWJqZWN0ID0gbmV3IFN1YmplY3QoKSkpO1xuICAgICAgICB9LCBub29wLCBlcnJvckhhbmRsZXIpKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvd1N1YmplY3QgPT09IG51bGwgfHwgd2luZG93U3ViamVjdCA9PT0gdm9pZCAwID8gdm9pZCAwIDogd2luZG93U3ViamVjdC51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgd2luZG93U3ViamVjdCA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD13aW5kb3cuanMubWFwIiwiaW1wb3J0IHsgX192YWx1ZXMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICcuLi9TdWJqZWN0JztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuZXhwb3J0IGZ1bmN0aW9uIHdpbmRvd0NvdW50KHdpbmRvd1NpemUsIHN0YXJ0V2luZG93RXZlcnkpIHtcbiAgICBpZiAoc3RhcnRXaW5kb3dFdmVyeSA9PT0gdm9pZCAwKSB7IHN0YXJ0V2luZG93RXZlcnkgPSAwOyB9XG4gICAgdmFyIHN0YXJ0RXZlcnkgPSBzdGFydFdpbmRvd0V2ZXJ5ID4gMCA/IHN0YXJ0V2luZG93RXZlcnkgOiB3aW5kb3dTaXplO1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHdpbmRvd3MgPSBbbmV3IFN1YmplY3QoKV07XG4gICAgICAgIHZhciBzdGFydHMgPSBbXTtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgc3Vic2NyaWJlci5uZXh0KHdpbmRvd3NbMF0uYXNPYnNlcnZhYmxlKCkpO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgd2luZG93c18xID0gX192YWx1ZXMod2luZG93cyksIHdpbmRvd3NfMV8xID0gd2luZG93c18xLm5leHQoKTsgIXdpbmRvd3NfMV8xLmRvbmU7IHdpbmRvd3NfMV8xID0gd2luZG93c18xLm5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2luZG93XzEgPSB3aW5kb3dzXzFfMS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93XzEubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVfMV8xKSB7IGVfMSA9IHsgZXJyb3I6IGVfMV8xIH07IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3dzXzFfMSAmJiAhd2luZG93c18xXzEuZG9uZSAmJiAoX2EgPSB3aW5kb3dzXzEucmV0dXJuKSkgX2EuY2FsbCh3aW5kb3dzXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYyA9IGNvdW50IC0gd2luZG93U2l6ZSArIDE7XG4gICAgICAgICAgICBpZiAoYyA+PSAwICYmIGMgJSBzdGFydEV2ZXJ5ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgd2luZG93cy5zaGlmdCgpLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKytjb3VudCAlIHN0YXJ0RXZlcnkgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgd2luZG93XzIgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICAgICAgICAgIHdpbmRvd3MucHVzaCh3aW5kb3dfMik7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHdpbmRvd18yLmFzT2JzZXJ2YWJsZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2hpbGUgKHdpbmRvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHdpbmRvd3Muc2hpZnQoKS5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICB3aGlsZSAod2luZG93cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgd2luZG93cy5zaGlmdCgpLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmVycm9yKGVycik7XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHN0YXJ0cyA9IG51bGw7XG4gICAgICAgICAgICB3aW5kb3dzID0gbnVsbDtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2luZG93Q291bnQuanMubWFwIiwiaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJy4uL1N1YmplY3QnO1xuaW1wb3J0IHsgYXN5bmNTY2hlZHVsZXIgfSBmcm9tICcuLi9zY2hlZHVsZXIvYXN5bmMnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAnLi4vU3Vic2NyaXB0aW9uJztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgYXJyUmVtb3ZlIH0gZnJvbSAnLi4vdXRpbC9hcnJSZW1vdmUnO1xuaW1wb3J0IHsgcG9wU2NoZWR1bGVyIH0gZnJvbSAnLi4vdXRpbC9hcmdzJztcbmV4cG9ydCBmdW5jdGlvbiB3aW5kb3dUaW1lKHdpbmRvd1RpbWVTcGFuKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgb3RoZXJBcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgb3RoZXJBcmdzW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgc2NoZWR1bGVyID0gKF9hID0gcG9wU2NoZWR1bGVyKG90aGVyQXJncykpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IGFzeW5jU2NoZWR1bGVyO1xuICAgIHZhciB3aW5kb3dDcmVhdGlvbkludGVydmFsID0gKF9iID0gb3RoZXJBcmdzWzBdKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBudWxsO1xuICAgIHZhciBtYXhXaW5kb3dTaXplID0gb3RoZXJBcmdzWzFdIHx8IEluZmluaXR5O1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHdpbmRvd1JlY29yZHMgPSBbXTtcbiAgICAgICAgdmFyIHJlc3RhcnRPbkNsb3NlID0gZmFsc2U7XG4gICAgICAgIHZhciBjbG9zZVdpbmRvdyA9IGZ1bmN0aW9uIChyZWNvcmQpIHtcbiAgICAgICAgICAgIHZhciB3aW5kb3cgPSByZWNvcmQud2luZG93LCBzdWJzID0gcmVjb3JkLnN1YnM7XG4gICAgICAgICAgICB3aW5kb3cuY29tcGxldGUoKTtcbiAgICAgICAgICAgIHN1YnMudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIGFyclJlbW92ZSh3aW5kb3dSZWNvcmRzLCByZWNvcmQpO1xuICAgICAgICAgICAgcmVzdGFydE9uQ2xvc2UgJiYgc3RhcnRXaW5kb3coKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN0YXJ0V2luZG93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHdpbmRvd1JlY29yZHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VicyA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmFkZChzdWJzKTtcbiAgICAgICAgICAgICAgICB2YXIgd2luZG93XzEgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICAgICAgICAgIHZhciByZWNvcmRfMSA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93OiB3aW5kb3dfMSxcbiAgICAgICAgICAgICAgICAgICAgc3Viczogc3VicyxcbiAgICAgICAgICAgICAgICAgICAgc2VlbjogMCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHdpbmRvd1JlY29yZHMucHVzaChyZWNvcmRfMSk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHdpbmRvd18xLmFzT2JzZXJ2YWJsZSgpKTtcbiAgICAgICAgICAgICAgICBzdWJzLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkgeyByZXR1cm4gY2xvc2VXaW5kb3cocmVjb3JkXzEpOyB9LCB3aW5kb3dUaW1lU3BhbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB3aW5kb3dDcmVhdGlvbkludGVydmFsICE9PSBudWxsICYmIHdpbmRvd0NyZWF0aW9uSW50ZXJ2YWwgPj0gMFxuICAgICAgICAgICAgP1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuYWRkKHNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0V2luZG93KCk7XG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmNsb3NlZCAmJiBzdWJzY3JpYmVyLmFkZCh0aGlzLnNjaGVkdWxlKG51bGwsIHdpbmRvd0NyZWF0aW9uSW50ZXJ2YWwpKTtcbiAgICAgICAgICAgICAgICB9LCB3aW5kb3dDcmVhdGlvbkludGVydmFsKSlcbiAgICAgICAgICAgIDogKHJlc3RhcnRPbkNsb3NlID0gdHJ1ZSk7XG4gICAgICAgIHN0YXJ0V2luZG93KCk7XG4gICAgICAgIHZhciBsb29wID0gZnVuY3Rpb24gKGNiKSB7IHJldHVybiB3aW5kb3dSZWNvcmRzLnNsaWNlKCkuZm9yRWFjaChjYik7IH07XG4gICAgICAgIHZhciB0ZXJtaW5hdGUgPSBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgICAgIGxvb3AoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdpbmRvdyA9IF9hLndpbmRvdztcbiAgICAgICAgICAgICAgICByZXR1cm4gY2Iod2luZG93KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2Ioc3Vic2NyaWJlcik7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH07XG4gICAgICAgIHNvdXJjZS5zdWJzY3JpYmUobmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGxvb3AoZnVuY3Rpb24gKHJlY29yZCkge1xuICAgICAgICAgICAgICAgIHJlY29yZC53aW5kb3cubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgbWF4V2luZG93U2l6ZSA8PSArK3JlY29yZC5zZWVuICYmIGNsb3NlV2luZG93KHJlY29yZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGVybWluYXRlKGZ1bmN0aW9uIChjb25zdW1lcikgeyByZXR1cm4gY29uc3VtZXIuY29tcGxldGUoKTsgfSk7IH0sIGZ1bmN0aW9uIChlcnIpIHsgcmV0dXJuIHRlcm1pbmF0ZShmdW5jdGlvbiAoY29uc3VtZXIpIHsgcmV0dXJuIGNvbnN1bWVyLmVycm9yKGVycik7IH0pOyB9KSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3dSZWNvcmRzID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdpbmRvd1RpbWUuanMubWFwIiwiaW1wb3J0IHsgX192YWx1ZXMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICcuLi9TdWJqZWN0JztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJy4uL1N1YnNjcmlwdGlvbic7XG5pbXBvcnQgeyBvcGVyYXRlIH0gZnJvbSAnLi4vdXRpbC9saWZ0JztcbmltcG9ydCB7IGlubmVyRnJvbSB9IGZyb20gJy4uL29ic2VydmFibGUvZnJvbSc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBub29wIH0gZnJvbSAnLi4vdXRpbC9ub29wJztcbmltcG9ydCB7IGFyclJlbW92ZSB9IGZyb20gJy4uL3V0aWwvYXJyUmVtb3ZlJztcbmV4cG9ydCBmdW5jdGlvbiB3aW5kb3dUb2dnbGUob3BlbmluZ3MsIGNsb3NpbmdTZWxlY3Rvcikge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHdpbmRvd3MgPSBbXTtcbiAgICAgICAgdmFyIGhhbmRsZUVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgd2hpbGUgKDAgPCB3aW5kb3dzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHdpbmRvd3Muc2hpZnQoKS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Vic2NyaWJlci5lcnJvcihlcnIpO1xuICAgICAgICB9O1xuICAgICAgICBpbm5lckZyb20ob3BlbmluZ3MpLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uIChvcGVuVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB3aW5kb3cgPSBuZXcgU3ViamVjdCgpO1xuICAgICAgICAgICAgd2luZG93cy5wdXNoKHdpbmRvdyk7XG4gICAgICAgICAgICB2YXIgY2xvc2luZ1N1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgICAgIHZhciBjbG9zZVdpbmRvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBhcnJSZW1vdmUod2luZG93cywgd2luZG93KTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICBjbG9zaW5nU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGNsb3NpbmdOb3RpZmllcjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2xvc2luZ05vdGlmaWVyID0gaW5uZXJGcm9tKGNsb3NpbmdTZWxlY3RvcihvcGVuVmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVFcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh3aW5kb3cuYXNPYnNlcnZhYmxlKCkpO1xuICAgICAgICAgICAgY2xvc2luZ1N1YnNjcmlwdGlvbi5hZGQoY2xvc2luZ05vdGlmaWVyLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGNsb3NlV2luZG93LCBub29wLCBoYW5kbGVFcnJvcikpKTtcbiAgICAgICAgfSwgbm9vcCkpO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZV8xLCBfYTtcbiAgICAgICAgICAgIHZhciB3aW5kb3dzQ29weSA9IHdpbmRvd3Muc2xpY2UoKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgd2luZG93c0NvcHlfMSA9IF9fdmFsdWVzKHdpbmRvd3NDb3B5KSwgd2luZG93c0NvcHlfMV8xID0gd2luZG93c0NvcHlfMS5uZXh0KCk7ICF3aW5kb3dzQ29weV8xXzEuZG9uZTsgd2luZG93c0NvcHlfMV8xID0gd2luZG93c0NvcHlfMS5uZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpbmRvd18xID0gd2luZG93c0NvcHlfMV8xLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3dfMS5uZXh0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZV8xXzEpIHsgZV8xID0geyBlcnJvcjogZV8xXzEgfTsgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvd3NDb3B5XzFfMSAmJiAhd2luZG93c0NvcHlfMV8xLmRvbmUgJiYgKF9hID0gd2luZG93c0NvcHlfMS5yZXR1cm4pKSBfYS5jYWxsKHdpbmRvd3NDb3B5XzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHsgaWYgKGVfMSkgdGhyb3cgZV8xLmVycm9yOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdoaWxlICgwIDwgd2luZG93cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3dzLnNoaWZ0KCkuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgfSwgaGFuZGxlRXJyb3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdoaWxlICgwIDwgd2luZG93cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3dzLnNoaWZ0KCkudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2luZG93VG9nZ2xlLmpzLm1hcCIsImltcG9ydCB7IFN1YmplY3QgfSBmcm9tICcuLi9TdWJqZWN0JztcbmltcG9ydCB7IG9wZXJhdGUgfSBmcm9tICcuLi91dGlsL2xpZnQnO1xuaW1wb3J0IHsgT3BlcmF0b3JTdWJzY3JpYmVyIH0gZnJvbSAnLi9PcGVyYXRvclN1YnNjcmliZXInO1xuaW1wb3J0IHsgaW5uZXJGcm9tIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS9mcm9tJztcbmV4cG9ydCBmdW5jdGlvbiB3aW5kb3dXaGVuKGNsb3NpbmdTZWxlY3Rvcikge1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHdpbmRvdztcbiAgICAgICAgdmFyIGNsb3NpbmdTdWJzY3JpYmVyO1xuICAgICAgICB2YXIgaGFuZGxlRXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICB3aW5kb3cuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9wZW5XaW5kb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjbG9zaW5nU3Vic2NyaWJlciA9PT0gbnVsbCB8fCBjbG9zaW5nU3Vic2NyaWJlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2xvc2luZ1N1YnNjcmliZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHdpbmRvdyA9PT0gbnVsbCB8fCB3aW5kb3cgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHdpbmRvdy5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgd2luZG93ID0gbmV3IFN1YmplY3QoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh3aW5kb3cuYXNPYnNlcnZhYmxlKCkpO1xuICAgICAgICAgICAgdmFyIGNsb3NpbmdOb3RpZmllcjtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2xvc2luZ05vdGlmaWVyID0gaW5uZXJGcm9tKGNsb3NpbmdTZWxlY3RvcigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVFcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsb3NpbmdOb3RpZmllci5zdWJzY3JpYmUoKGNsb3NpbmdTdWJzY3JpYmVyID0gbmV3IE9wZXJhdG9yU3Vic2NyaWJlcihzdWJzY3JpYmVyLCBvcGVuV2luZG93LCBvcGVuV2luZG93LCBoYW5kbGVFcnJvcikpKTtcbiAgICAgICAgfTtcbiAgICAgICAgb3BlbldpbmRvdygpO1xuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB3aW5kb3cubmV4dCh2YWx1ZSk7IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICB9LCBoYW5kbGVFcnJvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2xvc2luZ1N1YnNjcmliZXIgPT09IG51bGwgfHwgY2xvc2luZ1N1YnNjcmliZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNsb3NpbmdTdWJzY3JpYmVyLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB3aW5kb3cgPSBudWxsO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD13aW5kb3dXaGVuLmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5pbXBvcnQgeyBPcGVyYXRvclN1YnNjcmliZXIgfSBmcm9tICcuL09wZXJhdG9yU3Vic2NyaWJlcic7XG5pbXBvcnQgeyBpbm5lckZyb20gfSBmcm9tICcuLi9vYnNlcnZhYmxlL2Zyb20nO1xuaW1wb3J0IHsgaWRlbnRpdHkgfSBmcm9tICcuLi91dGlsL2lkZW50aXR5JztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuLi91dGlsL25vb3AnO1xuaW1wb3J0IHsgcG9wUmVzdWx0U2VsZWN0b3IgfSBmcm9tICcuLi91dGlsL2FyZ3MnO1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMYXRlc3RGcm9tKCkge1xuICAgIHZhciBpbnB1dHMgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBpbnB1dHNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgdmFyIHByb2plY3QgPSBwb3BSZXN1bHRTZWxlY3RvcihpbnB1dHMpO1xuICAgIHJldHVybiBvcGVyYXRlKGZ1bmN0aW9uIChzb3VyY2UsIHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGxlbiA9IGlucHV0cy5sZW5ndGg7XG4gICAgICAgIHZhciBvdGhlclZhbHVlcyA9IG5ldyBBcnJheShsZW4pO1xuICAgICAgICB2YXIgaGFzVmFsdWUgPSBpbnB1dHMubWFwKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9KTtcbiAgICAgICAgdmFyIHJlYWR5ID0gZmFsc2U7XG4gICAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIGlubmVyRnJvbShpbnB1dHNbaV0pLnN1YnNjcmliZShuZXcgT3BlcmF0b3JTdWJzY3JpYmVyKHN1YnNjcmliZXIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIG90aGVyVmFsdWVzW2ldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWFkeSAmJiAhaGFzVmFsdWVbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzVmFsdWVbaV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAocmVhZHkgPSBoYXNWYWx1ZS5ldmVyeShpZGVudGl0eSkpICYmIChoYXNWYWx1ZSA9IG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIG5vb3ApKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgX2xvb3BfMShpKTtcbiAgICAgICAgfVxuICAgICAgICBzb3VyY2Uuc3Vic2NyaWJlKG5ldyBPcGVyYXRvclN1YnNjcmliZXIoc3Vic2NyaWJlciwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAocmVhZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gX19zcHJlYWRBcnJheShbdmFsdWVdLCBfX3JlYWQob3RoZXJWYWx1ZXMpKTtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQocHJvamVjdCA/IHByb2plY3QuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQodmFsdWVzKSkpIDogdmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2l0aExhdGVzdEZyb20uanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyB6aXAgYXMgemlwU3RhdGljIH0gZnJvbSAnLi4vb2JzZXJ2YWJsZS96aXAnO1xuaW1wb3J0IHsgb3BlcmF0ZSB9IGZyb20gJy4uL3V0aWwvbGlmdCc7XG5leHBvcnQgZnVuY3Rpb24gemlwKCkge1xuICAgIHZhciBzb3VyY2VzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgc291cmNlc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gb3BlcmF0ZShmdW5jdGlvbiAoc291cmNlLCBzdWJzY3JpYmVyKSB7XG4gICAgICAgIHppcFN0YXRpYy5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW3NvdXJjZV0sIF9fcmVhZChzb3VyY2VzKSkpLnN1YnNjcmliZShzdWJzY3JpYmVyKTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXppcC5qcy5tYXAiLCJpbXBvcnQgeyB6aXAgfSBmcm9tICcuLi9vYnNlcnZhYmxlL3ppcCc7XG5pbXBvcnQgeyBqb2luQWxsSW50ZXJuYWxzIH0gZnJvbSAnLi9qb2luQWxsSW50ZXJuYWxzJztcbmV4cG9ydCBmdW5jdGlvbiB6aXBBbGwocHJvamVjdCkge1xuICAgIHJldHVybiBqb2luQWxsSW50ZXJuYWxzKHppcCwgcHJvamVjdCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD16aXBBbGwuanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyB6aXAgfSBmcm9tICcuL3ppcCc7XG5leHBvcnQgZnVuY3Rpb24gemlwV2l0aCgpIHtcbiAgICB2YXIgb3RoZXJJbnB1dHMgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBvdGhlcklucHV0c1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gemlwLmFwcGx5KHZvaWQgMCwgX19zcHJlYWRBcnJheShbXSwgX19yZWFkKG90aGVySW5wdXRzKSkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9emlwV2l0aC5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVBcnJheShpbnB1dCwgc2NoZWR1bGVyKSB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KGlucHV0W2krK10pO1xuICAgICAgICAgICAgICAgIGlmICghc3Vic2NyaWJlci5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2hlZHVsZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zY2hlZHVsZUFycmF5LmpzLm1hcCIsImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICcuLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJy4uL1N1YnNjcmlwdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVBc3luY0l0ZXJhYmxlKGlucHV0LCBzY2hlZHVsZXIpIHtcbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSXRlcmFibGUgY2Fubm90IGJlIG51bGwnKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKGZ1bmN0aW9uIChzdWJzY3JpYmVyKSB7XG4gICAgICAgIHZhciBzdWIgPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG4gICAgICAgIHN1Yi5hZGQoc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IGlucHV0W1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgc3ViLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IubmV4dCgpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dChyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2NoZWR1bGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBzdWI7XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zY2hlZHVsZUFzeW5jSXRlcmFibGUuanMubWFwIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgaXRlcmF0b3IgYXMgU3ltYm9sX2l0ZXJhdG9yIH0gZnJvbSAnLi4vc3ltYm9sL2l0ZXJhdG9yJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuLi91dGlsL2lzRnVuY3Rpb24nO1xuaW1wb3J0IHsgY2F1Z2h0U2NoZWR1bGUgfSBmcm9tICcuLi91dGlsL2NhdWdodFNjaGVkdWxlJztcbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZUl0ZXJhYmxlKGlucHV0LCBzY2hlZHVsZXIpIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIGl0ZXJhdG9yO1xuICAgICAgICBzdWJzY3JpYmVyLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBpbnB1dFtTeW1ib2xfaXRlcmF0b3JdKCk7XG4gICAgICAgICAgICBjYXVnaHRTY2hlZHVsZShzdWJzY3JpYmVyLCBzY2hlZHVsZXIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2EgPSBpdGVyYXRvci5uZXh0KCksIHZhbHVlID0gX2EudmFsdWUsIGRvbmUgPSBfYS5kb25lO1xuICAgICAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXIubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NoZWR1bGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gaXNGdW5jdGlvbihpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IucmV0dXJuKSAmJiBpdGVyYXRvci5yZXR1cm4oKTsgfTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNjaGVkdWxlSXRlcmFibGUuanMubWFwIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJy4uL09ic2VydmFibGUnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAnLi4vU3Vic2NyaXB0aW9uJztcbmltcG9ydCB7IG9ic2VydmFibGUgYXMgU3ltYm9sX29ic2VydmFibGUgfSBmcm9tICcuLi9zeW1ib2wvb2JzZXJ2YWJsZSc7XG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVPYnNlcnZhYmxlKGlucHV0LCBzY2hlZHVsZXIpIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgdmFyIHN1YiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgc3ViLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9ic2VydmFibGUgPSBpbnB1dFtTeW1ib2xfb2JzZXJ2YWJsZV0oKTtcbiAgICAgICAgICAgIHN1Yi5hZGQob2JzZXJ2YWJsZS5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyBzdWIuYWRkKHNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7IHJldHVybiBzdWJzY3JpYmVyLm5leHQodmFsdWUpOyB9KSk7IH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChlcnIpIHsgc3ViLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkgeyByZXR1cm4gc3Vic2NyaWJlci5lcnJvcihlcnIpOyB9KSk7IH0sXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHsgc3ViLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkgeyByZXR1cm4gc3Vic2NyaWJlci5jb21wbGV0ZSgpOyB9KSk7IH0sXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIHN1YjtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNjaGVkdWxlT2JzZXJ2YWJsZS5qcy5tYXAiLCJpbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAnLi4vT2JzZXJ2YWJsZSc7XG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVQcm9taXNlKGlucHV0LCBzY2hlZHVsZXIpIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICAgICAgcmV0dXJuIHNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmVyLmFkZChzY2hlZHVsZXIuc2NoZWR1bGUoZnVuY3Rpb24gKCkgeyByZXR1cm4gc3Vic2NyaWJlci5jb21wbGV0ZSgpOyB9KSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHN1YnNjcmliZXIuYWRkKHNjaGVkdWxlci5zY2hlZHVsZShmdW5jdGlvbiAoKSB7IHJldHVybiBzdWJzY3JpYmVyLmVycm9yKGVycik7IH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNjaGVkdWxlUHJvbWlzZS5qcy5tYXAiLCJpbXBvcnQgeyBzY2hlZHVsZUFzeW5jSXRlcmFibGUgfSBmcm9tICcuL3NjaGVkdWxlQXN5bmNJdGVyYWJsZSc7XG5pbXBvcnQgeyByZWFkYWJsZVN0cmVhbUxpa2VUb0FzeW5jR2VuZXJhdG9yIH0gZnJvbSAnLi4vdXRpbC9pc1JlYWRhYmxlU3RyZWFtTGlrZSc7XG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVSZWFkYWJsZVN0cmVhbUxpa2UoaW5wdXQsIHNjaGVkdWxlcikge1xuICAgIHJldHVybiBzY2hlZHVsZUFzeW5jSXRlcmFibGUocmVhZGFibGVTdHJlYW1MaWtlVG9Bc3luY0dlbmVyYXRvcihpbnB1dCksIHNjaGVkdWxlcik7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zY2hlZHVsZVJlYWRhYmxlU3RyZWFtTGlrZS5qcy5tYXAiLCJpbXBvcnQgeyBzY2hlZHVsZU9ic2VydmFibGUgfSBmcm9tICcuL3NjaGVkdWxlT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBzY2hlZHVsZVByb21pc2UgfSBmcm9tICcuL3NjaGVkdWxlUHJvbWlzZSc7XG5pbXBvcnQgeyBzY2hlZHVsZUFycmF5IH0gZnJvbSAnLi9zY2hlZHVsZUFycmF5JztcbmltcG9ydCB7IHNjaGVkdWxlSXRlcmFibGUgfSBmcm9tICcuL3NjaGVkdWxlSXRlcmFibGUnO1xuaW1wb3J0IHsgc2NoZWR1bGVBc3luY0l0ZXJhYmxlIH0gZnJvbSAnLi9zY2hlZHVsZUFzeW5jSXRlcmFibGUnO1xuaW1wb3J0IHsgaXNJbnRlcm9wT2JzZXJ2YWJsZSB9IGZyb20gJy4uL3V0aWwvaXNJbnRlcm9wT2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBpc1Byb21pc2UgfSBmcm9tICcuLi91dGlsL2lzUHJvbWlzZSc7XG5pbXBvcnQgeyBpc0FycmF5TGlrZSB9IGZyb20gJy4uL3V0aWwvaXNBcnJheUxpa2UnO1xuaW1wb3J0IHsgaXNJdGVyYWJsZSB9IGZyb20gJy4uL3V0aWwvaXNJdGVyYWJsZSc7XG5pbXBvcnQgeyBpc0FzeW5jSXRlcmFibGUgfSBmcm9tICcuLi91dGlsL2lzQXN5bmNJdGVyYWJsZSc7XG5pbXBvcnQgeyBjcmVhdGVJbnZhbGlkT2JzZXJ2YWJsZVR5cGVFcnJvciB9IGZyb20gJy4uL3V0aWwvdGhyb3dVbm9ic2VydmFibGVFcnJvcic7XG5pbXBvcnQgeyBpc1JlYWRhYmxlU3RyZWFtTGlrZSB9IGZyb20gJy4uL3V0aWwvaXNSZWFkYWJsZVN0cmVhbUxpa2UnO1xuaW1wb3J0IHsgc2NoZWR1bGVSZWFkYWJsZVN0cmVhbUxpa2UgfSBmcm9tICcuL3NjaGVkdWxlUmVhZGFibGVTdHJlYW1MaWtlJztcbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZWQoaW5wdXQsIHNjaGVkdWxlcikge1xuICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChpc0ludGVyb3BPYnNlcnZhYmxlKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlT2JzZXJ2YWJsZShpbnB1dCwgc2NoZWR1bGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBcnJheUxpa2UoaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVBcnJheShpbnB1dCwgc2NoZWR1bGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNQcm9taXNlKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlUHJvbWlzZShpbnB1dCwgc2NoZWR1bGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBc3luY0l0ZXJhYmxlKGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlQXN5bmNJdGVyYWJsZShpbnB1dCwgc2NoZWR1bGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNJdGVyYWJsZShpbnB1dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZUl0ZXJhYmxlKGlucHV0LCBzY2hlZHVsZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1JlYWRhYmxlU3RyZWFtTGlrZShpbnB1dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzY2hlZHVsZVJlYWRhYmxlU3RyZWFtTGlrZShpbnB1dCwgc2NoZWR1bGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBjcmVhdGVJbnZhbGlkT2JzZXJ2YWJsZVR5cGVFcnJvcihpbnB1dCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zY2hlZHVsZWQuanMubWFwIiwiaW1wb3J0IHsgX19leHRlbmRzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICcuLi9TdWJzY3JpcHRpb24nO1xudmFyIEFjdGlvbiA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFjdGlvbiwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBBY3Rpb24oc2NoZWR1bGVyLCB3b3JrKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xuICAgIH1cbiAgICBBY3Rpb24ucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKHN0YXRlLCBkZWxheSkge1xuICAgICAgICBpZiAoZGVsYXkgPT09IHZvaWQgMCkgeyBkZWxheSA9IDA7IH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICByZXR1cm4gQWN0aW9uO1xufShTdWJzY3JpcHRpb24pKTtcbmV4cG9ydCB7IEFjdGlvbiB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QWN0aW9uLmpzLm1hcCIsImltcG9ydCB7IF9fZXh0ZW5kcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgQXN5bmNBY3Rpb24gfSBmcm9tICcuL0FzeW5jQWN0aW9uJztcbmltcG9ydCB7IGFuaW1hdGlvbkZyYW1lUHJvdmlkZXIgfSBmcm9tICcuL2FuaW1hdGlvbkZyYW1lUHJvdmlkZXInO1xudmFyIEFuaW1hdGlvbkZyYW1lQWN0aW9uID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQW5pbWF0aW9uRnJhbWVBY3Rpb24sIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQW5pbWF0aW9uRnJhbWVBY3Rpb24oc2NoZWR1bGVyLCB3b3JrKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIHNjaGVkdWxlciwgd29yaykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgICAgICBfdGhpcy53b3JrID0gd29yaztcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBbmltYXRpb25GcmFtZUFjdGlvbi5wcm90b3R5cGUucmVxdWVzdEFzeW5jSWQgPSBmdW5jdGlvbiAoc2NoZWR1bGVyLCBpZCwgZGVsYXkpIHtcbiAgICAgICAgaWYgKGRlbGF5ID09PSB2b2lkIDApIHsgZGVsYXkgPSAwOyB9XG4gICAgICAgIGlmIChkZWxheSAhPT0gbnVsbCAmJiBkZWxheSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIucHJvdG90eXBlLnJlcXVlc3RBc3luY0lkLmNhbGwodGhpcywgc2NoZWR1bGVyLCBpZCwgZGVsYXkpO1xuICAgICAgICB9XG4gICAgICAgIHNjaGVkdWxlci5hY3Rpb25zLnB1c2godGhpcyk7XG4gICAgICAgIHJldHVybiBzY2hlZHVsZXIuX3NjaGVkdWxlZCB8fCAoc2NoZWR1bGVyLl9zY2hlZHVsZWQgPSBhbmltYXRpb25GcmFtZVByb3ZpZGVyLnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7IHJldHVybiBzY2hlZHVsZXIuZmx1c2godW5kZWZpbmVkKTsgfSkpO1xuICAgIH07XG4gICAgQW5pbWF0aW9uRnJhbWVBY3Rpb24ucHJvdG90eXBlLnJlY3ljbGVBc3luY0lkID0gZnVuY3Rpb24gKHNjaGVkdWxlciwgaWQsIGRlbGF5KSB7XG4gICAgICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7IGRlbGF5ID0gMDsgfVxuICAgICAgICBpZiAoKGRlbGF5ICE9IG51bGwgJiYgZGVsYXkgPiAwKSB8fCAoZGVsYXkgPT0gbnVsbCAmJiB0aGlzLmRlbGF5ID4gMCkpIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIucHJvdG90eXBlLnJlY3ljbGVBc3luY0lkLmNhbGwodGhpcywgc2NoZWR1bGVyLCBpZCwgZGVsYXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY2hlZHVsZXIuYWN0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lUHJvdmlkZXIuY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpO1xuICAgICAgICAgICAgc2NoZWR1bGVyLl9zY2hlZHVsZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIHJldHVybiBBbmltYXRpb25GcmFtZUFjdGlvbjtcbn0oQXN5bmNBY3Rpb24pKTtcbmV4cG9ydCB7IEFuaW1hdGlvbkZyYW1lQWN0aW9uIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1BbmltYXRpb25GcmFtZUFjdGlvbi5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEFzeW5jU2NoZWR1bGVyIH0gZnJvbSAnLi9Bc3luY1NjaGVkdWxlcic7XG52YXIgQW5pbWF0aW9uRnJhbWVTY2hlZHVsZXIgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhBbmltYXRpb25GcmFtZVNjaGVkdWxlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBBbmltYXRpb25GcmFtZVNjaGVkdWxlcigpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICBBbmltYXRpb25GcmFtZVNjaGVkdWxlci5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGFjdGlvbnMgPSB0aGlzLmFjdGlvbnM7XG4gICAgICAgIHZhciBlcnJvcjtcbiAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgIGFjdGlvbiA9IGFjdGlvbiB8fCBhY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgIHZhciBjb3VudCA9IGFjdGlvbnMubGVuZ3RoO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBpZiAoKGVycm9yID0gYWN0aW9uLmV4ZWN1dGUoYWN0aW9uLnN0YXRlLCBhY3Rpb24uZGVsYXkpKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlICgrK2luZGV4IDwgY291bnQgJiYgKGFjdGlvbiA9IGFjdGlvbnMuc2hpZnQoKSkpO1xuICAgICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICB3aGlsZSAoKytpbmRleCA8IGNvdW50ICYmIChhY3Rpb24gPSBhY3Rpb25zLnNoaWZ0KCkpKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyO1xufShBc3luY1NjaGVkdWxlcikpO1xuZXhwb3J0IHsgQW5pbWF0aW9uRnJhbWVTY2hlZHVsZXIgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyLmpzLm1hcCIsImltcG9ydCB7IF9fZXh0ZW5kcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgQXN5bmNBY3Rpb24gfSBmcm9tICcuL0FzeW5jQWN0aW9uJztcbmltcG9ydCB7IGltbWVkaWF0ZVByb3ZpZGVyIH0gZnJvbSAnLi9pbW1lZGlhdGVQcm92aWRlcic7XG52YXIgQXNhcEFjdGlvbiA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFzYXBBY3Rpb24sIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQXNhcEFjdGlvbihzY2hlZHVsZXIsIHdvcmspIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgc2NoZWR1bGVyLCB3b3JrKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIF90aGlzLndvcmsgPSB3b3JrO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIEFzYXBBY3Rpb24ucHJvdG90eXBlLnJlcXVlc3RBc3luY0lkID0gZnVuY3Rpb24gKHNjaGVkdWxlciwgaWQsIGRlbGF5KSB7XG4gICAgICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7IGRlbGF5ID0gMDsgfVxuICAgICAgICBpZiAoZGVsYXkgIT09IG51bGwgJiYgZGVsYXkgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS5yZXF1ZXN0QXN5bmNJZC5jYWxsKHRoaXMsIHNjaGVkdWxlciwgaWQsIGRlbGF5KTtcbiAgICAgICAgfVxuICAgICAgICBzY2hlZHVsZXIuYWN0aW9ucy5wdXNoKHRoaXMpO1xuICAgICAgICByZXR1cm4gc2NoZWR1bGVyLl9zY2hlZHVsZWQgfHwgKHNjaGVkdWxlci5fc2NoZWR1bGVkID0gaW1tZWRpYXRlUHJvdmlkZXIuc2V0SW1tZWRpYXRlKHNjaGVkdWxlci5mbHVzaC5iaW5kKHNjaGVkdWxlciwgdW5kZWZpbmVkKSkpO1xuICAgIH07XG4gICAgQXNhcEFjdGlvbi5wcm90b3R5cGUucmVjeWNsZUFzeW5jSWQgPSBmdW5jdGlvbiAoc2NoZWR1bGVyLCBpZCwgZGVsYXkpIHtcbiAgICAgICAgaWYgKGRlbGF5ID09PSB2b2lkIDApIHsgZGVsYXkgPSAwOyB9XG4gICAgICAgIGlmICgoZGVsYXkgIT0gbnVsbCAmJiBkZWxheSA+IDApIHx8IChkZWxheSA9PSBudWxsICYmIHRoaXMuZGVsYXkgPiAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIF9zdXBlci5wcm90b3R5cGUucmVjeWNsZUFzeW5jSWQuY2FsbCh0aGlzLCBzY2hlZHVsZXIsIGlkLCBkZWxheSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjaGVkdWxlci5hY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgaW1tZWRpYXRlUHJvdmlkZXIuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgICAgICAgICAgc2NoZWR1bGVyLl9zY2hlZHVsZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIHJldHVybiBBc2FwQWN0aW9uO1xufShBc3luY0FjdGlvbikpO1xuZXhwb3J0IHsgQXNhcEFjdGlvbiB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QXNhcEFjdGlvbi5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEFzeW5jU2NoZWR1bGVyIH0gZnJvbSAnLi9Bc3luY1NjaGVkdWxlcic7XG52YXIgQXNhcFNjaGVkdWxlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFzYXBTY2hlZHVsZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQXNhcFNjaGVkdWxlcigpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICBBc2FwU2NoZWR1bGVyLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVkID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgYWN0aW9ucyA9IHRoaXMuYWN0aW9ucztcbiAgICAgICAgdmFyIGVycm9yO1xuICAgICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgICAgYWN0aW9uID0gYWN0aW9uIHx8IGFjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgdmFyIGNvdW50ID0gYWN0aW9ucy5sZW5ndGg7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmICgoZXJyb3IgPSBhY3Rpb24uZXhlY3V0ZShhY3Rpb24uc3RhdGUsIGFjdGlvbi5kZWxheSkpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKCsraW5kZXggPCBjb3VudCAmJiAoYWN0aW9uID0gYWN0aW9ucy5zaGlmdCgpKSk7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHdoaWxlICgrK2luZGV4IDwgY291bnQgJiYgKGFjdGlvbiA9IGFjdGlvbnMuc2hpZnQoKSkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQXNhcFNjaGVkdWxlcjtcbn0oQXN5bmNTY2hlZHVsZXIpKTtcbmV4cG9ydCB7IEFzYXBTY2hlZHVsZXIgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFzYXBTY2hlZHVsZXIuanMubWFwIiwiaW1wb3J0IHsgX19leHRlbmRzIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuL0FjdGlvbic7XG5pbXBvcnQgeyBpbnRlcnZhbFByb3ZpZGVyIH0gZnJvbSAnLi9pbnRlcnZhbFByb3ZpZGVyJztcbmltcG9ydCB7IGFyclJlbW92ZSB9IGZyb20gJy4uL3V0aWwvYXJyUmVtb3ZlJztcbnZhciBBc3luY0FjdGlvbiA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFzeW5jQWN0aW9uLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEFzeW5jQWN0aW9uKHNjaGVkdWxlciwgd29yaykge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBzY2hlZHVsZXIsIHdvcmspIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnNjaGVkdWxlciA9IHNjaGVkdWxlcjtcbiAgICAgICAgX3RoaXMud29yayA9IHdvcms7XG4gICAgICAgIF90aGlzLnBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBc3luY0FjdGlvbi5wcm90b3R5cGUuc2NoZWR1bGUgPSBmdW5jdGlvbiAoc3RhdGUsIGRlbGF5KSB7XG4gICAgICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7IGRlbGF5ID0gMDsgfVxuICAgICAgICBpZiAodGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgdmFyIGlkID0gdGhpcy5pZDtcbiAgICAgICAgdmFyIHNjaGVkdWxlciA9IHRoaXMuc2NoZWR1bGVyO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHRoaXMucmVjeWNsZUFzeW5jSWQoc2NoZWR1bGVyLCBpZCwgZGVsYXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGVuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgdGhpcy5yZXF1ZXN0QXN5bmNJZChzY2hlZHVsZXIsIHRoaXMuaWQsIGRlbGF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBBc3luY0FjdGlvbi5wcm90b3R5cGUucmVxdWVzdEFzeW5jSWQgPSBmdW5jdGlvbiAoc2NoZWR1bGVyLCBfaWQsIGRlbGF5KSB7XG4gICAgICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7IGRlbGF5ID0gMDsgfVxuICAgICAgICByZXR1cm4gaW50ZXJ2YWxQcm92aWRlci5zZXRJbnRlcnZhbChzY2hlZHVsZXIuZmx1c2guYmluZChzY2hlZHVsZXIsIHRoaXMpLCBkZWxheSk7XG4gICAgfTtcbiAgICBBc3luY0FjdGlvbi5wcm90b3R5cGUucmVjeWNsZUFzeW5jSWQgPSBmdW5jdGlvbiAoX3NjaGVkdWxlciwgaWQsIGRlbGF5KSB7XG4gICAgICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7IGRlbGF5ID0gMDsgfVxuICAgICAgICBpZiAoZGVsYXkgIT0gbnVsbCAmJiB0aGlzLmRlbGF5ID09PSBkZWxheSAmJiB0aGlzLnBlbmRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgaW50ZXJ2YWxQcm92aWRlci5jbGVhckludGVydmFsKGlkKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIEFzeW5jQWN0aW9uLnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24gKHN0YXRlLCBkZWxheSkge1xuICAgICAgICBpZiAodGhpcy5jbG9zZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoJ2V4ZWN1dGluZyBhIGNhbmNlbGxlZCBhY3Rpb24nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVycm9yID0gdGhpcy5fZXhlY3V0ZShzdGF0ZSwgZGVsYXkpO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnBlbmRpbmcgPT09IGZhbHNlICYmIHRoaXMuaWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHRoaXMucmVjeWNsZUFzeW5jSWQodGhpcy5zY2hlZHVsZXIsIHRoaXMuaWQsIG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBBc3luY0FjdGlvbi5wcm90b3R5cGUuX2V4ZWN1dGUgPSBmdW5jdGlvbiAoc3RhdGUsIF9kZWxheSkge1xuICAgICAgICB2YXIgZXJyb3JlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3JWYWx1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMud29yayhzdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgZXJyb3JWYWx1ZSA9ICghIWUgJiYgZSkgfHwgbmV3IEVycm9yKGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlcnJvcmVkKSB7XG4gICAgICAgICAgICB0aGlzLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICByZXR1cm4gZXJyb3JWYWx1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQXN5bmNBY3Rpb24ucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuY2xvc2VkKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSB0aGlzLCBpZCA9IF9hLmlkLCBzY2hlZHVsZXIgPSBfYS5zY2hlZHVsZXI7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IHNjaGVkdWxlci5hY3Rpb25zO1xuICAgICAgICAgICAgdGhpcy53b3JrID0gdGhpcy5zdGF0ZSA9IHRoaXMuc2NoZWR1bGVyID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgYXJyUmVtb3ZlKGFjdGlvbnMsIHRoaXMpO1xuICAgICAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlkID0gdGhpcy5yZWN5Y2xlQXN5bmNJZChzY2hlZHVsZXIsIGlkLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGVsYXkgPSBudWxsO1xuICAgICAgICAgICAgX3N1cGVyLnByb3RvdHlwZS51bnN1YnNjcmliZS5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQXN5bmNBY3Rpb247XG59KEFjdGlvbikpO1xuZXhwb3J0IHsgQXN5bmNBY3Rpb24gfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFzeW5jQWN0aW9uLmpzLm1hcCIsImltcG9ydCB7IF9fZXh0ZW5kcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgU2NoZWR1bGVyIH0gZnJvbSAnLi4vU2NoZWR1bGVyJztcbnZhciBBc3luY1NjaGVkdWxlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEFzeW5jU2NoZWR1bGVyLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEFzeW5jU2NoZWR1bGVyKFNjaGVkdWxlckFjdGlvbiwgbm93KSB7XG4gICAgICAgIGlmIChub3cgPT09IHZvaWQgMCkgeyBub3cgPSBTY2hlZHVsZXIubm93OyB9XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIFNjaGVkdWxlckFjdGlvbiwgbm93KSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5hY3Rpb25zID0gW107XG4gICAgICAgIF90aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuX3NjaGVkdWxlZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBc3luY1NjaGVkdWxlci5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0gdGhpcy5hY3Rpb25zO1xuICAgICAgICBpZiAodGhpcy5fYWN0aXZlKSB7XG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goYWN0aW9uKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZXJyb3I7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGlmICgoZXJyb3IgPSBhY3Rpb24uZXhlY3V0ZShhY3Rpb24uc3RhdGUsIGFjdGlvbi5kZWxheSkpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKChhY3Rpb24gPSBhY3Rpb25zLnNoaWZ0KCkpKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgd2hpbGUgKChhY3Rpb24gPSBhY3Rpb25zLnNoaWZ0KCkpKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIEFzeW5jU2NoZWR1bGVyO1xufShTY2hlZHVsZXIpKTtcbmV4cG9ydCB7IEFzeW5jU2NoZWR1bGVyIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Bc3luY1NjaGVkdWxlci5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEFzeW5jQWN0aW9uIH0gZnJvbSAnLi9Bc3luY0FjdGlvbic7XG52YXIgUXVldWVBY3Rpb24gPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhRdWV1ZUFjdGlvbiwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBRdWV1ZUFjdGlvbihzY2hlZHVsZXIsIHdvcmspIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgc2NoZWR1bGVyLCB3b3JrKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIF90aGlzLndvcmsgPSB3b3JrO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFF1ZXVlQWN0aW9uLnByb3RvdHlwZS5zY2hlZHVsZSA9IGZ1bmN0aW9uIChzdGF0ZSwgZGVsYXkpIHtcbiAgICAgICAgaWYgKGRlbGF5ID09PSB2b2lkIDApIHsgZGVsYXkgPSAwOyB9XG4gICAgICAgIGlmIChkZWxheSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBfc3VwZXIucHJvdG90eXBlLnNjaGVkdWxlLmNhbGwodGhpcywgc3RhdGUsIGRlbGF5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZXIuZmx1c2godGhpcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgUXVldWVBY3Rpb24ucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbiAoc3RhdGUsIGRlbGF5KSB7XG4gICAgICAgIHJldHVybiAoZGVsYXkgPiAwIHx8IHRoaXMuY2xvc2VkKSA/XG4gICAgICAgICAgICBfc3VwZXIucHJvdG90eXBlLmV4ZWN1dGUuY2FsbCh0aGlzLCBzdGF0ZSwgZGVsYXkpIDpcbiAgICAgICAgICAgIHRoaXMuX2V4ZWN1dGUoc3RhdGUsIGRlbGF5KTtcbiAgICB9O1xuICAgIFF1ZXVlQWN0aW9uLnByb3RvdHlwZS5yZXF1ZXN0QXN5bmNJZCA9IGZ1bmN0aW9uIChzY2hlZHVsZXIsIGlkLCBkZWxheSkge1xuICAgICAgICBpZiAoZGVsYXkgPT09IHZvaWQgMCkgeyBkZWxheSA9IDA7IH1cbiAgICAgICAgaWYgKChkZWxheSAhPSBudWxsICYmIGRlbGF5ID4gMCkgfHwgKGRlbGF5ID09IG51bGwgJiYgdGhpcy5kZWxheSA+IDApKSB7XG4gICAgICAgICAgICByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS5yZXF1ZXN0QXN5bmNJZC5jYWxsKHRoaXMsIHNjaGVkdWxlciwgaWQsIGRlbGF5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NoZWR1bGVyLmZsdXNoKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIFF1ZXVlQWN0aW9uO1xufShBc3luY0FjdGlvbikpO1xuZXhwb3J0IHsgUXVldWVBY3Rpb24gfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVF1ZXVlQWN0aW9uLmpzLm1hcCIsImltcG9ydCB7IF9fZXh0ZW5kcyB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgQXN5bmNTY2hlZHVsZXIgfSBmcm9tICcuL0FzeW5jU2NoZWR1bGVyJztcbnZhciBRdWV1ZVNjaGVkdWxlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFF1ZXVlU2NoZWR1bGVyLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFF1ZXVlU2NoZWR1bGVyKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyICE9PSBudWxsICYmIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBRdWV1ZVNjaGVkdWxlcjtcbn0oQXN5bmNTY2hlZHVsZXIpKTtcbmV4cG9ydCB7IFF1ZXVlU2NoZWR1bGVyIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1RdWV1ZVNjaGVkdWxlci5qcy5tYXAiLCJpbXBvcnQgeyBfX2V4dGVuZHMgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEFzeW5jQWN0aW9uIH0gZnJvbSAnLi9Bc3luY0FjdGlvbic7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICcuLi9TdWJzY3JpcHRpb24nO1xuaW1wb3J0IHsgQXN5bmNTY2hlZHVsZXIgfSBmcm9tICcuL0FzeW5jU2NoZWR1bGVyJztcbnZhciBWaXJ0dWFsVGltZVNjaGVkdWxlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFZpcnR1YWxUaW1lU2NoZWR1bGVyLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFZpcnR1YWxUaW1lU2NoZWR1bGVyKHNjaGVkdWxlckFjdGlvbkN0b3IsIG1heEZyYW1lcykge1xuICAgICAgICBpZiAoc2NoZWR1bGVyQWN0aW9uQ3RvciA9PT0gdm9pZCAwKSB7IHNjaGVkdWxlckFjdGlvbkN0b3IgPSBWaXJ0dWFsQWN0aW9uOyB9XG4gICAgICAgIGlmIChtYXhGcmFtZXMgPT09IHZvaWQgMCkgeyBtYXhGcmFtZXMgPSBJbmZpbml0eTsgfVxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBzY2hlZHVsZXJBY3Rpb25DdG9yLCBmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy5mcmFtZTsgfSkgfHwgdGhpcztcbiAgICAgICAgX3RoaXMubWF4RnJhbWVzID0gbWF4RnJhbWVzO1xuICAgICAgICBfdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIF90aGlzLmluZGV4ID0gLTE7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgVmlydHVhbFRpbWVTY2hlZHVsZXIucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2EgPSB0aGlzLCBhY3Rpb25zID0gX2EuYWN0aW9ucywgbWF4RnJhbWVzID0gX2EubWF4RnJhbWVzO1xuICAgICAgICB2YXIgZXJyb3I7XG4gICAgICAgIHZhciBhY3Rpb247XG4gICAgICAgIHdoaWxlICgoYWN0aW9uID0gYWN0aW9uc1swXSkgJiYgYWN0aW9uLmRlbGF5IDw9IG1heEZyYW1lcykge1xuICAgICAgICAgICAgYWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IGFjdGlvbi5kZWxheTtcbiAgICAgICAgICAgIGlmICgoZXJyb3IgPSBhY3Rpb24uZXhlY3V0ZShhY3Rpb24uc3RhdGUsIGFjdGlvbi5kZWxheSkpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICB3aGlsZSAoKGFjdGlvbiA9IGFjdGlvbnMuc2hpZnQoKSkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBWaXJ0dWFsVGltZVNjaGVkdWxlci5mcmFtZVRpbWVGYWN0b3IgPSAxMDtcbiAgICByZXR1cm4gVmlydHVhbFRpbWVTY2hlZHVsZXI7XG59KEFzeW5jU2NoZWR1bGVyKSk7XG5leHBvcnQgeyBWaXJ0dWFsVGltZVNjaGVkdWxlciB9O1xudmFyIFZpcnR1YWxBY3Rpb24gPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhWaXJ0dWFsQWN0aW9uLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFZpcnR1YWxBY3Rpb24oc2NoZWR1bGVyLCB3b3JrLCBpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPT09IHZvaWQgMCkgeyBpbmRleCA9IChzY2hlZHVsZXIuaW5kZXggKz0gMSk7IH1cbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgc2NoZWR1bGVyLCB3b3JrKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgICAgIF90aGlzLndvcmsgPSB3b3JrO1xuICAgICAgICBfdGhpcy5pbmRleCA9IGluZGV4O1xuICAgICAgICBfdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBfdGhpcy5pbmRleCA9IHNjaGVkdWxlci5pbmRleCA9IGluZGV4O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFZpcnR1YWxBY3Rpb24ucHJvdG90eXBlLnNjaGVkdWxlID0gZnVuY3Rpb24gKHN0YXRlLCBkZWxheSkge1xuICAgICAgICBpZiAoZGVsYXkgPT09IHZvaWQgMCkgeyBkZWxheSA9IDA7IH1cbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShkZWxheSkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfc3VwZXIucHJvdG90eXBlLnNjaGVkdWxlLmNhbGwodGhpcywgc3RhdGUsIGRlbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gbmV3IFZpcnR1YWxBY3Rpb24odGhpcy5zY2hlZHVsZXIsIHRoaXMud29yayk7XG4gICAgICAgICAgICB0aGlzLmFkZChhY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbi5zY2hlZHVsZShzdGF0ZSwgZGVsYXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgVmlydHVhbEFjdGlvbi5wcm90b3R5cGUucmVxdWVzdEFzeW5jSWQgPSBmdW5jdGlvbiAoc2NoZWR1bGVyLCBpZCwgZGVsYXkpIHtcbiAgICAgICAgaWYgKGRlbGF5ID09PSB2b2lkIDApIHsgZGVsYXkgPSAwOyB9XG4gICAgICAgIHRoaXMuZGVsYXkgPSBzY2hlZHVsZXIuZnJhbWUgKyBkZWxheTtcbiAgICAgICAgdmFyIGFjdGlvbnMgPSBzY2hlZHVsZXIuYWN0aW9ucztcbiAgICAgICAgYWN0aW9ucy5wdXNoKHRoaXMpO1xuICAgICAgICBhY3Rpb25zLnNvcnQoVmlydHVhbEFjdGlvbi5zb3J0QWN0aW9ucyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgVmlydHVhbEFjdGlvbi5wcm90b3R5cGUucmVjeWNsZUFzeW5jSWQgPSBmdW5jdGlvbiAoc2NoZWR1bGVyLCBpZCwgZGVsYXkpIHtcbiAgICAgICAgaWYgKGRlbGF5ID09PSB2b2lkIDApIHsgZGVsYXkgPSAwOyB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICBWaXJ0dWFsQWN0aW9uLnByb3RvdHlwZS5fZXhlY3V0ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgZGVsYXkpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS5fZXhlY3V0ZS5jYWxsKHRoaXMsIHN0YXRlLCBkZWxheSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFZpcnR1YWxBY3Rpb24uc29ydEFjdGlvbnMgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBpZiAoYS5kZWxheSA9PT0gYi5kZWxheSkge1xuICAgICAgICAgICAgaWYgKGEuaW5kZXggPT09IGIuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGEuaW5kZXggPiBiLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYS5kZWxheSA+IGIuZGVsYXkpIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gVmlydHVhbEFjdGlvbjtcbn0oQXN5bmNBY3Rpb24pKTtcbmV4cG9ydCB7IFZpcnR1YWxBY3Rpb24gfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVZpcnR1YWxUaW1lU2NoZWR1bGVyLmpzLm1hcCIsImltcG9ydCB7IEFuaW1hdGlvbkZyYW1lQWN0aW9uIH0gZnJvbSAnLi9BbmltYXRpb25GcmFtZUFjdGlvbic7XG5pbXBvcnQgeyBBbmltYXRpb25GcmFtZVNjaGVkdWxlciB9IGZyb20gJy4vQW5pbWF0aW9uRnJhbWVTY2hlZHVsZXInO1xuZXhwb3J0IHZhciBhbmltYXRpb25GcmFtZVNjaGVkdWxlciA9IG5ldyBBbmltYXRpb25GcmFtZVNjaGVkdWxlcihBbmltYXRpb25GcmFtZUFjdGlvbik7XG5leHBvcnQgdmFyIGFuaW1hdGlvbkZyYW1lID0gYW5pbWF0aW9uRnJhbWVTY2hlZHVsZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hbmltYXRpb25GcmFtZS5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXkgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJy4uL1N1YnNjcmlwdGlvbic7XG5leHBvcnQgdmFyIGFuaW1hdGlvbkZyYW1lUHJvdmlkZXIgPSB7XG4gICAgc2NoZWR1bGU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVxdWVzdCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgdmFyIGNhbmNlbCA9IGNhbmNlbEFuaW1hdGlvbkZyYW1lO1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBhbmltYXRpb25GcmFtZVByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICAgIHJlcXVlc3QgPSBkZWxlZ2F0ZS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgICAgICAgICBjYW5jZWwgPSBkZWxlZ2F0ZS5jYW5jZWxBbmltYXRpb25GcmFtZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaGFuZGxlID0gcmVxdWVzdChmdW5jdGlvbiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICBjYW5jZWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjYWxsYmFjayh0aW1lc3RhbXApO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWJzY3JpcHRpb24oZnVuY3Rpb24gKCkgeyByZXR1cm4gY2FuY2VsID09PSBudWxsIHx8IGNhbmNlbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2FuY2VsKGhhbmRsZSk7IH0pO1xuICAgIH0sXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlbGVnYXRlID0gYW5pbWF0aW9uRnJhbWVQcm92aWRlci5kZWxlZ2F0ZTtcbiAgICAgICAgcmV0dXJuICgoZGVsZWdhdGUgPT09IG51bGwgfHwgZGVsZWdhdGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRlbGVnYXRlLnJlcXVlc3RBbmltYXRpb25GcmFtZSkgfHwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKS5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhcmdzKSkpO1xuICAgIH0sXG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGVsZWdhdGUgPSBhbmltYXRpb25GcmFtZVByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICByZXR1cm4gKChkZWxlZ2F0ZSA9PT0gbnVsbCB8fCBkZWxlZ2F0ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGVsZWdhdGUuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHx8IGNhbmNlbEFuaW1hdGlvbkZyYW1lKS5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhcmdzKSkpO1xuICAgIH0sXG4gICAgZGVsZWdhdGU6IHVuZGVmaW5lZCxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hbmltYXRpb25GcmFtZVByb3ZpZGVyLmpzLm1hcCIsImltcG9ydCB7IEFzYXBBY3Rpb24gfSBmcm9tICcuL0FzYXBBY3Rpb24nO1xuaW1wb3J0IHsgQXNhcFNjaGVkdWxlciB9IGZyb20gJy4vQXNhcFNjaGVkdWxlcic7XG5leHBvcnQgdmFyIGFzYXBTY2hlZHVsZXIgPSBuZXcgQXNhcFNjaGVkdWxlcihBc2FwQWN0aW9uKTtcbmV4cG9ydCB2YXIgYXNhcCA9IGFzYXBTY2hlZHVsZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hc2FwLmpzLm1hcCIsImltcG9ydCB7IEFzeW5jQWN0aW9uIH0gZnJvbSAnLi9Bc3luY0FjdGlvbic7XG5pbXBvcnQgeyBBc3luY1NjaGVkdWxlciB9IGZyb20gJy4vQXN5bmNTY2hlZHVsZXInO1xuZXhwb3J0IHZhciBhc3luY1NjaGVkdWxlciA9IG5ldyBBc3luY1NjaGVkdWxlcihBc3luY0FjdGlvbik7XG5leHBvcnQgdmFyIGFzeW5jID0gYXN5bmNTY2hlZHVsZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hc3luYy5qcy5tYXAiLCJleHBvcnQgdmFyIGRhdGVUaW1lc3RhbXBQcm92aWRlciA9IHtcbiAgICBub3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChkYXRlVGltZXN0YW1wUHJvdmlkZXIuZGVsZWdhdGUgfHwgRGF0ZSkubm93KCk7XG4gICAgfSxcbiAgICBkZWxlZ2F0ZTogdW5kZWZpbmVkLFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGVUaW1lc3RhbXBQcm92aWRlci5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXkgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEltbWVkaWF0ZSB9IGZyb20gJy4uL3V0aWwvSW1tZWRpYXRlJztcbnZhciBzZXRJbW1lZGlhdGUgPSBJbW1lZGlhdGUuc2V0SW1tZWRpYXRlLCBjbGVhckltbWVkaWF0ZSA9IEltbWVkaWF0ZS5jbGVhckltbWVkaWF0ZTtcbmV4cG9ydCB2YXIgaW1tZWRpYXRlUHJvdmlkZXIgPSB7XG4gICAgc2V0SW1tZWRpYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlbGVnYXRlID0gaW1tZWRpYXRlUHJvdmlkZXIuZGVsZWdhdGU7XG4gICAgICAgIHJldHVybiAoKGRlbGVnYXRlID09PSBudWxsIHx8IGRlbGVnYXRlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkZWxlZ2F0ZS5zZXRJbW1lZGlhdGUpIHx8IHNldEltbWVkaWF0ZSkuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYXJncykpKTtcbiAgICB9LFxuICAgIGNsZWFySW1tZWRpYXRlOiBmdW5jdGlvbiAoaGFuZGxlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGltbWVkaWF0ZVByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICByZXR1cm4gKChkZWxlZ2F0ZSA9PT0gbnVsbCB8fCBkZWxlZ2F0ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGVsZWdhdGUuY2xlYXJJbW1lZGlhdGUpIHx8IGNsZWFySW1tZWRpYXRlKShoYW5kbGUpO1xuICAgIH0sXG4gICAgZGVsZWdhdGU6IHVuZGVmaW5lZCxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbW1lZGlhdGVQcm92aWRlci5qcy5tYXAiLCJpbXBvcnQgeyBfX3JlYWQsIF9fc3ByZWFkQXJyYXkgfSBmcm9tIFwidHNsaWJcIjtcbmV4cG9ydCB2YXIgaW50ZXJ2YWxQcm92aWRlciA9IHtcbiAgICBzZXRJbnRlcnZhbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGludGVydmFsUHJvdmlkZXIuZGVsZWdhdGU7XG4gICAgICAgIHJldHVybiAoKGRlbGVnYXRlID09PSBudWxsIHx8IGRlbGVnYXRlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkZWxlZ2F0ZS5zZXRJbnRlcnZhbCkgfHwgc2V0SW50ZXJ2YWwpLmFwcGx5KHZvaWQgMCwgX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGFyZ3MpKSk7XG4gICAgfSxcbiAgICBjbGVhckludGVydmFsOiBmdW5jdGlvbiAoaGFuZGxlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGludGVydmFsUHJvdmlkZXIuZGVsZWdhdGU7XG4gICAgICAgIHJldHVybiAoKGRlbGVnYXRlID09PSBudWxsIHx8IGRlbGVnYXRlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkZWxlZ2F0ZS5jbGVhckludGVydmFsKSB8fCBjbGVhckludGVydmFsKShoYW5kbGUpO1xuICAgIH0sXG4gICAgZGVsZWdhdGU6IHVuZGVmaW5lZCxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnRlcnZhbFByb3ZpZGVyLmpzLm1hcCIsImV4cG9ydCB2YXIgcGVyZm9ybWFuY2VUaW1lc3RhbXBQcm92aWRlciA9IHtcbiAgICBub3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChwZXJmb3JtYW5jZVRpbWVzdGFtcFByb3ZpZGVyLmRlbGVnYXRlIHx8IHBlcmZvcm1hbmNlKS5ub3coKTtcbiAgICB9LFxuICAgIGRlbGVnYXRlOiB1bmRlZmluZWQsXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGVyZm9ybWFuY2VUaW1lc3RhbXBQcm92aWRlci5qcy5tYXAiLCJpbXBvcnQgeyBRdWV1ZUFjdGlvbiB9IGZyb20gJy4vUXVldWVBY3Rpb24nO1xuaW1wb3J0IHsgUXVldWVTY2hlZHVsZXIgfSBmcm9tICcuL1F1ZXVlU2NoZWR1bGVyJztcbmV4cG9ydCB2YXIgcXVldWVTY2hlZHVsZXIgPSBuZXcgUXVldWVTY2hlZHVsZXIoUXVldWVBY3Rpb24pO1xuZXhwb3J0IHZhciBxdWV1ZSA9IHF1ZXVlU2NoZWR1bGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cXVldWUuanMubWFwIiwiaW1wb3J0IHsgX19yZWFkLCBfX3NwcmVhZEFycmF5IH0gZnJvbSBcInRzbGliXCI7XG5leHBvcnQgdmFyIHRpbWVvdXRQcm92aWRlciA9IHtcbiAgICBzZXRUaW1lb3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlbGVnYXRlID0gdGltZW91dFByb3ZpZGVyLmRlbGVnYXRlO1xuICAgICAgICByZXR1cm4gKChkZWxlZ2F0ZSA9PT0gbnVsbCB8fCBkZWxlZ2F0ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGVsZWdhdGUuc2V0VGltZW91dCkgfHwgc2V0VGltZW91dCkuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYXJncykpKTtcbiAgICB9LFxuICAgIGNsZWFyVGltZW91dDogZnVuY3Rpb24gKGhhbmRsZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSB0aW1lb3V0UHJvdmlkZXIuZGVsZWdhdGU7XG4gICAgICAgIHJldHVybiAoKGRlbGVnYXRlID09PSBudWxsIHx8IGRlbGVnYXRlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkZWxlZ2F0ZS5jbGVhclRpbWVvdXQpIHx8IGNsZWFyVGltZW91dCkoaGFuZGxlKTtcbiAgICB9LFxuICAgIGRlbGVnYXRlOiB1bmRlZmluZWQsXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGltZW91dFByb3ZpZGVyLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBnZXRTeW1ib2xJdGVyYXRvcigpIHtcbiAgICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJyB8fCAhU3ltYm9sLml0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiAnQEBpdGVyYXRvcic7XG4gICAgfVxuICAgIHJldHVybiBTeW1ib2wuaXRlcmF0b3I7XG59XG5leHBvcnQgdmFyIGl0ZXJhdG9yID0gZ2V0U3ltYm9sSXRlcmF0b3IoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWl0ZXJhdG9yLmpzLm1hcCIsImV4cG9ydCB2YXIgb2JzZXJ2YWJsZSA9IChmdW5jdGlvbiAoKSB7IHJldHVybiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wub2JzZXJ2YWJsZSkgfHwgJ0BAb2JzZXJ2YWJsZSc7IH0pKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1vYnNlcnZhYmxlLmpzLm1hcCIsImltcG9ydCB7IGNyZWF0ZUVycm9yQ2xhc3MgfSBmcm9tICcuL2NyZWF0ZUVycm9yQ2xhc3MnO1xuZXhwb3J0IHZhciBBcmd1bWVudE91dE9mUmFuZ2VFcnJvciA9IGNyZWF0ZUVycm9yQ2xhc3MoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiBBcmd1bWVudE91dE9mUmFuZ2VFcnJvckltcGwoKSB7XG4gICAgICAgIF9zdXBlcih0aGlzKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ0FyZ3VtZW50T3V0T2ZSYW5nZUVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gJ2FyZ3VtZW50IG91dCBvZiByYW5nZSc7XG4gICAgfTtcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QXJndW1lbnRPdXRPZlJhbmdlRXJyb3IuanMubWFwIiwiaW1wb3J0IHsgY3JlYXRlRXJyb3JDbGFzcyB9IGZyb20gJy4vY3JlYXRlRXJyb3JDbGFzcyc7XG5leHBvcnQgdmFyIEVtcHR5RXJyb3IgPSBjcmVhdGVFcnJvckNsYXNzKGZ1bmN0aW9uIChfc3VwZXIpIHsgcmV0dXJuIGZ1bmN0aW9uIEVtcHR5RXJyb3JJbXBsKCkge1xuICAgIF9zdXBlcih0aGlzKTtcbiAgICB0aGlzLm5hbWUgPSAnRW1wdHlFcnJvcic7XG4gICAgdGhpcy5tZXNzYWdlID0gJ25vIGVsZW1lbnRzIGluIHNlcXVlbmNlJztcbn07IH0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RW1wdHlFcnJvci5qcy5tYXAiLCJ2YXIgbmV4dEhhbmRsZSA9IDE7XG52YXIgcmVzb2x2ZWQ7XG52YXIgYWN0aXZlSGFuZGxlcyA9IHt9O1xuZnVuY3Rpb24gZmluZEFuZENsZWFySGFuZGxlKGhhbmRsZSkge1xuICAgIGlmIChoYW5kbGUgaW4gYWN0aXZlSGFuZGxlcykge1xuICAgICAgICBkZWxldGUgYWN0aXZlSGFuZGxlc1toYW5kbGVdO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZXhwb3J0IHZhciBJbW1lZGlhdGUgPSB7XG4gICAgc2V0SW1tZWRpYXRlOiBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgdmFyIGhhbmRsZSA9IG5leHRIYW5kbGUrKztcbiAgICAgICAgYWN0aXZlSGFuZGxlc1toYW5kbGVdID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgICAgICAgcmVzb2x2ZWQgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlZC50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZpbmRBbmRDbGVhckhhbmRsZShoYW5kbGUpICYmIGNiKCk7IH0pO1xuICAgICAgICByZXR1cm4gaGFuZGxlO1xuICAgIH0sXG4gICAgY2xlYXJJbW1lZGlhdGU6IGZ1bmN0aW9uIChoYW5kbGUpIHtcbiAgICAgICAgZmluZEFuZENsZWFySGFuZGxlKGhhbmRsZSk7XG4gICAgfSxcbn07XG5leHBvcnQgdmFyIFRlc3RUb29scyA9IHtcbiAgICBwZW5kaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhhY3RpdmVIYW5kbGVzKS5sZW5ndGg7XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUltbWVkaWF0ZS5qcy5tYXAiLCJpbXBvcnQgeyBjcmVhdGVFcnJvckNsYXNzIH0gZnJvbSAnLi9jcmVhdGVFcnJvckNsYXNzJztcbmV4cG9ydCB2YXIgTm90Rm91bmRFcnJvciA9IGNyZWF0ZUVycm9yQ2xhc3MoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbiBOb3RGb3VuZEVycm9ySW1wbChtZXNzYWdlKSB7XG4gICAgICAgIF9zdXBlcih0aGlzKTtcbiAgICAgICAgdGhpcy5uYW1lID0gJ05vdEZvdW5kRXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH07XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU5vdEZvdW5kRXJyb3IuanMubWFwIiwiaW1wb3J0IHsgY3JlYXRlRXJyb3JDbGFzcyB9IGZyb20gJy4vY3JlYXRlRXJyb3JDbGFzcyc7XG5leHBvcnQgdmFyIE9iamVjdFVuc3Vic2NyaWJlZEVycm9yID0gY3JlYXRlRXJyb3JDbGFzcyhmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIE9iamVjdFVuc3Vic2NyaWJlZEVycm9ySW1wbCgpIHtcbiAgICAgICAgX3N1cGVyKHRoaXMpO1xuICAgICAgICB0aGlzLm5hbWUgPSAnT2JqZWN0VW5zdWJzY3JpYmVkRXJyb3InO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSAnb2JqZWN0IHVuc3Vic2NyaWJlZCc7XG4gICAgfTtcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9T2JqZWN0VW5zdWJzY3JpYmVkRXJyb3IuanMubWFwIiwiaW1wb3J0IHsgY3JlYXRlRXJyb3JDbGFzcyB9IGZyb20gJy4vY3JlYXRlRXJyb3JDbGFzcyc7XG5leHBvcnQgdmFyIFNlcXVlbmNlRXJyb3IgPSBjcmVhdGVFcnJvckNsYXNzKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gU2VxdWVuY2VFcnJvckltcGwobWVzc2FnZSkge1xuICAgICAgICBfc3VwZXIodGhpcyk7XG4gICAgICAgIHRoaXMubmFtZSA9ICdTZXF1ZW5jZUVycm9yJztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9O1xufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TZXF1ZW5jZUVycm9yLmpzLm1hcCIsImltcG9ydCB7IGNyZWF0ZUVycm9yQ2xhc3MgfSBmcm9tICcuL2NyZWF0ZUVycm9yQ2xhc3MnO1xuZXhwb3J0IHZhciBVbnN1YnNjcmlwdGlvbkVycm9yID0gY3JlYXRlRXJyb3JDbGFzcyhmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIFVuc3Vic2NyaXB0aW9uRXJyb3JJbXBsKGVycm9ycykge1xuICAgICAgICBfc3VwZXIodGhpcyk7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IGVycm9yc1xuICAgICAgICAgICAgPyBlcnJvcnMubGVuZ3RoICsgXCIgZXJyb3JzIG9jY3VycmVkIGR1cmluZyB1bnN1YnNjcmlwdGlvbjpcXG5cIiArIGVycm9ycy5tYXAoZnVuY3Rpb24gKGVyciwgaSkgeyByZXR1cm4gaSArIDEgKyBcIikgXCIgKyBlcnIudG9TdHJpbmcoKTsgfSkuam9pbignXFxuICAnKVxuICAgICAgICAgICAgOiAnJztcbiAgICAgICAgdGhpcy5uYW1lID0gJ1Vuc3Vic2NyaXB0aW9uRXJyb3InO1xuICAgICAgICB0aGlzLmVycm9ycyA9IGVycm9ycztcbiAgICB9O1xufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1VbnN1YnNjcmlwdGlvbkVycm9yLmpzLm1hcCIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL2lzRnVuY3Rpb24nO1xuaW1wb3J0IHsgaXNTY2hlZHVsZXIgfSBmcm9tICcuL2lzU2NoZWR1bGVyJztcbmZ1bmN0aW9uIGxhc3QoYXJyKSB7XG4gICAgcmV0dXJuIGFyclthcnIubGVuZ3RoIC0gMV07XG59XG5leHBvcnQgZnVuY3Rpb24gcG9wUmVzdWx0U2VsZWN0b3IoYXJncykge1xuICAgIHJldHVybiBpc0Z1bmN0aW9uKGxhc3QoYXJncykpID8gYXJncy5wb3AoKSA6IHVuZGVmaW5lZDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwb3BTY2hlZHVsZXIoYXJncykge1xuICAgIHJldHVybiBpc1NjaGVkdWxlcihsYXN0KGFyZ3MpKSA/IGFyZ3MucG9wKCkgOiB1bmRlZmluZWQ7XG59XG5leHBvcnQgZnVuY3Rpb24gcG9wTnVtYmVyKGFyZ3MsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgbGFzdChhcmdzKSA9PT0gJ251bWJlcicgPyBhcmdzLnBvcCgpIDogZGVmYXVsdFZhbHVlO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXJncy5qcy5tYXAiLCJ2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YsIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgZ2V0S2V5cyA9IE9iamVjdC5rZXlzO1xuZXhwb3J0IGZ1bmN0aW9uIGFyZ3NBcmdBcnJheU9yT2JqZWN0KGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgdmFyIGZpcnN0XzEgPSBhcmdzWzBdO1xuICAgICAgICBpZiAoaXNBcnJheShmaXJzdF8xKSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgYXJnczogZmlyc3RfMSwga2V5czogbnVsbCB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1BPSk8oZmlyc3RfMSkpIHtcbiAgICAgICAgICAgIHZhciBrZXlzID0gZ2V0S2V5cyhmaXJzdF8xKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYXJnczoga2V5cy5tYXAoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gZmlyc3RfMVtrZXldOyB9KSxcbiAgICAgICAgICAgICAgICBrZXlzOiBrZXlzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBhcmdzOiBhcmdzLCBrZXlzOiBudWxsIH07XG59XG5mdW5jdGlvbiBpc1BPSk8ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBnZXRQcm90b3R5cGVPZihvYmopID09PSBvYmplY3RQcm90bztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFyZ3NBcmdBcnJheU9yT2JqZWN0LmpzLm1hcCIsInZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmV4cG9ydCBmdW5jdGlvbiBhcmdzT3JBcmdBcnJheShhcmdzKSB7XG4gICAgcmV0dXJuIGFyZ3MubGVuZ3RoID09PSAxICYmIGlzQXJyYXkoYXJnc1swXSkgPyBhcmdzWzBdIDogYXJncztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFyZ3NPckFyZ0FycmF5LmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBhcnJSZW1vdmUoYXJyLCBpdGVtKSB7XG4gICAgaWYgKGFycikge1xuICAgICAgICB2YXIgaW5kZXggPSBhcnIuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgMCA8PSBpbmRleCAmJiBhcnIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcnJSZW1vdmUuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGNhdWdodFNjaGVkdWxlKHN1YnNjcmliZXIsIHNjaGVkdWxlciwgZXhlY3V0ZSwgZGVsYXkpIHtcbiAgICBpZiAoZGVsYXkgPT09IHZvaWQgMCkgeyBkZWxheSA9IDA7IH1cbiAgICB2YXIgc3Vic2NyaXB0aW9uID0gc2NoZWR1bGVyLnNjaGVkdWxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGV4ZWN1dGUuY2FsbCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9LCBkZWxheSk7XG4gICAgc3Vic2NyaWJlci5hZGQoc3Vic2NyaXB0aW9uKTtcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2F1Z2h0U2NoZWR1bGUuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVycm9yQ2xhc3MoY3JlYXRlSW1wbCkge1xuICAgIHZhciBfc3VwZXIgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgICAgRXJyb3IuY2FsbChpbnN0YW5jZSk7XG4gICAgICAgIGluc3RhbmNlLnN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgfTtcbiAgICB2YXIgY3RvckZ1bmMgPSBjcmVhdGVJbXBsKF9zdXBlcik7XG4gICAgY3RvckZ1bmMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuICAgIGN0b3JGdW5jLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JGdW5jO1xuICAgIHJldHVybiBjdG9yRnVuYztcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNyZWF0ZUVycm9yQ2xhc3MuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU9iamVjdChrZXlzLCB2YWx1ZXMpIHtcbiAgICByZXR1cm4ga2V5cy5yZWR1Y2UoZnVuY3Rpb24gKHJlc3VsdCwga2V5LCBpKSB7IHJldHVybiAoKHJlc3VsdFtrZXldID0gdmFsdWVzW2ldKSwgcmVzdWx0KTsgfSwge30pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y3JlYXRlT2JqZWN0LmpzLm1hcCIsImltcG9ydCB7IGNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG52YXIgY29udGV4dCA9IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb250ZXh0KGNiKSB7XG4gICAgaWYgKGNvbmZpZy51c2VEZXByZWNhdGVkU3luY2hyb25vdXNFcnJvckhhbmRsaW5nKSB7XG4gICAgICAgIHZhciBpc1Jvb3QgPSAhY29udGV4dDtcbiAgICAgICAgaWYgKGlzUm9vdCkge1xuICAgICAgICAgICAgY29udGV4dCA9IHsgZXJyb3JUaHJvd246IGZhbHNlLCBlcnJvcjogbnVsbCB9O1xuICAgICAgICB9XG4gICAgICAgIGNiKCk7XG4gICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IGNvbnRleHQsIGVycm9yVGhyb3duID0gX2EuZXJyb3JUaHJvd24sIGVycm9yID0gX2EuZXJyb3I7XG4gICAgICAgICAgICBjb250ZXh0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChlcnJvclRocm93bikge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjYigpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlRXJyb3IoZXJyKSB7XG4gICAgaWYgKGNvbmZpZy51c2VEZXByZWNhdGVkU3luY2hyb25vdXNFcnJvckhhbmRsaW5nICYmIGNvbnRleHQpIHtcbiAgICAgICAgY29udGV4dC5lcnJvclRocm93biA9IHRydWU7XG4gICAgICAgIGNvbnRleHQuZXJyb3IgPSBlcnI7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXJyb3JDb250ZXh0LmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gICAgcmV0dXJuIHg7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pZGVudGl0eS5qcy5tYXAiLCJleHBvcnQgdmFyIGlzQXJyYXlMaWtlID0gKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ICYmIHR5cGVvZiB4Lmxlbmd0aCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHggIT09ICdmdW5jdGlvbic7IH0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXNBcnJheUxpa2UuanMubWFwIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4vaXNGdW5jdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlKG9iaikge1xuICAgIHJldHVybiBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJiBpc0Z1bmN0aW9uKG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9ialtTeW1ib2wuYXN5bmNJdGVyYXRvcl0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXNBc3luY0l0ZXJhYmxlLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkRGF0ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgJiYgIWlzTmFOKHZhbHVlKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzRGF0ZS5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pc0Z1bmN0aW9uLmpzLm1hcCIsImltcG9ydCB7IG9ic2VydmFibGUgYXMgU3ltYm9sX29ic2VydmFibGUgfSBmcm9tICcuLi9zeW1ib2wvb2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAnLi9pc0Z1bmN0aW9uJztcbmV4cG9ydCBmdW5jdGlvbiBpc0ludGVyb3BPYnNlcnZhYmxlKGlucHV0KSB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24oaW5wdXRbU3ltYm9sX29ic2VydmFibGVdKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzSW50ZXJvcE9ic2VydmFibGUuanMubWFwIiwiaW1wb3J0IHsgaXRlcmF0b3IgYXMgU3ltYm9sX2l0ZXJhdG9yIH0gZnJvbSAnLi4vc3ltYm9sL2l0ZXJhdG9yJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIGlzSXRlcmFibGUoaW5wdXQpIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbihpbnB1dCA9PT0gbnVsbCB8fCBpbnB1dCA9PT0gdm9pZCAwID8gdm9pZCAwIDogaW5wdXRbU3ltYm9sX2l0ZXJhdG9yXSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pc0l0ZXJhYmxlLmpzLm1hcCIsImltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICcuLi9PYnNlcnZhYmxlJztcbmltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JzZXJ2YWJsZShvYmopIHtcbiAgICByZXR1cm4gISFvYmogJiYgKG9iaiBpbnN0YW5jZW9mIE9ic2VydmFibGUgfHwgKGlzRnVuY3Rpb24ob2JqLmxpZnQpICYmIGlzRnVuY3Rpb24ob2JqLnN1YnNjcmliZSkpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzT2JzZXJ2YWJsZS5qcy5tYXAiLCJpbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSBcIi4vaXNGdW5jdGlvblwiO1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvbWlzZSh2YWx1ZSkge1xuICAgIHJldHVybiBpc0Z1bmN0aW9uKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDAgPyB2b2lkIDAgOiB2YWx1ZS50aGVuKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzUHJvbWlzZS5qcy5tYXAiLCJpbXBvcnQgeyBfX2FzeW5jR2VuZXJhdG9yLCBfX2F3YWl0LCBfX2dlbmVyYXRvciB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4vaXNGdW5jdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gcmVhZGFibGVTdHJlYW1MaWtlVG9Bc3luY0dlbmVyYXRvcihyZWFkYWJsZVN0cmVhbSkge1xuICAgIHJldHVybiBfX2FzeW5jR2VuZXJhdG9yKHRoaXMsIGFyZ3VtZW50cywgZnVuY3Rpb24gcmVhZGFibGVTdHJlYW1MaWtlVG9Bc3luY0dlbmVyYXRvcl8xKCkge1xuICAgICAgICB2YXIgcmVhZGVyLCBfYSwgdmFsdWUsIGRvbmU7XG4gICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2IpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoX2IubGFiZWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIHJlYWRlciA9IHJlYWRhYmxlU3RyZWFtLmdldFJlYWRlcigpO1xuICAgICAgICAgICAgICAgICAgICBfYi5sYWJlbCA9IDE7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBfYi50cnlzLnB1c2goWzEsICwgOSwgMTBdKTtcbiAgICAgICAgICAgICAgICAgICAgX2IubGFiZWwgPSAyO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0cnVlKSByZXR1cm4gWzMsIDhdO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQsIF9fYXdhaXQocmVhZGVyLnJlYWQoKSldO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgX2EgPSBfYi5zZW50KCksIHZhbHVlID0gX2EudmFsdWUsIGRvbmUgPSBfYS5kb25lO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRvbmUpIHJldHVybiBbMywgNV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCwgX19hd2FpdCh2b2lkIDApXTtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHJldHVybiBbMiwgX2Iuc2VudCgpXTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IHJldHVybiBbNCwgX19hd2FpdCh2YWx1ZSldO1xuICAgICAgICAgICAgICAgIGNhc2UgNjogcmV0dXJuIFs0LCBfYi5zZW50KCldO1xuICAgICAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgICAgICAgICAgX2Iuc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMsIDJdO1xuICAgICAgICAgICAgICAgIGNhc2UgODogcmV0dXJuIFszLCAxMF07XG4gICAgICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs3XTtcbiAgICAgICAgICAgICAgICBjYXNlIDEwOiByZXR1cm4gWzJdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1JlYWRhYmxlU3RyZWFtTGlrZShvYmopIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbihvYmogPT09IG51bGwgfHwgb2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvYmouZ2V0UmVhZGVyKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzUmVhZGFibGVTdHJlYW1MaWtlLmpzLm1hcCIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICcuL2lzRnVuY3Rpb24nO1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2NoZWR1bGVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIGlzRnVuY3Rpb24odmFsdWUuc2NoZWR1bGUpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXNTY2hlZHVsZXIuanMubWFwIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJy4vaXNGdW5jdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gaGFzTGlmdChzb3VyY2UpIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbihzb3VyY2UgPT09IG51bGwgfHwgc291cmNlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzb3VyY2UubGlmdCk7XG59XG5leHBvcnQgZnVuY3Rpb24gb3BlcmF0ZShpbml0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgaWYgKGhhc0xpZnQoc291cmNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZS5saWZ0KGZ1bmN0aW9uIChsaWZ0ZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5pdChsaWZ0ZWRTb3VyY2UsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmFibGUgdG8gbGlmdCB1bmtub3duIE9ic2VydmFibGUgdHlwZScpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1saWZ0LmpzLm1hcCIsImltcG9ydCB7IF9fcmVhZCwgX19zcHJlYWRBcnJheSB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSBcIi4uL29wZXJhdG9ycy9tYXBcIjtcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmZ1bmN0aW9uIGNhbGxPckFwcGx5KGZuLCBhcmdzKSB7XG4gICAgcmV0dXJuIGlzQXJyYXkoYXJncykgPyBmbi5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhcmdzKSkpIDogZm4oYXJncyk7XG59XG5leHBvcnQgZnVuY3Rpb24gbWFwT25lT3JNYW55QXJncyhmbikge1xuICAgIHJldHVybiBtYXAoZnVuY3Rpb24gKGFyZ3MpIHsgcmV0dXJuIGNhbGxPckFwcGx5KGZuLCBhcmdzKTsgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXBPbmVPck1hbnlBcmdzLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBub29wKCkgeyB9XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ub29wLmpzLm1hcCIsImV4cG9ydCBmdW5jdGlvbiBub3QocHJlZCwgdGhpc0FyZykge1xuICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7IHJldHVybiAhcHJlZC5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpbmRleCk7IH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ub3QuanMubWFwIiwiaW1wb3J0IHsgaWRlbnRpdHkgfSBmcm9tICcuL2lkZW50aXR5JztcbmV4cG9ydCBmdW5jdGlvbiBwaXBlKCkge1xuICAgIHZhciBmbnMgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBmbnNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgcmV0dXJuIHBpcGVGcm9tQXJyYXkoZm5zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBwaXBlRnJvbUFycmF5KGZucykge1xuICAgIGlmIChmbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBpZGVudGl0eTtcbiAgICB9XG4gICAgaWYgKGZucy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGZuc1swXTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBpcGVkKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBmbnMucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBmbikgeyByZXR1cm4gZm4ocHJldik7IH0sIGlucHV0KTtcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGlwZS5qcy5tYXAiLCJpbXBvcnQgeyBjb25maWcgfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHsgdGltZW91dFByb3ZpZGVyIH0gZnJvbSAnLi4vc2NoZWR1bGVyL3RpbWVvdXRQcm92aWRlcic7XG5leHBvcnQgZnVuY3Rpb24gcmVwb3J0VW5oYW5kbGVkRXJyb3IoZXJyKSB7XG4gICAgdGltZW91dFByb3ZpZGVyLnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGNvbmZpZy5vblVuaGFuZGxlZEVycm9yO1xuICAgICAgICBpZiAob25VbmhhbmRsZWRFcnJvcikge1xuICAgICAgICAgICAgb25VbmhhbmRsZWRFcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXBvcnRVbmhhbmRsZWRFcnJvci5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gY3JlYXRlSW52YWxpZE9ic2VydmFibGVUeXBlRXJyb3IoaW5wdXQpIHtcbiAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBwcm92aWRlZCBcIiArIChpbnB1dCAhPT0gbnVsbCAmJiB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnID8gJ2FuIGludmFsaWQgb2JqZWN0JyA6IFwiJ1wiICsgaW5wdXQgKyBcIidcIikgKyBcIiB3aGVyZSBhIHN0cmVhbSB3YXMgZXhwZWN0ZWQuIFlvdSBjYW4gcHJvdmlkZSBhbiBPYnNlcnZhYmxlLCBQcm9taXNlLCBSZWFkYWJsZVN0cmVhbSwgQXJyYXksIEFzeW5jSXRlcmFibGUsIG9yIEl0ZXJhYmxlLlwiKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRocm93VW5vYnNlcnZhYmxlRXJyb3IuanMubWFwIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20pIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGZyb20ubGVuZ3RoLCBqID0gdG8ubGVuZ3RoOyBpIDwgaWw7IGkrKywgaisrKVxyXG4gICAgICAgIHRvW2pdID0gZnJvbVtpXTtcclxuICAgIHJldHVybiB0bztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHByaXZhdGVNYXAuc2V0KHJlY2VpdmVyLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgT2JzZXJ2YWJsZVN0b3JlIH0gZnJvbSAnQGNvZGV3aXRoZGFuL29ic2VydmFibGUtc3RvcmUnO1xuXG5jbGFzcyBDdXN0b21lcnNTdG9yZSBleHRlbmRzIE9ic2VydmFibGVTdG9yZSB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoeyB0cmFja1N0YXRlSGlzdG9yeTogdHJ1ZSwgbG9nU3RhdGVDaGFuZ2VzOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGZldGNoQ3VzdG9tZXJzKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2goJy4vY3VzdG9tZXJzLmpzb24nKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAgICAgLnRoZW4oY3VzdG9tZXJzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3VzdG9tZXJzIH0sIEN1c3RvbWVyc1N0b3JlQWN0aW9ucy5HZXRDdXN0b21lcnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXN0b21lcnM7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTZXQgc3RhdGUgaW4gdGhlIHN0b3JlIGJ5IGNhbGxpbmcgc2V0U3RhdGUoc3RhdGVPYmplY3QsIGFjdGlvbikuIFxuICAgIC8vIElmIHlvdSB3YW50IHRvIGFjY2VzcyB0aGUgcHJldmlvdXMgc3RhdGUgeW91IGNhbiBhbHNvIGNhbGwgXG4gICAgLy8gc2V0U3RhdGUoKHByZXZTdGF0ZSkgPT4gc3RhdGVPYmplY3QsIGFjdGlvbikgcmF0aGVyIHRoYW4gY2FsbGluZyBnZXRTdGF0ZSgpXG4gICAgLy8gZmlyc3QgYmVmb3JlIGNhbGxpbmcgc2V0U3RhdGUoKS5cbiAgICBnZXRDdXN0b21lcnMoKSB7XG4gICAgICAgIGxldCBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGUoKTtcbiAgICAgICAgLy8gcHVsbCBmcm9tIHN0b3JlIGNhY2hlXG4gICAgICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS5jdXN0b21lcnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVByb21pc2UobnVsbCwgc3RhdGUuY3VzdG9tZXJzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkb2Vzbid0IGV4aXN0IGluIHN0b3JlIHNvIGZldGNoIGZyb20gc2VydmVyXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hDdXN0b21lcnMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEN1c3RvbWVyKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1c3RvbWVycygpXG4gICAgICAgICAgICAudGhlbihjdXN0cyA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZpbHRlcmVkQ3VzdHMgPSBjdXN0cy5maWx0ZXIoY3VzdCA9PiBjdXN0LmlkID09PSBpZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tZXIgPSAoZmlsdGVyZWRDdXN0cyAmJiBmaWx0ZXJlZEN1c3RzLmxlbmd0aCkgPyBmaWx0ZXJlZEN1c3RzWzBdIDogbnVsbDsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1c3RvbWVyIH0sIEN1c3RvbWVyc1N0b3JlQWN0aW9ucy5HZXRDdXN0b21lcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1c3RvbWVyO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKGN1c3RvbWVyKSB7XG4gICAgICAgIGxldCBjdXN0b21lcnMgPSB0aGlzLmdldFN0YXRlKCkuY3VzdG9tZXJzO1xuICAgICAgICBsZXQgaW5kZXggPSBjdXN0b21lcnMuZmluZEluZGV4KGMgPT4gYy5pZCA9PT0gY3VzdG9tZXIuaWQpO1xuICAgICAgICBjdXN0b21lcnNbaW5kZXhdID0gY3VzdG9tZXI7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXN0b21lcnMgfSwgQ3VzdG9tZXJzU3RvcmVBY3Rpb25zLlVwZGF0ZUN1c3RvbWVyKTtcbiAgICB9XG5cbiAgICBkZWxldGUoaWQpIHtcbiAgICAgICAgbGV0IGN1c3RvbWVycyA9IHRoaXMuZ2V0U3RhdGUoKS5jdXN0b21lcnM7XG4gICAgICAgIGxldCBpbmRleCA9IGN1c3RvbWVycy5maW5kSW5kZXgoYyA9PiBjLmlkID09PSAraWQpO1xuICAgICAgICBjdXN0b21lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1c3RvbWVycyB9LCBDdXN0b21lcnNTdG9yZUFjdGlvbnMuRGVsZXRlQ3VzdG9tZXIpO1xuICAgIH1cblxuICAgIGNyZWF0ZVByb21pc2UoZXJyLCByZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBDdXN0b21lcnNTdG9yZUFjdGlvbnMgPSB7XG4gICAgR2V0Q3VzdG9tZXJzOiAnR0VUX0NVU1RPTUVSUycsXG4gICAgR2V0Q3VzdG9tZXI6ICdHRVRfQ1VTVE9NRVInLFxuICAgIFVwZGF0ZUN1c3RvbWVyOiAnVVBEQVRFX0NVU1RPTUVSJyxcbiAgICBEZWxldGVDdXN0b21lcjogJ0RFTEVURV9DVVNUT01FUidcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEN1c3RvbWVyc1N0b3JlOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IEN1c3RvbWVyc1N0b3JlIGZyb20gJy4vY3VzdG9tZXJzLXN0b3JlJztcblxubGV0IGN1c3RvbWVyc1N0b3JlID0gbmV3IEN1c3RvbWVyc1N0b3JlKCk7XG5jdXN0b21lcnNTdG9yZS5nZXRDdXN0b21lcnMoKS50aGVuKChjdXN0b21lcnMpID0+IHtcbiAgICAvLyBHZXQgY3VzdG9tZXJzIHZpYSBmZXRjaFxuICAgIGFsZXJ0KCdGZXRjaCByZXR1cm5lZCAnICsgY3VzdG9tZXJzLmxlbmd0aCArICcgY3VzdG9tZXJzJyk7XG4gICAgLy8gR2V0IGN1c3RvbWVycyBmcm9tIHN0b3JlXG4gICAgY3VzdG9tZXJzU3RvcmUuZ2V0Q3VzdG9tZXJzKCkudGhlbigoY3VzdG9tZXJzKSA9PiB7XG4gICAgICAgIGFsZXJ0KCdTdG9yZSByZXR1cm5lZCAnICsgY3VzdG9tZXJzLmxlbmd0aCArICcgY3VzdG9tZXJzJyk7XG4gICAgfSk7XG59KTsiXSwic291cmNlUm9vdCI6IiJ9