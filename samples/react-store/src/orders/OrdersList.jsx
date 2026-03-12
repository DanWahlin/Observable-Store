import { formatCurrency } from '../utils/index.js';

function OrdersList({ orders }) {
  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <table className="table table-hover orders-table">
            <tbody>
              {order.orderItems.map(orderItem => (
                <tr key={orderItem.id}>
                  <td>{orderItem.productName}</td>
                  <td>{formatCurrency(orderItem.itemCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
        </div>
      ))}
    </div>
  );
}

export default OrdersList;
