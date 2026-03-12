import { onMount, createSignal, onCleanup  } from 'solid-js'
import './App.css'
import Child from './Child'
import { customersStore } from './core/CustomersStore';
import type {Customer, StoreState} from './core/CustomersStore';
import { Observable } from 'rxjs';
import type { StateWithPropertyChanges } from '@codewithdan/observable-store';
import { For, Show } from "solid-js"

function App() {
  const [storeState, setStoreState] = createSignal<Observable<StoreState>>(new Observable<StoreState>())
  const [storeStateWithPropertyChanges, setStoreStateWithPropertyChanges] = createSignal<StateWithPropertyChanges<StoreState>>(new Observable<StateWithPropertyChanges<StoreState>>())


  onMount(() => {
     const sub1 = customersStore.stateChanged.subscribe(state => {
    setStoreState(state);
  });

  const sub2 = customersStore.stateWithPropertyChanges.subscribe(state => {
    setStoreStateWithPropertyChanges(state);
  });

  onCleanup(() => {
    sub1.unsubscribe();
    sub2.unsubscribe();
  });
  })

  function addCustomer() {
    const customer: Customer = {
      id: Date.now(),
      firstName: 'John',
      lastName: 'Doe'
    };
    customersStore.addCustomer(customer);
  }

  function updateCustomer(customer: Customer) {
    customersStore.updateCustomer(customer);
  }

 return (
  <div>
    <h1>Customers</h1>

    <button onClick={addCustomer}>Add Customer</button>

    <Show when={storeState()} fallback={<p>Nothing to display</p>}>
      {(state) => (
        <ul>
          <For each={state().customers}>
            {(customer) => (
              <li>
                {customer.firstName} {customer.lastName}
                <button onClick={() => updateCustomer(customer)}>
                  Update
                </button>
              </li>
            )}
          </For>
        </ul>
      )}
    </Show>

    <Child />

    <h2>State with Property Changes</h2>
    <p>This shows the store state as well as which properties changed.</p>

    <pre>
      {JSON.stringify(storeStateWithPropertyChanges(), null, 2)}
    </pre>
  </div>
);
}

export default App
