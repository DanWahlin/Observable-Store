import { BehaviorSubject } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { ObservableStoreSettings, ObservableStoreGlobalSettings, StateWithPropertyChanges, ObservableStoreExtension } from './interfaces';

/** Singleton that holds the shared store state across all ObservableStore services. */
class ObservableStoreBase {
    private _storeState: Readonly<Record<string, unknown>> | null = null;
    private readonly _clonerService = new ClonerService();
    private readonly _extensions: ObservableStoreExtension[] = [];

    readonly settingsDefaults: ObservableStoreSettings = {
        trackStateHistory: false,
        logStateChanges: false,
        stateSliceSelector: null
    };
    stateHistory: unknown[] = [];
    readonly globalStateDispatcher = new BehaviorSubject<unknown>(null);
    readonly globalStateWithChangesDispatcher = new BehaviorSubject<StateWithPropertyChanges<unknown>>(null);
    globalSettings: ObservableStoreGlobalSettings | null = null;
    services: unknown[] = [];

    get isStoreInitialized(): boolean {
        return this._storeState !== null;
    }

    initializeState(state: Record<string, unknown>): void {
        if (this.isStoreInitialized) {
            throw Error('The store state has already been initialized. initializeStoreState() can ' +
                        'only be called once BEFORE any store state has been set.');
        }
        this.setStoreState(state);
    }

    getStoreState(propertyName: string | null = null, deepCloneReturnedState: boolean = true): unknown {
        if (!this.isStoreInitialized) {
            return null;
        }

        let state: unknown = null;

        // See if a specific property of the store should be returned via getStateProperty<T>()
        if (propertyName) {
            if (Object.hasOwn(this._storeState!, propertyName)) {
                state = this._storeState![propertyName];
            }
        }
        else {
            state = this._storeState;
        }

        if (state != null && deepCloneReturnedState) {
            state = this.deepClone(state);
        }

        return state;
    }

    setStoreState(state: Record<string, unknown>, deepCloneState: boolean = true): void {
        const currentStoreState = this.getStoreState(null, deepCloneState) as Record<string, unknown> | null;
        if (deepCloneState) {
            this._storeState = { ...currentStoreState, ...this.deepClone(state) as Record<string, unknown> };
        }
        else {
            this._storeState = { ...currentStoreState, ...state };
        }
    }

    clearStoreState(): void {
        this._storeState = null;
    }

    deepClone<V>(obj: V): V {
        return this._clonerService.deepClone(obj);
    }

    removeService(service: unknown): void {
        const index = this.services.indexOf(service);
        if (index > -1) {
            this.services.splice(index, 1);
        }
    }

    addExtension(extension: ObservableStoreExtension): void {
        this._extensions.push(extension);
        extension.init();
    }
}

// Created once to initialize singleton
export default new ObservableStoreBase();
