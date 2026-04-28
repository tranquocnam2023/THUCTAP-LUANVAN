import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, CheckCircle, Truck, XCircle, Clock, ShoppingCart } from 'lucide-react';
import { MOCK_ORDERS } from '../utils/mockData';

const STATUS_TABS = [
  { id: 'all', name: 'Tất cả', count: 0 },
  { id: 'pending', name: 'Chờ xác nhận', count: 0, icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'confirmed', name: 'Đã xác nhận', count: 0, icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'shipping', name: 'Đang giao', count: 0, icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'delivered', name: 'Đã giao', count: 0, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'cancelled', name: 'Đã hủy', count: 0, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
];

const ORDER_STATS_CONFIG = [
  { label: 'Tổng đơn hàng', countKey: 'all', icon: ShoppingCart, bgColor: '#5856d6', textColor: '#ffffff' },
  { label: 'Chờ xác nhận', countKey: 'pending', icon: Clock, bgColor: '#ffcc00', textColor: '#000000' },
  { label: 'Đang giao', countKey: 'shipping', icon: Truck, bgColor: '#007aff', textColor: '#ffffff' },
  { label: 'Đã hoàn thành', countKey: 'delivered', icon: CheckCircle, bgColor: '#34c759', textColor: '#ffffff' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState(MOCK_ORDERS); // Sử dụng dữ liệu ảo làm mặc định
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/Order')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setOrders(data);
      })
      .catch(err => {
        console.log("Sử dụng dữ liệu ảo (API không khả dụng)");
      });
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipping': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusName = (status) => {
    return STATUS_TABS.find(t => t.id === status)?.name || status;
  };

  const handleStatusChange = (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    // Thực hiện gọi API cập nhật ở đây
  };

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Danh sách đơn hàng</h2>
          <p className="text-sm text-gray-500 font-medium">Quản lý và cập nhật trạng thái đơn hàng của khách</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Mã đơn, tên khách hàng..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Overview - MISA Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ORDER_STATS_CONFIG.map((item, i) => {
          const Icon = item.icon;
          const count = counts[item.countKey];
          return (
            <div 
              key={i} 
              className="p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02] flex flex-col justify-between h-32 border border-white/10"
              style={{ backgroundColor: item.bgColor }}
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: item.textColor }}>
                  {item.label}
                </p>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon size={20} style={{ color: item.textColor }} />
                </div>
              </div>
              <h3 className="text-3xl font-black leading-none" style={{ color: item.textColor }}>
                {count.toLocaleString('vi-VN')}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border ${
                isActive 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-[1.02]' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : tab.color}`} />}
              {tab.name}
              <span className={`ml-3 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Đơn hàng</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Ngày đặt</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Thanh toán</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tổng cộng</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-blue-600 font-black group-hover:underline cursor-pointer">{order.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{order.customer}</span>
                        <span className="text-[11px] text-gray-400 font-bold">{order.phone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-gray-500">{order.date}</td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-tighter ${
                        order.payment === 'Đã thanh toán' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900 text-lg">
                      {order.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-2xl text-[11px] font-black border uppercase tracking-tight shadow-sm inline-block ${getStatusStyle(order.status)}`}>
                        {getStatusName(order.status)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <select 
                          className="text-xs font-black bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer hover:bg-white transition-all shadow-sm"
                          defaultValue={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          {STATUS_TABS.filter(t => t.id !== 'all').map(status => (
                            <option key={status.id} value={status.id}>{status.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <ShoppingCart size={64} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold">Không tìm thấy đơn hàng nào</p>
                      <p className="text-sm font-medium">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-gray-400">
          <span>HIỂN THỊ {filteredOrders.length} TRÊN {orders.length} ĐƠN HÀNG</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50" disabled>TRƯỚC</button>
            <button className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-xl shadow-lg shadow-blue-200">1</button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:text-gray-900 transition-colors shadow-sm">SAU</button>
          </div>
        </div>
      </div>
    </div>
  );
}
