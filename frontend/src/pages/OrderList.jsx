import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchOrders,
  deleteOrder,
  setStatusFilter,
} from '../redux/slices/orderSlice';
import OrderCard from '../components/OrderCard';
import ConfirmModal from '../components/ConfirmModal';
import OrderCardSkeleton from '../components/OrderCardSkeleton';
import styles from './OrderList.module.css';

const STATUS_OPTIONS = ['', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

const OrderList = () => {
  const dispatch = useDispatch();

  const {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    totalOrders,
    statusFilter,
  } = useSelector((state) => state.orders);

  // Controls the confirmation modal
  const [modalOpen, setModalOpen]       = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null); // stores the id to delete

  // Fetch orders whenever page or status filter changes
  useEffect(() => {
    dispatch(fetchOrders({ page: currentPage, limit: 5, status: statusFilter }));
  }, [dispatch, currentPage, statusFilter]);

  const handleFilterChange = (e) => {
    dispatch(setStatusFilter(e.target.value));
    dispatch(fetchOrders({ page: 1, limit: 5, status: e.target.value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    dispatch(fetchOrders({ page: newPage, limit: 5, status: statusFilter }));
  };

  // Step 1: user clicks Delete on a card → open modal and remember which order
  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId);
    setModalOpen(true);
  };

  // Step 2a: user confirms in the modal → actually delete
  const handleConfirmDelete = async () => {
    const result = await dispatch(deleteOrder(orderToDelete));
    if (!result.error) {
      toast.success('Order deleted.');
    } else {
      toast.error(result.payload || 'Failed to delete order.');
    }
    setModalOpen(false);
    setOrderToDelete(null);
  };

  // Step 2b: user cancels → close modal, do nothing
  const handleCancelDelete = () => {
    setModalOpen(false);
    setOrderToDelete(null);
  };

  return (
    <div className={styles.orderListContainer}>

      {/* Confirmation modal — rendered at the top level so it overlays everything */}
      <ConfirmModal
        isOpen={modalOpen}
        title="Delete Order"
        message="Are you sure you want to delete this order?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Header */}
      <div className={styles.orderListHeader}>
        <div>
          <h2>My Orders</h2>
          <p className={styles.orderCount}>
            {totalOrders > 0
              ? `Showing ${orders.length} of ${totalOrders} order${totalOrders !== 1 ? 's' : ''}`
              : 'No orders yet'}
          </p>
        </div>
        <Link to="/orders/new" className={styles.btnCreateOrder}>
          + New Order
        </Link>
      </div>

      {/* Status filter */}
      <div className={styles.filterBar}>
        <label htmlFor="statusFilter">Filter by status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === '' ? 'All Orders' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Loading — show skeleton cards instead of plain text */}
      {loading && (
        <div>
          {[1, 2, 3].map((n) => <OrderCardSkeleton key={n} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.error}>
          {error}
          <button
            className={styles.retryBtn}
            onClick={() =>
              dispatch(fetchOrders({ page: currentPage, limit: 5, status: statusFilter }))
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className={styles.noOrders}>
          <p>No orders found.</p>
          {statusFilter ? (
            <p>
              Try changing the filter, or{' '}
              <Link to="/orders/new">create a new order</Link>.
            </p>
          ) : (
            <p>
              <Link to="/orders/new">Create your first order</Link> to get started!
            </p>
          )}
        </div>
      )}

      {/* Order cards + pagination */}
      {!loading && !error && orders.length > 0 && (
        <>
          <div>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderList;
