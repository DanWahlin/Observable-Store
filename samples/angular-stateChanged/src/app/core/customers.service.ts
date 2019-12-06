import { Injectable } from '@angular/core';
import { ObservableStore } from '@codewithdan/observable-store';
import { of } from 'rxjs';

export interface StoreState {
  customers: Customer[];
  selectedCustomer: Customer;
  countries: Country[];
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Country {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomersService extends ObservableStore<StoreState> {

  constructor() { 
    super({ logStateChanges: true, trackStateHistory: true });

    const initialState = {
      customers: [{
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe'
      }],
      countries: [
        { id: 1, name: 'Arizona' },
        { id: 2, name: 'California' }
      ]
    }
    this.setState(initialState, 'INITIALIZE_STORE');
  }

  getCustomers() {
    return of(this.getState().customers);
  }

  addCustomer(customer: Customer) {
    let customers = this.getState().customers;
    customers.push(customer);
    this.setState({ customers }, 'ADD_CUSTOMER');
  }

  updateCustomer(customer: Customer) {
    let customers = this.getState().customers;
    customer.firstName = customer.firstName + ' Updated!!!';
    customers = customers.map(c => {
      if (c.id === customer.id) {
        return customer;
      }
      return c;
     });
    this.setState({ customers }, 'UPDATE_CUSTOMER');
  }

}
