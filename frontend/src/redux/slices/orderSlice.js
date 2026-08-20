import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// ─────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page = 1, limit = 5, ...filters } = {}, { rejectWithValue }) => {
    try {
      // Empty filters are omitted so the API only receives active filters.
      const params = { page, limit };
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) params[key] = value;
      });
      const response = await axiosInstance.get('/orders', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

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

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/orders/${orderId}`);
      return orderId;
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
    orders: [],
    currentOrder: null,
    loading: false,
    formLoading: false,
    error: null,
    formError: null,
    totalPages: 1,
    currentPage: 1,
    totalOrders: 0,
    statusFilter: '',
    productNameFilter: '',
    fromDateFilter: '',
    toDateFilter: '',
    minPriceFilter: '',
    maxPriceFilter: '',
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setOrderFilters: (state, action) => {
      Object.assign(state, action.payload);
      // Any filter can change the result set, so always begin at page one.
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearOrderFilters: (state) => {
      state.statusFilter = '';
      state.productNameFilter = '';
      state.fromDateFilter = '';
      state.toDateFilter = '';
      state.minPriceFilter = '';
      state.maxPriceFilter = '';
      state.currentPage = 1;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.formError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchOrders
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

    // fetchOrderById
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

    // createOrder
    builder
      .addCase(createOrder.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.formLoading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
      });

    // updateOrder
    builder
      .addCase(updateOrder.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.formLoading = false;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) state.orders[index] = action.payload;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
      });

    // deleteOrder
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o._id !== action.payload);
        state.totalOrders = Math.max(0, state.totalOrders - 1);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setStatusFilter,
  setOrderFilters,
  setCurrentPage,
  clearOrderFilters,
  clearCurrentOrder,
  clearError,
} = orderSlice.actions;
export default orderSlice.reducer;
