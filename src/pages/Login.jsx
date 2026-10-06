import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className="muted">Log in to continue shopping</p>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p className="muted center">
          New here? <Link to="/signup" state={location.state}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}
