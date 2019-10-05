[![Build Status](https://travis-ci.org/DanWahlin/Observable-Store.svg?branch=master)](https://travis-ci.org/DanWahlin/Observable-Store)

## Observable Store - State Management for Front-End Applications (Angular, React, Vue.js, or any other)

Observable Store is a tiny front-end state management library that provides a lot of functionality. Front-end state management has become so complex that many of us spend more hours working on the state management code then on the rest of the application. Observable Store has one overall goal -   "keep it simple".

The goal of observable store is to provide a small, simple, and consistent way to manage state in any front-end application (Angular, React, Vue.js or any other) while achieving many of the [key goals](#goals) offered by more complex state management solutions. While many front-end frameworks/libraries provide state management functionality, many can be overly complex and are only useable with the target framework/library. Observable Store is simple and can be used with any front-end JavaScript codebase.

<a href="https://blog.codewithdan.com/simplifying-front-end-state-management-with-observable-store" target="_blank">View my blog post about Observable Store</a>

### <a name="goals"></a>Key Goals of Observable Store:
1. Single source of truth
1. State is read-only/immutable
1. Provide state change notifications to any subscriber
1. Track state change history
1. Minimal amount of code required
1. Works with Angular (demo included), React (demo included), Vue.js (demo coming soon), or any front-end library/framework

### Steps to use Observable Store

1. Install the Observable Store package:

    `npm install @codewithdan/observable-store`

1. Install RxJS (a required peer dependency)

    `npm install rxjs`

1. Create a class that extends `ObservableStore`.
1. Optionally pass settings into `super()` in your class's constructor ([view Observable Store settings](#settings))
1. Update the store state using `setState(state, action)`.
1. Retrieve store state using `getState()`.
1. Subscribe to store changes using the store's `stateChanged` observable.
1. Access store state history by calling the `stateHistory` property (this assumes that the `trackStateHistory` setting is set to `true`)

### API and Settings

[Observable Store API](#api)

[Observable Store Settings](#settings)

### Running the Samples

Open the `samples` folder available at the Github repo and follow the instructions provided in the readme file for any of the provided sample projects.

### Sample Applications

* [Using Observable Store with Angular](#angular)
* [Using Observable Store with React](#react)
* [Using Observable Store with Vue.js](#vue)

## <a name="angular"></a>Using Observable Store with Angular

See the `samples` folder in the Github repo for examples of using Observable Store with Angular.

1. Create an Angular application using the Angular CLI or another option.

1. Install `@codewithdan/observable-store`:

    `npm install @codewithdan/observable-store`

1. Install RxJS (a required peer dependency)

    `npm install rxjs`

1. Add an interface or model object that represents the shape of the data you'd like to add to your store. Here's an example of an interface to store customer state:

    ``` typescript
    export interface StoreState {
        customers: Customer[];
        customer: Customer;
    }
    ```

1. Add a service (you can optionally calll it a store if you'd like) that extends ObservableStore<T>. Pass the interface or model class that represents the shape of your store data in for T as shown next:

    ``` typescript
    @Injectable()
    export class CustomersService extends ObservableStore<StoreState> {

    }
    ```

1. In the constructor add a call to `super()`. The store allows you to turn tracking of store state changes on and off using the `trackStateHistory` property.

    ``` typescript
    constructor() { 
        super({ trackStateHistory: true });
    }
    ```

1. Add functions into your service/store to retrieve, store, sort, filter, or perform any actions you'd like. To update the store call `setState()` and pass the action that is occuring as well as the store state. To get the state out of the store call `getState()`. Note that store data is immutable and `getState()` always returns a clone of the store data. Here's a simple example:

    ``` typescript
    @Injectable()
    export class CustomersService extends ObservableStore<StoreState> {
        sorterService: SorterService;

        constructor(sorterService: SorterService) { 
            const initialState = {
                customers: [],
                customer: null
            }
            super({ trackStateHistory: true });
            this.setState(initialState, 'init_state');
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
            this.setState({ customers: state.customers }, 'remove_customer');
        }
        
        sort(property: string = 'id') {
            let state = this.getState();
            const sortedState = this.sorterService.sort(state.customers, property);
            this.setState({ customers: sortedState }, 'sort_customers');
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
    ```

1. An example of the state history output is shown next:

    ``` typescript
    // example stateHistory output
    [
        {
            "action": "initialize_state",
            "beginState": null,
            "endState": {
                "customers": [
                    {
                        "id": 1545847909628,
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
            "beginState": {
                "customers": [
                    {
                        "id": 1545847909628,
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
            },
            "endState": {
                "customers": [
                    {
                        "id": 1545847909628,
                        "name": "Jane Doe",
                        "address": {
                            "street": "1234 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    },
                    {
                        "id": 1545847921260,
                        "name": "Fred",
                        "address": {
                            "street": "1545847921260 Main St.",
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
    storeSub: Subscription;

    constructor(private customersService: CustomersService) { }

    ngOnInit() {
        // If using async pipe (recommend renaming customers to customers$)
        // this.customers$ = this.customersService.stateChanged;

        // Can subscribe to stateChanged observable of the store
        this.storeSub = this.customersService.stateChanged.subscribe(state => {
            this.customers = state.customers;
        });

        // Can call service/store to get data directly 
        // It won't fire when the store state changes though in this case
        //this.storeSub = this.customersService.get().subscribe(custs => this.customers = custs);
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

See the `samples` folder in the Github repo for examples of using Observable Store with React.

1. Create a React application using the `create-react-app` or another option.

1. Install `@codewithdan/observable-store`:

    `npm install @codewithdan/observable-store`

1. Install RxJS (a required peer dependency)

    `npm install rxjs`

1. Add a store class (you can call it whatever you'd like) that extends ObservableStore<T>. 

    ``` javascript
    export class CustomersStore extends ObservableStore {

    }
    ```

1. In the constructor add a call to `super()`. The store allows you to turn tracking of store state changes on and off using the `trackStateHistory` property.

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

1. Export your store. A default export is used here:


    ``` javascript
    export default new CustomersStore();
    ```

1. If you want to view all of the changes to the store you can access the store's `stateHistory` property:

    ``` javascript
    console.log(this.stateHistory);

    // example stateHistory output
    [
        {
            "action": "initialize_state",
            "beginState": null,
            "endState": {
                "customers": [
                    {
                        "id": 1545847909628,
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
            "beginState": {
                "customers": [
                    {
                        "id": 1545847909628,
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
            },
            "endState": {
                "customers": [
                    {
                        "id": 1545847909628,
                        "name": "Jane Doe",
                        "address": {
                            "street": "1234 Main St.",
                            "city": "Phoenix",
                            "state": "AZ",
                            "zip": "85258"
                        }
                    },
                    {
                        "id": 1545847921260,
                        "name": "Fred",
                        "address": {
                            "street": "1545847921260 Main St.",
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

1. Import your store into a component:

    ``` javascript
    import CustomersStore from '../stores/CustomersStore';
    ```

1. Now use your store to access or update data. Any component can be notified of changes to the store state by subscribing to the `stateChanged` observable:

    ``` javascript
    storeSub = null;

    componentDidMount() {
        // ###### CustomersStore ########
        // Option 1: Subscribe to store changes
        // Useful when a component needs to be notified of changes but won't always
        // call store directly.
        this.storeSub = CustomersStore.stateChanged.subscribe(state => {
          if (state) {
            this.setState({ customers: state.customers });
          }
        });

        // In this example we trigger getting the customers (code above receives the customers)
        CustomersStore.getCustomers();

        // Option 2: Get data directly from store
        // If a component triggers getting the data it can retrieve it directly rather than subscribing
        // CustomersStore.getCustomers()
        //     .then(customers => {
        //       ....
        //     });
    }
    ```

    You'll want to unsubscribe in `componentWillUnmount()`:

    ``` javascript
    componentWillUnmount() {
        if (this.storeSub) {
          this.storeSub.unsubscribe();
        }
    }
    ```

### <a name="vue"></a>Using Observable Store with Vue.js

Coming Soon...

### <a name="api"></a>Store API

Observable Store provides a simple API that can be used to get/set state, subscribe to store state changes, and access state history.

 API                                            | Description
| ----------------------------------------------|------------------------------------------------------------------------------------------------------------------- 
| `getState() : any`                              | Retrieve store's state. If using TypeScript (optional) then the state type defined when the store was created will be returned rather than `any`.                                                                                            
| `setState(state: any, action: string) : any`    | Set store state. Pass the state to be updated as well as the action that is occuring. The state value can be a function (see example below). The latest store state is returned.
| `stateChanged: Observable`                      | Subscribe to store changes in the particlar slice of state updated by a Service. If the store contains 'n' slices of state each being managed by one of 'n' services, then changes in any of the other slices of state will not generate values in the stateChanged stream. Returns an RxJS Observable containing the current store state (or a specific slice of state if a stateSliceSelector has been specified).  If the `includeStateChangesOnSubscribe` setting is true you'll get back an object containing `state` (which has the current store state) and `stateChanges` (which has the individual properties/data that were changed in the store) properties.
| `globalStateChanged: Observable`                | Subscribe to global store changes i.e. changes in any slice of state of the store. The global store may consist of 'n' slices of state each managed by a particular service. This property notifies of a change in any of the 'n' slices of state. Returns an RxJS Observable containing the current store state.  If the `includeStateChangesOnSubscribe` setting is true you'll get back an object containing `state` (which has the current store state) and `stateChanges` (which has the individual properties/data that were changed in the store) properties.
| `stateHistory: any`                             | Retrieve state history (assumes trackStateHistory setting was set on store)

Note that TypeScript types are used to describe parameters and return types above. TypeScript is not required to use Observable Store though.

#### Passing a Function to setState()

Here's an example of passing a function to setState(). This allows the previous state to be accessed directly while setting the new state.

``` javascript
this.setState(prevState => { 
    return { customers: this.sorterService.sort(prevState.customers, property) };
}, 'sort_customers');
```

### <a name="settings"></a>Store Settings

Observable Store settings can be passed when the store is initialized (when super() is called). See examples of using it above.
 
 Setting                         | Description
| -------------------------------|------------------------------------------------------------------------------------------------------------------- 
| `trackStateHistory: boolean`   | Determines if the store's state will be tracked or not (defaults to false). Pass it when initializing the Observable Store (see examples above). When `true`, you can access the store's state history by calling the `stateHistory` property.
| `logStateChanges: boolean`     | Log any store state changes to the browser console (defaults to false). 
| `includeStateChangesOnSubscribe: boolean`   | Returns the store state by default when false (default). Set to `true` if you want to receive the store state as well as the specific properties/data that were changed when the `stateChanged` subject emits. Upon subscribing to `stateChanged` you will get back an object containing `state` (which has the current store state) and `stateChanges` (which has the individual properties/data that were changed in the store).
| `stateSliceSelector: function`     | Function to select the slice of the store being managed by this particular service. If specified then the specific state slice is returned. If not specified then the total state is returned (defaults to null). 
| `useDeepCloning: boolean`     | Determines if deep cloning (complete copies of objects) will be used when store state is returned (defaults to true). To use the spread operator instead to create a shallow clone (note that complex properties/objects will still be reference types if this is set to true), switch the property to false. 



#### Using the stateSliceSelector() Function

The `stateSliceSelector()` function can be used to return a "slice" of the store state that is managed by a Service to any subscribers. For example, if a CustomersService manages a `customers` collection and a `selectedCustomer` object you can return only the `selectedCustomer` object to subscribers (rather than `customers` and `selectedCustomer`) by creating a `stateSliceSelector()` function. 

Define it as you initialize the service when passing a `settings` object to `super()` in the Service's constructor.

``` typescript
export class CustomersService extends ObservableStore<StoreState> {
  constructor() { 
    super({ stateSliceSelector: state => { 
        return {
          customer: state.selectedCustomer
          // return other parts of the store here too if desired
        };
      } 
    });
 }
}
```

### Changes

#### 1.0.11 

Added `includeStateChangesOnSubscribe` setting for cases where a subscriber to `stateChanged` wants to get the current state as well as the specific properties/data that were changes in the store. Defaults to `false` so prior versions will only receive the current state by default which keeps patched versions compatible in the 1.0.x range.

Set the property to `true` if you want to receive the store state as well as the specific properties/data that were changed when the `stateChanged` subject emits. Upon subscribing to `stateChanged` you will get back an object containing `state` (which has the current store state) and `stateChanges` (which has the individual properties/data that were changed in the store).

#### 1.0.12

Changed `updateState()` to `_updateState()` since it's a private function. Remove `tsconfig.json` from package.

#### 1.0.13

Moved `BehaviorSubject` into `ObservableService` class so that if multiple instances of a wrapper around the store are created, subscribers can subscribe to the individual instances.

#### 1.0.14

Added `logStateChanges` setting to write out all state changes to the browser console when true. Defaults to false.

#### 1.0.15

Added action to log output when `logStateChanges` is true.

#### 1.0.16

Thanks to a great contribution by Mickey Puri you can now globally subscribe to store changes (`globalStateChanged` event) and even define state slices (`stateSliceSelector` setting).

#### 1.0.17

Merged in another contribution by Mickey Puri to ensure the settings defaults are always applied regardless of how many properties the user passes. Renamed
a settings default property (`state_slice_selector` => `stateSliceSelector`). Added editable store example (update/delete functionality) for Angular in the `samples` folder.

#### 1.0.18 

Minor updates to the readme.

#### 1.0.19

Updated Angular example and added `stateSliceSelector()` information in readme

#### 1.0.20

Updated readme

#### 1.0.21

Updated to latest version of RxJS. Removed subsink from the Angular Simple Store demo to just use a normal Subscription for unsubscribing (just to keep it more "native" and require less dependencies).

#### 1.0.22

Internal type additions and tests contributed by @elAndyG (https://github.com/elAndyG). 

#### 2.0.0

1. RxJS is now a peer dependency (RxJS 6.4.0 or higher is required). This avoids reported versioning issues that have come up when a project already has RxJS in it. The 1.x version of Observable Store added RxJS as a dependency. Starting with 2.0.0 this is no longer the case.
1. setState() now clones the state as its added. State cloning used to be done in getState(). Previously, references to objects added using setState() could update the state as they were changed. While no issues were reported with that scenario, it wasn't a desirable behavior since the store state is immutable. 
1. Refactored some of the underlying code to be more maintainable.
1. Changed TypeScript module compilation to CommonJS instead of ES2015 to aid with testing scenarios (such as Jest) where the project didn't automatically handle ES2015 module conventions without extra  configuration.


