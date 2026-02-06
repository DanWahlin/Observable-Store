import { useState, useEffect, useRef } from 'react';
import CustomersStore from '../stores/CustomersStore.js';
import CustomersList from './CustomersList.jsx';

function CustomersContainer() {
  const [customers, setCustomers] = useState([]);
  const storeSubRef = useRef(null);

  useEffect(() => {
    // Subscribe to store changes
    storeSubRef.current = CustomersStore.stateChanged.subscribe(state => {
      if (state && state.customers) {
        setCustomers(state.customers);
      }
    });

    CustomersStore.getCustomers();

    return () => {
      if (storeSubRef.current) {
        storeSubRef.current.unsubscribe();
      }
    };
  }, []);

  return (
    <div>
      <h1>Customers</h1>
      <br />
      <CustomersList customers={customers} />
    </div>
  );
}

export default CustomersContainer;
