// React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Utilities
import { capitalize } from '../utils';

// Components
import OrdersList from './OrdersList';

class OrdersContainer extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  };

  state = {
    customer: null,
    orderItems: []
  };

  componentDidMount() {
    const customerId = parseInt(this.props.match.params.id, 10);

    fetch('../../customers.json')
      .then(response => response.json())
      .then(customers => {
        const customer = customers.filter(
          customer => customer.id === customerId
        )[0];

        if (customer) {
          this.setState({
            customer
          });
        } else {
          this.setState({
            customer: null
          });
        }
      });

    fetch('../../orders.json')
      .then(response => response.json())
      .then(orders => {
        const customerOrders = orders.filter(
          order => order.customerId === customerId
        );

        if (customerOrders) {
          this.setState({
            orderItems: customerOrders[0].orderItems
          });
        }
      });
  }

  render() {
    return (
      <div>
        {this.state.customer ? (
          <div>
            <h1>Orders for {capitalize(this.state.customer.name)}</h1>
            <br />
            <OrdersList orderItems={this.state.orderItems} />
          </div>
        ) : (
          <div className="row">No customer found</div>
        )}
        <br />
        <Link to="/customers">View All Customers</Link>
      </div>
    );
  }
}

export default OrdersContainer;
