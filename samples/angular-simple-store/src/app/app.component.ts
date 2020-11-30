import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomersService } from './core/store/customers.service';
import { Customer } from './core/store/customer';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  customers: Customer[] | Observable<Customer[]>;
  stateHistory = null;
  isHistoryVisible = false;
  subs = new Subscription();

  constructor(private customersService: CustomersService) {  }

  ngOnInit() {
    // Use Observable<Customer> if desired
    // this.customers$ = this.customersStore.stateChanged;

    // Can subscribe to stateChanged of store
    // Will fire state changes caused by only this service
    this.subs.add(this.customersService.stateChanged.subscribe(stateChange => {
      if (stateChange && stateChange.state) {
        this.customers = stateChange.state.customers;
      }
    }));

    // Can subscribe to globalStateChanged
    // Will fire ANY state changes made by ANY service to the store. In other words,
    // when the store is changed by anything this will send a notification to subscribers.
    // this.subs.add(this.customersService.globalStateChanged.subscribe(state => {
    //   if (state && state.customers) {
    //     this.customers = state.customers;
    //   }
    // }));

    // Can call service/store to get data directly (won't fire when the store state changes)
    // this.storeSub = this.customersStore.get().subscribe(custs => this.customers = custs);
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
    this.customersService.add(cust);
  }

  removeCustomer() {
    this.customersService.remove();
  }

  sortCustomers() {
    this.customersService.sort('id');
  }

  viewStateHistory() {
    this.isHistoryVisible = !this.isHistoryVisible;
    this.stateHistory = this.customersService.stateHistory;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
