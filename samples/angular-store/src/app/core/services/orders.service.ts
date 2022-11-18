import { HttpClient } from '@angular/common/http';
import { of, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Order } from '../../shared/interfaces';
import { Injectable } from '@angular/core';
import { StoreState } from '../store/store-state';
// The following is for testing only
// import { ObservableStore } from '../../../../../../src/observable-store';
import { ObservableStore } from '@codewithdan/observable-store';

@Injectable({
    providedIn: 'root'
})
export class OrdersService extends ObservableStore<StoreState> {
    ordersUrl = 'assets/orders.json';

    constructor(private http: HttpClient) {
        super({ trackStateHistory: true });
     }

    private fetchOrders() {
        return this.http.get<Order[]>(this.ordersUrl)
            .pipe(
                map(orders => {
                    this.setState({ orders }, OrdersStoreActions.GetOrders);
                    return orders;
                }),
                catchError(this.handleError)
            );
    }

    getOrders(id: number) {
        let state = this.getState();
        // pull from store cache
        if (state && state.orders) {
            return of(this.filterOrders(id, state.orders));
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchOrders()
                .pipe(
                    map(orders => {
                        let filteredOrders = this.filterOrders(id, orders);
                        // The following can be used in cases where the store data won't change, but 
                        // you'd like to add to the state history for debugging/tracing purposes.
                        this.logStateAction(filteredOrders, OrdersStoreActions.FilterOrders);
                        return filteredOrders;
                    })
                );
        }
    }

    filterOrders(id: number, orders : Order[]) {
       return orders.filter(order => +order.customerId === id);
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

export enum OrdersStoreActions {
    GetOrders = 'get_orders',
    FilterOrders = 'filter_orders'
}