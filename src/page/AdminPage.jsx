import React, { useState, useEffect } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from '../components/AdminOrders';
import AdminDashboard from '../components/AdminDashboard';
import AdminCustomers from '../components/AdminCustomers';
import AdminCategories from '../components/AdminCategories';
import AdminReviews from '../components/AdminReviews';
import { dashboardService } from '../services/dashboardService';
import { authService } from '../services/authService';
import { Layout, Package, Users, ShoppingCart, Settings, LogOut, Bell, FolderTree, Star } from 'lucide-react';

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
      case 'dashboard': return 'Bảng thống kê số liệu';
      default: return 'Trang quản trị';
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveAdminTab(id)}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
        activeAdminTab === id 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-2' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${activeAdminTab === id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex shrink-0 border-r border-gray-800">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-600/30">
            <span className="font-bold text-lg">P</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white uppercase">PhoneAdmin</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Chính</p>
          <SidebarItem id="dashboard" icon={Layout} label="Bảng thống kê" />
          <SidebarItem id="products" icon={Package} label="Sản phẩm" />
          <SidebarItem id="categories" icon={FolderTree} label="Danh mục" />
          <SidebarItem id="reviews" icon={Star} label="Đánh giá" />
          <SidebarItem id="orders" icon={ShoppingCart} label="Đơn hàng" />
          <SidebarItem id="customers" icon={Users} label="Khách hàng" />
          
          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Hệ thống</p>
            <SidebarItem id="settings" icon={Settings} label="Cài đặt" />
          </div>
        </nav>

        <div className="p-4 bg-gray-900 border-t border-gray-800 space-y-2">
          <a href="/" className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-400/10 group">
            <Layout className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
            Thoát về cửa hàng
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10 group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center">
            <button className="p-2 -ml-2 text-gray-400 hover:text-gray-600 md:hidden">
              <Layout size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 ml-2 md:ml-0">{getHeaderTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-none">{user?.username || 'Admin User'}</p>
                <p className="text-[10px] text-gray-500 leading-none mt-1 uppercase">{user?.role || 'Quản trị viên'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-200 uppercase">
                {user?.username?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50 scroll-smooth">
          {activeAdminTab === 'products' && <AdminProducts />}
          {activeAdminTab === 'categories' && <AdminCategories />}
          {activeAdminTab === 'reviews' && <AdminReviews />}
          {activeAdminTab === 'orders' && <AdminOrders />}
          {activeAdminTab === 'customers' && <AdminCustomers />}
          {activeAdminTab === 'dashboard' && (
            <AdminDashboard />
          )}
        </main>
      </div>
    </div>
  );
}
