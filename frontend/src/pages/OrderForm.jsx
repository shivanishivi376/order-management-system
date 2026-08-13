import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createOrder,
  updateOrder,
  fetchOrderById,
  clearCurrentOrder,
} from '../redux/slices/orderSlice';
import styles from './OrderForm.module.css';

// /orders/new      → Create mode
// /orders/:id/edit → Edit mode (pre-fills form with existing order data)

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

const EMPTY_FORM = {
  productName: '',
  quantity: '',
  price: '',
  address: '',
  status: 'Pending',
};

const OrderForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOrder, formLoading, formError } = useSelector(
    (state) => state.orders
  );

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Edit mode: fetch the order to pre-fill the form
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchOrderById(id));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id, isEditMode]);

  // When Redux loads the order, populate form fields
  useEffect(() => {
    if (isEditMode && currentOrder) {
      setFormData({
        productName: currentOrder.productName || '',
        quantity:    currentOrder.quantity    || '',
        price:       currentOrder.price       || '',
        address:     currentOrder.address     || '',
        status:      currentOrder.status      || 'Pending',
      });
      if (currentOrder.image) {
        setImagePreview(currentOrder.image);
      }
    }
  }, [isEditMode, currentOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errors = {};
    if (!formData.productName.trim())
      errors.productName = 'Product name is required.';
    if (!formData.quantity || Number(formData.quantity) < 1)
      errors.quantity = 'Quantity must be at least 1.';
    if (formData.price === '' || Number(formData.price) < 0)
      errors.price = 'Price must be 0 or more.';
    if (!formData.address.trim())
      errors.address = 'Delivery address is required.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // FormData because the backend uses multer for image uploads
    const data = new FormData();
    data.append('productName', formData.productName.trim());
    data.append('quantity',    Number(formData.quantity));
    data.append('price',       Number(formData.price));
    data.append('address',     formData.address.trim());
    data.append('status',      formData.status);
    if (imageFile) {
      data.append('image', imageFile);
    }

    if (isEditMode) {
      const result = await dispatch(updateOrder({ orderId: id, formData: data }));
      if (!result.error) navigate('/orders');
    } else {
      const result = await dispatch(createOrder(data));
      if (!result.error) navigate('/orders');
    }
  };

  if (isEditMode && formLoading && !currentOrder) {
    return <div className={styles.formLoading}>Loading order details...</div>;
  }

  return (
    <div className={styles.orderFormContainer}>
      <div className={styles.orderFormCard}>

        {/* Header */}
        <div className={styles.orderFormHeader}>
          <h2>{isEditMode ? 'Edit Order' : 'Create New Order'}</h2>
          <p className={styles.orderFormSubtitle}>
            {isEditMode
              ? 'Update the details of your order below.'
              : 'Fill in the details to place a new order.'}
          </p>
          {/* Required field legend */}
          <p className={styles.requiredNote}>
            Fields marked <span className={styles.required}>*</span> are required.
          </p>
        </div>

        {/* Server error from Redux */}
        {formError && (
          <div className={styles.formErrorBanner}>{formError}</div>
        )}

        <form className={styles.orderForm} onSubmit={handleSubmit} noValidate>

          {/* Product Name */}
          <div className={styles.formGroup}>
            <label htmlFor="productName">
              Product Name <span className={styles.required}>*</span>
            </label>
            <input
              id="productName"
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g. Wireless Keyboard"
              className={fieldErrors.productName ? styles.inputError : ''}
            />
            {fieldErrors.productName && (
              <span className={styles.fieldError}>{fieldErrors.productName}</span>
            )}
          </div>

          {/* Quantity + Price side by side */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">
                Quantity <span className={styles.required}>*</span>
              </label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                placeholder="1"
                className={fieldErrors.quantity ? styles.inputError : ''}
              />
              {fieldErrors.quantity && (
                <span className={styles.fieldError}>{fieldErrors.quantity}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">
                Price (₹) <span className={styles.required}>*</span>
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={fieldErrors.price ? styles.inputError : ''}
              />
              {fieldErrors.price && (
                <span className={styles.fieldError}>{fieldErrors.price}</span>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className={styles.formGroup}>
            <label htmlFor="address">
              Delivery Address <span className={styles.required}>*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. 123 Main St, City, State, Pincode"
              className={fieldErrors.address ? styles.inputError : ''}
            />
            {fieldErrors.address && (
              <span className={styles.fieldError}>{fieldErrors.address}</span>
            )}
          </div>

          {/* Status */}
          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!isEditMode}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Image Upload — optional, no asterisk */}
          <div className={styles.formGroup}>
            <label htmlFor="image">Product Image</label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            {imagePreview && (
              <div className={styles.imagePreviewWrapper}>
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => navigate('/orders')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={formLoading}
            >
              {formLoading
                ? isEditMode ? 'Saving...' : 'Creating...'
                : isEditMode ? 'Save Changes' : 'Create Order'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OrderForm;
