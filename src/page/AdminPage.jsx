import React, { useState, useEffect } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from '../components/AdminOrders';
import { Layout, Package, Users, ShoppingCart, Settings, LogOut, Bell } from 'lucide-react';

export default function AdminPage() {
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  
  // Khởi tạo state trống để sau này truyền API
  const [stats, setStats] = useState({ users: 0, revenue: 0, orders: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  // Kết nối API ở đây:
  // useEffect(() => { fetchAdminStats().then(data => setStats(data)) }, [])
  // useEffect(() => { fetchRecentOrders().then(data => setRecentOrders(data)) }, [])

  const getHeaderTitle = () => {
    switch (activeAdminTab) {
      case 'products': return 'Quản lý sản phẩm';
      case 'orders': return 'Quản lý đơn hàng';
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
          <SidebarItem id="orders" icon={ShoppingCart} label="Đơn hàng" />
          <SidebarItem id="customers" icon={Users} label="Khách hàng" />
          
          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Hệ thống</p>
            <SidebarItem id="settings" icon={Settings} label="Cài đặt" />
          </div>
        </nav>

        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <a href="/" className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10 group">
            <LogOut className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform" />
            Thoát về cửa hàng
          </a>
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
                <p className="text-xs font-bold text-gray-900 leading-none">Admin User</p>
                <p className="text-[10px] text-gray-500 leading-none mt-1">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-200">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50 scroll-smooth">
          {activeAdminTab === 'products' && <AdminProducts />}
          {activeAdminTab === 'orders' && <AdminOrders />}
          {activeAdminTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Khách hàng', value: stats?.users || 0, icon: Users, color: 'blue' },
                  { label: 'Doanh thu', value: stats?.revenue || 0, icon: Layout, color: 'green' },
                  { label: 'Đơn hàng', value: stats?.orders || 0, icon: ShoppingCart, color: 'orange' },
                  { label: 'Sản phẩm', value: stats?.products || 0, icon: Package, color: 'purple' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                      <div className={`p-4 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">{item.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">
                          {typeof item.value === 'number' ? item.value.toLocaleString('vi-VN') : item.value}
                          {item.label === 'Doanh thu' ? 'đ' : ''}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Đơn hàng mới nhận</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Tổng cộng 3 đơn hàng đang chờ xử lý</p>
                  </div>
                  <button
                    onClick={() => setActiveAdminTab('orders')}
                    className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                      <tr className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                        <th className="px-6 py-4">Mã đơn</th>
                        <th className="px-6 py-4">Khách hàng</th>
                        <th className="px-6 py-4">Ngày đặt</th>
                        <th className="px-6 py-4">Tổng tiền</th>
                        <th className="px-6 py-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((order, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-blue-600 font-bold">{order.id}</td>
                          <td className="px-6 py-4 font-semibold text-gray-800">{order.customer}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                          <td className="px-6 py-4 font-black text-gray-900">{order.amount.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
