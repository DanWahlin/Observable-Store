import { Customer, Order } from '../../shared/interfaces';

export interface StoreState {
    customers: Customer[];
    customer: Customer;
    orders: Order[];
}
