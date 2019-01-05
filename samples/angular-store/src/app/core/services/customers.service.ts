import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Customer } from '../../shared/interfaces';
import { Injectable } from '@angular/core';
import { StoreState } from '../store/store-state';
import { ObservableStore } from '../../../../../../src/observable-store';

@Injectable({
    providedIn: 'root'
})
export class CustomersService extends ObservableStore<StoreState> {

    customersUrl = 'assets/customers.json';

    constructor(private http: HttpClient) {  
        super({ trackStateHistory: true, logStateChanges: true });
    }

    private fetchCustomers() {
        return this.http.get<Customer[]>(this.customersUrl)
            .pipe(
                map(customers => {
                    this.setState({ customers }, CustomersStoreActions.GetCustomers);
                    return customers;
                }),
                catchError(this.handleError)
            );
    }

    getCustomers() {
        const state = this.getState();
        // pull from store cache
        if (state && state.customers) {
            console.log('stateHistory:', this.stateHistory);
            return of(state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchCustomers();
        }
    }

    getCustomer(id: number) {
        return this.getCustomers()
            .pipe(
                map(custs => {
                    let filteredCustomers = custs.filter(cust => cust.id === id);
                    let customer = (filteredCustomers && filteredCustomers.length) ? filteredCustomers[0] : null;                
                    this.setState({ customer }, CustomersStoreActions.GetCustomer);
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