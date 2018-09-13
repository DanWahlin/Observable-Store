import { ObservableStore } from '../../../../../../src/observable-store';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IOrdersStoreState, IOrder } from '../../shared/interfaces';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class OrdersStore extends ObservableStore<IOrdersStoreState> {
    http: HttpClient;
    ordersUrl = 'assets/orders.json';

    constructor(http: HttpClient) {
        super(null, { trackStateHistory: true });
        this.http = http;
    }

    private fetchOrders() {
        return this.http.get<IOrder[]>(this.ordersUrl)
            .pipe(
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
                        this.setState({ orders }, OrdersStoreActions.GetOrders);
                        return this.filterOrders(id, orders);
                    })
                );
        }
    }

    filterOrders(id: number, orders) {
       return orders.filter(order => +order.customerId === id);
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

export enum OrdersStoreActions {
    GetOrders = 'get_orders'
}