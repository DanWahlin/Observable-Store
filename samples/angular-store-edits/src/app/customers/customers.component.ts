import { Component, OnInit } from '@angular/core';

import { Customer } from '../core/model/customer';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomersService } from './customers.service';

@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit {
    title = 'Customers';
    customers$: Observable<Customer[]>;

    constructor(private customersService: CustomersService) {}

    ngOnInit() {
        // Capture any changes to the store (useful when using Redux Devtools timeline in this case)
        this.customersService.stateChanged.pipe(
            map(state => {
                if (state) {
                    this.customers$ = of(state.customers);
                }
            })
        ).subscribe();
        this.getCustomers();
    }

    getCustomers() {
        this.customers$ = this.customersService.getAll();
    }

}
