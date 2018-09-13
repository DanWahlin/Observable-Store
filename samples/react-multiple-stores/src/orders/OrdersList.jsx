// React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Currency from 'react-currency-formatter';

class OrdersList extends Component {
  static propTypes = {
    orders: PropTypes.array.isRequired
  };

  render() {
    return (
      <div>
        {this.props.orders.map(order => {
          return <div>
              <table className="table table-hover orders-table" key={order.customerId}>
              <tbody>
                {order.orderItems.map(orderItem => {
                  return <tr key={orderItem.id}>
                    <td>{orderItem.productName}</td>
                    <td>
                      <Currency quantity={orderItem.itemCost} />
                    </td>
                  </tr>
                })}
              </tbody>
            </table>
              <br />
          </div>
        })}
      </div>
    );
  }

}

export default OrdersList;
