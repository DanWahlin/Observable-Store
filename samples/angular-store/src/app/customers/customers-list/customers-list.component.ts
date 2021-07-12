import { Component, Input, OnInit } from '@angular/core';

import { Customer } from '../../shared/interfaces';
import { SorterService } from '../../core/sorter.service';

@Component({
    selector: 'app-customers-list',
    templateUrl: './customers-list.component.html'
})
export class CustomersListComponent implements OnInit {
    private _customers: Customer[] = [];
    @Input() get customers(): Customer[] {
        return this._customers;
    }
    set customers(value: Customer[]) {
        if (value) {
            this.filteredCustomers = this._customers = value;
            this.calculateOrders();
        }
    }
    filteredCustomers: Customer[] = [];
    customersOrderTotal = 0;
    currencyCode = 'USD';

    constructor(private sorterService: SorterService) { }

    ngOnInit() {

    }

    calculateOrders() {
        this.customersOrderTotal = 0;
        this.filteredCustomers.forEach((cust: Customer) => {
            if (cust && cust.orderTotal) {
                this.customersOrderTotal += cust.orderTotal;
            }
        });
    }

    filter(data: string) {
        if (data) {
            this.filteredCustomers = this.customers.filter((cust: Customer) => {
                const orderTotal = cust.orderTotal || '';
                return cust.name.toLowerCase().indexOf(data.toLowerCase()) > -1 ||
                       cust.city.toLowerCase().indexOf(data.toLowerCase()) > -1 ||
                       orderTotal.toString().indexOf(data) > -1;
            });
        } else {
            this.filteredCustomers = this.customers;
        }
        this.calculateOrders();
    }

    sort(prop: string) {
        this.sorterService.sort(this.filteredCustomers, prop);
    }

    customerTrackBy(index: number, customer: Customer) {
        return customer.id;
    }

}
