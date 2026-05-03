import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Users, Star, Award, UserCheck, ShieldCheck } from 'lucide-react';
import { MOCK_CUSTOMERS } from '../utils/mockData';
import { userService } from '../services/userService';
import { usePagination } from '../hooks/usePagination';
import { useFormat } from '../hooks/useFormat';

const CUSTOMER_TABS = [
  { id: 'all', name: 'Tất cả', count: 0, icon: Users, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { id: 'potential', name: 'Tiềm năng', count: 0, icon: Star, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  { id: 'loyal', name: 'Thân thiết', count: 0, icon: Award, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'new', name: 'Khách hàng mới', count: 0, icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-50' },
];

const CUSTOMER_STATS_CONFIG = [
  { label: 'Tổng khách hàng', countKey: 'all', icon: Users, bgColor: '#5856d6', textColor: '#ffffff' },
  { label: 'KH Tiềm năng', countKey: 'potential', icon: Star, bgColor: '#ff9500', textColor: '#ffffff' },
  { label: 'KH Thân thiết', countKey: 'loyal', icon: Award, bgColor: '#af52de', textColor: '#ffffff' },
  { label: 'Khách hàng mới', countKey: 'new', icon: UserCheck, bgColor: '#34c759', textColor: '#ffffff' },
];

export default function AdminCustomers() {
  // Mock data for demonstration
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);

  useEffect(() => {
    userService.getAll()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCustomers(data);
      })
      .catch(err => console.log("Sử dụng dữ liệu ảo (API không khả dụng)"));
  }, []);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Khởi tạo các hook
  const { formatCurrency, formatDate, formatNumber } = useFormat();

  // Potential threshold: > 1000 points
  // Loyal threshold: > 2000 points
  const getCustomerType = (points) => {
    if (points >= 2000) return { label: 'Thân thiết', id: 'loyal', style: 'bg-purple-50 text-purple-600 border-purple-100' };
    if (points >= 1000) return { label: 'Tiềm năng', id: 'potential', style: 'bg-orange-50 text-orange-600 border-orange-100' };
    return { label: 'Thường', id: 'regular', style: 'bg-gray-50 text-gray-500 border-gray-100' };
  };

  const filteredCustomers = customers.filter(customer => {
    const type = getCustomerType(customer.points || 0);
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'potential' && type.id === 'potential') ||
                      (activeTab === 'loyal' && type.id === 'loyal') ||
                      (activeTab === 'new' && new Date(customer.joinDate) > new Date('2024-03-01'));
    
    const matchesSearch = (customer.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (customer.phone || '').includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const { 
    currentData: paginatedCustomers, 
    currentPage, 
    totalPages, 
    nextPage, 
    prevPage, 
    goToPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination(filteredCustomers, 5); // Hiển thị 5 khách hàng mỗi trang

  // Calculate counts for tabs
  const tabCounts = {
    all: customers.length,
    potential: customers.filter(c => getCustomerType(c.points).id === 'potential').length,
    loyal: customers.filter(c => getCustomerType(c.points).id === 'loyal').length,
    new: customers.filter(c => new Date(c.joinDate) > new Date('2024-03-01')).length
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý khách hàng</h2>
          <p className="text-sm text-gray-500 font-medium">Theo dõi thông tin và điểm thưởng tích lũy của khách hàng</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm tên, số điện thoại, mã KH..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap">
            <UserPlus size={18} />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Stats Overview - MISA Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CUSTOMER_STATS_CONFIG.map((item, i) => {
          const Icon = item.icon;
          const count = tabCounts[item.countKey];
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

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
        {CUSTOMER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id];
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
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Mã KH</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Họ và tên</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Điểm thưởng</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Phân loại</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Ngày tham gia</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => {
                  const type = getCustomerType(customer.points);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-blue-600 font-black">{customer.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {(customer.name || 'U').charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-semibold text-gray-600">{customer.phone}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-black text-sm border border-blue-100">
                          <Award size={14} />
                          {formatNumber(customer.points)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-tight shadow-sm inline-block ${type.style}`}>
                          {type.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-gray-500">
                        {formatDate(customer.joinDate)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Chỉnh sửa">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <Users size={64} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold">Không tìm thấy khách hàng nào</p>
                      <p className="text-sm font-medium">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            HIỂN THỊ {startIndex}-{endIndex} TRÊN {totalItems} KHÁCH HÀNG
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
            >
              TRƯỚC
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-100 text-gray-400 hover:border-blue-200'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
            >
              SAU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
