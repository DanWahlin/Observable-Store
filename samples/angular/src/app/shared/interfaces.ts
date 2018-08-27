export interface ICustomer {
    id: number;
    name: string;
    city: string;
    orderTotal?: number;
    customerSince: any;
}

export interface IOrder {
    customerId: number;
    orderItems: IOrderItem[];
}

export interface IOrderItem {
    id: number;
    productName: string;
    itemCost: number;
}

export interface ICustomersStoreState {
    customers: ICustomer[];
    customer: ICustomer;
}

export interface IOrdersStoreState {
    orders: IOrder[];
}
