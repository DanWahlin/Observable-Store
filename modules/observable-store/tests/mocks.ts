import { ObservableStore, stateFunc } from '../observable-store';
import { StateWithPropertyChanges } from '../interfaces';
import { ClonerService } from '../utilities/cloner.service';

const Update_Prop1 = 'Update_Prop1';

export interface MockUser {
    name: string;
    address?: MockAddress;
}

export interface MockAddress {
    city: string;
    state: string;
    zip: number;
}

export interface MockState {
    prop1: string;
    prop2: string;
    user: MockUser;
    users: MockUser[];
    map?: Map<any, any>;
}

export class MockStore extends ObservableStore<MockState> {
    updateProp1(value: string, cloneState: boolean = true) {
        this.setState({ prop1: value }, Update_Prop1, cloneState);
    }

    updateForTestAction(value: string, action: string, cloneState: boolean = true) {
        this.setState({ prop1: value }, action, true, cloneState);
    }

    updateUsingAFunction(func: stateFunc<MockState>, cloneState: boolean = true) {
        this.setState(prevState => {
            return func(prevState);
        }, 'Update Using a Function', true, cloneState);
    }

    get currentState() {
        return this.getState();
    }
}

let user = { name: 'foo', address: { city: 'Phoenix', state: 'AZ', zip: 85349 } };
let cloner = new ClonerService();

export function getUser() {
    return cloner.deepClone(user);
}

export class UserStore extends ObservableStore<MockState> {
    constructor(settings) {
        super(settings);
        // this.setState(null, 'Initialize');
        this.resetStateHistory();
    }

    updateUser(user: MockUser, deepCloneState: boolean = true) {
        this.setState({ user }, 'Update User', true, deepCloneState);
    }

    updateMap(map: Map<any, any>, deepCloneState: boolean = true) {
        this.setState({ map }, 'Update Map', true, deepCloneState);
    }

    addToUsers(user: MockUser, deepCloneState: boolean = true) {
        const state = this.getState(deepCloneState);
        let users = (state && state.users) ? state.users : [];
        users.push(user);
        this.setState({ users }, 'Update Users', true, deepCloneState);
    }

    getCurrentState(deepCloneReturnedState: boolean = true) {
        return this.getState(deepCloneReturnedState);
    }

    get currentState() {
        return this.getState();
    }
}