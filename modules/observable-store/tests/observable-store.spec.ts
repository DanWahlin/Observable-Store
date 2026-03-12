import { describe, it, expect, beforeEach, vi } from 'vitest';
import { skip } from 'rxjs/operators';
import { ObservableStore, stateFunc } from '../observable-store';
import { StateWithPropertyChanges } from '../interfaces';
import { MockStore, UserStore, MockState, getUser, MockUser } from './mocks';

let mockStore: any = null;
let userStore: any = null;

beforeEach(() => {
  ObservableStore['isTesting'] = true;
  mockStore = new MockStore({ trackStateHistory: true });
  userStore = new UserStore(null);
  // Clear all existing store state
  ObservableStore.clearState(null);
});

describe('Observable Store', () => {

  describe('Changing state', () => {

    it('should change a single property', () => {
      mockStore.updateProp1('test');
      expect(mockStore.currentState.prop1).toEqual('test');
    });

    it('should reset the store state', () => {
      let newState = { prop1: 'reset prop1 state', prop2: null, user: { name: 'reset user state' }, users: null };
      mockStore.updateProp1('test');
      ObservableStore.resetState(newState);
      expect(mockStore.currentState.prop1).toEqual('reset prop1 state');
      expect(mockStore.currentState.user.name).toEqual('reset user state');
      expect(userStore.currentState.prop1).toEqual('reset prop1 state');
      expect(userStore.currentState.user.name).toEqual('reset user state');
    });

    it('should clear the store state', () => {
      let newState = { prop1: 'reset prop1 state', prop2: null, user: 'reset user state', users: null };
      mockStore.updateProp1('test');
      ObservableStore.resetState(newState);
      ObservableStore.clearState();
      expect(mockStore.currentState).toBeNull();
      expect(userStore.currentState).toBeNull();
    });

    it('should execute an anonymous function', () => {
      const capitalizeProp1: stateFunc<MockState> = (state: MockState) => {
        state.prop1 = state.prop1.toLocaleUpperCase();
        return state;
      };

      const capitalizeSpy = vi.fn().mockImplementation(capitalizeProp1);
      mockStore.updateProp1('test');
      mockStore.updateUsingAFunction(capitalizeSpy);

      expect(capitalizeSpy).toHaveBeenCalled();
      expect(mockStore.currentState.prop1).toEqual('TEST');
    });

    it('should execute an anonymous function on a slice of data', () => {
      const updateUser: stateFunc<MockState> = (state: MockState) => {
        if (!state) {
          state = { prop1: null, prop2: null, user: null, users: null };
        }
        state.user = { name: 'fred' };
        return { user: state.user };
      };

      const updateUserSpy = vi.fn().mockImplementation(updateUser);

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

    // we will skip 1 to account for the initial BehaviorSubject<T> value
    it('should receive notification when state has been reset', () => {
      let receivedUpdate = false;
      let receivedState = null;
      const sub = mockStore.stateChanged.pipe(skip(1)).subscribe((state) => {
        receivedUpdate = true;
        receivedState = state;
      });
      mockStore.updateProp1('initial state');
      ObservableStore.resetState({ prop1: 'state reset', prop2: null, user: null, users: null });

      expect(receivedUpdate).toBeTruthy();
      expect(receivedState.prop1).toEqual('state reset');
      expect(receivedState.prop2).toBe(null);
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

  describe('getStateProperty', () => {

    it('should retrieve single user property when string property name passed', () => {
      userStore.setState({ user: getUser() });
      expect(userStore.currentState.user).toBeTruthy();
      let state = userStore.getStateProperty('user');
      expect(state.name).toBeTruthy();
      expect(state.users).toBeUndefined();
    });

  });

  describe('getStateSliceProperty', () => {

    it('should retrieve single user property from slice when string property name passed', () => {
      userStore = new UserStore({
        stateSliceSelector: state => {
          if (state) {
            return { ...state.user };
          }
        }
      });
      userStore.setState({ user: getUser() });
      expect(userStore.currentState).toBeTruthy();
      let userName = userStore.getStateSliceProperty('name');
      expect(userName).toBeTruthy();
    });

  });

  describe('SliceSelector', () => {

    it('should only have MockUser when requesting state', () => {
      userStore = new UserStore({
        stateSliceSelector: state => {
          if (state) {
            return { user: state.user };
          }
        }
      });

      userStore.updateUser({ name: 'foo', address: { city: 'Phoenix', state: 'AZ', zip: 85349 } });

      const state = userStore.currentState;

      expect(state.prop1).toBeFalsy();
      expect(state.prop2).toBeFalsy();
      // although the state is populated, slice will only populate the User
      expect(state.user).toBeTruthy();
    });

  });

  describe('Cloning', () => {
    let user = null;

    beforeEach(() => {
      user = getUser();
    });

    it('should clone Map object added to store', () => {
      let map = new Map();
      map.set('key1', 22);
      map.set('key2', 32);
      userStore.updateMap(map);
      let state = userStore.getCurrentState();
      expect(map).toBe(map);
      expect(state.map).not.toBe(map);
      expect(state.map.size).toEqual(map.size);
    });

    it('should deep clone when setState called', () => {
      userStore.updateUser(user);
      user.address.city = 'Las Vegas';
      expect(userStore.currentState.user.address.city).not.toEqual('Las Vegas');
    });

    it('should NOT deep clone when setState called', () => {
      userStore.updateUser(user, false); // don't clone when setting state
      user.address.city = 'Las Vegas';
      expect(userStore.currentState.user.address.city).toEqual('Las Vegas');
    });

    it('should NOT deep clone when setState or getState called', () => {
      // Set state but don't clone
      userStore.updateUser(user, false);
      // Get state but don't clone
      let nonClonedUserState = userStore.getCurrentState(false);
      // Update user which should also update store
      nonClonedUserState.user.address.city = 'Las Vegas';
      // Ensure user was updated by reference
      expect(userStore.currentState.user.address.city).toEqual('Las Vegas');
    });

    it('should deep clone when setState or getState called', () => {
      // Set state but don't clone
      userStore.updateUser(user);
      let clonedUserState = userStore.getCurrentState();
      clonedUserState.user.address.city = 'Las Vegas';
      expect(userStore.currentState.user.address.city).not.toEqual('Las Vegas');
    });

    it('should deep clone array', () => {
      userStore.addToUsers(user);
      let users = userStore.getCurrentState().users;
      // Should NOT affect store users array since it would be cloned
      users.push({ name: 'user2', address: { city: 'Chandler', state: 'AZ', zip: 85249 } });
      expect(users.length).toEqual(2);
      expect(userStore.currentState.users.length).toEqual(1);
    });

    it('should NOT deep clone array', () => {
      userStore.addToUsers(user, false);
      let users = userStore.getCurrentState(false).users;
      users.push({ name: 'user2', address: { city: 'Chandler', state: 'AZ', zip: 85249 } });
      expect(userStore.currentState.users.length).toEqual(2);
    });

    it('should deep clone with matching number of keys', () => {
      userStore.updateUser(user);
      userStore.addToUsers(user);
      const stateKeys = Object.getOwnPropertyNames(userStore.currentState);
      expect(stateKeys.length).toEqual(2);
    });

    it('should NOT deep clone but have matching number of keys', () => {
      userStore.updateUser(user, false);
      userStore.addToUsers(user, false);
      const stateKeys = Object.getOwnPropertyNames(userStore.currentState);
      expect(stateKeys.length).toEqual(2);
    });

  });

  describe('globalSettings', () => {

    it('should store global settings', () => {
      ObservableStore.globalSettings = { trackStateHistory: true };
      const settingsKeys = Object.getOwnPropertyNames(ObservableStore.globalSettings);
      expect(settingsKeys.length).toEqual(1);
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

    let user = null;

    beforeEach(() => {
      user = getUser();
    });

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

  describe('destroy', () => {

    it('should remove service from allStoreServices when destroyed', () => {
      const servicesBefore = ObservableStore.allStoreServices.length;
      const tempStore = new MockStore({});
      expect(ObservableStore.allStoreServices.length).toEqual(servicesBefore + 1);

      tempStore.destroy();
      expect(ObservableStore.allStoreServices.length).toEqual(servicesBefore);
    });

    it('should complete state dispatchers on destroy', () => {
      const tempStore = new MockStore({});
      let completed = false;
      tempStore.stateChanged.subscribe({
        complete: () => { completed = true; }
      });

      tempStore.destroy();
      expect(completed).toBe(true);
    });

    it('should complete stateWithPropertyChanges on destroy', () => {
      const tempStore = new MockStore({});
      let completed = false;
      tempStore.stateWithPropertyChanges.subscribe({
        complete: () => { completed = true; }
      });

      tempStore.destroy();
      expect(completed).toBe(true);
    });

    it('should handle double destroy without error', () => {
      const tempStore = new MockStore({});
      tempStore.destroy();
      // Second destroy should not throw
      expect(() => tempStore.destroy()).not.toThrow();
    });

    it('should not remove other services when one is destroyed', () => {
      const servicesBefore = ObservableStore.allStoreServices.length;
      const store1 = new MockStore({});
      const store2 = new MockStore({});
      expect(ObservableStore.allStoreServices.length).toEqual(servicesBefore + 2);

      store1.destroy();
      expect(ObservableStore.allStoreServices.length).toEqual(servicesBefore + 1);
      expect(ObservableStore.allStoreServices).toContain(store2);

      store2.destroy();
    });

  });

  describe('dispatchState', () => {

    it('should NOT dispatch to subscribers when dispatchState is false on setState', () => {
      let receivedCount = 0;
      const sub = mockStore.stateChanged.pipe(skip(1)).subscribe(() => receivedCount++);

      mockStore.updateProp1WithDispatch('test', false);

      expect(receivedCount).toEqual(0);
      // But state should still be updated
      expect(mockStore.currentState.prop1).toEqual('test');
      sub.unsubscribe();
    });

    it('should NOT dispatch global state when dispatchGlobalState is false', () => {
      let globalReceived = 0;
      let localReceived = 0;
      const globalSub = mockStore.globalStateChanged.pipe(skip(1)).subscribe(() => globalReceived++);
      const localSub = mockStore.stateChanged.pipe(skip(1)).subscribe(() => localReceived++);

      // Dispatch locally but not globally
      mockStore.updateProp1('test');
      mockStore.dispatch({ prop1: 'dispatched' }, false);

      // Local should get the dispatch, global should only get the setState one
      expect(localReceived).toBeGreaterThanOrEqual(1);
      expect(globalReceived).toEqual(1); // Only from the setState, not the manual dispatch
      globalSub.unsubscribe();
      localSub.unsubscribe();
    });

  });

  describe('logStateAction', () => {

    it('should add custom action to state history', () => {
      const historyBefore = mockStore.stateHistory.length;
      mockStore.updateProp1('test');
      mockStore.logAction({ custom: 'data' }, 'Custom_Action');

      const lastEntry = mockStore.stateHistory[mockStore.stateHistory.length - 1];
      expect(mockStore.stateHistory.length).toEqual(historyBefore + 2); // setState + logAction
      expect(lastEntry.action).toEqual('Custom_Action');
    });

    it('should not add to history when trackStateHistory is false', () => {
      const noTrackStore = new MockStore({ trackStateHistory: false });
      noTrackStore.logAction({ data: 'test' }, 'Action');
      // stateHistory is global, so check it didn't add
      const hasAction = mockStore.stateHistory.some(h => h.action === 'Action');
      expect(hasAction).toBe(false);
      noTrackStore.destroy();
    });

    it('should deep clone the state in the logged action', () => {
      const data = { nested: { value: 'original' } };
      mockStore.logAction(data, 'Clone_Test');
      data.nested.value = 'mutated';

      const lastEntry = mockStore.stateHistory[mockStore.stateHistory.length - 1];
      expect(lastEntry.endState.nested.value).toEqual('original');
    });

  });

  describe('resetStateHistory', () => {

    it('should clear all state history entries', () => {
      mockStore.updateProp1('test1');
      mockStore.updateProp1('test2');
      expect(mockStore.stateHistory.length).toBeGreaterThan(0);

      mockStore.clearHistory();
      expect(mockStore.stateHistory.length).toEqual(0);
    });

    it('should allow new history entries after reset', () => {
      mockStore.updateProp1('test1');
      mockStore.clearHistory();
      mockStore.updateProp1('test2');
      expect(mockStore.stateHistory.length).toEqual(1);
      expect(mockStore.stateHistory[0].action).toEqual('Update_Prop1');
    });

  });

  describe('logStateChanges', () => {

    it('should log state changes to console when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logStore = new MockStore({ logStateChanges: true });

      logStore.updateProp1('logged');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      // console.log('%cSTATE CHANGED', 'font-weight: bold', '\r\nAction: ', action, caller, '\r\nState: ', state)
      const args = consoleSpy.mock.calls[0];
      expect(args[0]).toEqual('%cSTATE CHANGED');
      expect(args[1]).toEqual('font-weight: bold');
      expect(args).toContain('Update_Prop1');
      consoleSpy.mockRestore();
      logStore.destroy();
    });

    it('should NOT log state changes to console when disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const noLogStore = new MockStore({ logStateChanges: false });

      noLogStore.updateProp1('not-logged');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
      noLogStore.destroy();
    });

  });

  describe('Extensions', () => {

    it('should call init() when extension is added', () => {
      const mockExtension = { init: vi.fn() };
      ObservableStore.addExtension(mockExtension);
      expect(mockExtension.init).toHaveBeenCalledTimes(1);
    });

    it('should track all store services via allStoreServices', () => {
      const servicesBefore = ObservableStore.allStoreServices.length;
      const store1 = new MockStore({});
      const store2 = new MockStore({});

      expect(ObservableStore.allStoreServices.length).toEqual(servicesBefore + 2);
      expect(ObservableStore.allStoreServices).toContain(store1);
      expect(ObservableStore.allStoreServices).toContain(store2);

      store1.destroy();
      store2.destroy();
    });

  });

  describe('Multiple services sharing state', () => {

    it('should notify Service B via globalStateChanged when Service A sets state', () => {
      let receivedState = null;
      const storeA = new MockStore({});
      const storeB = new MockStore({});

      const sub = storeB.globalStateChanged.pipe(skip(1)).subscribe(state => {
        receivedState = state;
      });

      storeA.updateProp1('from-A');

      expect(receivedState).not.toBeNull();
      expect(receivedState.prop1).toEqual('from-A');

      sub.unsubscribe();
      storeA.destroy();
      storeB.destroy();
    });

    it('should give different views via stateSliceSelector on different services', () => {
      const userSliceStore = new UserStore({
        stateSliceSelector: state => {
          if (state) return { user: state.user };
          return null;
        }
      });

      // Set both prop1 and user
      mockStore.updateProp1('test');
      userSliceStore.updateUser({ name: 'Dan', address: { city: 'Phoenix', state: 'AZ', zip: 85349 } });

      // mockStore sees everything
      expect(mockStore.currentState.prop1).toEqual('test');
      expect(mockStore.currentState.user.name).toEqual('Dan');

      // userSliceStore only sees user slice
      const sliceState = userSliceStore.currentState;
      expect(sliceState.user.name).toEqual('Dan');
      expect(sliceState.prop1).toBeUndefined();

      userSliceStore.destroy();
    });

  });

  describe('getStateProperty edge cases', () => {

    it('should return null for non-existent property name', () => {
      userStore.updateUser(getUser());
      const result = userStore.getProperty('nonExistentProp');
      expect(result).toBeNull();
    });

    it('should return the property value without cloning when deepClone is false', () => {
      const user = getUser();
      userStore.updateUser(user, false);
      const userRef1 = userStore.getProperty('user', false);
      const userRef2 = userStore.getProperty('user', false);
      // Without cloning, should be the same reference
      expect(userRef1).toBe(userRef2);
    });

  });

  describe('getStateSliceProperty', () => {

    it('should return null when no stateSliceSelector is set', () => {
      userStore.updateUser(getUser());
      const result = userStore.getSliceProperty('name');
      expect(result).toBeNull();
    });

    it('should return property from slice when stateSliceSelector is set', () => {
      const sliceStore = new UserStore({
        stateSliceSelector: state => {
          if (state) return { ...state.user };
          return null;
        }
      });
      sliceStore.updateUser({ name: 'Dan', address: { city: 'Phoenix', state: 'AZ', zip: 85349 } });
      const name = sliceStore.getSliceProperty('name');
      expect(name).toEqual('Dan');
      sliceStore.destroy();
    });

    it('should return null for non-existent property in slice', () => {
      const sliceStore = new UserStore({
        stateSliceSelector: state => {
          if (state) return { ...state.user };
          return null;
        }
      });
      sliceStore.updateUser({ name: 'Dan', address: { city: 'Phoenix', state: 'AZ', zip: 85349 } });
      const result = sliceStore.getSliceProperty('nonExistent');
      expect(result).toBeNull();
      sliceStore.destroy();
    });

  });

  describe('setState error handling', () => {

    it('should throw when setState is called with a string', () => {
      expect(() => mockStore.setStateRaw('invalid')).toThrow(
        'Pass an object or a function for the state parameter when calling setState().'
      );
    });

    it('should throw when setState is called with a number', () => {
      expect(() => mockStore.setStateRaw(42)).toThrow(
        'Pass an object or a function for the state parameter when calling setState().'
      );
    });

    it('should throw when setState is called with a boolean', () => {
      expect(() => mockStore.setStateRaw(true)).toThrow(
        'Pass an object or a function for the state parameter when calling setState().'
      );
    });

  });

  describe('State history correctness', () => {

    it('should record beginState and endState correctly', () => {
      mockStore.updateProp1('first');
      mockStore.updateProp1('second');

      const history = mockStore.stateHistory;
      expect(history.length).toEqual(2);

      // First entry: beginState is null/empty, endState has 'first'
      expect(history[0].endState.prop1).toEqual('first');

      // Second entry: beginState has 'first', endState has 'second'
      expect(history[1].beginState.prop1).toEqual('first');
      expect(history[1].endState.prop1).toEqual('second');
    });

    it('should deep clone beginState so mutations do not affect history', () => {
      mockStore.updateProp1('original');
      mockStore.updateProp1('changed');

      // The beginState of the second entry should still be 'original'
      const beginState = mockStore.stateHistory[1].beginState;
      expect(beginState.prop1).toEqual('original');
    });

  });

  describe('isInitialized', () => {
    it('should return false when ObservableStore state has not yet been initialized', () => {
      expect(ObservableStore.isStoreInitialized).toEqual(false);
    });

    it('should return true when ObservableStore state has been initialized', () => {
      const state = {
        number: 420,
        awesome: false,
      }
      expect(ObservableStore.isStoreInitialized).toEqual(false);
      ObservableStore.initializeState(state);
      expect(ObservableStore.isStoreInitialized).toEqual(true);
    });

    it('should return false after the ObservableStore state has been initialized and then reset', () => {
      const state = {
        number: 69,
        awesome: true,
      }
      ObservableStore.initializeState(state);
      ObservableStore.clearState();
      expect(ObservableStore.isStoreInitialized).toEqual(false);
    });
  });

});
