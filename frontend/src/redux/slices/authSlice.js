import { createSlice } from '@reduxjs/toolkit';

// Helper: safely parse the stored user JSON (returns null if missing/corrupt)
const loadUser = () => {
  try {
    const serialized = localStorage.getItem('user');
    return serialized ? JSON.parse(serialized) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: loadUser(),                               // Persisted across page refreshes
  token: localStorage.getItem('token') || null,   // JWT token
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called after a successful login — saves both token AND user to localStorage
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      // Persist the user object so the Navbar still shows the name after a refresh
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    // Called on logout or on a 401 response (via the axios interceptor)
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
