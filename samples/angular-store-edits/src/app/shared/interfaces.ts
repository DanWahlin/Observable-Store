import { Customer, Order } from '../core/model';
import { Theme } from './enums';

export interface StoreState {
    customers: Customer[];
    customer: Customer;
    orders: Order[];
    userSettings: UserSettings;
}

export interface UserSettings {
    id: number;
    preferredName: string;
    email: string;
    theme: Theme;
}