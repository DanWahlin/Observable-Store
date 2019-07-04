import { skip } from 'rxjs/operators';

import { ObservableStore } from './observable-store';

describe('Observable Store', () => {
  interface FakeState {
    prop1: string;
    prop2: string;
  }

  class FakeStore extends ObservableStore<FakeState> {
    updateProp1(value: string) {
      this.setState({ prop1: value });
    }
    get currentState() {
      return this.getState();
    }
  }

  it('should set a single property', () => {
    const store = new FakeStore({});

    store.updateProp1('test');

    expect(store.currentState.prop1).toEqual('test');
  });

  // we will skip 1 to account for the initial BehaviorSubject<T> value
  it('should NOT receive notification if no state has changed', () => {
    const store = new FakeStore({});
    let receiveUpdate = false;
    const sub = store.stateChanged.pipe(skip(1)).subscribe(() => (receiveUpdate = true));

    expect(receiveUpdate).toBeFalsy();
    sub.unsubscribe();
  });

  // we will skip 1 to account for the initial BehaviorSubject<T> value
  it('should receive notification when state has been changed', () => {
    const store = new FakeStore({});
    let receiveUpdate = false;
    const sub = store.stateChanged.pipe(skip(1)).subscribe(() => (receiveUpdate = true));

    store.updateProp1('test');

    expect(receiveUpdate).toBeTruthy();
    sub.unsubscribe();
  });
});
