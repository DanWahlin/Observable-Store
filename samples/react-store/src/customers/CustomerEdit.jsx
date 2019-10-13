import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CustomersStore from '../stores/CustomersStore';
// Utilities
import { capitalize } from '../utils';

class CustomerEdit extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.string.isRequired
            }).isRequired
        }).isRequired
    };
    customersStoreSub = null;

    state = {
        customer: null,
        errors: {}
    };

    componentDidMount() {
        const customerId = +this.props.match.params.id;

        // ###### CustomersStore ########
        // ## Customer Option 1: Subscribe to store changes
        // Useful when a component needs to be notified of changes but won't always
        // call store directly.
        this.customersStoreSub = CustomersStore.stateChanged.subscribe(state => {
            if (state && state.customer) {
                this.setState({ customer: state.customer });
            }
        });

        // Call into store to get customer based on route param
        // This will trigger subscription above once data is available
        CustomersStore.getCustomer(customerId);

        // ## Customer Option 2: Get data directly from store
        // This is a normal option to use when you just want the data
        // immediately. Showing subscription above for demo purposes.

        // customersStore.getCustomer(customerId)
        //     .then(customer => {
        //       this.setState({ customer: customer });
        //     });

    }

    componentWillUnmount() {
        if (this.customersStoreSub) {
          this.customersStoreSub.unsubscribe();
        }
    }

    validate() {
        let errors = {};
        if (!this.state.customer.name) {
            errors['name'] = true;
        }
        if (!this.state.customer.city) {
            errors['city'] = true;
        }
        this.setState({ errors });
    }

    change(prop, value) {
        let customer = this.state.customer;
        customer[prop] = value;
        this.setState({ customer });
        this.validate();
    }

    delete(event, id) {
        event.preventDefault();
        CustomersStore.delete(id);
        this.props.history.push("/customers");
    }

    submit(event) {
        event.preventDefault();
        CustomersStore.update(this.state.customer);
        this.props.history.push("/customers");
    }

    render() {
        return (
            <div>
            {this.state.customer ? (
              <div className="container">
                <h1>{capitalize(this.state.customer.name)}</h1>
                <form onSubmit={(e) => this.submit(e) }>
                    <div className="form-group">
                        <label htmlFor="name">Id</label>
                        <input type="text" className="form-control" value={this.state.customer.id} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" className="form-control" value={this.state.customer.name} onChange={(e) => this.change('name', e.target.value)} />
                        {this.state.errors.name && 
                            <div className="alert alert-danger">Name is required</div>
                        }
                    </div>
                    <div className="form-group">
                        <label htmlFor="alterEgo">City</label>
                        <input type="text" className="form-control" value={this.state.customer.city} onChange={(e) => this.change('city', e.target.value)} />
                        {this.state.errors.city && 
                            <div className="alert alert-danger">City is required</div>
                        }
                    </div>
                    <button type="button" className="btn btn-danger" onClick={(e) => this.delete(e, this.state.customer.id) }>Delete</button>&nbsp;&nbsp;
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
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

export default CustomerEdit;