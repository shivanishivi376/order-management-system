import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { fetchOrders, setStatusFilter } from '../redux/slices/orderSlice';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMyOrders = () => {
    dispatch(setStatusFilter(''));
    dispatch(fetchOrders({ page: 1, limit: 5, status: '' }));
    navigate('/orders');
  };

  const isOrdersActive = location.pathname === '/orders';

  const navLinkClass = ({ isActive }) =>
    isActive ? `${styles.navBtn} ${styles.navBtnActive}` : styles.navBtn;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <NavLink to="/" className={styles.brandLink}>
          Order Management System
        </NavLink>
      </div>

      <div className={styles.navbarLinks}>
        {isAuthenticated ? (
          <>
            <span className={styles.navbarGreeting}>
              Hello, {user?.name || 'User'}
            </span>

            <button
              onClick={handleMyOrders}
              className={`${styles.navBtn} ${isOrdersActive ? styles.navBtnActive : ''}`}
            >
              My Orders
            </button>

            <NavLink
              to="/orders/new"
              className={({ isActive }) =>
                isActive
                  ? `${styles.navBtn} ${styles.navBtnPrimary} ${styles.navBtnActive}`
                  : `${styles.navBtn} ${styles.navBtnPrimary}`
              }
            >
              + Create Order
            </NavLink>

            <button
              onClick={handleLogout}
              className={`${styles.navBtn} ${styles.navBtnDanger}`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClass}>Login</NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                isActive
                  ? `${styles.navBtn} ${styles.navBtnPrimary} ${styles.navBtnActive}`
                  : `${styles.navBtn} ${styles.navBtnPrimary}`
              }
            >
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
