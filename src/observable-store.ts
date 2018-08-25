import { BehaviorSubject, Observable } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { ObservableStoreSettings } from './interfaces';

export class ObservableStore<T> {
    private state: Readonly<T>;
    private stateDispatcher: BehaviorSubject<T>;
    private clonerService: ClonerService;
    private trackStateHistory: boolean;
    stateChanged: Observable<T>;
    stateHistory: any[] = [];

    constructor(initialState: T, settings: ObservableStoreSettings) {
        this.trackStateHistory = settings.trackStateHistory;
        this.initStore(initialState);
    }

    private initStore(initialState: T) {
        //Not injecting service since we want to use ObservableStore outside of Angular
        this.clonerService = new ClonerService();
        this.stateDispatcher = new BehaviorSubject<T>(initialState);
        this.stateChanged = this.stateDispatcher.asObservable();
        this.setState('init', initialState);
    }

    private dispatchState() {
        const clone = this.clonerService.deepClone(this.state);
        this.stateDispatcher.next(clone);
    }

    protected setState(action: string, state: any) { 
        this.state = Object.assign({}, this.state, state);
        this.dispatchState();
        if (this.trackStateHistory) {
            this.stateHistory.push({ action, state});
        }
    }

    protected getState() : T {
        return this.clonerService.deepClone(this.state);
    }

    protected resetState(initialState: T) {
        this.initStore(initialState);
    }

    protected getNestedProp(p) {
        return p.reduce((xs, x) => {
            if (xs === null || xs === undefined) {
                return null;
            }
            else {
                return xs[x];
            }
        }, this.state);
    }

}
