## Observable Store - State Management for Front-End Applications (Angular, React, Vue.js)

Observable Store is a small front-end state management library that provides a lot of functionality. Front-end state management has become so complex that many of us spend more hours working on the state management code then on the rest of the code. Something's wrong with that!

The goal of observable store is to provide an extremely small and simple way to store state in a front-end application (Angular, React, Vue.js or any other) while achieving many of the key goals offered by more complex state management options.  

### Key Goals:
1. Single source of truth (or create multiple stores if desired)
1. State is read-only/immutable
1. Provide state change notifications to any subscriber
1. Track state change history
1. Works with Angular (demo included), React (demo included), Vue.js (coming soon), or any front-end library/framework

### Running the Samples

Open the `samples` folder and follow the instructions provided in the readme file for one of the provided sample projects.

### Steps to use Observable Store

1. Create a class that extends ObservableStore
2. Pass any initial store state as well as observable store settings into super()
3. Update the store state using setState(action, state)
4. Retrieve from the store using getState()
5. Subscribe to store changes using the store.stateChanged observable

### Walk-Throughs

* [Using Observable Store with Angular](#angular)
* [Using Observable Store with React](#react)
* [Using Observable Store with Vue.js](#vue)

## <a name="angular"></a>Using Observable Store with Angular

See the `samples` folder for examples of using Observable Store with Angular.

1. Create an Angular application using the Angular CLI or another option.

1. Install @codewithdan/observable-store:

`npm install @codewithdan/observable-store`

1. Add an interface or model object that represents the shape of the data you'd like to add to your store. Here's an example of an interface to store customer state:

    ``` typescript
    export interface StoreState {
        customers: Customer[];
        customer: Customer;
    }
    ```

1. Add a service (you can call it a store if you'd like) that extends ObservableStore<T>. Pass the interface or model class that represents the shape of your store data in for T.

    ``` typescript
    @Injectable()
    export class CustomersStore extends ObservableStore<StoreState> {

    }
    ```

1. In the constructor add a call to `super()`. Currently the store will allow you to turn tracking of store state changes on and off using the `trackStateHistory` property.

    ``` typescript
    constructor() { 
        super({ trackStateHistory: true });
    }
    ```

1. Add functions into your service/store to retrieve, store, sort, filter, or perform any actions you'd like. To update the store call `setState()` and pass the action that is occuring as well as the store state. To get the state out of the store call `getState()`. Note that store data is immutable and `getState()` always returns a clone of the store data. Here's a simple example:

    ``` typescript
    @Injectable()
    export class CustomersStore extends ObservableStore<StoreState> {
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
            this.setState({ customers: state.customers }, 'add_customer');
        }

        remove() {
            let state = this.getState();
            state.customers.splice(state.customers.length - 1, 1);
            this.setState({ customers: state.customers } 'remove_customer');
        }
        
        sort(property: string = 'id') {
            let state = this.getState();
            const sortedState = this.sorterService.sort(state.customers, property);
            this.setState({ customers: sortedState } 'sort_customers');
        }

    }
    ```

    While strings are used for actions in the prior examples, you can use string enums as well if you want to have a set list of actions to choose from:

    ``` typescript
        export enum CustomersStoreActions {
            AddCustomer = 'add_customer',
            RemoveCustomer = 'remove_customer',
            GetCustomers = 'get_customers',
            SortCustomers = 'sort_customers'
        }

        // Example of using the enum in a store
        add(customer: Customer) {
            let state = this.getState();
            state.customers.push(customer);
            this.setState({ customers: state.customers }, CustomersStoreActions.AddCustomer);
        }
    ```

1. If you want to view all of the changes to the store you can access the `stateHistory` property:

    ``` typescript
    console.log(this.stateHistory);

    // example stateHistory output
    [
        {
            "action": "init_state",
            "state": {
                "customers": [
                    {
                    "id": 1536354269413,
                    "name": "Jane Doe",
                    "address": {
                        "street": "1234 Main St.",
                        "city": "Phoenix",
                        "state": "AZ",
                        "zip": "85258"
                    }
                    }
                ],
                "customer": null
            }
        },
        {
            "action": "add_customer",
            "state": {
                "customers": [
                    {
                        "id": 1536354269413,
                        "name": "Jane Doe",
                        "address": {
                            "street": "1234 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    },
                    {
                        "id": 1536354272461,
                        "name": "Fred",
                        "address": {
                            "street": "1536354272461 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    }
                ],
                "customer": null
            }
        },
        {
            "action": "remove_customer",
            "state": {
                "customers": [
                    {
                        "id": 1536354269413,
                        "name": "Jane Doe",
                        "address": {
                            "street": "1234 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    }
                ],
                "customer": null
            }
        }
    ]
    ```

1. Any component can be notified of changes to the store state by injecting the store and then subscribing to the `stateChanged` observable:

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
        // It won't fire when the store state changes though in this case
        //this.storeSub = this.customersStore.get().subscribe(custs => this.customers = custs);
    }
    ```

    You'll of course want to unsubscribe in `ngOnDestroy()` (check out SubSink on npm for a nice way to easily subscribe/unsubscribe):

    ``` typescript
    ngOnDestroy() {
        if (this.storeSub) {
            this.storeSub.unsubscribe();
        }        
    }
    ```

## <a name="react"></a>Using Observable Store with React

See the `samples` folder for examples of using Observable Store with React.

1. Create a React application using the `create-react-app` or another option.

1. Add `rxjs` into the `package.json` dependencies and run `npm install`.

1. Add a service class (you can call it a store if you'd like) that extends ObservableStore<T>. Pass the interface or model class that represents the shape of your store data in for T.

    ``` javascript
    export class CustomersStore extends ObservableStore {

    }
    ```

1. In the constructor add a call to `super()`. Currently the store will allow you to turn tracking of store state changes on and off using the `trackStateHistory` property.

    ``` javascript
    export class CustomersStore extends ObservableStore {
        constructor() {
            super({ trackStateHistory: true });
        }
    }
    ```

1. Add functions into your service/store to retrieve, store, sort, filter, or perform any actions you'd like. To update the store call `setState()` and pass the action that is occuring as well as the store state. To get the state out of the store call `getState()`. Note that store data is immutable and `getState()` always returns a clone of the store data. Here's a simple example:

    ``` javascript
    export class CustomersStore extends ObservableStore {

        constructor() {
            super({ trackStateHistory: true });
        }

        fetchCustomers() {
            // using fetch api here to keep it simple, but any other
            // 3rd party option will work (Axios, Ky, etc.)
            return fetch('/customers')
                .then(response => response.json())
                .then(customers => {
                    this.setState({ customers }, 'get_customers');
                    return customers;
                });
        }

        getCustomers() {
            let state = this.getState();
            // pull from store cache
            if (state && state.customers) {
                return this.createPromise(null, state.customers);
            }
            // doesn't exist in store so fetch from server
            else {
                return this.fetchCustomers();
            }
        }

        getCustomer(id) {
            return this.getCustomers()
                .then(custs => {
                    let filteredCusts = custs.filter(cust => cust.id === id);
                    const customer = (filteredCusts && filteredCusts.length) ? filteredCusts[0] : null;                
                    this.setState({ customer }, 'get_customer');
                    return customer;
                });
        }

        createPromise(err, result) {
            return new Promise((resolve, reject) => {
                return err ? reject(err) : resolve(result);
            });
        }
    }
    ```

    While strings are used for actions in the prior example, you can use an object as well if you want to have a set list of actions to choose from:

    ``` javascript
    const CustomersStoreActions = {
        GetCustomers: 'get_customers',
        GetCustomer: 'get_customer'
    };

        // Example of using the enum in a store
    getCustomer(id) {
        return this.getCustomers()
            .then(custs => {
                let filteredCusts = custs.filter(cust => cust.id === id);
                const customer = (filteredCusts && filteredCusts.length) ? filteredCusts[0] : null;                
                this.setState({ customer }, CustomersStoreActions.GetCustomer);
                return customer;
            });
    }
    ```

1. If you want to view all of the changes to the store you can access the `stateHistory` property:

    ``` javascript
    console.log(this.stateHistory);

    // example stateHistory output
    [
        {
            "action": "init_state",
            "state": {
                "customers": [
                    {
                    "id": 1536354269413,
                    "name": "Jane Doe",
                    "address": {
                        "street": "1234 Main St.",
                        "city": "Phoenix",
                        "state": "AZ",
                        "zip": "85258"
                    }
                    }
                ],
                "customer": null
            }
        },
        {
            "action": "add_customer",
            "state": {
                "customers": [
                    {
                        "id": 1536354269413,
                        "name": "Jane Doe",
                        "address": {
                            "street": "1234 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    },
                    {
                        "id": 1536354272461,
                        "name": "Fred",
                        "address": {
                            "street": "1536354272461 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    }
                ],
                "customer": null
            }
        },
        {
            "action": "remove_customer",
            "state": {
                "customers": [
                    {
                        "id": 1536354269413,
                        "name": "Jane Doe",
                        "address": {
                            "street": "1234 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    }
                ],
                "customer": null
            }
        }
    ]
    ```

1. Any component can be notified of changes to the store state by subscribing to the `stateChanged` observable:

    ``` javascript
    componentDidMount() {
        // Get store
        // Note that all store instances share the same data (a single storage location)
        let store = new CustomersStore();

        // ###### CustomersStore ########
        // Option 1: Subscribe to store changes
        // Useful when a component needs to be notified of changes but won't always
        // call store directly.
        this.storeSub = store.stateChanged.subscribe(state => {
          if (state) {
            this.setState({ customers: state.customers });
          }
        });
        store.getCustomers();

        // Option 2: Get data directly from store
        // store.getCustomers()
        //     .then(customers => {
        //       this.setState({ customers: customers });
        //     });
    }
    ```

    You'll of course want to unsubscribe in `componentWillUnmount()`:

    ``` javascript
    componentWillUnmount() {
        if (this.storeSub) {
          this.storeSub.unsubscribe();
        }
    }
    ```

### <a name="vue"></a>Using Observable Store with Vue.js

Coming Soon
