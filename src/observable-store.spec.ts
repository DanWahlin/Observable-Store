import { skip } from 'rxjs/operators';

import { ObservableStore } from './observable-store';

const Update_Prop1 = 'Update_Prop1';

interface MockState {
  prop1: string;
  prop2: string;
}
class MockStore extends ObservableStore<MockState> {
  updateProp1(value: string) {
    this.setState({ prop1: value }, Update_Prop1);
  }

  updateForTestAction(value: string, action: string) {
    this.setState({ prop1: value }, action);
  }

  get currentState() {
    return this.getState();
  }
}
describe('Observable Store', () => {
  let mockStore = new MockStore({ trackStateHistory: true });

  it('should set a single property', () => {
    mockStore.updateProp1('test');

    expect(mockStore.currentState.prop1).toEqual('test');
  });

  describe('Subscriptions', () => {
    // we will skip 1 to account for the initial BehaviorSubject<T> value
    it('should NOT receive notification if no state has changed', () => {
      let receiveUpdate = false;
      const sub = mockStore.stateChanged.pipe(skip(1)).subscribe(() => (receiveUpdate = true));

      expect(receiveUpdate).toBeFalsy();
      sub.unsubscribe();
    });

    // we will skip 1 to account for the initial BehaviorSubject<T> value
    it('should receive notification when state has been changed', () => {
      let receiveUpdate = false;
      const sub = mockStore.stateChanged.pipe(skip(1)).subscribe(() => (receiveUpdate = true));

      mockStore.updateProp1('test');

      expect(receiveUpdate).toBeTruthy();
      sub.unsubscribe();
    });
  });

  describe('Action', () => {
    it('should add valid action to stateHistory', () => {
      const mockAction = 'Mock_Action';
      mockStore.updateForTestAction('test', mockAction);

      expect(mockStore.stateHistory[mockStore.stateHistory.length - 1].action).toEqual(mockAction);
    });
  });
});
