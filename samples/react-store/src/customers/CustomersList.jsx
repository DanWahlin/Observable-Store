import { useState, useEffect } from 'react';
import CustomerRow from './CustomerRow.jsx';
import { formatCurrency } from '../utils/index.js';

function CustomersList({ customers }) {
  const [filter, setFilter] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customersOrderTotal, setCustomersOrderTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    let result = customers;
    if (filter) {
      result = customers.filter(
        cust =>
          cust.name.toLowerCase().includes(filter.toLowerCase()) ||
          cust.city.toLowerCase().includes(filter.toLowerCase()) ||
          cust.orderTotal.toString().includes(filter.toLowerCase())
      );
    }
    setFilteredCustomers(result);
    setCustomersOrderTotal(calculateOrders(result));
  }, [customers, filter]);

  function calculateOrders(custs) {
    return custs.reduce((total, cust) => total + cust.orderTotal, 0);
  }

  function sort(prop) {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...filteredCustomers].sort((a, b) => {
      if (a[prop] < b[prop]) return newOrder === 'asc' ? -1 : 1;
      if (a[prop] > b[prop]) return newOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredCustomers(sorted);
  }

  function handleFilterChange(e) {
    setFilter(e.target.value);
  }

  return (
    <>
      Filter: <input type="text" onInput={handleFilterChange} value={filter} />
      <br />
      <br />
      <table className="table table-hover">
        <thead>
          <tr>
            <th onClick={() => sort('name')}>Name</th>
            <th onClick={() => sort('city')}>City</th>
            <th onClick={() => sort('orderTotal')}>Order Total</th>
            <th>&nbsp;</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map(cust => (
            <CustomerRow key={cust.id} customer={cust} />
          ))}
          {filteredCustomers.length ? (
            <tr>
              <td colSpan="2" />
              <td>{formatCurrency(customersOrderTotal)}</td>
              <td colSpan="2" />
            </tr>
          ) : (
            <tr>
              <td colSpan="6">No customers found</td>
            </tr>
          )}
        </tbody>
      </table>
      Number of Customers: {filteredCustomers.length}
    </>
  );
}

export default CustomersList;
