import { Customer, Order } from '../core/model';
import { Theme } from './enums';

export interface UserSettings {
    id: number;
    preferredName: string;
    email: string;
    theme: Theme;
}

export interface StoreState {
    customers: Customer[];
    customer: Customer | null;
    orders: Order[];
    userSettings: UserSettings;
}