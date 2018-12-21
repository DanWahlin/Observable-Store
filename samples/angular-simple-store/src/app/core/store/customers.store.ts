import { Injectable } from '@angular/core';
import { of } from 'rxjs';

import { ObservableStore } from '../../../../../../src/observable-store';
import { Customer } from './customer';
import { SorterService } from '..//utilities/sorter.service';

export interface StoreState {
  customers: Customer[];
  customer: Customer;
}

@Injectable({
  providedIn: 'root'
})
export class CustomersStore extends ObservableStore<StoreState> {
  sorterService: SorterService;

  constructor(sorterService: SorterService) { 
    const initialState = {
      customers: [{
        id: Date.now(),
        name: 'Jane Doe',
        address: {
          street: '1234 Main St.',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85258'
        }
      }],
      customer: null
    }
    super(initialState, { trackStateHistory: true });
    this.sorterService = sorterService;
  }

  get() {
    const customers = this.getState().customers;
    if (customers) {
        return of(customers);
    }
    else {
        // call server and get data
        // assume async call here that returns observable
        return of(null);
    }
  }

  add(customer: Customer) {
    // insert via server API
    // if successful update store state
    let state = this.getState();
    state.customers.push(customer);
    this.setState({ customers: state.customers }, CustomersStoreActions.AddCustomer);
  }

  remove() {
    let state = this.getState();
    state.customers.splice(state.customers.length - 1, 1);
    this.setState({ customers: state.customers }, CustomersStoreActions.RemoveCustomer);
  }
  
  sort(property: string = 'id') {
    // let state = this.getState();
    // const sortedState = this.sorterService.sort(state.customers, property);
    // this.setState({ customers: sortedState }, CustomersStoreActions.SortCustomers);

    // could also pass a function to setState to grab the previous state 
    // and then update the current state
    this.setState(prevState => { 
      return { customers: this.sorterService.sort(prevState.customers, property) };
    }, CustomersStoreActions.SortCustomers);

    console.log(this.stateHistory);
  }

}

export interface StoreState {
  customers: Customer[];
  customer: Customer;
}

export enum CustomersStoreActions {
  AddCustomer = 'add_customer',
  RemoveCustomer = 'remove_customer',
  GetCustomers = 'get_customers',
  SortCustomers = 'sort_customers'
}
