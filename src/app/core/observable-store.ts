import { ReflectiveInjector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClonerService } from './utilities/cloner.service';
import { SorterService } from './utilities/sorter.service';

export class ObservableStore<T> {
    private state: T;
    private stateDispatcher: BehaviorSubject<T>;
    private clonerService: ClonerService;
    private sorterService: SorterService;
    stateChanged: Observable<T>;

    constructor(initialState?: T) {
        this.initStore(initialState);
    }

    private initStore(initialState) {
        const injector = ReflectiveInjector.resolveAndCreate([ClonerService, SorterService]);
        this.clonerService = injector.get(ClonerService);
        this.sorterService = injector.get(SorterService);

        this.stateDispatcher = new BehaviorSubject<T>(initialState);
        this.stateChanged = this.stateDispatcher.asObservable();

        this.setState(initialState);
    }

    private dispatchState() {
        const clone = this.clonerService.deepClone(this.state);
        this.stateDispatcher.next(clone);
    }

    protected setState(state: T) {
        // console.log(this, state);
        this.state = state;
        this.dispatchState();
    }

    protected getState() {
        return this.state;
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

    protected sortState(property: string) {
        // if (Array.isArray(this.state)) {
        //     const sortedState = this.sorterService.sort<T>(this.state, property);
        //     this.setState(sortedState);
        // }
        // else {
        //     throw new Error('No collection to sort.');
        // }
    }

}
