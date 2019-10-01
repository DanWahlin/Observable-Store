var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var operators_1 = require("rxjs/operators");
var observable_store_1 = require("./observable-store");
var Update_Prop1 = 'Update_Prop1';
var MockStore = /** @class */ (function (_super) {
    __extends(MockStore, _super);
    function MockStore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MockStore.prototype.updateProp1 = function (value) {
        this.setState({ prop1: value }, Update_Prop1);
    };
    MockStore.prototype.updateForTestAction = function (value, action) {
        this.setState({ prop1: value }, action);
    };
    MockStore.prototype.updateUsingAFunction = function (func) {
        this.setState(function (prevState) {
            return func(prevState);
        });
    };
    Object.defineProperty(MockStore.prototype, "currentState", {
        get: function () {
            return this.getState();
        },
        enumerable: true,
        configurable: true
    });
    return MockStore;
}(observable_store_1.ObservableStore));
describe('Observable Store', function () {
    var mockStore = new MockStore({ trackStateHistory: true });
    describe('Changing state', function () {
        it('should change a single property', function () {
            mockStore.updateProp1('test');
            expect(mockStore.currentState.prop1).toEqual('test');
        });
        it('should execute an anonymous function', function () {
            var capitalizeProp1 = function (state) {
                state.prop1 = state.prop1.toLocaleUpperCase();
                return state;
            };
            var capitalizeSpy = jasmine.createSpy().and.callFake(capitalizeProp1);
            mockStore.updateProp1('test');
            mockStore.updateUsingAFunction(capitalizeSpy);
            expect(capitalizeSpy).toHaveBeenCalled();
            expect(mockStore.currentState.prop1).toEqual('TEST');
        });
        it('should execute an anonymous function on a slice of data', function () {
            var updateUser = function (state) {
                state.user = { name: 'fred' };
                return { user: state.user };
            };
            var updateUserSpy = jasmine.createSpy().and.callFake(updateUser);
            mockStore.updateUsingAFunction(updateUserSpy);
            expect(updateUserSpy).toHaveBeenCalled();
            expect(mockStore.currentState.user.name).toEqual('fred');
        });
    });
    describe('Subscriptions', function () {
        // we will skip 1 to account for the initial BehaviorSubject<T> value
        it('should NOT receive notification if no state has changed', function () {
            var receiveUpdate = false;
            var sub = mockStore.stateChanged.pipe(operators_1.skip(1)).subscribe(function () { return (receiveUpdate = true); });
            expect(receiveUpdate).toBeFalsy();
            sub.unsubscribe();
        });
        // we will skip 1 to account for the initial BehaviorSubject<T> value
        it('should receive notification when state has been changed', function () {
            var receiveUpdate = false;
            var sub = mockStore.stateChanged.pipe(operators_1.skip(1)).subscribe(function () { return (receiveUpdate = true); });
            mockStore.updateProp1('test');
            expect(receiveUpdate).toBeTruthy();
            sub.unsubscribe();
        });
    });
    describe('Action', function () {
        it('should add valid action to stateHistory', function () {
            var mockAction = 'Mock_Action';
            mockStore.updateForTestAction('test', mockAction);
            expect(mockStore.stateHistory[mockStore.stateHistory.length - 1].action).toEqual(mockAction);
        });
    });
    describe('SliceSelector', function () {
        var UserStore = /** @class */ (function (_super) {
            __extends(UserStore, _super);
            function UserStore() {
                return _super.call(this, {
                    stateSliceSelector: function (state) {
                        // console.log('state constructor', state);
                        return { user: state.user };
                    }
                }) || this;
            }
            UserStore.prototype.updateUser = function (user) {
                this.setState({ user: user });
            };
            Object.defineProperty(UserStore.prototype, "currentState", {
                get: function () {
                    return this.getState();
                },
                enumerable: true,
                configurable: true
            });
            return UserStore;
        }(observable_store_1.ObservableStore));
        var userStore = new UserStore();
        it('should only have MockUser when requesting state', function () {
            userStore.updateUser({ name: 'foo' });
            var state = userStore.currentState;
            expect(state.prop1).toBeFalsy();
            expect(state.prop2).toBeFalsy();
            // although the state is populated, slice will only populate the User
            expect(state.user).toBeTruthy();
        });
    });
});
//# sourceMappingURL=observable-store.spec.js.map