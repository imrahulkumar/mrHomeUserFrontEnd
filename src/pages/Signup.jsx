import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await signup({ name: form.name.trim(), email: form.email, password: form.password });
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
        <h2>Create account</h2>
        <p className="muted">Join us for exclusive collections</p>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} required autoFocus />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Confirm password
          <input type="password" name="confirm" value={form.confirm} onChange={handleChange} required />
        </label>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
        <p className="muted center">
          Already have an account? <Link to="/login" state={location.state}>Login</Link>
        </p>
      </form>
    </div>
  );
}
