import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ObservableStore } from '@codewithdan/observable-store';

import { Customer } from '../core/model';
import { StoreState } from '../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class CustomersService extends ObservableStore<StoreState> {

    apiUrl = 'api/customers';

    constructor(private http: HttpClient) { 
        super({ });
    }

    private fetchCustomers() {
        return this.http.get<Customer[]>(this.apiUrl)
            .pipe(
                map(customers => {
                    this.setState({ customers }, CustomersStoreActions.GetCustomers);
                    return customers;
                }),
                catchError(this.handleError)
            );
    }

    getAll() {
        const state = this.getState();
        // pull from store cache
        if (state && state.customers) {
            return of(state.customers);
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchCustomers()
                .pipe(
                    catchError(this.handleError)
                );
        }
    }

    get(id: number) {
        return this.getAll()
            .pipe(
                map(custs => {
                    let filteredCusts = custs.filter(cust => cust.id === id);
                    const customer = ((filteredCusts && filteredCusts.length) ? filteredCusts[0] : null) as Customer;                
                    this.setState({ customer }, CustomersStoreActions.GetCustomer);
                    return customer;
                }),
                catchError(this.handleError)
            );
    }

    add(customer: Customer) {
        return this.http.post(this.apiUrl, customer)
            .pipe(
                switchMap(cust => {
                    // update local store with added customer data
                    // not required of course unless the store cache is needed 
                    // (it is for the customer list component in this example)
                    return this.fetchCustomers();
                }),
                catchError(this.handleError)
            );
    }

    update(customer: Customer) {
        return this.http.put(this.apiUrl + '/' + customer.id, customer)
            .pipe(
                switchMap(cust => {
                    // update local store with updated customer data
                    // not required of course unless the store cache is needed 
                    // (it is for the customer list component in this example)
                    this.setState( { customer }, CustomersStoreActions.UpdateCustomer);
                    return this.fetchCustomers();
                }),
                catchError(this.handleError)
            );
    }

    delete(id: number) {
        return this.http.delete(this.apiUrl + '/' + id)
            .pipe(
                switchMap(() => {
                    // update local store since customer deleted
                    // not required of course unless the store cache is needed 
                    // (it is for the customer list component in this example)  
                    const customers = this.deleteLocalCustomer(id);
                    this.setState({ customers, customer: null }, CustomersStoreActions.DeleteCustomer);                 
                    return this.fetchCustomers();
                }),
                catchError(this.handleError)
            );
    }

    private deleteLocalCustomer(id: number) {
        let customers = this.getState().customers;
        for(let i = customers.length -1; i--;){ 
            if(customers[i].id === id){ 
                customers.splice(i,1); 
                break;
            }
        }
        return customers;
    }

    private handleError(error: any) {
        console.error('server error:', error);
        if (error.error instanceof Error) {
          const errMessage = error.error.message;
          return throwError(() => new Error(errMessage));
        }
        return throwError(() => error ? new Error(error) : new Error('Server error'));
    }
}

export enum CustomersStoreActions {
    GetCustomers = 'GET_CUSTOMERS',
    GetCustomer = 'GET_CUSTOMER',
    UpdateCustomer = 'UPDATE_CUSTOMER',
    DeleteCustomer = 'DELETE_CUSTOMER'
}