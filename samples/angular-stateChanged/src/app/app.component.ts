import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Customer, CustomersService, StoreState } from './core/customers.service';
import { StateWithPropertyChanges } from '@codewithdan/observable-store';
import { ChildComponent } from './child/child.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ChildComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  storeState$: Observable<StoreState> = new Observable<StoreState>();
  storeStateWithPropertyChanges$: Observable<StateWithPropertyChanges<StoreState>> = new Observable<StateWithPropertyChanges<StoreState>>();

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.storeState$ = this.customersService.stateChanged;
    this.storeStateWithPropertyChanges$ = this.customersService.stateWithPropertyChanges;
  }

  addCustomer() {
    const customer: Customer = {
      id: Date.now(),
      firstName: 'John',
      lastName: 'Doe'
    };
    this.customersService.addCustomer(customer);
  }

  updateCustomer(customer: Customer) {
    this.customersService.updateCustomer(customer);
  }
}
