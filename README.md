[![Build Status](https://travis-ci.org/DanWahlin/Observable-Store.svg?branch=master)](https://travis-ci.org/DanWahlin/Observable-Store)
[![npm version](https://badge.fury.io/js/%40codewithdan%2Fobservable-store.svg)](https://www.npmjs.com/package/@codewithdan/observable-store)

## Observable Store - State Management for Front-End Applications (Angular, React, Vue.js, or any other)

Observable Store is a front-end state management library that provides a simple yet powerful way to manage state in front-end applications. Front-end state management has become so complex that many of us spend more hours working on the state management code than on the rest of the application. Observable Store has one overall goal -   "keep it simple".

The goal of observable store is to provide a small, simple, and consistent way to manage state in any front-end application (Angular, React, Vue.js or any other) while achieving many of the [key goals](#goals) offered by more complex state management solutions. While many front-end frameworks/libraries provide state management functionality, many can be overly complex and are only useable with the target framework/library. Observable Store is simple and can be used with any front-end JavaScript codebase.

<a href="https://blog.codewithdan.com/simplifying-front-end-state-management-with-observable-store" target="_blank">View my blog post about Observable Store</a>

![Using Obervable Store](images/ObservableStore.png)

### <a name="goals"></a>Key Goals of Observable Store:
1. Keep it simple!
1. Single source of truth for state
1. Store state is immutable
1. Provide state change notifications to any subscriber
1. Track state change history
1. Easy to understand with a minimal amount of code required to get started
1. Works with any front-end project built with JavaScript or TypeScript (Angular, React, Vue, or anything else)
1. Integrate with the Redux DevTools (Angular and React currently supported)

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
* [Using Observable Store with Vue.js](#vue)

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

1. Add a service (you can optionally calll it a store if you'd like) that extends ObservableStore<T>. Pass the interface or model class that represents the shape of your store data in for T as shown next:

    ``` typescript
    @Injectable()
    export class CustomersService extends ObservableStore<StoreState> {

    }
    ```

1. In the constructor add a call to `super()`. The store allows you to turn tracking of store state changes on and off using the `trackStateHistory` property. See a list of [Observable Store Settings](#settings).

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
            this.setState(initialState, 'INIT_STATE');
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

1. Install RxJS (a required peer dependency):

    `npm install rxjs`

1. Add a store class (you can call it whatever you'd like) that extends ObservableStore<T>. 

    ``` javascript
    export class CustomersStore extends ObservableStore {

    }
    ```

1. In the constructor add a call to `super()`. The store allows you to turn tracking of store state changes on and off using the `trackStateHistory` property. See a list of [Observable Store Settings](#settings).

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
                    this.setState({ customers }, 'GET_CUSTOMERS');
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
                    this.setState({ customer }, 'GET_CUSTOMER');
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
        GetCustomers: 'GET_CUSTOMERS',
        GetCustomer: 'GET_CUSTOMER'
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

....

### <a name="api"></a>Store API

Observable Store provides a simple API that can be used to get/set state, subscribe to store state changes, and access state history. If you're new to TypeScript generics, the `T` shown in the APIs below represents your store's state.

 Functions                                      | Description
| ----------------------------------------------| -----------------------------------------------------
| `dispatchState(stateChanges: Partial<T>, dispatchGlobalState: boolean = true) : T`                              | Dispatch the store's state without modifying the  state. Service state can be dispatched as well as the global store state. If `dispatchGlobalState` is false then global state will not be dispatched to subscribers (defaults to `true`). 
| `getState(deepCloneReturnedState: boolean = true) : T`                              | Retrieve store's state. If using TypeScript (optional) then the state type defined when the store was created will be returned rather than `any`. The deepCloneReturnedState boolean parameter (default is true) can be used to determine if the returned state will be deep cloned or not. If set to false, a reference to the store state will be returned and it's up to the user to ensure the state isn't change from outside the store. Setting it to false can be useful in cases where read-only cached data is stored and must be retrieved as quickly as possible without any cloning.
| `getStateProperty<TProp>(propertyName: string, deepCloneReturnedState: boolean = true) : TProp`| Retrieve a specific property from the store's state which can be more efficient than getState() since only the defined property value will be returned (and cloned) rather than the entire store value. If using TypeScript (optional) then the generic property type used with the function call will be the return type.                           
| `logStateAction(state: any, action: string): void` | Add a custom state value and action into the state history. Assumes `trackStateHistory` setting was set on store or using the global settings.
| `resetStateHistory(): void`                   | Reset the store's state history to an empty array.
| `setState(state: T, action: string, dispatchState: boolean = true, deepCloneState: boolean = true) : T`      | Set the store state. Pass the state to be updated as well as the action that is occuring. The state value can be a function (see example below). The latest store state is returned and any store subscribers are notified of the state change. The dispatchState parameter can be set to `false` if you do not want to send state change notifications to subscribers. The deepCloneReturnedState boolean parameter (default is true) can be used to determine if the state will be deep cloned before it is added to the store. Setting it to false can be useful in cases where read-only cached data is stored and must added to the store as quickly as possible without any cloning.
| `static addExtension(extension: ObservableStoreExtension)`                              | Used to add an extension into ObservableStore. The extension must implement the `ObservableStoreExtension` interface. 
| `static clearState(): void`| Clear/null the store state across all services that use it.
| `static initializeState(state: any)`                              | Used to initialize the store's state. An error will be thrown if this is called and store state already exists so this should be set when the application first loads. No notifications are sent out to store subscribers when the store state is initialized.
| `static resetState(state, dispatchState: boolean = true)`                              | Used to reset the state of the store to a desired value for all services that derive from ObservableStore<T>. A state change notification and global state change notification is sent out to subscribers if the dispatchState parameter is true (the default value).
<br>

 Properties                                     | Description
| ----------------------------------------------| -----------------------------------------------------
| `globalStateChanged: Observable<any>`         | Subscribe to global store changes i.e. changes in any slice of state of the store. The global store may consist of 'n' slices of state each managed by a particular service. This property notifies of a change in any of the 'n' slices of state. Returns an RxJS Observable containing the current store state. 
| `globalStateWithPropertyChanges: Observable<StateWithPropertyChanges<any>>`         | Subscribe to global store changes i.e. changes in any slice of state of the store and also include the properties that changed as well. The global store may consist of 'n' slices of state each managed by a particular service. This property notifies of a change in any of the 'n' slices of state. Upon subscribing to `globalStateWithPropertyChanges` you will get back an object containing `state` (which has the current store state) and `stateChanges` (which has the individual properties/data that were changed in the store).
| `stateChanged: Observable<T>`                 | Subscribe to store changes in the particlar slice of state updated by a Service. If the store contains 'n' slices of state each being managed by one of 'n' services, then changes in any of the other slices of state will not generate values in the stateChanged stream. Returns an RxJS Observable containing the current store state (or a specific slice of state if a stateSliceSelector has been specified). 
| `stateWithPropertyChanges: Observable<StateWithPropertyChanges<T>>`     | Subscribe to store changes in the particlar slice of state updated by a Service and also include the properties that changed as well. Upon subscribing to `stateWithPropertyChanges` you will get back an object containing `state` (which has the current slice of store state) and `stateChanges` (which has the individual properties/data that were changed in the store).
| `stateHistory: StateHistory`                  | Retrieve state history. Assumes `trackStateHistory` setting was set on the store.
| `static allStoreServices: any[]`| Provides access to all services that interact with ObservableStore. Useful for extensions that need to be able to access a specific service.
| `static globalSettings: ObservableStoreGlobalSettings`| get/set global settings throughout the application for ObservableStore. See the [Observable Store Settings](#settings) below for additional information. Note that global settings can only be set once as the application first loads.
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
| `includeStateChangesOnSubscribe: boolean`   | **DEPRECATED**. Returns the store state by default when false (default). Set to `true` if you want to receive the store state as well as the specific properties/data that were changed when the `stateChanged` subject emits. Upon subscribing to `stateChanged` you will get back an object containing `state` (which has the current store state) and `stateChanges` (which has the individual properties/data that were changed in the store). **Since this is deprecated, use `stateWithPropertyChanges` or `globalStateWithPropertyChanges` instead.**
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
* `includeStateChangesOnSubscribe` [DEPRECATED]

Global store settings are defined ONCE when the application **first initializes** and BEFORE the store has been used:

``` javascript
ObservableStore.globalSettings = {  /* pass settings here */ };
```

### <a name="extensions"></a>Extensions

Observable Store now supports extensions. These can be added when the application first loads by calling `ObservableStore.addExtension()`.

**Redux DevTools Extension**

The first built-in extension adds [Redux DevTools](http://extension.remotedev.io/) integration into applications that use Observable Store. The extension can be found in the `@codewithdan/observable-store-extensions` package.

![Integrating the Redux DevTools](images/reduxDevTools.png)

**Note about Angular 9/Ivy and the Redux DevTools Support**

While the [code is in place](https://github.com/DanWahlin/Observable-Store/blob/master/modules/observable-store-extensions/angular/angular-devtools-extension.ts) to support it, The Observable Store Redux DevTools currently do not work with Angular 9 and Ivy. Once the [`findProviders()` API](https://github.com/angular/angular/blob/cd9ae66b357bd4b5f97aa60cea38e48acb015325/packages/core/src/testability/testability.ts#L221) is fully implemented and released by Angular then support will be finalized for the Redux DevTools.

**Note about the `__devTools` Store Property:** 

When the Redux DevTools extension is enabled it will add routing information into your store using a property called `__devTools`. This property is used to enable the Redux DevTools time travel feature and can be useful for associating different action states with a given route when manually looking at store data using the DevTools. If the Redux DevTools extension is not enabled (such as in production scenarios) then the `__devTools` property will not be added into your store.


**Integrating Angular with the Redux DevTools**

See the example in the `samples/angular-store-edits` folder.

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

Install the [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) in your browser, run your Angular application, and open the Redux DevTools extension.


**Integrating React with the Redux DevTools**

See the example in the `samples/react-store` folder.

Install the extensions package:

`npm install @codewithdan/observable-store-extensions`

Add the `history` prop to your router:

```jsx
import React from 'react';
import { Router, Route, Redirect } from 'react-router-dom';
import { createBrowserHistory } from 'history';|

export const history = createBrowserHistory();

...

const Routes = () => (
  <Router history={history}>
    <div>
       <!-- Routes go here -->
    </div>
  </Router>
);

export default Routes;

```

Add the following into `index.js` and ensure that you set `trackStateHistory` to `true` and pass the `history` object into the `ReduxDevToolsExtension` constructor as shown:

``` javascript
import Routes, { history } from './Routes';
import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

...

ObservableStore.globalSettings = {  
    trackStateHistory: true
};
ObservableStore.addExtension(new ReduxDevToolsExtension({ 
    reactRouterHistory: history 
}));

ReactDOM.render(<Routes />, document.getElementById('root'));
```

Install the [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) in your browser, run your React application, and open the Redux DevTools extension.

### Redux DevTools and Production

While you can enable the Redux DevTools extension in production it's normally recommended that you remove it. That can be done through a custom build process or by checking the environment where your code is running.

**Angular Example**

```typescript
import { environment } from './environments/environment';

if (!environment.production) {
    ObservableStore.addExtension(new ReduxDevToolsExtension());
}
```


**React Example**

```typescript
if (process.env.NODE_ENV !== 'production') {
    ObservableStore.addExtension(new ReduxDevToolsExtension({ 
        reactRouterHistory: history 
    }));
}
```

### Changes

#### 1.0.11 

Added `includeStateChangesOnSubscribe` setting (NOW DEPRECATED in 2+) for cases where a subscriber to `stateChanged` wants to get the current state as well as the specific properties/data that were changes in the store. Defaults to `false` so prior versions will only receive the current state by default which keeps patched versions compatible in the 1.0.x range.

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

#### 2.0.0 - October 13, 2019

1. Added more strongly-typed information for `stateChanged` and the overall API to provide better code help while using Observable Store.
1. RxJS is now a peer dependency (RxJS 6.4.0 or higher is required). This avoids reported versioning issues that have come up when a project already has RxJS in it. The 1.x version of Observable Store added RxJS as a dependency. Starting with 2.0.0 this is no longer the case.
1. Added an `ObservableStore.globalSettings` property to allow store settings to be defined once if desired for an entire application rather than per service that uses the store. 
1. `getState()` and `setState()` now clone when the global settings `isProduction` property is false (`ObservableStore.globalSettings = { isProduction: false }`). When running in production mode no cloning is used in order to enhance performance since mutability issues would've been detected at development time. This technique is used with other store solutions as well. NOTE: isProduction is no longer used. See 2.0.1 below.
1. Changed TypeScript module compilation to CommonJS instead of ES2015 to aid with testing scenarios (such as Jest) where the project doesn't automatically handle ES2015 module conventions without extra configuration.

#### 2.0.1 - October 14, 2019

Due to edge cases cloning is used in development and production. The `isProduction` property is left in so builds are not broken, but currently isn't used.

#### 2.1.0 - October 24, 2019

In order to allow `stateChanged` to be strongly-typed and also allow state changes with property changes to return a strongly-typed object as well, there are now 4 observable options to choose from when you want to know about changes to the store:

```typescript
// access state changes made by a service interacting with the store
// allows access to slice of store state that service interacts with
stateChanged: Observable<T>   

// access all state changes in the store regardless of where they're
// made in the app
globalStateChanged: Observable<any>  

// access state changes made by a service interacting with the 
// store and include the properties that were changed
stateWithPropertyChanges: Observable<StateWithPropertyChanges<T>> 

// access all state changes in the store and include the 
// properties that were changed
globalStateWithPropertyChanges: Observable<StateWithPropertyChanges<any>>
````

The `includeStateChangesOnSubscribe` property is now deprecated since `stateWithPropertyChanges` or `globalStateWithPropertyChanges` can be used directly.

Thanks to <a href="https://github.com/MichaelTurbe" target="_blank">Michael Turbe</a> for the feedback and discussion on these changes.

#### 2.2.3 - December 10, 2019

This version adds a [Redux DevTools Extension](#extensions). A BIG thank you to @brandonroberts (https://github.com/brandonroberts) of [NgRx](https://github.com/ngrx) fame for helping get me started integrating with the Redux DevTools.

New APIs:

* A static `allStoreServices` property is now available to access all services that extend ObservableStore and interact with the store. Used by the Redux DevTools extension and can be useful for future extensions.
* Added static `addExtension()` function. Used to add the [Redux DevTools Extension](#extensions) and any future extensions.
* Added new `@codewithdan/observable-store-extensions` package for the redux devtools support.

#### 2.2.4 - January 23, 2019

Minor updates to the Observable Store docs. Fixed a bug in the Redux DevTools extension that would throw an error when the extension wasn't installed or available. Updated readme to discuss how to disable extensions for production scenarios.

Thanks to <a href="https://github.com/riscie" target="_blank">Matthias Langhard</a> for the feedback and discussion on these changes.

#### 2.2.5 - February 26, 2020

- Added `ObservableStore.initializeState()` API. 
- Refactored unit tests.

#### 2.2.6 - February 29, 2020

- Added `ObservableStore.resetState()` API.
- Added unit tests for `resetState()`.

Feedback from <a href="https://github.com/svehera" target="_blank">Severgyn</a> and <a href="https://github.com/LuizFilipeMedeira" target="_blank">Luiz Filipe</a> influenced this feature. Thanks folks!

#### 2.2.7 - March 6, 2020

- Fixed bug where Redux DevTools code for Angular v8 or lower was also calling code intended for Angular v9 (which is still a work in progress as noted in the Redux DevTools section above).

Thanks to <a href="https://github.com/trentsteel84" target="_blank">trentsteel84</a> for reporting the issue.

##### 2.2.8 - April 2, 2020

- All calls to getState() and setState() clone data now due to edge issues that can arise otherwise with external references. Previously, it would
selectively clone based on dev or prod. All functions that get/set state now provide an optional `deepClone` type of boolean property that can be used in cases where
it's not desirable to clone state (large amount of data being added to the store for caching for example).

- Added `ObservableStore.clearState()` API to null the store across all services that use it.
- Added `getStateProperty<T>(propName: string)` to retrieve a specific property from the store versus retrieving the entire store
as `getState()` does.

##### 2.2.9 - May 5, 2020

Added support for cloning Map and Set objects in the interal cloner service used by Observable Store. Thanks to <a href="https://github.com/chrisjandrade" target="_blank">Chris Andrade</a> for the initial contribution. 

##### 2.2.10 - May 20, 2020

External APIs supported turning off cloning but internal APIs still cloned which isn't optimal for people storing a lot of data in the store. Thanks to 
 <a href="https://github.com/Steve-RW" target="_blank">Steve-RW</a> for asking about it and for the PR that fixed it.

##### 2.2.11 - May 21, 2020

Updates to documentation.

### Building the Project

See the `README.md` file in the `modules` folder.


