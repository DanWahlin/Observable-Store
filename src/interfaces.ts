export interface ObservableStoreSettings {
    trackStateHistory?: boolean;
    logStateChanges?: boolean;
    includeStateChangesOnSubscribe?: boolean;
    stateSliceSelector?: (state: any) => any;
}

export interface StateHistory<T>{
    action: string;
    beginState: T,
    endState: T
}