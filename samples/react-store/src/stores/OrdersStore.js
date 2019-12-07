import { ObservableStore } from '@codewithdan/observable-store';

class OrdersStore extends ObservableStore {

    constructor() {
        super({ trackStateHistory: true, logStateChanges: true });
    }

    fetchOrders() {
        return fetch('/orders.json')
            .then(response => response.json())
            .then(orders => {
                this.setState({ orders }, 'SET_ORDERS');
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

export default new OrdersStore();