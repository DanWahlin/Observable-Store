// React
import React, { Component } from 'react';

// Components
import CustomersList from './CustomersList';

class CustomersContainer extends Component {
  state = {
    customers: []
  };

  componentDidMount() {
    fetch('./customers.json')
      .then(response => response.json())
      .then(customers => {
        this.setState({
          customers
        });
      });
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
