import { ObservableStore } from '../stores/observable-store';

export class OrdersStore extends ObservableStore {

    static instance = new OrdersStore();

    constructor() {
        super(null, { trackStateHistory: true });
    }

    fetchOrders() {
        return fetch('/orders.json')
            .then(response => response.json())
            .then(orders => orders);
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
                       .then(orders => {
                            this.setState('get_orders', {
                                orders: orders
                            });
                           return this.filterOrders(id);
                       });
        }
    }

    filterOrders(id) {
        let filteredOrders = this.getState().orders.filter(order => order.customerId === id);
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