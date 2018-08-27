import { Component, OnInit, OnDestroy } from '@angular/core';

import { ICustomer } from '../shared/interfaces';
import { CustomersStore } from '../core/stores/customers.store';
import { AutoUnsubscribe } from '../shared/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

@AutoUnsubscribe()
@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit, OnDestroy {
    title: string;
    customers: ICustomer[];
    customersStateChangeSub: Subscription;
    customersStoreSub: Subscription;

    constructor(private customersStore: CustomersStore) { }

    ngOnInit() {
      this.title = 'Customers';

      // Option 1: Subscribe to store stateChanged
      // Useful when a component needs to be notified of changes but won't always
      // call store directly.
      this.customersStateChangeSub = this.customersStore.stateChanged.subscribe(state => {
        if (state) {
            this.customers = state.customers;
        }
      });
      this.customersStoreSub = this.customersStore.getCustomers().subscribe();

      // Option 2: Retrieve data directly from store
      // this.customersStoreSub = this.customersStore.getCustomers()
      //   .subscribe((customers: ICustomer[]) => this.customers = customers);
    }

    ngOnDestroy() {
        // Using @AutoUnsubscribe() decorator on class so these aren't required
        // if (this.customersStateChangeSub) {
        //     this.customersStateChangeSub.unsubscribe();
        // }

        // if (this.customersStoreSub) {
        //     this.customersStoreSub.unsubscribe();
        // }
     }

}
