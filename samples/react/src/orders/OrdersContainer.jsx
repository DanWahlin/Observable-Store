// React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Utilities
import { capitalize } from '../utils';

// Components
import OrdersList from './OrdersList';

// Stores
import { CustomersStore } from '../stores/CustomersStore';
import { OrdersStore } from '../stores/OrdersStore';


class OrdersContainer extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  };

  constructor() {
    super();
    this.customersStoreSub = null;
    this.ordersStoreSub = null;
  }

  state = {
    customer: null,
    orderItems: []
  };

  componentDidMount() {
    const customerId = parseInt(this.props.match.params.id, 10);
    // Get store instance
    let customersStore = CustomersStore.instance;
    let ordersStore = OrdersStore.instance;

    // ###### CustomersStore ########
    // ## Customer Option 1: Subscribe to store changes
    this.customersStoreSub = customersStore.stateChanged.subscribe(state => {
      if (state && state.customer) {
        this.setState( {customer: state.customer} );
      }
    });
    customersStore.getCustomer(customerId);

    // ## Customer Option 2: Get data directly from store
    // customersStore.getCustomer(customerId)
    //     .then(customer => {
    //       this.setState({ customer: customer });
    //     });

    // ###### OrdersStore ########
    // ## Orders Option 1: Subscribe to store changes
    this.ordersStoreSub = ordersStore.stateChanged.subscribe(state => {
      if (state && state.orderItems) {
        this.setState({ orderItems: state.orderItems });
      }
    });
    ordersStore.getOrderItems(customerId);

    // ## Orders Option 2: Get data directly from store
    // ordersStore.getOrderItems(customerId)
    //     .then(orderItems => {
    //       this.setState( {orderItems: orderItems} );
    //     });
  }

  componentWillUnmount() {
    if (this.customersStoreSub) {
      this.customersStoreSub.unsubscribe();
    }

    if (this.ordersStoreSub) {
      this.ordersStoreSub.unsubscribe();
    }
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
