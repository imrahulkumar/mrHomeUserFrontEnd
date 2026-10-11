import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useStore } from './context/StoreContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MyOrders from './pages/MyOrders';
import OrderSuccess from './pages/OrderSuccess';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import Signup from './pages/Signup';
import { appIconUrl } from './utils/pwa';

export default function App() {
  const { user } = useAuth();
  const { settings } = useStore();
  const { pathname } = useLocation();

  const mainRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Replay the page-enter animation (chosen in admin settings, see html[data-page-anim] in index.css)
    // without remounting the page.
    const main = mainRef.current;
    main.classList.remove('page-enter');
    void main.offsetWidth;
    main.classList.add('page-enter');
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main className="main" ref={mainRef}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <InstallPrompt
        name={settings.siteName}
        icon={settings.logo ? appIconUrl(192, Date.parse(settings.updatedAt)) : '/pwa-192x192.png'}
      />
    </>
  );
}
