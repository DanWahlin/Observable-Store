## Observable Store for State Management (Angular, React, Vue.js)

Front-end state management has become so complex that many of us spend more hours working on the front-end code then on our back-end code. Something's wrong with that!

The goal of the Observable Store is to provide an extremely simple way to store state in a front-end application (Angular, React, Vue.js or any other) while achieving key goals offered by more complex state management options.  

### Key Goals:
1. Single source of truth
1. State is read-only/immutable
1. Provide state change notifications
1. Track state change history (can be turned off)
1. Works with Angular (demo included), React (demo included), Vue.js (coming soon), and any front-end library/framework

### Running the Samples

Open the `samples` folder and follow the instructions provided in the readme file for one of the provided sample projects.

### Steps to use Observable Store

1. Create a class that extends ObservableStore
2. Pass any initial store state as well as observable store settings into super()
3. Update the store state using setState(action, state)
4. Retrieve from the store using getState()
5. Subscribe to store changes using the store.stateChanged observable

### Using Observable Store with Angular

1. Create an interface or model object that represents the shape of the data you'd like to add to your store. Here's an example of an interface to store customer state:

    ``` typescript
    export interface ICustomerStoreState {
        customers: Customer[];
        customer: Customer;
    }
    ```

1. Create a service (you can call it a store if you'd like) that extends ObservableStore<T>. Pass the interface or model class that represents the shape of your store data in for T.

    ``` typescript
    @Injectable()
    export class CustomersStore extends ObservableStore<ICustomerStoreState> {

    }
    ```

1. In the constructor add a call to `super()` and pass the initial store state as well as any Observable Store settings. Currently the store will allow you to turn tracking of store state changes on and off using the `trackStateHistory` property.

    ``` typescript
    constructor() { 
        const initialState = {
        customers: [],
        customer: null
        }
        super(initialState, { trackStateHistory: true });
    }
    ```

1. Add functions into your service/store to retrieve, store, sort, filter, or perform any actions you'd like. To update the store call `setState()` and pass the action that is occuring as well as the store state. To get the state out of the store call `getState()`. Note that store data is immutable and `getState()` always returns a clone of the store data. Here's a simple example:

    ``` typescript
    @Injectable()
    export class CustomersStore extends ObservableStore<ICustomerStoreState> {
        sorterService: SorterService;

        constructor(sorterService: SorterService) { 
            const initialState = {
                customers: [],
                customer: null
            }
            super(initialState, { trackStateHistory: true });
            this.sorterService = sorterService;
        }

        get() {
            const customers = this.getState().customers;
            if (customers) {
                return of(customers);
            }
            else {
                // call server and get data
                // assume async call here that returns observable
                return asyncData;
            }
        }

        add(customer: Customer) {
            let state = this.getState();
            state.customers.push(customer);
            this.setState('add_customer', {
                customers: state.customers
            });
        }

        remove() {
            let state = this.getState();
            state.customers.splice(state.customers.length - 1, 1);
            this.setState('remove_customer', {
                customers: state.customers
            });
        }
        
        sort(property: string = 'id') {
            let state = this.getState();
            const sortedState = this.sorterService.sort(state.customers, property);
            this.setState('sort_customers', {
                customers: sortedState
            });
        }

    }
    ```

1. If you want to view all of the changes to the store you can access the stateHistory property:

    ``` typescript
        console.log(this.stateHistory);
    ```

1. Any component can be notified of changes to the store by injecting the store and then subscribing to the stateChanged observable:

    ``` typescript
    customers: Customer[];

    constructor(private customersStore: CustomersStore) { }

    ngOnInit() {
        // Use Observable<Customer> if desired for customers property
        // this.customers = this.customersService.storeStateChanged;

        // Can subscribe to stateChanged observable of the store
        this.storeSub = this.customersStore.stateChanged.subscribe(state => {
            this.customers = state.customers;
        });

        // Can call service/store to get data directly 
        // (won't fire when the store state changes)
        //this.storeSub = this.customersStore.get().subscribe(custs => this.customers = custs);
    }
    ```

    You'll of course want to unsubscribe in ngOnDestroy() as well:

    ``` typescript
    ngOnDestroy() {
        if (this.storeSub) {
            this.storeSub.unsubscribe();
        }        
    }
    ```

    ### Using Observable Store with React

