import { ObservableStore } from '../stores/observable-store';

export class OrdersStore extends ObservableStore {

    constructor() {
        super({ trackStateHistory: true });
    }

    fetchOrders() {
        return fetch('/orders.json')
            .then(response => response.json())
            .then(orders => {
                this.setState({ orders }, 'set_orders');
                return orders;
            });
    }

    getOrders(id) {
        let state = this.getState();
        // pull from store cache
        if (state && state.orders) {
            return this.createPromise(null, this.filterOrders(id, state.orders));
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchOrders()
                       .then(orders => {
                            return this.filterOrders(id, orders);
                       });
        }
    }

    filterOrders(id, orders) {
        return orders.filter(order => order.customerId === id);
    }

    createPromise(err, result) {
        return new Promise((resolve, reject) => {
            return err ? reject(err) : resolve(result);
        });
    }
}