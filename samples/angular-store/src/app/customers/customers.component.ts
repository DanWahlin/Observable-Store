import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { Customer } from '../shared/interfaces';
import { CustomersService } from '../core/services/customers.service';
import { CustomersListComponent } from './customers-list/customers-list.component';

@Component({
    selector: 'app-customers',
    imports: [CustomersListComponent],
    templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit, OnDestroy {
    title = '';
    customers: Customer[] = [];
    private sub = new Subscription();

    constructor(private customersService: CustomersService) { }

    ngOnInit() {
      this.title = 'Customers';

      this.sub.add(this.customersService.stateChanged.subscribe(state => {
        if (state) {
            console.log(this.customersService.stateHistory);
            this.customers = state.customers;
        }
      }));
      this.sub.add(this.customersService.getCustomers().subscribe());
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
