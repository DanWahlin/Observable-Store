import { createSignal, onMount } from "solid-js"
import { customersStore} from './core/CustomersStore';
import type {StoreState} from './core/CustomersStore';
import { Observable } from 'rxjs';
import { Show, For } from "solid-js";

export default function Child() {
    const [storeState, setStoreState] = createSignal<Observable<StoreState>>(new Observable<StoreState>())

    onMount(() => {
        setStoreState(customersStore.stateChanged);
    })
    return (
     <>   
    <h1>Customers (in Child Component)</h1>

    <Show when={storeState()} fallback={<p>No customers</p>}>
    {(state) => (
    <ul>
      <For each={state().customers ?? []}>
        {(customer) => (
          <li>
            {customer.firstName} {customer.lastName}
          </li>
        )}
      </For>
    </ul>
    )}
</Show>
    </>
    )
}