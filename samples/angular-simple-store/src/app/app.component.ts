import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersService, StoreState } from './core/store/customers.service';
import { Customer } from './core/store/customer';
import { Subscription } from 'rxjs';
import { StateHistory } from '@codewithdan/observable-store';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  customers: Customer[] | null = [];
  stateHistory: StateHistory<StoreState>[] = [];
  isHistoryVisible = false;
  subs = new Subscription();

  constructor(private customersService: CustomersService) {  }

  ngOnInit() {
    this.subs.add(this.customersService.stateChanged.subscribe(state => {
      if (state) {
        this.customers = state.customers;
      }
    }));
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
