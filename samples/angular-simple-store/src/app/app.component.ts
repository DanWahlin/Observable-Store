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
  stateHistory = null;
  isHistoryVisible = false;
  storeSub: Subscription;

  constructor(private customersStore: CustomersStore) { }

  ngOnInit() {
    // Use Observable<Customer> if desired
    // this.customers = this.customersService.stateChanged;

    // Can subscribe to stateChanged of store
    this.storeSub = this.customersStore.stateChanged.subscribe(state => {
      this.customers = state.customers;
    });

    // Can call service/store to get data directly (won't fire when the store state changes)
    //this.storeSub = this.customersStore.get().subscribe(custs => this.customers = custs);
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

  viewStateHistory() {
    this.isHistoryVisible = !this.isHistoryVisible;
    this.stateHistory = this.customersStore.stateHistory;
  }

  ngOnDestroy() {
    // Not needed since we're using the AutoUnsubscribe decorator above the class
    // if (this.storeSub) {
    //   this.storeSub.unsubscribe();
    // }
  }
}
