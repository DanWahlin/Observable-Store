import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { capitalize } from '../utils/index.js';
import OrdersList from './OrdersList.jsx';
import CustomersStore from '../stores/CustomersStore.js';
import OrdersStore from '../stores/OrdersStore.js';

function OrdersContainer() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const storeSubRef = useRef(null);

  useEffect(() => {
    const customerId = +id;

    storeSubRef.current = CustomersStore.stateChanged.subscribe(state => {
      if (state && state.customer) {
        setCustomer(state.customer);
      }
    });

    CustomersStore.getCustomer(customerId);

    OrdersStore.getOrders(customerId).then(ords => {
      setOrders(ords);
    });

    return () => {
      if (storeSubRef.current) {
        storeSubRef.current.unsubscribe();
      }
    };
  }, [id]);

  return (
    <div>
      {customer ? (
        <div>
          <h1>Orders for {capitalize(customer.name)}</h1>
          <br />
          <OrdersList orders={orders} />
        </div>
      ) : (
        <div className="row">No customer found</div>
      )}
      <br />
      <Link to="/customers">View All Customers</Link>
    </div>
  );
}

export default OrdersContainer;
