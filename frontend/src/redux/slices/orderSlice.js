import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// ─────────────────────────────────────────────
// Async Thunks  (each one talks to the backend)
// ─────────────────────────────────────────────

// Fetch the current user's orders (supports page, limit, status filter)
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 5, status = '' } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      const response = await axiosInstance.get('/orders', { params });
      return response.data; // { orders, totalPages, currentPage, totalOrders }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Fetch a single order by ID (used to pre-populate the edit form)
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch order');
    }
  }
);

// Create a new order  (FormData because the backend uses multer for image upload)
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create order');
    }
  }
);

// Update an existing order  (also multipart/form-data for possible image swap)
export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order');
    }
  }
);

// Delete an order
export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/orders/${orderId}`);
      return orderId; // Return the ID so we can remove it from state
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete order');
    }
  }
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],          // array of orders shown on the list page
    currentOrder: null,  // single order loaded for the edit form
    loading: false,
    formLoading: false,  // separate loading flag for the form submit button
    error: null,
    formError: null,     // error shown inside the form
    totalPages: 1,
    currentPage: 1,
    totalOrders: 0,
    statusFilter: '',    // currently active status filter
  },
  reducers: {
    // Let the OrderList page change the status filter and reset to page 1
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    // Clear the single order when leaving the edit form
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.formError = null;
    },
    // Clear any list-level error (e.g. when user retries)
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchOrders ──────────────────────────
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalOrders = action.payload.totalOrders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── fetchOrderById ───────────────────────
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
        state.currentOrder = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.formLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
      });

    // ── createOrder ──────────────────────────
    builder
      .addCase(createOrder.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.formLoading = false;
        // Don't manually insert into the list here — the user will be
        // redirected to /orders which re-fetches automatically.
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
      });

    // ── updateOrder ──────────────────────────
    builder
      .addCase(updateOrder.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.formLoading = false;
        // Update the order in the list if it happens to be loaded already
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) state.orders[index] = action.payload;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
      });

    // ── deleteOrder ──────────────────────────
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        // Remove deleted order from the list instantly (optimistic update)
        state.orders = state.orders.filter((o) => o._id !== action.payload);
        state.totalOrders = Math.max(0, state.totalOrders - 1);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setStatusFilter, clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
