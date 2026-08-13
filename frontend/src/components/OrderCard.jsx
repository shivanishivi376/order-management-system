import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OrderCard.module.css';

// Props:
//   order    — the order object from Redux state
//   onDelete — function called with order._id when the Delete button is clicked
const OrderCard = ({ order, onDelete }) => {
  const navigate = useNavigate();

  // Returns the CSS module class for the status badge colour
  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':   return styles.statusPending;
      case 'Shipped':   return styles.statusShipped;
      case 'Delivered': return styles.statusDelivered;
      case 'Cancelled': return styles.statusCancelled;
      default:          return '';
    }
  };

  return (
    <div className={styles.orderCard}>

      {/* Product image — shown only when the order has an image URL */}
      {order.image && (
        <div className={styles.orderImageWrapper}>
          <img
            src={order.image}
            alt={order.productName}
            className={styles.orderImage}
          />
        </div>
      )}

      {/* Order details */}
      <div className={styles.orderInfo}>
        <h3>{order.productName}</h3>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p>
          <strong>Price:</strong> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.price)}&nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>Quantity:</strong> {order.quantity}
        </p>
        <p><strong>Address:</strong> {order.address}</p>
        <p>
          <strong>Status: </strong>
          <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
            {order.status}
          </span>
        </p>
        <p>
          <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Edit / Delete buttons */}
      <div className={styles.orderActions}>
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
