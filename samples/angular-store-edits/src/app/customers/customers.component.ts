import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Customer } from '../core/model/customer';
import { Observable } from 'rxjs';
import { CustomersService } from './customers.service';
import { CustomersListComponent } from './customers-list/customers-list.component';

@Component({
    selector: 'app-customers',
    imports: [CommonModule, CustomersListComponent],
    templateUrl: './customers.component.html'
})
export class CustomersComponent implements OnInit {
    title = 'Customers';
    customers$: Observable<Customer[]> = new Observable<Customer[]>();

    constructor(private customersService: CustomersService) {}

    ngOnInit() {
        this.customers$ = this.customersService.getAll();
    }
}
