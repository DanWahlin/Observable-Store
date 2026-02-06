import { Link } from 'react-router-dom';
import { capitalize, formatCurrency } from '../utils/index.js';

function CustomerRow({ customer }) {
  return (
    <tr>
      <td><Link to={`/orders/${customer.id}`}>{capitalize(customer.name)}</Link></td>
      <td>{customer.city}</td>
      <td>{formatCurrency(customer.orderTotal)}</td>
      <td><Link to={`/orders/${customer.id}`}>Orders</Link></td>
      <td><Link to={`/customers/${customer.id}`}>Edit</Link></td>
    </tr>
  );
}

export default CustomerRow;
