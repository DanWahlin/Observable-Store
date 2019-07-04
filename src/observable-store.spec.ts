import { skip } from 'rxjs/operators';

import { ObservableStore } from './observable-store';

interface FakeState {
  prop1: string;
  prop2: string;
}

describe('Observable Store', () => {
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

  describe('State History', () => {
    const Update_Prop1 = 'Update_Prop1';
    class UserStore extends ObservableStore<FakeState> {
      updateProp1(value: string) {
        this.setState({ prop1: value }, Update_Prop1);
      }
      get currentState() {
        return this.getState();
      }
    }

    it('should have no history on initialize', () => {
      const fakeStore = new UserStore({ trackStateHistory: true });

      console.log('init test: ', fakeStore.stateHistory);

      expect(fakeStore.stateHistory.length).toEqual(0);
    });

    it('should add one record to state history', () => {
      const fakeStore = new UserStore({ trackStateHistory: true });

      fakeStore.updateProp1('test');
      expect(fakeStore.stateHistory.length).toEqual(1);
    });

    it('should add 2 records to state history', () => {
      const fakeStore = new UserStore({ trackStateHistory: true });
      expect(fakeStore.stateHistory.length).toEqual(0);

      fakeStore.updateProp1('test');
      fakeStore.updateProp1('test');
      expect(fakeStore.stateHistory.length).toEqual(2);
    });
  });

  describe('Can I have 2 stores?', () => {
    const Update_Prop1A = 'Update_Prop1-A';
    const Update_Prop1B = 'Update_Prop1-B';

    class MockStoreA extends ObservableStore<FakeState> {
      updateProp1(value: string) {
        this.setState({ prop1: value }, Update_Prop1A);
      }
      get currentState() {
        return this.getState();
      }
    }

    class MockStoreB extends ObservableStore<FakeState> {
      updateProp1(value: string) {
        this.setState({ prop1: value }, Update_Prop1B);
      }
      get currentState() {
        return this.getState();
      }
    }
    it('should have different histories', () => {
      const mockStoreA = new MockStoreA({ trackStateHistory: true });
      const mockStoreB = new MockStoreB({ trackStateHistory: true });

      mockStoreA.updateProp1('test');
      expect(mockStoreB.stateHistory.length).toBe(0);
    });
  });
});
