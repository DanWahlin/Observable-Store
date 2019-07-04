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
});
