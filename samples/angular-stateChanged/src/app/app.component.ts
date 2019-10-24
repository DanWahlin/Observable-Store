import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { Customer, CustomersService, StoreState } from './core/customers.service';
import { StateWithPropertyChanges } from '@codewithdan/observable-store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  storeState$: Observable<StoreState>;
  storeStateWithPropertyChanges$: Observable<StateWithPropertyChanges<StoreState>>;

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
