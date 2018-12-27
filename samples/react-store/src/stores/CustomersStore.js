import { ObservableStore } from '../stores/observable-store';

class CustomersStore extends ObservableStore {

    constructor() {
        super({ trackStateHistory: true });
    }

    fetchCustomers() {
        return fetch('/customers.json')
            .then(response => response.json())
            .then(customers => {
                this.setState({ customers }, CustomersStoreActions.GetCustomers);
                return customers;
            });
    }

    // Set state in the store by calling setState(stateObject, action). 
    // If you want to access the previous state you can also call 
    // setState((prevState) => stateObject, action) rather than calling getState()
    // first before calling setState().
    getCustomers() {
        let state = this.getState();
        // pull from store cache
        if (state && state.customers) {
            return this.createPromise(null, state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchCustomers();
        }
    }

    getCustomer(id) {
        return this.getCustomers()
            .then(custs => {
                let filteredCusts = custs.filter(cust => cust.id === id);
                const customer = (filteredCusts && filteredCusts.length) ? filteredCusts[0] : null;                
                this.setState({ customer }, CustomersStoreActions.GetCustomer);
                return customer;
            });
    }

    createPromise(err, result) {
        return new Promise((resolve, reject) => {
            return err ? reject(err) : resolve(result);
        });
    }
}

const CustomersStoreActions = {
    GetCustomers: 'get_customers',
    GetCustomer: 'get_customer'
};

export default new CustomersStore();