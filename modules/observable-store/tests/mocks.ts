import { ObservableStore, stateFunc } from '../observable-store';
import { StateWithPropertyChanges } from '../interfaces';

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
}

export class MockStore extends ObservableStore<MockState> {
    updateProp1(value: string) {
        this.setState({ prop1: value }, Update_Prop1);
    }

    updateForTestAction(value: string, action: string) {
        this.setState({ prop1: value }, action);
    }

    updateUsingAFunction(func: stateFunc<MockState>) {
        this.setState(prevState => {
            return func(prevState);
        });
    }

    get currentState() {
        return this.getState();
    }
}

export let user = { name: 'foo', address: { city: 'Phoenix', state: 'AZ', zip: 85349 } };

export class UserStore extends ObservableStore<MockState> {
    constructor(settings) {
        super(settings);
        // this.setState(null, 'Initialize');
        this.resetStateHistory();
    }

    updateUser(user: MockUser) {
        this.setState({ user }, 'Update User');
    }

    addToUsers(user: MockUser) {
        const state = this.getState();
        let users = (state && state.users) ? state.users : [];
        users.push(user);
        this.setState({ users }, 'Update Users');
    }

    get currentState() {
        return this.getState();
    }
}