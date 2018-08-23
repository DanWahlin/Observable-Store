import React from 'react';
import { Link } from 'react-router-dom';
import Currency from 'react-currency-formatter';

import { capitalize } from '../utils';

const CustomerRow = ({ customer }) => {
  return (
    <tr>
      <td>
        <Link to={`/orders/${customer.id}`}>{capitalize(customer.name)}</Link>
      </td>
      <td>{customer.city}</td>
      <td>
        <Currency quantity={customer.orderTotal} />
      </td>
    </tr>
  );
};

export default CustomerRow;
