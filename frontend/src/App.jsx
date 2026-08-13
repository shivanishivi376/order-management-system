import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderList from './pages/OrderList';
import OrderForm from './pages/OrderForm';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
          {/* Redirect root to orders */}
          <Route path="/" element={<Navigate to="/orders" replace />} />

          {/* Public routes */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Private routes */}
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrderList />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <PrivateRoute>
                <OrderForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id/edit"
            element={
              <PrivateRoute>
                <OrderForm />
              </PrivateRoute>
            }
          />

          {/* 404 — catch any unknown URL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
