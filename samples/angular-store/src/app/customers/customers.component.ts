import { Component, OnInit, OnDestroy } from '@angular/core';

import { SubSink } from 'subsink';
import { Customer } from '../shared/interfaces';
import { CustomersService } from '../core/services/customers.service';
import { AppStore } from '../core/store/app.store';

@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit, OnDestroy {
    title: string;
    customers: Customer[];
    subsink = new SubSink();

    constructor(private customersService: CustomersService, private store: AppStore) { }

    ngOnInit() {
      this.title = 'Customers';

      // Option 1: Subscribe to store stateChanged
      // Useful when a component needs to be notified of changes but won't always
      // call store directly.
      this.subsink.sink = this.store.stateChanged.subscribe(state => {
        if (state) {
            this.customers = state.customers;
        }
      });
      this.subsink.sink = this.customersService.getCustomers().subscribe();

      // Option 2: Retrieve data directly from store
      // this.subsink.sink = this.customersStore.getCustomers()
      //   .subscribe((customers: ICustomer[]) => this.customers = customers);
    }

    ngOnDestroy() {
        this.subsink.unsubscribe();
     }

}
