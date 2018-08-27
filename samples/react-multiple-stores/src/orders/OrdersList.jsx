// React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Currency from 'react-currency-formatter';

class OrdersList extends Component {
  static propTypes = {
    orderItems: PropTypes.array.isRequired
  };

  render() {
    return (
      <table className="table table-hover orders-table">
        <tbody>
          {this.props.orderItems.map(orderItem => {
            return <tr key={orderItem.id}>
              <td>{orderItem.productName}</td>
              <td>
                <Currency quantity={orderItem.itemCost} />
              </td>
            </tr>
          })}
        </tbody>
      </table>
    );
  }

}

export default OrdersList;
