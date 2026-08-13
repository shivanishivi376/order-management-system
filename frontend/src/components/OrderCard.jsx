import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OrderCard.module.css';

const STEPS = ['Pending', 'Shipped', 'Delivered'];

const OrderCard = ({ order, onDelete }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':   return styles.statusPending;
      case 'Shipped':   return styles.statusShipped;
      case 'Delivered': return styles.statusDelivered;
      case 'Cancelled': return styles.statusCancelled;
      default:          return '';
    }
  };

  const activeStep = order.status === 'Cancelled' ? -1 : STEPS.indexOf(order.status);

  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className={styles.orderCard}>

      {/* Clicking the main body navigates to detail page */}
      <div
        className={styles.orderBody}
        onClick={() => navigate(`/orders/${order._id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/orders/${order._id}`)}
      >
        {/* Product image */}
        {order.image && (
          <div className={styles.orderImageWrapper}>
            <img src={order.image} alt={order.productName} className={styles.orderImage} />
          </div>
        )}

        {/* Order details */}
        <div className={styles.orderInfo}>
          <h3>{order.productName}</h3>
          <p><strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}</p>
          <p>
            <strong>Price:</strong> {formatINR(order.price)}&nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Qty:</strong> {order.quantity}
          </p>
          <p><strong>Address:</strong> {order.address}</p>
          <p>
            <strong>Status: </strong>
            <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
              {order.status}
            </span>
          </p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>

          {/* Status Timeline */}
          {order.status !== 'Cancelled' ? (
            <div className={styles.timeline}>
              {STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className={styles.timelineStep}>
                    <div className={`${styles.dot} ${i <= activeStep ? styles.dotActive : styles.dotInactive}`}>
                      {i < activeStep && <span className={styles.checkmark}>✓</span>}
                      {i === activeStep && <span className={styles.activeDot} />}
                    </div>
                    <span className={`${styles.stepLabel} ${i <= activeStep ? styles.stepLabelActive : ''}`}>
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`${styles.connector} ${i < activeStep ? styles.connectorActive : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className={styles.cancelledNote}>🚫 This order was cancelled</div>
          )}
        </div>
      </div>

      {/* Action buttons — stopPropagation so clicks don't bubble to the card */}
      <div className={styles.orderActions} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.btnView}
          onClick={() => navigate(`/orders/${order._id}`)}
        >
          View
        </button>
        <button
          className={styles.btnEdit}
          onClick={() => navigate(`/orders/${order._id}/edit`)}
        >
          Edit
        </button>
        <button
          className={styles.btnDelete}
          onClick={() => onDelete(order._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
