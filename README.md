[![Node.js CI](https://github.com/DanWahlin/Observable-Store/actions/workflows/nodejs-build-validation.yml/badge.svg)](https://github.com/DanWahlin/Observable-Store/actions/workflows/nodejs-build-validation.yml)
[![npm version](https://img.shields.io/npm/v/@codewithdan/observable-store?color=%23330C252&label=npm%20version)](https://www.npmjs.com/package/@codewithdan/observable-store)

## Observable Store - State Management for Front-End Applications (Angular, React, Vue.js, or any other)

Observable Store is a front-end state management library that provides a simple yet powerful way to manage state in front-end applications. Front-end state management has become so complex that many of us spend more hours working on the state management code than on the rest of the application. Observable Store has one overall goal -   "keep it simple".

The goal of observable store is to provide a small, simple, and consistent way to manage state in any front-end application (Angular, React, Vue.js or any other) while achieving many of the [key goals](#goals) offered by more complex state management solutions. While many front-end frameworks/libraries provide state management functionality, many can be overly complex and are only useable with the target framework/library. Observable Store is simple and can be used with any front-end JavaScript codebase.

* <a href="https://blog.codewithdan.com/simplifying-front-end-state-management-with-observable-store" target="_blank">Blog Post about Observable Store</a>

* <a href="https://www.youtube.com/watch?v=jn4AH5pGWhA" target="_blank">Talk on Observable Store</a>

![Using Observable Store](images/ObservableStore.png)

### <a name="goals"></a>Key Goals of Observable Store:
1. Keep it simple!
1. Single source of truth for state
1. Store state is immutable
1. Provide state change notifications to any subscriber
1. Track state change history
1. Easy to understand with a minimal amount of code required to get started
1. Works with any front-end project built with JavaScript or TypeScript (Angular, React, Vue, or anything else)
1. Integrate with the Redux DevTools (Angular and React currently supported)

### Compatibility

- **Angular 17+** — use Observable Store **v3** (`npm install @codewithdan/observable-store`)
- **Angular 14–16** — use Observable Store **v2.2.15** (`npm install @codewithdan/observable-store@2.2.15`)
- **React, Vue, and vanilla JS** — v3 works with any modern setup

### Development Setup

To run samples locally from this repo:

1. Build the core modules first:

    ```bash
    npm run build
    ```

2. Then go into any sample and install + start:

    ```bash
    cd samples/angular-store
    npm install
    npm start
    ```

### Steps to use Observable Store

Here's a simple example of getting started using Observable Store. Note that if you're using TypeScript you can provide additional details about the store state by using an interface or class (additional examples of that can be found below).

1. Install the Observable Store package:

    `npm install @codewithdan/observable-store`

1. Install RxJS - a required peer dependency if your project doesn't already reference it:

    `npm install rxjs`

1. Create a class that extends `ObservableStore`. Optionally pass settings into `super()` in your class's constructor ([view Observable Store settings](#settings)). While this shows a pure JavaScript approach, ObservableStore also accepts a generic that represents the store type. See the Angular example below for more details.

    ``` javascript
    export class CustomersStore extends ObservableStore {

        constructor() {
            super({ /* add settings here */ });
        }

    }
    ```

1. Update the store state using `setState(state, action)`.

    ``` javascript
    addCustomerToStore(newCustomer) {
        this.setState({ customer: newCustomer }, 'add_customer');
    }
    ```

1. Retrieve store state using `getState()`.

    ``` javascript
    getCustomerFromStore() {
        this.getState().customer;
    }
    ```

1. Subscribe to store changes in other areas of the application by using the store's `stateChanged` observable.

    ``` javascript
    // Create CustomersStore object or have it injected if platform supports that

    init() {
        this.storeSub = this.customersStore.stateChanged.subscribe(state => {
            if (state) {
                this.customer = state.customer;
            }
        });
    }

    // Note: Would need to unsubscribe by calling this.storeSub.unsubscribe()
    // as the target object is destroyed
    ```

1. Access store state history in `CustomersStore` by calling the `stateHistory` property (this assumes that the `trackStateHistory` setting is set to `true`)

    ``` javascript
    console.log(this.stateHistory);
    ```

### API and Settings

[Observable Store API](#api)

[Observable Store Settings](#settings)

[Observable Store Global Settings](#globalSettings)

[Observable Store Extensions](#extensions)

### Running the Samples

Open the `samples` folder available at the Github repo and follow the instructions provided in the readme file for any of the provided sample projects.

### Sample Applications

* [Using Observable Store with Angular](#angular)
* [Using Observable Store with React](#react)
* [Using Observable Store with JavaScript](#javascript)

## <a name="angular"></a>Using Observable Store with Angular

See the `samples` folder in the Github repo for examples of using Observable Store with Angular.

1. Create an Angular application using the Angular CLI or another option.

1. Install `@codewithdan/observable-store`:

    `npm install @codewithdan/observable-store`

1. Add an interface or model object that represents the shape of the data you'd like to add to your store. Here's an example of an interface to store customer state:

    ``` typescript
    export interface StoreState {
        customers: Customer[];
        customer: Customer;
    }
    ```

1. Add a service (you can optionally call it a store if you'd like) that extends ObservableStore<T>. Pass the interface or model class that represents the shape of your store data in for T as shown next:

    ``` typescript
    @Injectable({ providedIn: 'root' })
    export class CustomersService extends ObservableStore<StoreState> {

    }
    ```

1. In the constructor add a call to `super()`. The store allows you to turn tracking of store state changes on and off using the `trackStateHistory` property. See a list of [Observable Store Settings](#settings).

    ``` typescript
    constructor() { 
        super({ trackStateHistory: true });
    }
    ```

1. Add functions into your service/store to retrieve, store, sort, filter, or perform any actions you'd like. To update the store call `setState()` and pass the action that is occurring as well as the store state. To get the state out of the store call `getState()`. Note that store data is immutable and `getState()` always returns a clone of the store data. Here's a simple example:

    ``` typescript
    @Injectable({ providedIn: 'root' })
    export class CustomersService extends ObservableStore<StoreState> {
        sorterService: SorterService;

        constructor(sorterService: SorterService) { 
            const initialState = {
                customers: [],
                customer: null
            }
            super({ trackStateHistory: true });
            this.setState(initialState, 'INIT_STATE');
            this.sorterService = sorterService;
        }

        get() {
            const { customers } = this.getState();
            if (customers) {
                return of(customers);
            }
            // call server and get data
            // assume async call here that returns observable
            return asyncData;
        }

        add(customer: Customer) {
            let state = this.getState();
            state.customers.push(customer);
            this.setState({ customers: state.customers }, 'ADD_CUSTOMER');
        }

        remove() {
            let state = this.getState();
            state.customers.splice(state.customers.length - 1, 1);
            this.setState({ customers: state.customers }, 'REMOVE_CUSTOMER');
        }
        
        sort(property: string = 'id') {
            let state = this.getState();
            const sortedState = this.sorterService.sort(state.customers, property);
            this.setState({ customers: sortedState }, 'SORT_CUSTOMERS');
        }

    }
    ```

    While strings are used for actions in the prior examples, you can use string enums (a TypeScript feature) as well if you want to have a set list of actions to choose from:

    ``` typescript
        export enum CustomersStoreActions {
            AddCustomer = 'ADD_CUSTOMER',
            RemoveCustomer = 'REMOVE_CUSTOMER',
            GetCustomers = 'GET_CUSTOMERS',
            SortCustomers = 'SORT_CUSTOMERS'
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
            "action": "INIT_STATE",
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
            "action": "ADD_CUSTOMER",
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
            if (state) {
                this.customers = state.customers;
            }
        });

        // Can call service/store to get data directly 
        // It won't fire when the store state changes though in this case
        //this.storeSub = this.customersService.get().subscribe(custs => this.customers = custs);
    }
    ```

    Unsubscribe when the component is destroyed to avoid memory leaks:

    ``` typescript
    ngOnDestroy() {
        if (this.storeSub) {
            this.storeSub.unsubscribe();
        }        
    }
    ```

## <a name="react"></a>Using Observable Store with React

See the `samples/react-store` folder in the Github repo for a complete example.

1. Create a React application using [Vite](https://vitejs.dev/) or another tool:

    ```bash
    npm create vite@latest my-app -- --template react
    ```

1. Install `@codewithdan/observable-store` and RxJS:

    ```bash
    npm install @codewithdan/observable-store rxjs
    ```

1. Create a store class that extends `ObservableStore`:

    ``` javascript
    import { ObservableStore } from '@codewithdan/observable-store';

    class CustomersStore extends ObservableStore {

        constructor() {
            super({ trackStateHistory: true });
        }

        fetchCustomers() {
            return fetch('/customers.json')
                .then(response => response.json())
                .then(customers => {
                    this.setState({ customers }, 'GET_CUSTOMERS');
                    return customers;
                });
        }

        getCustomers() {
            const state = this.getState();
            if (state && state.customers) {
                return Promise.resolve(state.customers);
            }
            return this.fetchCustomers();
        }
    }

    export default new CustomersStore();
    ```

1. Use the store in a component with hooks. Subscribe to `stateChanged` in a `useEffect` and clean up on unmount:

    ``` jsx
    import { useState, useEffect } from 'react';
    import CustomersStore from '../stores/CustomersStore';

    function CustomersList() {
        const [customers, setCustomers] = useState([]);

        useEffect(() => {
            // Subscribe to store state changes
            const sub = CustomersStore.stateChanged.subscribe(state => {
                if (state && state.customers) {
                    setCustomers(state.customers);
                }
            });

            // Trigger the initial data fetch
            CustomersStore.getCustomers();

            // Cleanup subscription on unmount
            return () => sub.unsubscribe();
        }, []);

        return (
            <ul>
                {customers.map(cust => (
                    <li key={cust.id}>{cust.name}</li>
                ))}
            </ul>
        );
    }

    export default CustomersList;
    ```

## <a name="javascript"></a>Using Observable Store with JavaScript

See the `samples/javascript-demo` folder in the Github repo for a complete example. Observable Store works with plain JavaScript — no framework required.

1. Create a project with [Vite](https://vitejs.dev/) or any bundler, then install Observable Store:

    ```bash
    npm install @codewithdan/observable-store rxjs
    ```

1. Create a store class and use it directly:

    ``` javascript
    import { ObservableStore } from '@codewithdan/observable-store';

    class CustomersStore extends ObservableStore {
        constructor() {
            super({ trackStateHistory: true, logStateChanges: true });
        }

        addCustomer(customer) {
            const state = this.getState();
            const customers = state?.customers ? [...state.customers, customer] : [customer];
            this.setState({ customers }, 'ADD_CUSTOMER');
        }
    }

    const store = new CustomersStore();

    // Subscribe to state changes
    store.stateChanged.subscribe(state => {
        if (state) {
            console.log('Customers:', state.customers);
        }
    });

    // Update state
    store.addCustomer({ id: 1, name: 'Jane Doe' });
    ```

### <a name="api"></a>Store API

Observable Store provides a simple API that can be used to get/set state, subscribe to store state changes, and access state history. If you're new to TypeScript generics, the `T` shown in the APIs below represents your store's state.

 Functions                                      | Description
| ----------------------------------------------| -----------------------------------------------------
| `dispatchState(stateChanges: Partial<T>, dispatchGlobalState: boolean = true) : void`                              | Dispatch the store's state without modifying the store state. Service state can be dispatched as well as the global store state. If `dispatchGlobalState` is false then global state will not be dispatched to subscribers (defaults to `true`). 
| `getState(deepCloneReturnedState: boolean = true) : T`                              | Retrieve store's state. If using TypeScript (optional) then the state type defined when the store was created will be returned rather than `any`. The deepCloneReturnedState boolean parameter (default is true) can be used to determine if the returned state will be deep cloned or not. If set to false, a reference to the store state will be returned and it's up to the user to ensure the state isn't changed from outside the store. Setting it to false can be useful in cases where read-only cached data is stored and must be retrieved as quickly as possible without any cloning.
| `getStateProperty<TProp>(propertyName: string, deepCloneReturnedState: boolean = true) : TProp`| Retrieve a specific property from the store's state which can be more efficient than getState() since only the defined property value will be returned (and cloned) rather than the entire store value. If using TypeScript (optional) then the generic property type used with the function call will be the return type.      
| `getStateSliceProperty<TProp>(propertyName: string, deepCloneReturnedState: boolean = true): TProp`| If a `stateSliceSelector` has been set, the specific slice will be searched first. Retrieve a specific property from the store's state which can be more efficient than getState() since only the defined property value will be returned (and cloned) rather than the entire store value. If using TypeScript (optional) then the generic property type used with the function call will be the return type.
| `logStateAction(state: any, action: string): void` | Add a custom state value and action into the state history. Assumes `trackStateHistory` setting was set on store or using the global settings.
| `resetStateHistory(): void`                   | Reset the store's state history to an empty array.
| `setState(state: Partial<T> \| stateFunc<T>, action?: string, dispatchState: boolean = true, deepCloneState: boolean = true) : T`      | Set the store state. Pass the state to be updated as well as the action that is occurring. The state value can be an object or a function (see example below). The latest store state is returned and any store subscribers are notified of the state change. The `dispatchState` parameter can be set to `false` if you do not want to send state change notifications to subscribers. The `deepCloneState` parameter (default is true) can be used to determine if the state will be deep cloned before it is added to the store. Setting it to false can be useful in cases where read-only cached data is stored and must be added to the store as quickly as possible without any cloning.
| `destroy(): void`                              | Unregister this service from the global store and complete its state dispatchers. Call this when a service is destroyed (e.g., in Angular's `ngOnDestroy`) to prevent memory leaks.
| `static addExtension(extension: ObservableStoreExtension)`                              | Used to add an extension into ObservableStore. The extension must implement the `ObservableStoreExtension` interface. 
| `static clearState(dispatchState: boolean = true): void`| Clear/null the store state across all services that use it. A state change notification is sent to subscribers if `dispatchState` is true (the default).
| `static initializeState(state: any)`                              | Used to initialize the store's state. An error will be thrown if this is called and store state already exists so this should be set when the application first loads. No notifications are sent out to store subscribers when the store state is initialized.
| `static resetState(state, dispatchState: boolean = true)`                              | Used to reset the state of the store to a desired value for all services that derive from ObservableStore<T>. A state change notification and global state change notification is sent out to subscribers if the dispatchState parameter is true (the default value).
<br>

 Properties                                     | Description
| ----------------------------------------------| -----------------------------------------------------
| `globalStateChanged: Observable<any>`         | Subscribe to global store changes i.e. changes in any slice of state of the store. The global store may consist of 'n' slices of state each managed by a particular service. This property notifies of a change in any of the 'n' slices of state. Returns an RxJS Observable containing the current store state. 
| `globalStateWithPropertyChanges: Observable<StateWithPropertyChanges<any>>`         | Subscribe to global store changes i.e. changes in any slice of state of the store and also include the properties that changed as well. The global store may consist of 'n' slices of state each managed by a particular service. This property notifies of a change in any of the 'n' slices of state. Upon subscribing to `globalStateWithPropertyChanges` you will get back an object containing `state` (which has the current store state) and `stateChanges` (which has the individual properties/data that were changed in the store).
| `stateChanged: Observable<T>`                 | Subscribe to store changes in the particular slice of state updated by a Service. If the store contains 'n' slices of state each being managed by one of 'n' services, then changes in any of the other slices of state will not generate values in the stateChanged stream. Returns an RxJS Observable containing the current store state (or a specific slice of state if a stateSliceSelector has been specified). 
| `stateWithPropertyChanges: Observable<StateWithPropertyChanges<T>>`     | Subscribe to store changes in the particular slice of state updated by a Service and also include the properties that changed as well. Upon subscribing to `stateWithPropertyChanges` you will get back an object containing `state` (which has the current slice of store state) and `stateChanges` (which has the individual properties/data that were changed in the store).
| `stateHistory: StateHistory<T>[]`             | Retrieve state history. Assumes `trackStateHistory` setting was set on the store.
| `static allStoreServices: any[]`| Provides access to all services that interact with ObservableStore. Useful for extensions that need to be able to access a specific service.
| `static globalSettings: ObservableStoreGlobalSettings`| get/set global settings throughout the application for ObservableStore. See the [Observable Store Settings](#settings) below for additional information. Note that global settings can only be set once as the application first loads.
| `static isStoreInitialized: boolean`                              | Used to determine if the store's state is currently initialized. This is useful if there are multiple scenarios where the store might have already been initialized such as during unit testing etc or after the store has been cleared.
<br>

Note that TypeScript types are used to describe parameters and return types above. TypeScript is not required to use Observable Store though.

#### Passing a Function to setState()

Here's an example of passing a function to `setState()`. This allows the previous state to be accessed directly while setting the new state.

``` javascript
this.setState(prevState => { 
    return { customers: this.sorterService.sort(prevState.customers, property) };
}, 'SORT_CUSTOMERS');
```

### <a name="settings"></a>Store Settings (per service)

Observable Store settings can be passed when the store is initialized (when super() is called in a service). This gives you control over how things work for each service within your application that extends the store.
 
 Setting                         | Description
| -------------------------------|------------------------------------------------------------------------------------------------------------------- 
| `trackStateHistory: boolean`   | Determines if the store's state will be tracked or not (defaults to false). Pass it when initializing the Observable Store (see examples above). When `true`, you can access the store's state history by calling the `stateHistory` property.
| `logStateChanges: boolean`     | Log any store state changes to the browser console (defaults to false). 
| `stateSliceSelector: function`     | Function to select the slice of the store being managed by this particular service. If specified then the specific state slice is returned. If not specified then the total state is returned (defaults to null).

Example of passing settings to the store:

``` javascript
export class CustomersStore extends ObservableStore {

    constructor() {
        super({ /* add settings here */ });
    }

}
```

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

#### <a name="globalSettings"></a>Global Store Settings

You can set the following Observable Store settings globally for the entire application if desired. For details, view the [Observable Store Settings](#settings) section. This allows you to define the settings once and all services that extend Observable Store will automatically pick these settings up. You can override these properties at the service level as well which is nice when you want a particular service to have more logging (as an example) while other services don't.

* `trackStateHistory`
* `logStateChanges`

Global store settings are defined ONCE when the application **first initializes** and BEFORE the store has been used:

``` javascript
ObservableStore.globalSettings = {  /* pass settings here */ };
```

### <a name="extensions"></a>Extensions

Observable Store now supports extensions. These can be added when the application first loads by calling `ObservableStore.addExtension()`.

**Redux DevTools Extension**

The first built-in extension adds [Redux DevTools](https://github.com/reduxjs/redux-devtools) integration into applications that use Observable Store. The extension can be found in the `@codewithdan/observable-store-extensions` package.

![Integrating the Redux DevTools](images/reduxDevTools.png)

**Note about the `__devTools` Store Property:** 

When the Redux DevTools extension is enabled it will add routing information into your store using a property called `__devTools`. This property is used to enable the Redux DevTools time travel feature and can be useful for associating different action states with a given route when manually looking at store data using the DevTools. If the Redux DevTools extension is not enabled (such as in production scenarios) then the `__devTools` property will not be added into your store.


**Integrating Angular with the Redux DevTools**

See the example in the `samples/angular-store` folder.

Install the extensions package:

`npm install @codewithdan/observable-store-extensions`

Add the following into `main.ts` and ensure that you set `trackStateHistory` to `true`:

``` typescript
import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

...

ObservableStore.globalSettings = {  
    trackStateHistory: true
};
ObservableStore.addExtension(new ReduxDevToolsExtension());
```

Install the [Redux DevTools Extension](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) in your browser, run your Angular application, and open the Redux DevTools extension.


**Integrating React with the Redux DevTools**

See the example in the `samples/react-store` folder.

Install the extensions package:

`npm install @codewithdan/observable-store-extensions`

Add the following into your app's entry point (e.g., `main.jsx`) and ensure that you set `trackStateHistory` to `true`:

``` javascript
import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

ObservableStore.globalSettings = {  
    trackStateHistory: true
};
ObservableStore.addExtension(new ReduxDevToolsExtension());
```

Install the [Redux DevTools Extension](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) in your browser, run your React application, and open the Redux DevTools extension.

### Redux DevTools and Production

While you can enable the Redux DevTools extension in production it's normally recommended that you remove it. That can be done through a custom build process or by checking the environment where your code is running.

**Angular Example**

```typescript
import { isDevMode } from '@angular/core';

if (isDevMode()) {
    ObservableStore.addExtension(new ReduxDevToolsExtension());
}
```


**React Example**

```typescript
if (import.meta.env.DEV) {
    ObservableStore.addExtension(new ReduxDevToolsExtension());
}
```

### Changes

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

### Building the Project

```bash
# Build both modules (observable-store + extensions)
npm run build

# Run tests
npm test
```
