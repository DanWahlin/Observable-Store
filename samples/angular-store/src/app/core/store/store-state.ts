import { ObservableStore } from '../../../../../../src/observable-store';
import { Customer, Order } from '../../shared/interfaces';
import { environment } from '../../../environments/environment';

/*
    Define single store used throughout application. 
    Shape of data stored is defined by StoreState interface.

    Parameters passed to contructor:
    - Initial state (if any)
    - Store settings
*/

export interface StoreState {
    customers: Customer[];
    customer: Customer;
    orders: Order[];
}

// export const observableStore = new ObservableStore<StoreState>(
//     null, 
//     { trackStateHistory: !environment.production }
// );

