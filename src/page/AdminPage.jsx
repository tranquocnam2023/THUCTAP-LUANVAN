import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminProducts from './AdminProducts';
import AdminOrders from '../components/AdminOrders';
import AdminDashboard from '../components/AdminDashboard';
import AdminCustomers from '../components/AdminCustomers';
import AdminCategories from '../components/AdminCategories';
import AdminReviews from '../components/AdminReviews';
import AdminPromotions from '../components/AdminPromotions';
import { dashboardService } from '../services/dashboardService';
import { authService } from '../services/authService';
import { Layout, Package, Users, ShoppingCart, Settings, LogOut, Bell, FolderTree, Star, LayoutGrid, Ticket } from 'lucide-react';

const DASHBOARD_STATS = [
  { label: 'Tổng khách hàng', icon: Users, bgColor: '#5856d6', textColor: '#ffffff' },
  { label: 'Doanh thu tháng', icon: Layout, bgColor: '#007aff', textColor: '#ffffff', isCurrency: true },
  { label: 'Đơn hàng mới', icon: ShoppingCart, bgColor: '#32ade6', textColor: '#ffffff' },
  { label: 'Sản phẩm', icon: Package, bgColor: '#ff9500', textColor: '#ffffff' },
];

export default function AdminPage() {
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');

  // Khởi tạo state trống để sau này truyền API
  const [stats, setStats] = useState({ users: 0, revenue: 0, orders: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    dashboardService.getStats()
      .then(data => {
        if (data) setStats(data);
      })
      .catch(e => console.log("Lỗi tải thống kê tổng quát"));
  }, []);

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      authService.logout();
      window.location.href = '/auth';
    }
  };

  const getHeaderTitle = () => {
    switch (activeAdminTab) {
      case 'products': return 'Quản lý sản phẩm';
      case 'categories': return 'Quản lý danh mục';
      case 'reviews': return 'Quản lý đánh giá';
      case 'orders': return 'Quản lý đơn hàng';
      case 'customers': return 'Quản lý khách hàng';
      case 'promotions': return 'Quản lý mã khuyến mãi';
      case 'dashboard': return 'Bảng thống kê số liệu';
      default: return 'Trang quản trị';
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveAdminTab(id)}
      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold ${activeAdminTab === id
        ? 'bg-[#F4F7FE] text-[#4318FF] border-r-4 border-[#4318FF]'
        : 'text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#2B3674]'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${activeAdminTab === id ? 'text-[#4318FF]' : 'text-[#A3AED0]'}`} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F4F7FE] overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#FFFFFF] flex flex-col hidden md:flex shrink-0 border-r border-[#E0E5F2] shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-[#E0E5F2]">
          <div className="w-8 h-8 bg-[#4318FF] rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-[#4318FF]/30">
            <span className="font-bold text-lg text-[#FFFFFF]">AD</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2B3674] uppercase">PhoneShop</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-[12px] font-bold text-[#A3AED0] uppercase tracking-widest mb-4">Chính</p>
          <SidebarItem id="dashboard" icon={Layout} label="Bảng thống kê" />
          <SidebarItem id="products" icon={Package} label="Sản phẩm" />
          <SidebarItem id="categories" icon={FolderTree} label="Danh mục" />
          <SidebarItem id="reviews" icon={Star} label="Đánh giá" />
          <SidebarItem id="orders" icon={ShoppingCart} label="Đơn hàng" />
          <SidebarItem id="customers" icon={Users} label="Khách hàng" />
          <SidebarItem id="promotions" icon={Ticket} label="Khuyến mãi" />

          <div className="pt-6">
            <p className="px-4 text-[12px] font-bold text-[#A3AED0] uppercase tracking-widest mb-4">Hệ thống</p>
            <SidebarItem id="settings" icon={Settings} label="Cài đặt" />
          </div>
        </nav>

        <div className="p-4 bg-[#FFFFFF] border-t border-[#E0E5F2] space-y-2">
          <Link
            to="/"
            className="w-full flex items-center px-4 py-3 text-sm font-bold text-[#A3AED0] hover:text-[#4318FF] transition-colors rounded-xl hover:bg-[#F4F7FE] group"
          >
            <LayoutGrid className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Xem cửa hàng
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-bold text-[#A3AED0] hover:text-[#EE5D50] transition-colors rounded-xl hover:bg-[#FFF5F5] group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-20 bg-[#F4F7FE] flex items-center justify-between px-8 shrink-0 z-20 mt-4">
          <div className="flex flex-col justify-center">
            <div className="flex items-center">
              <button className="p-2 -ml-2 text-[#A3AED0] hover:text-[#2B3674] md:hidden">
                <Layout size={24} />
              </button>
              <p className="text-sm font-medium text-[#A3AED0]">Trang chủ / {getHeaderTitle()}</p>
            </div>
          </div>

          <div className="flex items-center bg-[#FFFFFF] rounded-full px-4 py-2 shadow-sm border border-[#E0E5F2]">
            <div className="flex items-center bg-[#F4F7FE] rounded-full px-4 py-2 mr-4">
              <svg className="w-4 h-4 text-[#2B3674]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none text-sm ml-2 w-32 placeholder-[#A3AED0] text-[#2B3674]" />
            </div>
            <button className="relative p-2 text-[#A3AED0] hover:text-[#4318FF] transition-colors mr-2">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EE5D50] rounded-full border-2 border-[#FFFFFF]"></span>
            </button>
            <div className="flex items-center gap-3 ml-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#4318FF] text-[#FFFFFF] flex items-center justify-center font-bold text-sm shadow-md">
                {user?.username?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 pt-4 bg-[#F4F7FE] scroll-smooth">
          {activeAdminTab === 'products' && <AdminProducts />}
          {activeAdminTab === 'categories' && <AdminCategories />}
          {activeAdminTab === 'reviews' && <AdminReviews />}
          {activeAdminTab === 'orders' && <AdminOrders />}
          {activeAdminTab === 'customers' && <AdminCustomers />}
          {activeAdminTab === 'promotions' && <AdminPromotions />}
          {activeAdminTab === 'dashboard' && (
            <AdminDashboard />
          )}
        </main>
      </div>
    </div>
  );
}
