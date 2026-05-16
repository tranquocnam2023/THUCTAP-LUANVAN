import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Users, Star, Award, UserCheck, ShieldCheck } from 'lucide-react';
// import { MOCK_CUSTOMERS } from '../utils/mockData'; // Removed mock data
import { userService } from '../services/userService';
import { usePagination } from '../hooks/usePagination';
import { useFormat } from '../hooks/useFormat';

const CUSTOMER_TABS = [
  { id: 'all', name: 'Tất cả', count: 0, icon: Users, color: 'text-[#A3AED0]', bgColor: 'bg-[#F4F7FE]' },
  { id: 'potential', name: 'Tiềm năng', count: 0, icon: Star, color: 'text-[#FFB547]', bgColor: 'bg-[#FFB547]/10' },
  { id: 'loyal', name: 'Thân thiết', count: 0, icon: Award, color: 'text-[#4318FF]', bgColor: 'bg-[#4318FF]/10' },
  { id: 'new', name: 'Khách hàng mới', count: 0, icon: UserCheck, color: 'text-[#01B574]', bgColor: 'bg-[#01B574]/10' },
];

const CUSTOMER_STATS_CONFIG = [
  { label: 'Tổng khách hàng', countKey: 'all', icon: Users, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
  { label: 'KH Tiềm năng', countKey: 'potential', icon: Star, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#FFB547' },
  { label: 'KH Thân thiết', countKey: 'loyal', icon: Award, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
  { label: 'Khách hàng mới', countKey: 'new', icon: UserCheck, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#01B574' },
];

export default function AdminCustomers() {
  // Mock data for demonstration
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    userService.getAll()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCustomers(data);
      })
      .catch(err => {
        console.error("Lỗi tải khách hàng:", err);
        setCustomers([]);
      });
  }, []);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Khởi tạo các hook
  const { formatCurrency, formatDate, formatNumber } = useFormat();

  // Potential threshold: > 1000 points
  // Loyal threshold: > 2000 points
  const getCustomerType = (points) => {
    if (points >= 2000) return { label: 'Thân thiết', id: 'loyal', style: 'bg-[#4318FF]/10 text-[#4318FF]' };
    if (points >= 1000) return { label: 'Tiềm năng', id: 'potential', style: 'bg-[#FFB547]/10 text-[#FFB547]' };
    return { label: 'Thường', id: 'regular', style: 'bg-[#F4F7FE] text-[#A3AED0]' };
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
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý khách hàng</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Theo dõi thông tin và điểm thưởng tích lũy của khách hàng</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm tên, số điện thoại, mã KH..."
              className="w-full pl-11 pr-4 py-3 border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all bg-[#FFFFFF] shadow-sm font-medium text-[#2B3674] placeholder-[#A3AED0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95 whitespace-nowrap">
            <UserPlus size={18} />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CUSTOMER_STATS_CONFIG.map((item, i) => {
          const Icon = item.icon;
          const count = tabCounts[item.countKey];
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
              className={`flex items-center px-6 py-3 rounded-[20px] text-sm font-bold transition-all whitespace-nowrap border ${
                isActive 
                ? 'bg-[#4318FF] text-[#FFFFFF] border-[#4318FF] shadow-md scale-[1.02]' 
                : 'bg-[#FFFFFF] text-[#A3AED0] border-[#E0E5F2] hover:border-[#4318FF] hover:text-[#4318FF]'
              }`}
            >
              {Icon && <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-[#FFFFFF]' : tab.color}`} />}
              {tab.name}
              <span className={`ml-3 px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-tighter ${isActive ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#F4F7FE] text-[#2B3674]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5F2]">
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Mã KH</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Họ và tên</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Số điện thoại</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Điểm thưởng</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Phân loại</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Ngày tham gia</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E5F2] text-sm">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => {
                  const type = getCustomerType(customer.points);
                  return (
                    <tr key={customer.id} className="hover:bg-[#F4F7FE] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[#4318FF] font-bold">{customer.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#4318FF]/10 flex items-center justify-center text-[#4318FF] font-bold text-sm">
                            {(customer.name || 'U').charAt(0)}
                          </div>
                          <span className="font-bold text-[#2B3674]">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] font-medium text-[#A3AED0]">{customer.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F7FE] text-[#4318FF] rounded-full font-bold text-sm">
                          <Award size={14} />
                          {formatNumber(customer.points)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${type.style}`}>
                          {type.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#2B3674]">
                        {formatDate(customer.joinDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-[#A3AED0] hover:text-[#FFB547] hover:bg-[#FFF8ED] rounded-lg transition-all" title="Chỉnh sửa">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-[#A3AED0] hover:text-[#EE5D50] hover:bg-[#FFF5F5] rounded-lg transition-all" title="Xóa">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-[#A3AED0]">
                      <Users size={64} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy khách hàng nào</p>
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
            Hiển thị {startIndex}-{endIndex} trên {totalItems} khách hàng
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
