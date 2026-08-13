import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderList from './pages/OrderList';
import OrderForm from './pages/OrderForm';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="pageWrapper" style={{ padding: '2rem' }}>
      <Routes>
        <Route path="/"                    element={<Navigate to="/orders" replace />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/signup"              element={<Signup />} />
        <Route path="/orders"              element={<PrivateRoute><OrderList /></PrivateRoute>} />
        <Route path="/orders/new"          element={<PrivateRoute><OrderForm /></PrivateRoute>} />
        <Route path="/orders/:id"          element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
        <Route path="/orders/:id/edit"     element={<PrivateRoute><OrderForm /></PrivateRoute>} />
        <Route path="*"                    element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '8px', fontSize: '0.92rem', fontWeight: '500' },
          success: {
            style: { background: '#d5f5e3', color: '#1e8449' },
            iconTheme: { primary: '#1e8449', secondary: '#d5f5e3' },
          },
          error: {
            style: { background: '#fadbd8', color: '#c0392b' },
            iconTheme: { primary: '#c0392b', secondary: '#fadbd8' },
          },
        }}
      />
      <Navbar />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
