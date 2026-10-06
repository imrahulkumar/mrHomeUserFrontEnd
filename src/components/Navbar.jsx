import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getDepartments } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-top container">
        <Link to="/" className="brand">
          <span className="brand-mark">◆</span> Mamta Jewellers
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="greeting">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
          <Link to="/cart" className="cart-link" aria-label="Cart">
            🛒
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>

      <nav className="category-bar">
        <div className="container category-list">
          <NavLink to="/" end className="category-link">Home</NavLink>
          {getDepartments().map((d) => (
            <NavLink key={d.slug} to={`/shop/${d.slug}`} className="category-link">
              {d.icon} {d.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
