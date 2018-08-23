import { ObservableStore } from '../../../../../src/observable-store';

export class CustomersStore extends ObservableStore {
  
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
  