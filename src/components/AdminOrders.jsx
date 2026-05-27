import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, CheckCircle, Truck, XCircle, Clock, ShoppingCart } from 'lucide-react';
// import { MOCK_ORDERS } from '../utils/mockData'; // Removed mock data
import { orderService } from '../services/orderService';
import { usePagination } from '../hooks/usePagination';
import { useFormat } from '../hooks/useFormat';

const STATUS_TABS = [
  { id: 'all', name: 'Tất cả', count: 0 },
  { id: 'pending', name: 'Chờ xác nhận', count: 0, icon: Clock, color: 'text-[#FFB547]', bgColor: 'bg-[#FFB547]/10' },
  { id: 'confirmed', name: 'Đã xác nhận', count: 0, icon: CheckCircle, color: 'text-[#39B8FF]', bgColor: 'bg-[#39B8FF]/10' },
  { id: 'shipping', name: 'Đang giao', count: 0, icon: Truck, color: 'text-[#4318FF]', bgColor: 'bg-[#4318FF]/10' },
  { id: 'delivered', name: 'Đã giao', count: 0, icon: CheckCircle, color: 'text-[#01B574]', bgColor: 'bg-[#01B574]/10' },
  { id: 'cancelled', name: 'Đã hủy', count: 0, icon: XCircle, color: 'text-[#EE5D50]', bgColor: 'bg-[#EE5D50]/10' },
];

const ORDER_STATS_CONFIG = [
  { label: 'Tổng đơn hàng', countKey: 'all', icon: ShoppingCart, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
  { label: 'Chờ xác nhận', countKey: 'pending', icon: Clock, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#FFB547' },
  { label: 'Đang giao', countKey: 'shipping', icon: Truck, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#39B8FF' },
  { label: 'Đã hoàn thành', countKey: 'delivered', icon: CheckCircle, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#01B574' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  // Khởi tạo các hook
  const { formatCurrency, formatDate } = useFormat();

  useEffect(() => {
    console.log("AdminOrders: Bắt đầu tải danh sách đơn hàng...");
    setError(null);
    orderService.getAll()
      .then(data => {
        console.log("AdminOrders: Đã tải dữ liệu thành công từ API:", data);
        if (Array.isArray(data)) {
          if (data.length > 0) {
            const mappedOrders = data.map(order => ({
              id: order.id,
              customer: order.customerName || 'Khách hàng',
              phone: order.customerPhone || 'N/A',
              date: order.createdAt,
              payment: order.status === 'Confirmed' || order.status === 'Delivered' || order.status === 'confirmed' || order.status === 'delivered' ? 'Đã thanh toán' : 'Chờ thanh toán',
              amount: order.totalPrice,
              status: order.status?.toLowerCase() || 'pending'
            }));
            console.log("AdminOrders: Mapped orders:", mappedOrders);
            setOrders(mappedOrders);
          } else {
            console.log("AdminOrders: Không có đơn hàng nào trong database.");
            setOrders([]);
          }
        } else {
          console.error("AdminOrders: Dữ liệu trả về không phải là mảng!", data);
          setError("Dữ liệu trả về không phải là mảng: " + JSON.stringify(data));
          setOrders([]);
        }
      })
      .catch(err => {
        console.error("AdminOrders: Lỗi tải đơn hàng:", err);
        setError(typeof err === 'object' ? JSON.stringify(err) : String(err));
        setOrders([]);
      });
  }, []);
  
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(order.customer || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const { 
    currentData: paginatedOrders, 
    currentPage, 
    totalPages, 
    nextPage, 
    prevPage, 
    goToPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination(filteredOrders, 5); // Hiển thị 5 đơn hàng mỗi trang

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-[#FFB547]/10 text-[#FFB547]';
      case 'confirmed': return 'bg-[#39B8FF]/10 text-[#39B8FF]';
      case 'shipping': return 'bg-[#4318FF]/10 text-[#4318FF]';
      case 'delivered': return 'bg-[#01B574]/10 text-[#01B574]';
      case 'cancelled': return 'bg-[#EE5D50]/10 text-[#EE5D50]';
      default: return 'bg-[#F4F7FE] text-[#A3AED0]';
    }
  };

  const getStatusName = (status) => {
    return STATUS_TABS.find(t => t.id === status)?.name || status;
  };

  const handleStatusChange = (orderId, newStatus) => {
    orderService.updateStatus(orderId, newStatus)
      .then(() => {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      })
      .catch(err => {
        console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
        alert('Cập nhật trạng thái thất bại: ' + (err.message || JSON.stringify(err)));
      });
  };

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {error && (
        <div className="p-5 bg-[#EE5D50]/10 border border-[#EE5D50]/20 text-[#EE5D50] rounded-[20px] font-bold text-sm">
          ⚠️ Có lỗi xảy ra khi tải dữ liệu đơn hàng: {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Danh sách đơn hàng</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Quản lý và cập nhật trạng thái đơn hàng của khách</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Mã đơn, tên khách hàng..."
            className="w-full pl-11 pr-4 py-3 border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all bg-[#FFFFFF] shadow-sm font-medium text-[#2B3674] placeholder-[#A3AED0]"
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
              className="p-5 rounded-[20px] shadow-sm transition-all hover:shadow-md flex items-center justify-between h-28 bg-[#FFFFFF]"
            >
              <div className="flex flex-col">
                <p className="text-[12px] font-bold text-[#A3AED0] mb-1">
                  {item.label}
                </p>
                <h3 className="text-2xl font-bold text-[#2B3674] leading-none">
                  {count.toLocaleString('vi-VN')}
                </h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#F4F7FE] flex items-center justify-center flex-shrink-0">
                <Icon size={24} style={{ color: item.iconColor }} />
              </div>
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
              className={`flex items-center px-6 py-3 rounded-[20px] text-sm font-bold transition-all whitespace-nowrap border ${
                isActive 
                ? 'bg-[#4318FF] text-[#FFFFFF] border-[#4318FF] shadow-md scale-[1.02]' 
                : 'bg-[#FFFFFF] text-[#A3AED0] border-[#E0E5F2] hover:border-[#4318FF] hover:text-[#4318FF]'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-[#FFFFFF]' : tab.color}`} />}
              {tab.name}
               <span className={`ml-3 px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-tighter ${isActive ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#F4F7FE] text-[#2B3674]'}`}>
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Đơn hàng</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Khách hàng</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Ngày đặt</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Thanh toán</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Tổng cộng</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Trạng thái</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2] text-sm">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F4F7FE] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-[#4318FF] font-bold group-hover:underline cursor-pointer">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#2B3674]">{order.customer}</span>
                        <span className="text-[12px] text-[#A3AED0] font-medium">{order.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#2B3674]">{formatDate(order.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        order.payment === 'Đã thanh toán' ? 'bg-[#01B574]/10 text-[#01B574]' : 'bg-[#F4F7FE] text-[#A3AED0]'
                      }`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#2B3674]">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold inline-block ${getStatusStyle(order.status)}`}>
                        {getStatusName(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <select 
                          className="text-xs font-bold bg-[#F4F7FE] text-[#2B3674] rounded-xl px-3 py-2 border-none focus:outline-none focus:ring-1 focus:ring-[#4318FF] cursor-pointer hover:bg-[#E0E5F2] transition-all"
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
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-[#A3AED0]">
                      <ShoppingCart size={64} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy đơn hàng nào</p>
                      <p className="text-sm font-medium mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-[#E0E5F2] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-[#A3AED0]">
            Hiển thị {startIndex}-{endIndex} trên {totalItems} đơn hàng
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl text-sm font-bold hover:bg-[#E0E5F2] transition-colors disabled:opacity-50"
            >
              TRƯỚC
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-[#4318FF] text-[#FFFFFF] shadow-md' : 'bg-transparent text-[#A3AED0] hover:bg-[#F4F7FE]'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#F4F7FE] text-[#2B3674] rounded-xl text-sm font-bold hover:bg-[#E0E5F2] transition-colors disabled:opacity-50"
            >
              SAU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
