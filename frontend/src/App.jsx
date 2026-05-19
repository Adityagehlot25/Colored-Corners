import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your page components
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import PendingVerification from './pages/PendingVerification';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthSuccess from './pages/OAuthSuccess';
import ChooseRole from './pages/ChooseRole';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';

export default function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pending-verification" element={<PendingVerification />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}