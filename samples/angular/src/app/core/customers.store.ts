import { Injectable } from '@angular/core';

import { ObservableStore } from '../../../../../src/observable-store';
import { Customer } from './customer';
import { SorterService } from './utilities/sorter.service';
import { ICustomerStoreState } from './interfaces';

@Injectable()
export class CustomersStore extends ObservableStore<ICustomerStoreState> {
  sorterService: SorterService;

  constructor(sorterService: SorterService) { 
    const customer = {
      id: Date.now(),
      name: 'Jane Doe',
      address: {
        street: '1234 Main St.',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85258'
      }
    };
    const initialState = {
      customers: [customer],
      customer: null
    }
    super(initialState, true);
    this.sorterService = sorterService;
  }

  addCustomer(customer: Customer) {
    // insert via server API
    // if successful update store state
    let state = this.getState();
    state.customers.push(customer);
    this.setState('add', {
      customers: state.customers
    });
  }

  removeCustomer() {
    let state = this.getState();
    state.customers.splice(state.customers.length - 1, 1);
    this.setState('remove', {
      customers: state.customers
    });
  }
  
  sortCustomers(property: string) {
    let state = this.getState();
    const sortedState = this.sorterService.sort(state.customers, 'id');
    this.setState('sort', {
      customers: sortedState
    });
    console.log(this.stateHistory);
  }

}
