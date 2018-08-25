import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomersStore } from './core/stores/customers.store';
import { AutoUnsubscribe } from './shared/auto-unsubscribe.decorator';
import { Customer } from './core/stores/customer.model';
import { Subscription, Observable } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  customers: Customer[] | Observable<Customer[]>;
  storeSub: Subscription;

  constructor(private customersStore: CustomersStore) { }

  ngOnInit() {
    // Use Observable<Customer> if desired
    // this.customers = this.customersService.storeStateChanged;

    this.storeSub = this.customersStore.stateChanged.subscribe(state => {
      this.customers = state.customers;
    });
  }

  addCustomer() {
    const cust = { 
      id: Date.now(), 
      name: 'Fred', 
      address: {
        street: Date.now() + ' Main St.',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85258'
      }
    };
    this.customersStore.add(cust);
  }

  removeCustomer() {
    this.customersStore.remove();
  }

  sortCustomers() {
    this.customersStore.sort('id');
  }

  ngOnDestroy() {

  }
}
