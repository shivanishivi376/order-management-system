import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { fetchOrders, setStatusFilter } from '../redux/slices/orderSlice';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // When "My Orders" is clicked, always reset filter + re-fetch from page 1
  // This ensures the list refreshes even if the user is already on /orders
  const handleMyOrders = () => {
    dispatch(setStatusFilter(''));
    dispatch(fetchOrders({ page: 1, limit: 5, status: '' }));
    navigate('/orders');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link to="/">Order Management System</Link>
      </div>
      <div className={styles.navbarLinks}>
        {isAuthenticated ? (
          <>
            <span className={styles.navbarGreeting}>
              Hello, {user?.name || 'User'}
            </span>

            {/* Button instead of Link so we can dispatch + navigate together */}
            <button onClick={handleMyOrders} className={styles.navBtn}>
              My Orders
            </button>

            <Link
              to="/orders/new"
              className={`${styles.navBtn} ${styles.navBtnPrimary}`}
            >
              + Create Order
            </Link>

            <button
              onClick={handleLogout}
              className={`${styles.navBtn} ${styles.navBtnDanger}`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navBtn}>
              Login
            </Link>
            <Link
              to="/signup"
              className={`${styles.navBtn} ${styles.navBtnPrimary}`}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
