export interface StateSliceSelector {
    stateSliceSelector?: (state: any) => any;
}

export interface BaseStoreSettings {
    trackStateHistory?: boolean;
    logStateChanges?: boolean;
    includeStateChangesOnSubscribe?: boolean;
}

export interface ObservableStoreSettings extends BaseStoreSettings, StateSliceSelector { }

export interface ObservableStoreGlobalSettings extends BaseStoreSettings {
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