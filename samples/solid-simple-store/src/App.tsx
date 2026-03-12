import { createSignal } from "solid-js"
import { onMount, onCleanup } from "solid-js"
import {customersStore} from './store/CustomersStore';
import { Subscription } from 'rxjs';
import { Customer } from './store/customer';
import './App.css'

function App() {

   const [customers, setCustomers] = createSignal<Customer[]>([]);
   const [isHistoryVisible, setIsHistoryVisible] = createSignal(false)
   const [stateHistory, setStateHistory] = createSignal<[]>([])
   const subs = new Subscription();


  onMount(() => {
     // Subscribe to store state changes
     subs.add(customersStore.stateChanged.subscribe(state => {
      if (state && state.customers) {
        setCustomers(state.customers);
      }
    }));

    // Trigger the initial data fetch
        customersStore.get();    
  })

  function addCustomer() {
    const cust = {
      id: Date.now(),
      name: 'Fred',
      address: {
        street: Date.now() + ' Main St.',
        city: 'Phoenix',
        state: 'AZ',
        zip: '85258'
      }
    };
    customersStore.add(cust);
  }

  function removeCustomer() {
    customersStore.remove();
  }

  function sortCustomers() {
    customersStore.sort('id');
  }

  function viewStateHistory() {
    setIsHistoryVisible(!isHistoryVisible());
    setStateHistory(customersStore.stateHistory);
  }

  onCleanup(() => {
    subs.unsubscribe();
  })

  return (
    <div>
      <h1>Customers</h1>
      <button onClick={addCustomer} class="btn btn-primary">Add Customer</button>
      <button onClick={removeCustomer} class="btn btn-danger">Remove Customer</button>
      <button onClick={sortCustomers} class="btn btn-secondary">Sort Customers</button>
      <button onClick={viewStateHistory} class="btn btn-secondary">Toggle State History</button>
      <br /><br />
<pre>
{JSON.stringify(customers(), null, 2)}
</pre>
<br />
<br />
{isHistoryVisible() ? (<div>
<h2>State History</h2>
<pre>
{JSON.stringify(stateHistory(), null, 2)}
</pre>
</div>): ("State History will be displayed here")}
    </div>
  )
}

export default App
