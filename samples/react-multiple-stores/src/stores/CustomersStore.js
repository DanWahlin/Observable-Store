import { ObservableStore } from '../stores/observable-store';

export class CustomersStore extends ObservableStore {

    static instance = new CustomersStore();

    constructor() {
        super(null, { trackStateHistory: true });
    }

    fetchCustomers() {
        return fetch('/customers.json')
            .then(response => response.json())
            .then(customers => customers);
    }

    getCustomers() {
        let state = this.getState();
        // pull from store cache
        if (state && state.customers) {
            return this.createPromise(null, state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchCustomers()
                       .then(customers => {
                            this.setState(CustomersStoreActions.GetCustomers, {
                                customers: customers
                            });
                            return this.getState().customers;
                       })
        }
    }

    getCustomer(id) {
        return this.getCustomers()
            .then(custs => {
                let filteredCusts = custs.filter(cust => cust.id === id);
                const customer = (filteredCusts && filteredCusts.length) ? filteredCusts[0] : null;                
                this.setState(CustomersStoreActions.GetCustomer, {
                    customer: customer
                });
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
    GetCustomers: 'get_customer'
};