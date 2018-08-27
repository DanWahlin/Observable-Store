import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ICustomer, IOrder } from '../../app/shared/interfaces';

@Injectable()
export class DataService {
    // Use the following properties if running the Docker containers via Docker Compose
    // customersUrl = 'http://localhost:3000/api/customers';
    // ordersUrl = 'http://localhost:3000/api/orders';

    // Use the following properties if running the app stand-alone with no external dependencies
    customersUrl = 'assets/customers.json';
    ordersUrl = 'assets/orders.json';

    constructor(private http: HttpClient) { }

    getCustomers(): Observable<ICustomer[]> {
      return this.http.get<ICustomer[]>(this.customersUrl)
        .pipe(
          catchError(this.handleError)
        );

    }

    getCustomer(id: number): Observable<ICustomer> {
      return this.http.get<ICustomer[]>(this.customersUrl)
        .pipe(
          map(customers => {
            const customer = customers.filter((cust: ICustomer) => cust.id === id);
            return (customer && customer.length) ? customer[0] : null;
          }),
          catchError(this.handleError)
        );
    }

    getOrders(id: number): Observable<IOrder[]> {
      return this.http.get<IOrder[]>(this.ordersUrl)
        .pipe(
          map(orders => {
            const custOrders = orders.filter((order: IOrder) => order.customerId === id);
            return custOrders;
          }),
          catchError(this.handleError)
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
