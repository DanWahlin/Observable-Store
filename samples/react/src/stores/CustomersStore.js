import { ObservableStore } from '../stores/observable-store';

export class CustomersStore extends ObservableStore {

    static instance = new CustomersStore();

    constructor() {
        super(null, true);
    }

    fetchState() {
        return fetch('/customers.json')
            .then(response => response.json())
            .then(customers => {
                this.setState('fetch_customers', {
                    customers: customers
                });
                return this.getState();
            });
    }

    getCustomers() {
        let state = this.getState();
        // pull from store cache
        if (state && state.customers) {
            return this.createPromise(null, state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchState()
                       .then(state => {
                           return state.customers;
                       })
        }
    }

    getCustomer(id) {
        return this.getCustomers()
            .then(custs => {
                let filteredCusts = custs.filter(cust => cust.id === id);
                const customer = (filteredCusts && filteredCusts.length) ? filteredCusts[0] : null;                
                this.setState('get_customer', {
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