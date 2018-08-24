// React
import React, { Component } from 'react';

//Store
import { CustomersStore } from '../stores/CustomersStore';

// Components
import CustomersList from './CustomersList';

class CustomersContainer extends Component {
  state = {
    customers: []
  };

  constructor() {
    super();
    this.storeSub = null;
  }

  componentDidMount() {
    // Get store instance
    let store = CustomersStore.instance;

    // Subscribe to store changes
    this.storeSub = store.stateChanged.subscribe(customers => {
      if (customers) {
        this.setState({customers});
      }
    });

    // Call function to modify store
    store.getCustomers();
  }

  componentWillUnmount() {
    this.storeSub.unsubscribe();
  }

  render() {
    return (
      <div>
        <h1>Customers</h1>
        <br />
        <CustomersList customers={this.state.customers} />
      </div>
    );
  }
}

export default CustomersContainer;
