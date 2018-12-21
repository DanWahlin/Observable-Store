import { Injectable } from "@angular/core";

import { ObservableStore } from '../../../../../../src/observable-store';
import { Customer, Order } from "../../shared/interfaces";
import { environment } from "../../../environments/environment.prod";

export interface StoreState {
    customers: Customer[];
    customer: Customer;
    orders: Order[];
}

/*
    Define single store used throughout application. 
    Shape of data stored is defined by StoreState interface.

    Parameters passed to contructor:
    - Initial state (if any)
    - Store settings
*/

@Injectable({
    providedIn: 'root'
})
export class AppStore extends ObservableStore<StoreState> { 
    constructor() {
        super(null, { trackStateHistory: !environment.production });
    }
}