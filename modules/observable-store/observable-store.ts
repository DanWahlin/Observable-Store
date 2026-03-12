import { BehaviorSubject, Observable } from 'rxjs';
import { ObservableStoreSettings, StateHistory, ObservableStoreGlobalSettings, StateWithPropertyChanges, ObservableStoreExtension } from './interfaces';
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
    private readonly _settings: ObservableStoreSettings;
    private readonly _stateDispatcher$ = new BehaviorSubject<T>(null);
    private readonly _stateWithChangesDispatcher$ = new BehaviorSubject<StateWithPropertyChanges<T>>(null);

    /**
     * Subscribe to store changes in the particular slice of state updated by a Service.
     * If the store contains 'n' slices of state each being managed by one of 'n' services, then changes in any
     * of the other slices of state will not generate values in the `stateChanged` stream.
     * Returns an RxJS Observable containing the current store state (or a specific slice of state if a `stateSliceSelector` has been specified).
     */
    readonly stateChanged: Observable<T>;

    /**
     * Subscribe to store changes in the particular slice of state updated by a Service and also include the properties that changed as well.
     * Upon subscribing to `stateWithPropertyChanges` you will get back an object containing state (which has the current slice of store state)
     * and `stateChanges` (which has the individual properties/data that were changed in the store).
     */
    readonly stateWithPropertyChanges: Observable<StateWithPropertyChanges<T>>;

    /**
     * Subscribe to global store changes i.e. changes in any slice of state of the store. The global store may consist of 'n'
     * slices of state each managed by a particular service. This property notifies of a change in any of the 'n' slices of state.
     * Returns an RxJS Observable containing the current store state.
     */
    readonly globalStateChanged: Observable<T>;

    /**
     * Subscribe to global store changes i.e. changes in any slice of state of the store and also include the properties that changed as well.
     * The global store may consist of 'n' slices of state each managed by a particular service.
     * This property notifies of a change in any of the 'n' slices of state. Upon subscribing to `globalStateWithPropertyChanges` you will get
     * back an object containing state (which has the current store state) and `stateChanges`
     * (which has the individual properties/data that were changed in the store).
     */
    readonly globalStateWithPropertyChanges: Observable<StateWithPropertyChanges<T>>;

    /**
     * Retrieve state history. Assumes trackStateHistory setting was set on the store.
     */
    get stateHistory(): StateHistory<T>[] {
        return ObservableStoreBase.stateHistory as StateHistory<T>[];
    }

    constructor(settings: ObservableStoreSettings) {
        this._settings = { ...ObservableStoreBase.settingsDefaults, ...settings, ...ObservableStoreBase.globalSettings };
        this.stateChanged = this._stateDispatcher$.asObservable();
        this.globalStateChanged = ObservableStoreBase.globalStateDispatcher.asObservable() as Observable<T>;

        this.stateWithPropertyChanges = this._stateWithChangesDispatcher$.asObservable();
        this.globalStateWithPropertyChanges = ObservableStoreBase.globalStateWithChangesDispatcher.asObservable() as Observable<StateWithPropertyChanges<T>>;
        ObservableStoreBase.services.push(this);
    }

    /**
     * get/set global settings throughout the application for ObservableStore.
     * See the [Observable Store Settings](https://github.com/danwahlin/observable-store#store-settings-per-service) documentation
     * for additional information. Note that global settings can only be set once as the application first loads.
     */
    static get globalSettings(): ObservableStoreGlobalSettings | null {
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
            throw new Error('Observable Store global settings may only be set once when the application first loads.');
        }
    }

    /**
     * Provides access to all services that interact with ObservableStore. Useful for extensions
     * that need to be able to access a specific service.
     */
    static get allStoreServices(): unknown[] {
        return ObservableStoreBase.services;
    }

    /**
     * Used to add an extension into ObservableStore. The extension must implement the
     * `ObservableStoreExtension` interface.
     */
    static addExtension(extension: ObservableStoreExtension): void {
        ObservableStoreBase.addExtension(extension);
    }

    /**
     * Used to initialize the store's starting state. An error will be thrown if this is called and store state already exists.
     * No notifications are sent out when the store state is initialized by calling initializeStoreState().
     */
    static initializeState(state: Record<string, unknown>): void {
        ObservableStoreBase.initializeState(state);
    }

    /**
     * Used to reset the state of the store to a desired value for all services that derive
     * from ObservableStore<T> to a desired value.
     * A state change notification and global state change notification is sent out to subscribers if the dispatchState parameter is true (the default value).
     */
    static resetState(state: Record<string, unknown>, dispatchState: boolean = true): void {
        ObservableStoreBase.setStoreState(state);
        if (dispatchState) {
            ObservableStore.dispatchToAllServices(state);
        }
    }

    /**
     * Clear/null the store state for all services that use it.
     */
    static clearState(dispatchState: boolean = true): void {
        ObservableStoreBase.clearStoreState();
        if (dispatchState) {
            ObservableStore.dispatchToAllServices(null);
        }
    }

    /**
     * Determines if the ObservableStore has already been initialized through the use of ObservableStore.initializeState()
     */
    static get isStoreInitialized(): boolean {
        return ObservableStoreBase.isStoreInitialized;
    }

    private static dispatchToAllServices(state: unknown): void {
        const services = ObservableStore.allStoreServices;
        if (services) {
            for (const service of services) {
                (service as ObservableStore<unknown>).dispatchState(state as Partial<unknown>);
            }
        }
    }

    /**
     * Retrieve store's state. If using TypeScript (optional) then the state type defined when the store
     * was created will be returned rather than `any`. The deepCloneReturnedState boolean parameter (default is true) can be used
     * to determine if the returned state will be deep cloned or not. If set to false, a reference to the store state will
     * be returned and it's up to the user to ensure the state isn't change from outside the store. Setting it to false can be
     * useful in cases where read-only cached data is stored and must be retrieved as quickly as possible without any cloning.
     */
    protected getState(deepCloneReturnedState: boolean = true): T {
        return this._getStateOrSlice(deepCloneReturnedState) as T;
    }

    /**
     * Retrieve a specific property from the store's state which can be more efficient than getState()
     * since only the defined property value will be returned (and cloned) rather than the entire
     * store value. If using TypeScript (optional) then the generic property type used with the
     * function call will be the return type.
     */
    protected getStateProperty<TProp>(propertyName: string, deepCloneReturnedState: boolean = true): TProp {
        return ObservableStoreBase.getStoreState(propertyName, deepCloneReturnedState) as TProp;
    }

    /**
     * Retrieve a specific property from the store's state which can be more efficient than getState()
     * since only the defined property value will be returned (and cloned) rather than the entire
     * store value. If using TypeScript (optional) then the generic property type used with the
     * function call will be the return type.
     * If a `stateSliceSelector` has been set, the specific slice will be searched first.
     */
    protected getStateSliceProperty<TProp>(propertyName: string, deepCloneReturnedState: boolean = true): TProp | null {
        if (this._settings.stateSliceSelector) {
            const state = this._getStateOrSlice(deepCloneReturnedState) as Record<string, unknown>;
            if (state && Object.hasOwn(state, propertyName)) {
                return state[propertyName] as TProp;
            }
        }
        return null;
    }

    /**
     * Set store state. Pass the state to be updated as well as the action that is occurring.
     * The state value can be a function [(see example)](https://github.com/danwahlin/observable-store#store-api).
     * The latest store state is returned.
     * The dispatchState parameter can be set to false if you do not want to send state change notifications to subscribers.
     * The deepCloneReturnedState boolean parameter (default is true) can be used
     * to determine if the state will be deep cloned before it is added to the store. Setting it to false can be
     * useful in cases where read-only cached data is stored and must added to the store as quickly as possible without any cloning.
     */
    protected setState(state: Partial<T> | stateFunc<T>,
        action?: string,
        dispatchState: boolean = true,
        deepCloneState: boolean = true): T {

        // Capture previous state for history tracking (before mutation)
        const previousState = this._settings.trackStateHistory ? this.getState(deepCloneState) : null;

        switch (typeof state) {
            case 'function':
                const newState = state(this.getState(deepCloneState));
                this._updateState(newState, deepCloneState);
                break;
            case 'object':
                this._updateState(state, deepCloneState);
                break;
            default:
                throw Error('Pass an object or a function for the state parameter when calling setState().');
        }

        // Get end state once — reused for history and return value
        const endState = this.getState(deepCloneState);

        if (this._settings.trackStateHistory) {
            ObservableStoreBase.stateHistory.push({
                action,
                beginState: previousState,
                endState
            });
        }

        if (dispatchState) {
            this.dispatchState(state as Partial<T>);
        }

        if (this._settings.logStateChanges) {
            const caller = this.constructor ? '\r\nCaller: ' + this.constructor.name : '';
            console.log('%cSTATE CHANGED', 'font-weight: bold', '\r\nAction: ', action, caller, '\r\nState: ', state);
        }

        return endState;
    }

    /**
     * Add a custom state value and action into the state history. Assumes `trackStateHistory` setting was set
     * on store or using the global settings.
     */
    protected logStateAction(state: unknown, action: string): void {
        if (this._settings.trackStateHistory) {
            ObservableStoreBase.stateHistory.push({
                action,
                beginState: this.getState(),
                endState: ObservableStoreBase.deepClone(state)
            });
        }
    }

    /**
     * Reset the store's state history to an empty array.
     */
    protected resetStateHistory(): void {
        ObservableStoreBase.stateHistory = [];
    }

    private _updateState(state: Partial<T>, deepCloneState: boolean): void {
        ObservableStoreBase.setStoreState(state as Record<string, unknown>, deepCloneState);
    }

    private _getStateOrSlice(deepCloneReturnedState: boolean): Readonly<Partial<T>> {
        const storeState = ObservableStoreBase.getStoreState(null, deepCloneReturnedState) as T;
        if (this._settings.stateSliceSelector) {
            return this._settings.stateSliceSelector(storeState) as Partial<T>;
        }
        return storeState;
    }

    /**
     * Dispatch the store's state without modifying the store state. Service state can be dispatched as well as the global store state.
     * If `dispatchGlobalState` is false then global state will not be dispatched to subscribers (defaults to `true`).
     */
    protected dispatchState(stateChanges: Partial<T>, dispatchGlobalState: boolean = true): void {
        // Get store state or slice of state
        const clonedStateOrSlice = this._getStateOrSlice(true) as T;

        // Get full store state
        const clonedGlobalState = ObservableStoreBase.getStoreState() as T;

        this._stateDispatcher$.next(clonedStateOrSlice);
        this._stateWithChangesDispatcher$.next({ state: clonedStateOrSlice, stateChanges });

        if (dispatchGlobalState) {
            ObservableStoreBase.globalStateDispatcher.next(clonedGlobalState);
            ObservableStoreBase.globalStateWithChangesDispatcher.next({ state: clonedGlobalState, stateChanges });
        }
    }

    /**
     * Unregister this service from the global store and complete its state dispatchers.
     * Call this when a service is destroyed (e.g., in Angular's ngOnDestroy) to prevent memory leaks.
     */
    destroy(): void {
        this._stateDispatcher$.complete();
        this._stateWithChangesDispatcher$.complete();
        ObservableStoreBase.removeService(this);
    }
}
