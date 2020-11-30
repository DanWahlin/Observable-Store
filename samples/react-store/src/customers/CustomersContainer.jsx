// React
import React, { Component } from 'react';

// Import store
import CustomersStore from '../stores/CustomersStore';

// Components
import CustomersList from './CustomersList';

class CustomersContainer extends Component {
  state = {
    customers: []
  };
  storeSub = null;

  componentDidMount() {
    // ###### CustomersStore ########
    // Option 1: Subscribe to store changes
    // Useful when a component needs to be notified of changes but won't always
    // call store directly.
    this.storeSub = CustomersStore.stateChanged.subscribe(stateChange => {
      if (stateChange && stateChange.state) {
        this.setState({customers: stateChange.state.customers});
      }
    });
    
    CustomersStore.getCustomers();

    // Option 2: Get data directly from store
    // CustomersStore.getCustomers()
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
