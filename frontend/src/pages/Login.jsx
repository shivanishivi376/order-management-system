import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import axiosInstance from '../api/axiosInstance';
import styles from './Auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Pick up the success message passed from Signup via router state
  const location = useLocation();
  const successMessage = location.state?.message || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', formData);
      // Save user + token to Redux (and localStorage via the slice)
      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token,
      }));
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.authTitle}>Welcome Back</h2>

      {/* Success message arriving from the Signup page */}
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form className={styles.authForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Email <span className={styles.required}>*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Password <span className={styles.required}>*</span></label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className={styles.switchText}>
        Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
