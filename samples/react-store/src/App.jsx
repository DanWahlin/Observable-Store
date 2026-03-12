import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomersContainer from './customers/CustomersContainer.jsx';
import CustomerEdit from './customers/CustomerEdit.jsx';
import OrdersContainer from './orders/OrdersContainer.jsx';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/customers" replace />} />
      <Route path="/customers" element={<CustomersContainer />} />
      <Route path="/customers/:id" element={<CustomerEdit />} />
      <Route path="/orders/:id" element={<OrdersContainer />} />
    </Routes>
  </BrowserRouter>
);

export default App;
