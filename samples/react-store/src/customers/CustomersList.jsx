// React
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Currency from 'react-currency-formatter';

// Utilities
import _orderBy from 'lodash.orderby';
import _isEqual from 'lodash.isequal';

// Components
import CustomerRow from './CustomerRow';

class CustomersList extends Component {
  static propTypes = {
    customers: PropTypes.array.isRequired
  };

  state = {
    filter: '',
    filteredCustomers: [],
    prevFilteredCustomers: [],
    customersOrderTotal: 0,
    sortOrder: 'asc'
  };

  static getDerivedStateFromProps(props, state) {
    if (!_isEqual(props.customers, state.prevFilteredCustomers)) {
      return {
        prevFilteredCustomers: props.customers,
        filteredCustomers: props.customers,
        customersOrderTotal: CustomersList.calculateOrders(props.customers)
      };
    }
    return null;
  }

  sort(prop) {
    const newSortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';

    this.setState(state => ({
      sortOrder: newSortOrder,
      filteredCustomers: _orderBy(state.filteredCustomers, prop, newSortOrder)
    }));
  }

  static calculateOrders = customers => {
    let total = 0;
    customers.forEach(cust => {
      total += cust.orderTotal;
    });
    return total;
  };

  handleFilterChange = e => {
    const filter = e.target.value;
    let filteredCustomers = this.props.customers;

    if (filter) {
      filteredCustomers = this.props.customers.filter(
        cust => cust.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                cust.city.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
                cust.orderTotal.toString().indexOf(filter.toLowerCase()) > -1
      );
    }

    this.setState({
      filter,
      filteredCustomers,
      customersOrderTotal: CustomersList.calculateOrders(filteredCustomers),
    });
  };

  render() {
    const { filteredCustomers, customersOrderTotal, filterValue } = this.state;

    return (
      <Fragment>
        Filter: <input type="text" onInput={this.handleFilterChange} value={filterValue} />
        <br />
        <br />
        <table className="table table-hover">
          <thead>
            <tr>
              <th onClick={() => this.sort('name')}>Name</th>
              <th onClick={() => this.sort('city')}>City</th>
              <th onClick={() => this.sort('orderTotal')}>Order Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(cust => (
              <CustomerRow key={cust.id} customer={cust} />
            ))}
            {filteredCustomers.length ? (
              <tr>
                <td colSpan="2" />
                <td>
                  <Currency quantity={customersOrderTotal} />
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="4">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
        Number of Customers: {filteredCustomers.length}
      </Fragment>
    );
  }
}

export default CustomersList;
