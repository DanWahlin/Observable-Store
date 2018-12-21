export interface Customer {
    id: number;
    name: string;
    city: string;
    orderTotal?: number;
    customerSince: any;
}

export interface Order {
    customerId: number;
    orderItems: OrderItem[];
}

export interface OrderItem {
    id: number;
    productName: string;
    itemCost: number;
}
