import { Customer } from "./customer";

export interface ICustomerStoreState {
    customers: Customer[];
    customer: Customer;
}