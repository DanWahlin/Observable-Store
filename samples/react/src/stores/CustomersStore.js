import { ObservableStore } from './observable-store';

export class CustomersStore extends ObservableStore {

    static instance = new CustomersStore();

    constructor() {
        super(null, true);
    }

    getCustomers() {
        return fetch('./customers.json')
            .then(response => response.json())
            .then(customers => {
                this.setState('get_customers', customers);
                return customers;
            });
    }

    // getCustomerOrders(id) {
    //     const customers = this.getState();
    //     if (!customers) {

    //     }
    //     else {
    //         this.getCustomers()
    //             .then(custs => {
    //                 return this.getCustomer(id, custs);
    //             });
    //     }
    // }

    // getCustomer(id, customers) {
    //     return customers.filter(cust => cust.id === id);
    // }
}