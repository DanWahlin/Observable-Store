export interface ObservableStoreSettings {
    trackStateHistory?: boolean;
    logStateChanges?: boolean;
    includeStateChangesOnSubscribe?: boolean;
    stateSliceSelector?: (state: any) => any;
}

export interface CurrentStoreState {
    state: any;
    stateChanges: any;
}