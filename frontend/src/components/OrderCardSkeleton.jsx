import React from 'react';
import styles from './OrderCardSkeleton.module.css';

// Animated placeholder card shown while orders are loading.
// Mimics the exact layout of OrderCard so there's no layout shift.
const OrderCardSkeleton = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonInfo}>
        <div className={`${styles.shimmer} ${styles.titleLine}`} />
        <div className={`${styles.shimmer} ${styles.line}`} />
        <div className={`${styles.shimmer} ${styles.lineShort}`} />
        <div className={`${styles.shimmer} ${styles.line}`} />
        <div className={`${styles.shimmer} ${styles.lineShort}`} />
      </div>
      <div className={styles.skeletonActions}>
        <div className={`${styles.shimmer} ${styles.btnPlaceholder}`} />
        <div className={`${styles.shimmer} ${styles.btnPlaceholder}`} />
      </div>
    </div>
  );
};

export default OrderCardSkeleton;
