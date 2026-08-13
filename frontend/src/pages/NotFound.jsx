import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Page not found.</p>
      <p className={styles.sub}>The page you are looking for does not exist.</p>
      <Link to="/orders" className={styles.homeLink}>
        Go to My Orders
      </Link>
    </div>
  );
};

export default NotFound;
