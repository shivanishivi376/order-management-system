import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchOrderById, deleteOrder, clearCurrentOrder } from '../redux/slices/orderSlice';
import ConfirmModal from '../components/ConfirmModal';
import styles from './OrderDetail.module.css';

const STEPS = ['Pending', 'Shipped', 'Delivered'];

const STATUS_DESCRIPTIONS = {
  Pending:   'Your order has been placed and is waiting to be processed.',
  Shipped:   'Your order is on its way! It has been handed to the courier.',
  Delivered: 'Your order has been delivered successfully. Enjoy!',
  Cancelled: 'This order has been cancelled.',
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOrder, formLoading, formError } = useSelector((state) => state.orders);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, id]);

  const handleConfirmDelete = async () => {
    const result = await dispatch(deleteOrder(id));
    if (!result.error) {
      toast.success('Order deleted.');
      navigate('/orders');
    } else {
      toast.error(result.payload || 'Failed to delete order.');
    }
    setModalOpen(false);
  };

  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  // ── Loading state ─────────────────────────
  if (!currentOrder && !formError) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonWrapper}>
          <div className={`${styles.shimmer} ${styles.skeletonImage}`} />
          <div className={styles.skeletonLines}>
            {[80, 50, 65, 45, 55].map((w, i) => (
              <div key={i} className={`${styles.shimmer} ${styles.skeletonLine}`}
                style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────
  if (formError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <p>⚠️ {formError}</p>
          <button className={styles.backBtn} onClick={() => navigate('/orders')}>
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const order = currentOrder;
  const activeStep = order.status === 'Cancelled' ? -1 : STEPS.indexOf(order.status);
  const totalValue = order.price * order.quantity;

  return (
    <div className={styles.container}>

      <ConfirmModal
        isOpen={modalOpen}
        title="Delete Order"
        message="Are you sure you want to delete this order?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setModalOpen(false)}
      />

      {/* Breadcrumb */}
      <button className={styles.backBtn} onClick={() => navigate('/orders')}>
        ← Back to Orders
      </button>

      <div className={styles.card}>

        {/* ── Top section: image + core info ── */}
        <div className={styles.topSection}>

          {/* Product image */}
          <div className={styles.imageBox}>
            {order.image ? (
              <img src={order.image} alt={order.productName} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>📦</span>
                <p>No image</p>
              </div>
            )}
          </div>

          {/* Core info */}
          <div className={styles.coreInfo}>
            <h2 className={styles.productName}>{order.productName}</h2>

            <div className={styles.statusBadgeRow}>
              <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                {order.status}
              </span>
            </div>

            <p className={styles.statusDesc}>
              {STATUS_DESCRIPTIONS[order.status]}
            </p>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Order ID</span>
                <span className={styles.metaValue} title={order._id}>
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Unit Price</span>
                <span className={styles.metaValue}>{formatINR(order.price)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Quantity</span>
                <span className={styles.metaValue}>{order.quantity}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Total Value</span>
                <span className={`${styles.metaValue} ${styles.totalValue}`}>
                  {formatINR(totalValue)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Ordered On</span>
                <span className={styles.metaValue}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Last Updated</span>
                <span className={styles.metaValue}>
                  {new Date(order.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className={styles.addressBox}>
              <span className={styles.metaLabel}>📍 Delivery Address</span>
              <p className={styles.addressText}>{order.address}</p>
            </div>
          </div>
        </div>

        {/* ── Status Timeline ── */}
        <div className={styles.timelineSection}>
          <h3 className={styles.timelineTitle}>Order Journey</h3>
          {order.status !== 'Cancelled' ? (
            <div className={styles.timeline}>
              {STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className={styles.timelineStep}>
                    <div className={`${styles.dot} ${
                      i < activeStep  ? styles.dotDone :
                      i === activeStep ? styles.dotActive :
                      styles.dotFuture
                    }`}>
                      {i < activeStep && <span>✓</span>}
                      {i === activeStep && <span className={styles.dotPulse} />}
                    </div>
                    <div className={styles.stepInfo}>
                      <span className={`${styles.stepName} ${
                        i <= activeStep ? styles.stepNameActive : ''
                      }`}>{step}</span>
                      <span className={styles.stepSub}>
                        {i < activeStep  ? 'Completed' :
                         i === activeStep ? 'Current'  :
                         'Upcoming'}
                      </span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`${styles.connector} ${
                      i < activeStep ? styles.connectorDone : ''
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className={styles.cancelledBanner}>
              🚫 This order was cancelled and is no longer being processed.
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className={styles.actions}>
          <button
            className={styles.btnEdit}
            onClick={() => navigate(`/orders/${order._id}/edit`)}
          >
            ✏️ Edit Order
          </button>
          <button
            className={styles.btnDelete}
            onClick={() => setModalOpen(true)}
            disabled={formLoading}
          >
            🗑️ Delete Order
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderDetail;
