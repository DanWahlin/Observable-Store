import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomersStore } from './core/customers.store';
import { AutoUnsubscribe } from './shared/auto-unsubscribe.decorator';
import { Customer } from './core/customer';
import { Observable } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // customers: Observable<Customer[]>;
  customers: Customer[];

  constructor(private customersStore: CustomersStore) { }

  ngOnInit() {
    // Use Observable<Customer> if desired
    // this.customers = this.customersService.storeStateChanged;

    this.customersStore.stateChanged.subscribe(custs => {
      this.customers = custs;
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
    this.customersStore.addCustomer(cust);
  }

  removeCustomer() {
    this.customersStore.removeCustomer();
  }

  sortCustomers() {
    this.customersStore.sortCustomers('id');
  }

  ngOnDestroy() {

  }
}
