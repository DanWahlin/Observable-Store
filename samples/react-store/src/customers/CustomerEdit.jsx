import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CustomersStore from '../stores/CustomersStore.js';
import { capitalize } from '../utils/index.js';

function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const storeSubRef = useRef(null);

  useEffect(() => {
    const customerId = +id;

    storeSubRef.current = CustomersStore.stateChanged.subscribe(state => {
      if (state && state.customer) {
        setCustomer({ ...state.customer });
      }
    });

    CustomersStore.getCustomer(customerId);

    return () => {
      if (storeSubRef.current) {
        storeSubRef.current.unsubscribe();
      }
    };
  }, [id]);

  function validate(cust) {
    let errs = {};
    if (!cust.name) errs.name = true;
    if (!cust.city) errs.city = true;
    setErrors(errs);
    return errs;
  }

  function change(prop, value) {
    const updated = { ...customer, [prop]: value };
    setCustomer(updated);
    validate(updated);
  }

  function handleDelete(event) {
    event.preventDefault();
    CustomersStore.delete(customer.id);
    navigate('/customers');
  }

  function handleSubmit(event) {
    event.preventDefault();
    CustomersStore.update(customer);
    navigate('/customers');
  }

  return (
    <div>
      {customer ? (
        <div className="container">
          <h1>{capitalize(customer.name)}</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="id">Id</label>
              <input type="text" className="form-control" value={customer.id} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                value={customer.name}
                onChange={(e) => change('name', e.target.value)}
              />
              {errors.name && <div className="alert alert-danger">Name is required</div>}
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                className="form-control"
                value={customer.city}
                onChange={(e) => change('city', e.target.value)}
              />
              {errors.city && <div className="alert alert-danger">City is required</div>}
            </div>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
            &nbsp;&nbsp;
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
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

export default CustomerEdit;
