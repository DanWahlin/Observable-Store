import { Observable } from 'rxjs';
export interface ObservableStoreSettings {
    trackStateHistory?: boolean;
}
export declare class ObservableStore<T> {
    stateChanged: Observable<T>;
    stateHistory: any[];
    private _stateDispatcher;
    private _clonerService;
    private _settings;
    constructor(settings?: ObservableStoreSettings);
    protected setState(state: any, action?: string, dispatchState?: boolean): void;
    protected getState(): T;
    protected logStateAction(state: any, action: string): void;
    private updateState;
    private _dispatchState;
}
