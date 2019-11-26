import { Subscription, Observable } from "rxjs";

export interface StateSliceSelector {
    /**
     * Function to select the slice of the store being managed by this particular service. 
     * If specified then the specific state slice is returned. 
     * If not specified then the total state is returned (defaults to `null`).
     */
    stateSliceSelector?: (state: any) => any;
}

export interface BaseStoreSettings {
    /**
     * Determines if the store's state will be tracked or not (defaults to `false`). 
     * Pass it when initializing the Observable Store. 
     * When `true`, you can access the store's state history by calling the `stateHistory` property.
     */
    trackStateHistory?: boolean;

    /**
     * Log any store state changes to the browser console (defaults to `false`).
     */
    logStateChanges?: boolean;

    /**
     * DEPRECATED. Since this is deprecated, use `stateWithPropertyChanges` or `globalStateWithPropertyChanges` instead.
     */
    includeStateChangesOnSubscribe?: boolean;
}

export interface ObservableStoreSettings extends BaseStoreSettings, StateSliceSelector { }

export interface ObservableStoreGlobalSettings extends BaseStoreSettings {
    /**
     * When `false`, cloning will be used when calling `getState()` or `setState()` in order to enforce 
     * immutability of the store state. When `true`, cloning will not be used in order to enhance performance.
     * [Additionl details](https://github.com/danwahlin/observable-store#the-isproduction-property).
     */
    isProduction?: boolean;
}

export interface StateHistory<T>{
    action: string;
    beginState: T,
    endState: T
}

export interface StateWithPropertyChanges<T> {
    state: T,
    stateChanges: Partial<T>
}

export interface ObservableStoreExtension {
    /**
     * Function used to initialize the extension.
     */
    init(config?: any): Observable<never> | Subscription;
}