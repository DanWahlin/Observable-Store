import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomersStore } from './core/stores/customers.store';
import { Customer } from './core/stores/customer';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  customers: Customer[] | Observable<Customer[]>;
  stateHistory = null;
  isHistoryVisible = false;
  subsink = new SubSink();

  constructor(private customersStore: CustomersStore) { }

  ngOnInit() {
    // Use Observable<Customer> if desired
    // this.customers$ = this.customersStore.stateChanged;

    // Can subscribe to stateChanged of store
    this.subsink.sink = this.customersStore.stateChanged.subscribe(state => {
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
    this.subsink.unsubscribe();
  }
}
