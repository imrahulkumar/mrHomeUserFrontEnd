import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import NotificationBell from './NotificationBell';

function CategoryMenu({ categories, showIcons }) {
  return (
    <div className="category-list">
      <NavLink to="/" end className="category-link">Home</NavLink>
      {categories
        .filter((c) => c.showInNav)
        .map((c) => (
          <NavLink key={c._id} to={`/shop/${c.slug}`} className="category-link">
            {showIcons && c.icon} {c.name}
          </NavLink>
        ))}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { settings, categories } = useStore();
  const navigate = useNavigate();
  const { style = 'classic', showCategoryIcons = true } = settings.header ?? {};
  const menu = <CategoryMenu categories={categories} showIcons={showCategoryIcons} />;

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
          <span className="brand-name">{settings.siteName}</span>
        </Link>

        {/* Compact headers put the menu in the top row; CSS moves it to its own row on small screens. */}
        {style === 'compact' && <nav className="category-inline">{menu}</nav>}

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
          <NotificationBell />
          <Link to="/cart" className="cart-link" aria-label="Cart">
            🛒
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>

      {style !== 'compact' && (
        <nav className="category-bar">
          <div className="container">{menu}</div>
        </nav>
      )}
    </header>
  );
}
