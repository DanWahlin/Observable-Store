import { ObservableStore } from '../stores/observable-store';

export class OrdersStore extends ObservableStore {

    static instance = new OrdersStore();

    constructor() {
        super(null, true);
    }

    fetchOrders() {
        return fetch('/orders.json')
            .then(response => response.json())
            .then(orders => {
                this.setState('fetch_orders', {
                    orders: orders
                });
                return this.getState();
            });
    }

    getOrderItems(id) {
        let state = this.getState();
        // pull from store cache
        if (state && state.orders) {
            return this.createPromise(null, this.filterOrders(id, state.orders));
        }
        // doesn't exist in store so fetch from server
        else {
            return this.fetchOrders()
                       .then(state => {
                           return this.filterOrders(id, state.orders);
                       });
        }
    }

    filterOrders(id, orders) {
        let filteredOrders = orders.filter(order => order.customerId === id);
        const orderItems = (filteredOrders && filteredOrders.length)
            ? filteredOrders[0].orderItems : null;
        this.setState('filter_orders', {
            orderItems: orderItems
        });
        return orderItems;
    }

    createPromise(err, result) {
        return new Promise((resolve, reject) => {
            return err ? reject(err) : resolve(result);
        });
    }
}