import { skip } from 'rxjs/operators';
import { ObservableStore, stateFunc } from '../observable-store';
import { StateWithPropertyChanges } from '../interfaces';
import { MockStore, UserStore, MockState, user } from './mocks';

let mockStore = null;
let userStore = null;

beforeEach(() => {
    ObservableStore['isTesting'] = true;
    mockStore = new MockStore({ trackStateHistory: true });
    userStore = new UserStore(null);
    // Clear all existing store state
    mockStore.setState(null, 'Reinitialize State For Each Test');
});

describe('Observable Store', () => {

  describe('Changing state', () => {

    it('should change a single property', () => {
      mockStore.updateProp1('test');
      expect(mockStore.currentState.prop1).toEqual('test');
    });

    it('should execute an anonymous function', () => {
      const capitalizeProp1: stateFunc<MockState> = (state: MockState) => {
        state.prop1 = state.prop1.toLocaleUpperCase();
        return state;
      };

      const capitalizeSpy = jasmine.createSpy().and.callFake(capitalizeProp1);
      mockStore.updateProp1('test');
      mockStore.updateUsingAFunction(capitalizeSpy);

      expect(capitalizeSpy).toHaveBeenCalled();
      expect(mockStore.currentState.prop1).toEqual('TEST');
    });

    it('should execute an anonymous function on a slice of data', () => {
      const updateUser: stateFunc<MockState> = (state: MockState) => {
        if (!state) { 
          state = { prop1: null, prop2: null, user: null, users: null } ;
        }
        state.user = { name: 'fred' };
        return { user: state.user };
      };

      const updateUserSpy = jasmine.createSpy().and.callFake(updateUser);

      mockStore.updateUsingAFunction(updateUserSpy);

      expect(updateUserSpy).toHaveBeenCalled();
      expect(mockStore.currentState.user.name).toEqual('fred');
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

    // deprecated
    // we will skip 1 to account for the initial BehaviorSubject<T> value
    it('should receive state notification when includeStateChangesOnSubscribe set [deprecated]', () => {
      let mockStore = new MockStore({ includeStateChangesOnSubscribe: true });
      let receivedData;
      const sub = mockStore.stateChanged.pipe(skip(1)).subscribe(stateWithChanges => receivedData = stateWithChanges);

      mockStore.updateProp1('test');

      expect(receivedData.state.prop1).toEqual('test');
      expect(receivedData.stateChanges.prop1).toEqual('test');
      sub.unsubscribe();
    });

    // we will skip 1 to account for the initial BehaviorSubject<T> value
    it('should receive notification from stateChangedWithChanges', () => {
      let mockStore = new MockStore({});
      let receivedData: StateWithPropertyChanges<MockState>;
      const sub = mockStore.stateWithPropertyChanges.pipe(skip(1)).subscribe(stateWithChanges => {
        receivedData = stateWithChanges;
      });

      mockStore.updateProp1('test');

      expect(receivedData.state.prop1).toEqual('test');
      expect(receivedData.stateChanges.prop1).toEqual('test');
      sub.unsubscribe();
    });

    // we will skip 1 to account for the initial BehaviorSubject<T> value
    it('should receive notification from globalStateChanged', () => {
      let mockStore = new MockStore({});
      let receivedData = [];
      const sub = mockStore.globalStateChanged.pipe(skip(1)).subscribe(state => {
        receivedData.push(state);
      });

      mockStore.updateProp1('test');
      expect(receivedData.length).toEqual(1);
      expect(receivedData[0].prop1).toEqual('test');
      sub.unsubscribe();
    });

    // we will skip 1 to account for the initial BehaviorSubject<T> value
    it('should receive notification from globalStateChangedWithChanges', () => {
      let mockStore = new MockStore({});
      let receivedData: StateWithPropertyChanges<MockState>;
      const sub = mockStore.globalStateWithPropertyChanges.pipe(skip(1)).subscribe(stateWithChanges => {
        receivedData = stateWithChanges;
      });

      mockStore.updateProp1('test');

      expect(receivedData.state.prop1).toEqual('test');
      expect(receivedData.stateChanges.prop1).toEqual('test');
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

    userStore = new UserStore({
      stateSliceSelector: state => {
        if (state) {
          return { user: state.user };
        }
      }
    });

    it('should only have MockUser when requesting state', () => {
      userStore.updateUser({ name: 'foo', address: { city: 'Phoenix', state: 'AZ', zip: 85349 } });

      const state = userStore.currentState;

      expect(state.prop1).toBeFalsy();
      expect(state.prop2).toBeFalsy();
      // although the state is populated, slice will only populate the User
      expect(state.user).toBeTruthy();
    });

  });

  describe('Deep Clone', () => {
    // Custom setting that can be used to allow globalSettings to be passed
    // more than once

    it('should be deep clone when not production', () => {
      ObservableStore.globalSettings = { isProduction: false }; // will deep clone while in dev
      userStore.updateUser(user);
      user.address.city = 'Las Vegas';
      expect(userStore.currentState.user.address.city).toEqual('Phoenix');
    });

    it('should not deep clone when production', () => {
      ObservableStore.globalSettings = { isProduction: true }; // will not deep clone because not in dev
      userStore.updateUser(user);
      user.address.city = 'Las Vegas';
      expect(userStore.currentState.user.address.city).toEqual('Las Vegas');
    });

    it('should be deep clone with matching number of keys', () => {
      ObservableStore.globalSettings = { isProduction: false }; // will deep clone while in dev
      userStore.updateUser(user);
      userStore.addToUsers(user);
      console.log(userStore.currentState);
      const stateKeys = Object.getOwnPropertyNames(userStore.currentState);
      expect(stateKeys.length).toEqual(2);
    });

    it('should deep clone multiple items when not production', () => {
      ObservableStore.globalSettings = { isProduction: false }; // will deep clone while in dev
      for (let i=0;i<10;i++) {
        userStore.addToUsers(user);
      }
      expect(userStore.currentState.users.length).toEqual(10);
    });

  });

  describe('globalSettings', () => {
    it('should store global settings', () => {
      ObservableStore.globalSettings = { trackStateHistory: true, isProduction: true };
      const settingsKeys = Object.getOwnPropertyNames(ObservableStore.globalSettings);
      expect(settingsKeys.length).toEqual(2);
    });

    it('should error when no global settings passed', () => {
      try {
        ObservableStore.globalSettings = null;
      }
      catch (e) {
        expect(e.message).toEqual('Please provide the global settings you would like to apply to Observable Store');
      }
    });

    it('should set initial state', () => {
      ObservableStore.initializeState({ user: { name: 'Fred' } });
      const state = userStore.currentState;
      expect(state.user.name).toEqual('Fred');
    });

    it('should error when setting initial state and state already exists', () => {
      // Update store state
      mockStore.updateProp1();
      try {
        // Try to initialize state (should throw)
        ObservableStore.initializeState({ user: { name: 'Fred' } });
      }
      catch (e) {
        expect(e.message).toEqual('The store state has already been initialized. initializeStoreState() can ' +
                                  'only be called once BEFORE any store state has been set.');
      }

    });

    it('should error when global settings passed more than once', () => {
      ObservableStore.globalSettings = { trackStateHistory: true };
      try {
        ObservableStore.globalSettings = { trackStateHistory: false };
      }
      catch (e) {
        expect(e.message).toEqual('Observable Store global settings may only be set once.');
      }
    });

  });

  describe('trackHistory', () => {

    it('should set trackHistory through global settings', () => {
      ObservableStore.globalSettings = { trackStateHistory: true };
      userStore = new UserStore(null);
      userStore.updateUser(user);
      userStore.updateUser(user);
      expect(userStore.stateHistory.length).toEqual(2);
    });

    it('should turn off trackHistory through global settings', () => {
      ObservableStore.globalSettings = { trackStateHistory: false };
      userStore = new UserStore(null);
      userStore.updateUser(user);
      userStore.updateUser(user);
      expect(userStore.stateHistory.length).toEqual(0);
    });

    it('should turn on trackHistory through settings', () => {
      ObservableStore.globalSettings = {};
      userStore = new UserStore({ trackStateHistory: true });
      userStore.updateUser(user);
      userStore.updateUser(user);
      expect(userStore.stateHistory.length).toEqual(2);
    });

    it('should turn off trackHistory through settings', () => {
      ObservableStore.globalSettings = {};
      userStore = new UserStore({ trackStateHistory: false });
      userStore.updateUser(user);
      expect(userStore.stateHistory.length).toEqual(0);
    });
  });

});
