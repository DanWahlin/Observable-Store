import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Customer } from '../../shared/interfaces';
import { Injectable } from '@angular/core';
import { AppStore } from '../store/app.store';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {
    customersUrl = 'assets/customers.json';

    constructor(private http: HttpClient, private store: AppStore) {  }

    private fetchCustomers() {
        return this.http.get<Customer[]>(this.customersUrl)
            .pipe(
                catchError(this.handleError)
            );
    }

    getCustomers() {
        const state = this.store.getState();
        // pull from store cache
        if (state && state.customers) {
            return of(state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchCustomers()
                .pipe(
                    map(customers => {
                        this.store.setState({ customers }, CustomersStoreActions.GetCustomers);
                        return customers;
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
                    this.store.setState({ customer }, CustomersStoreActions.GetCustomer);
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

export enum CustomersStoreActions {
    GetCustomers = 'get_customers',
    GetCustomer = 'get_customer'
}