import { ObservableStore } from '../../../../../../src/observable-store';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ICustomersStoreState, ICustomer } from '../../shared/interfaces';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CustomersStore extends ObservableStore<ICustomersStoreState> {
    http: HttpClient;
    customersUrl = 'assets/customers.json';

    constructor(http: HttpClient) {
        super(null, { trackStateHistory: true });
        this.http = http;
    }

    private fetchCustomers() {
        return this.http.get<ICustomer[]>(this.customersUrl)
            .pipe(
                catchError(this.handleError)
            );
    }

    getCustomers() {
        let state = this.getState();
        // pull from store cache
        if (state && state.customers) {
            return of(state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchCustomers()
                .pipe(
                    map(customers => {
                        this.setState('get_customers', {
                            customers: customers
                        });
                        return this.getState().customers;
                    })
                );
        }
    }

    getCustomer(id) {
        return this.getCustomers()
            .pipe(
                map(custs => {
                    let filteredCusts = custs.filter(cust => cust.id === id);
                    const customer = (filteredCusts && filteredCusts.length) ? filteredCusts[0] : null;                
                    this.setState('get_customer', {
                        customer: customer
                    });
                    return customer;
                })
            );
    }

    private handleError(error: any) {
        console.error('server error:', error);
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return Observable.throw(errMessage);
        }
        return Observable.throw(error || 'Server error');
      }
}