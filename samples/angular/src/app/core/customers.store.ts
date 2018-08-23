import { Injectable } from '@angular/core';

import { ObservableStore } from '../../../../../src/observable-store';
import { Customer } from './customer';
import { SorterService } from './utilities/sorter.service';

@Injectable()
export class CustomersStore extends ObservableStore<Customer[]> {
  sorterService: SorterService;

  constructor(sorterService: SorterService) { 
    let customer = {
      id: Date.now(),
      name: 'Jane Doe',
      address: {
        street: '1234 Main St.',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85258'
      }
    }
    super([customer], true);
    this.sorterService = sorterService;
  }

  addCustomer(cust: Customer) {
    // insert via server API
    // if successful update store state
    let custs = this.getState();
    custs.push(cust);
    this.setState('add', custs);
  }

  removeCustomer() {
    let custs = this.getState();
    custs.splice(custs.length - 1, 1);
    this.setState('remove', custs);
  }
  
  sortCustomers(property: string) {
    const sortedState = this.sorterService.sort(this.getState(), 'id');
    this.setState('sort', sortedState);
    console.log(this.stateHistory);
  }

}
