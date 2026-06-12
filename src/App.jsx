import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

const THEME = {
  background: '#f3f4f6',
  textDark: '#333333',
};

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomePage from './page/HomePage';
import AuthPage from './page/AuthPage';
import CartPage from './page/CartPage';
import AdminPage from './page/AdminPage';
import DonatePage from './page/DonatePage';
import ProductDetailPage from './page/ProductDetailPage';
import PolicyPage from './page/PolicyPage';
import CheckoutPage from './page/CheckoutPage';
import OrderTrackingPage from './page/OrderTrackingPage';



function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Tự động chuyển hướng tài khoản quản trị sang trang quản lý
  const userJson = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  let isAdmin = false;
  if (userJson && token) {
    try {
      const user = JSON.parse(userJson);
      if (user.role === 'Admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Lỗi đọc thông tin đăng nhập:", e);
    }
  }

  if (isAdmin && !isAdminPath) {
    window.location.replace('/admin');
    return null;
  }

  if (isAdminPath) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    );
  }

  return (
    <div
      className="w-full flex justify-center font-sans min-h-screen"
      style={{ backgroundColor: THEME.background, color: THEME.textDark }}
    >
      <div className="w-full h-full flex flex-col">
        {/* Header full width */}
        <Header />

        {/* Main Container - Giới hạn 1200px, chứa Sidebar và Routes */}
        <div className="container-box flex flex-1 w-full my-6 flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 px-4">

          {/* Sidebar danh mục (Giữ nguyên khi chuyển trang) */}
          <div className="hidden md:flex flex-col space-y-4 w-64">
            <Sidebar />    
            {/*thêm danh mục thì ghi đè*/}
          </div>

          {/* Nội dung chính linh hoạt theo Route */}
          <main className="flex-1 bg-white p-6 rounded shadow-sm border border-bordercustom min-h-[50vh]">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<AuthPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/chinh-sach/:type" element={<PolicyPage />} />
              <Route path="/danh-muc/:brand" element={<HomePage />} />
              <Route path="/track" element={<OrderTrackingPage />} />
            </Routes>
          </main>
        </div>

        {/* Footer full width */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
