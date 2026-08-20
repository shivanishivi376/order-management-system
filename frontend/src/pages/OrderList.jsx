import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchOrders,
  deleteOrder,
  setStatusFilter,
  setOrderFilters,
  setCurrentPage,
  clearOrderFilters,
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
    productNameFilter,
    fromDateFilter,
    toDateFilter,
    minPriceFilter,
    maxPriceFilter,
  } = useSelector((state) => state.orders);

  // Controls the confirmation modal
  const [modalOpen, setModalOpen]       = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null); // stores the id to delete
  const [filterError, setFilterError] = useState('');
  const [filterForm, setFilterForm] = useState({
    productNameFilter,
    fromDateFilter,
    toDateFilter,
    minPriceFilter,
    maxPriceFilter,
  });

  const fetchParams = useMemo(() => ({
    page: currentPage,
    limit: 5,
    status: statusFilter,
    productName: productNameFilter,
    fromDate: fromDateFilter,
    toDate: toDateFilter,
    minPrice: minPriceFilter,
    maxPrice: maxPriceFilter,
  }), [currentPage, statusFilter, productNameFilter, fromDateFilter, toDateFilter, minPriceFilter, maxPriceFilter]);

  // Fetch orders whenever page or status filter changes
  useEffect(() => {
    dispatch(fetchOrders(fetchParams));
  }, [dispatch, fetchParams]);

  // Navbar can reset filters while this page stays mounted.
  useEffect(() => {
    if (!productNameFilter && !fromDateFilter && !toDateFilter && !minPriceFilter && !maxPriceFilter) {
      setFilterForm({ productNameFilter: '', fromDateFilter: '', toDateFilter: '', minPriceFilter: '', maxPriceFilter: '' });
    }
  }, [productNameFilter, fromDateFilter, toDateFilter, minPriceFilter, maxPriceFilter]);

  // Search after typing stops, instead of making one request per typed character.
  useEffect(() => {
    if (filterForm.productNameFilter === productNameFilter) return undefined;
    const timeoutId = setTimeout(() => {
      dispatch(setOrderFilters({ productNameFilter: filterForm.productNameFilter }));
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [dispatch, filterForm.productNameFilter, productNameFilter]);

  // Min/max values change for every typed digit, so fetch once after typing stops.
  useEffect(() => {
    const priceHasChanged =
      filterForm.minPriceFilter !== minPriceFilter ||
      filterForm.maxPriceFilter !== maxPriceFilter;
    if (!priceHasChanged) return undefined;

    const timeoutId = setTimeout(() => {
      dispatch(setOrderFilters({
        minPriceFilter: filterForm.minPriceFilter,
        maxPriceFilter: filterForm.maxPriceFilter,
      }));
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [dispatch, filterForm.minPriceFilter, filterForm.maxPriceFilter, minPriceFilter, maxPriceFilter]);

  const handleFilterChange = (e) => {
    dispatch(setStatusFilter(e.target.value));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    // Do not fetch here. Changing state makes the effect above fetch exactly once.
    dispatch(setCurrentPage(newPage));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const nextFilters = { ...filterForm, [name]: value };
    setFilterForm(nextFilters);

    if (nextFilters.fromDateFilter && nextFilters.toDateFilter && nextFilters.fromDateFilter > nextFilters.toDateFilter) {
      setFilterError('From date cannot be after To date.');
      return;
    }
    if (nextFilters.minPriceFilter !== '' && nextFilters.maxPriceFilter !== '' && Number(nextFilters.minPriceFilter) > Number(nextFilters.maxPriceFilter)) {
      setFilterError('Minimum price cannot be greater than maximum price.');
      return;
    }
    setFilterError('');
    // Date applies immediately. Product and price filters use their debounced effects above.
    if (!['productNameFilter', 'minPriceFilter', 'maxPriceFilter'].includes(name)) {
      dispatch(setOrderFilters(nextFilters));
    }
  };

  const handleClearFilters = () => {
    setFilterError('');
    setFilterForm({ productNameFilter: '', fromDateFilter: '', toDateFilter: '', minPriceFilter: '', maxPriceFilter: '' });
    dispatch(clearOrderFilters());
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

      <div className={styles.filterBar}>
        <div className={styles.filterField}>
          <label htmlFor="statusFilter">Status</label>
          <select id="statusFilter" value={statusFilter} onChange={handleFilterChange} className={styles.filterSelect}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === '' ? 'All Orders' : s}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="productNameFilter">Search product</label>
          <input id="productNameFilter" name="productNameFilter" value={filterForm.productNameFilter} onChange={handleFormChange} placeholder="Product name" className={styles.filterInput} />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="fromDateFilter">From date</label>
          <input id="fromDateFilter" name="fromDateFilter" type="date" value={filterForm.fromDateFilter} onChange={handleFormChange} className={styles.filterInput} />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="toDateFilter">To date</label>
          <input id="toDateFilter" name="toDateFilter" type="date" value={filterForm.toDateFilter} onChange={handleFormChange} className={styles.filterInput} />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="minPriceFilter">Min price</label>
          <input id="minPriceFilter" name="minPriceFilter" type="number" min="0" value={filterForm.minPriceFilter} onChange={handleFormChange} placeholder="0" className={styles.filterInput} />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="maxPriceFilter">Max price</label>
          <input id="maxPriceFilter" name="maxPriceFilter" type="number" min="0" value={filterForm.maxPriceFilter} onChange={handleFormChange} placeholder="Any" className={styles.filterInput} />
        </div>
        <div className={styles.filterActions}>
          <button type="button" className={styles.clearBtn} onClick={handleClearFilters}>Clear</button>
        </div>
        {filterError && <p className={styles.filterError}>{filterError}</p>}
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
              dispatch(fetchOrders(fetchParams))
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
          {statusFilter || productNameFilter || fromDateFilter || toDateFilter || minPriceFilter || maxPriceFilter ? (
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
