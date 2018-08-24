import { ObservableStore } from './observable-store';

export class CustomersStore extends ObservableStore {

    static instance = new CustomersStore();

    constructor() {
        super(null, true);
    }

    getCustomers() {
        fetch('./customers.json')
            .then(response => response.json())
            .then(customers => {
                this.setState('get_customers', customers);
            });
    }
}