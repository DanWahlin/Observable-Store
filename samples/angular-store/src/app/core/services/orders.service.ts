import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Order } from '../../shared/interfaces';
import { Injectable } from '@angular/core';
import { AppStore } from '../store/app.store';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    ordersUrl = 'assets/orders.json';

    constructor(private http: HttpClient, private store: AppStore) { }

    private fetchOrders() {
        return this.http.get<Order[]>(this.ordersUrl)
            .pipe(
                catchError(this.handleError)
            );
    }

    getOrders(id: number) {
        let state = this.store.getState();
        // pull from store cache
        if (state && state.orders) {
            return of(this.filterOrders(id, state.orders));
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchOrders()
                .pipe(
                    map(orders => {
                        this.store.setState({ orders }, OrdersStoreActions.GetOrders);
                        return this.filterOrders(id, orders);
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
            return Observable.throw(errMessage);
        }
        return Observable.throw(error || 'Server error');
      }
}

export enum OrdersStoreActions {
    GetOrders = 'get_orders'
}