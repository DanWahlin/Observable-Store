import { skip } from 'rxjs/operators';

import { ObservableStore } from './observable-store';

const Update_Prop1 = 'Update_Prop1';

interface MockUser {
  name: string;
}

interface MockState {
  prop1: string;
  prop2: string;
  user: MockUser;
}

class MockStore extends ObservableStore<MockState> {
  updateProp1(value: string) {
    this.setState({ prop1: value }, Update_Prop1);
  }

  updateForTestAction(value: string, action: string) {
    this.setState({ prop1: value }, action);
  }

  updateUsingAFunction(func: (state: MockState) => MockState) {
    this.setState(prevState => {
      return func(prevState);
    });
  }

  get currentState() {
    return this.getState();
  }
}

describe('Observable Store', () => {
  let mockStore = new MockStore({ trackStateHistory: true });

  describe('Changing state', () => {
    it('should change a single property', () => {
      mockStore.updateProp1('test');

      expect(mockStore.currentState.prop1).toEqual('test');
    });

    it('should execute an anonymous function', () => {
      const capitalizeProp1 = (state: MockState) => {
        state.prop1 = state.prop1.toLocaleUpperCase();
        return state;
      };

      const capitalizeSpy = jasmine.createSpy().and.callFake(capitalizeProp1);
      mockStore.updateProp1('test');
      mockStore.updateUsingAFunction(capitalizeSpy);

      expect(capitalizeSpy).toHaveBeenCalled();
      expect(mockStore.currentState.prop1).toEqual('TEST');
    });
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
  describe('SliceSelector', () => {
    class UserStore extends ObservableStore<MockState> {
      constructor() {
        super({
          stateSliceSelector: state => {
            // console.log('state constructor', state);
            return { user: state.user };
          }
        });
      }
      updateUser(user: MockUser) {
        this.setState({ user: user });
      }

      get currentState() {
        return this.getState();
      }
    }
    const userStore = new UserStore();
    it('should only have MockUser when requesting state', () => {
      userStore.updateUser({ name: 'foo' });

      const state = userStore.currentState;

      expect(state.prop1).toBeFalsy();
      expect(state.prop2).toBeFalsy();
      // although the state is populated, slice will only populate the User
      expect(state.user).toBeTruthy();
    });
  });
});
