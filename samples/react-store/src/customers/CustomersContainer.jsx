// React
import React, { Component } from 'react';

// Store
import { CustomersStore } from '../stores/CustomersStore';

// Components
import CustomersList from './CustomersList';

class CustomersContainer extends Component {
  state = {
    customers: []
  };
  storeSub = null;

  componentDidMount() {
    // Get store instance
    let store = new CustomersStore();

    // ###### CustomersStore ########
    // Option 1: Subscribe to store changes
    // Useful when a component needs to be notified of changes but won't always
    // call store directly.
    this.storeSub = store.stateChanged.subscribe(state => {
      if (state) {
        this.setState({customers: state.customers});
      }
    });
    
    store.getCustomers();

    // Option 2: Get data directly from store
    // store.getCustomers()
    //     .then(customers => {
    //       this.setState({customers: customers});
    //     });
  }

  componentWillUnmount() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
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
