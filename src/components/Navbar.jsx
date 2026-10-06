import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { settings, categories } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      {settings.announcement && <div className="announcement">{settings.announcement}</div>}

      <div className="navbar-top container">
        <Link to="/" className="brand">
          {settings.logo ? <img src={settings.logo} alt="" className="brand-logo" /> : <span className="brand-mark">◆</span>}
          {settings.siteName}
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="greeting">Hi, {user.name.split(' ')[0]}</span>
              <Link to="/orders" className="btn btn-ghost">My orders</Link>
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
          {categories
            .filter((c) => c.showInNav)
            .map((c) => (
              <NavLink key={c._id} to={`/shop/${c.slug}`} className="category-link">
                {c.icon} {c.name}
              </NavLink>
            ))}
        </div>
      </nav>
    </header>
  );
}
