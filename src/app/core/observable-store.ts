import { ReflectiveInjector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';

export class ObservableStore<T> {
    private state: T;
    private stateDispatcher: BehaviorSubject<T>;
    private clonerService: ClonerService;
    stateChanged: Observable<T>;
    isDirty:boolean;

    constructor(initialState?: T) {
        this.initStore(initialState);
    }

    private initStore(initialState) {
        const injector = ReflectiveInjector.resolveAndCreate([ClonerService]);
        this.clonerService = injector.get(ClonerService);

        this.stateDispatcher = new BehaviorSubject<T>(initialState);
        this.stateChanged = this.stateDispatcher.asObservable();
        this.isDirty = false;

        this.setState(initialState);
    }

    private dispatchState() {
        const clone = this.clonerService.deepClone(this.state);
        this.stateDispatcher.next(clone);
    }

    protected setState(state: T) {
        // console.log(this, state);
        this.state = state;
        this.isDirty = true;
        this.dispatchState();
    }

    protected getState() {
        return this.clonerService.deepClone(this.state);
    }

    protected resetState(initialState) {
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
