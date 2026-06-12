import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Award, UserCheck, ShieldCheck, Users, Lock, Unlock, X, ShieldAlert } from 'lucide-react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { usePagination } from '../hooks/usePagination';
import { useFormat } from '../hooks/useFormat';

const CUSTOMER_TABS = [
  { id: 'all', name: 'Tất cả', count: 0, icon: Users, color: 'text-[#A3AED0]', bgColor: 'bg-[#F4F7FE]' },
  { id: 'User', name: 'Khách hàng', count: 0, icon: UserCheck, color: 'text-[#01B574]', bgColor: 'bg-[#01B574]/10' },
  { id: 'Admin', name: 'Quản trị viên', count: 0, icon: Award, color: 'text-[#4318FF]', bgColor: 'bg-[#4318FF]/10' },
];

const CUSTOMER_STATS_CONFIG = [
  { label: 'Tổng người dùng', countKey: 'all', icon: Users, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
  { label: 'Khách hàng (User)', countKey: 'User', icon: UserCheck, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#01B574' },
  { label: 'Quản trị viên (Admin)', countKey: 'Admin', icon: Award, bgColor: '#FFFFFF', textColor: '#2B3674', iconColor: '#4318FF' },
];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [modalLoading, setModalLoading] = useState(false);

  const { formatDate } = useFormat();

  const fetchUsers = () => {
    setLoading(true);
    userService.getAll()
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          setCustomers([]);
        }
      })
      .catch(err => {
        console.error("Lỗi tải khách hàng từ API:", err);
        setCustomers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, username, isActive) => {
    const actionText = isActive ? 'KHÓA' : 'MỞ KHÓA';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của "${username}"?`)) {
      try {
        const msg = await userService.toggleStatus(id);
        alert(msg || 'Thực hiện thao tác thành công!');
        fetchUsers();
      } catch (error) {
        console.error("Lỗi thay đổi trạng thái:", error);
        alert('Có lỗi xảy ra: ' + (error.message || JSON.stringify(error)));
      }
    }
  };

  const handleOpenModal = () => {
    setFormData({ username: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      alert('Đăng ký tài khoản người dùng mới thành công!');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
      alert('Lỗi đăng ký: ' + (error.message || JSON.stringify(error)));
    } finally {
      setModalLoading(false);
    }
  };

  // Filter logic
  const filteredCustomers = customers.filter(customer => {
    const matchesTab = activeTab === 'all' || customer.role === activeTab;
    const matchesSearch = (customer.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (customer.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase());
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
  } = usePagination(filteredCustomers, 5); // 5 records per page

  // Calculate counts for tabs
  const tabCounts = {
    all: customers.length,
    User: customers.filter(c => c.role === 'User').length,
    Admin: customers.filter(c => c.role === 'Admin').length,
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin': return 'bg-[#4318FF]/10 text-[#4318FF] border border-[#4318FF]/20';
      case 'User': return 'bg-[#01B574]/10 text-[#01B574] border border-[#01B574]/20';
      default: return 'bg-[#F4F7FE] text-[#A3AED0]';
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý khách hàng</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Theo dõi thông tin, phân quyền và trạng thái hoạt động của tài khoản người dùng</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm username, email, mã người dùng..."
              className="w-full pl-11 pr-4 py-3 border border-[#E0E5F2] rounded-xl focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all bg-[#FFFFFF] shadow-sm font-medium text-[#2B3674] placeholder-[#A3AED0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95 whitespace-nowrap"
          >
            <UserPlus size={18} />
            <span>Thêm tài khoản</span>
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
              className="p-5 rounded-[20px] shadow-sm transition-all hover:shadow-md flex items-center justify-between h-28 bg-[#FFFFFF] border border-[#E0E5F2]"
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
      <div className="bg-[#FFFFFF] rounded-[20px] shadow-sm overflow-hidden mb-8 border border-[#E0E5F2]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#4318FF] gap-3">
              <div className="w-8 h-8 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
              <span className="font-bold text-sm">Đang tải danh sách người dùng...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0E5F2] bg-[#F4F7FE]/50">
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Tên người dùng</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Mã số tài khoản</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Email liên hệ</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Vai trò</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0]">Ngày đăng ký</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E5F2] text-sm">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => {
                    return (
                      <tr key={customer.id} className="hover:bg-[#F4F7FE] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#4318FF]/10 flex items-center justify-center text-[#4318FF] font-bold text-sm">
                              {(customer.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#2B3674]">{customer.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#A3AED0]">
                          <span className="text-xs">{customer.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[13px] font-medium text-[#2B3674]">{customer.email}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${getRoleBadgeStyle(customer.role)}`}>
                            {customer.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#2B3674]">
                          {formatDate(customer.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block ${
                            customer.isActive 
                            ? 'bg-[#01B574]/10 text-[#01B574]' 
                            : 'bg-[#EE5D50]/10 text-[#EE5D50]'
                          }`}>
                            {customer.isActive ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleToggleStatus(customer.id, customer.username, customer.isActive)}
                              className={`p-2 rounded-lg transition-all ${
                                customer.isActive 
                                ? 'text-[#EE5D50] hover:bg-[#FFF5F5]' 
                                : 'text-[#01B574] hover:bg-[#E8F8F2]'
                              }`}
                              title={customer.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            >
                              {customer.isActive ? <Lock size={18} /> : <Unlock size={18} />}
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
                        <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy tài khoản người dùng nào</p>
                        <p className="text-sm font-medium mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination footer */}
        {!loading && filteredCustomers.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E0E5F2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-bold text-[#A3AED0]">
              Hiển thị {startIndex}-{endIndex} trên {totalItems} tài khoản
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
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E0E5F2] flex justify-between items-center bg-[#F4F7FE]">
              <h3 className="text-xl font-bold text-[#2B3674] flex items-center gap-2">
                <UserPlus size={22} className="text-[#4318FF]" />
                Tạo tài khoản mới
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A3AED0] hover:text-[#EE5D50] hover:rotate-90 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Tên đăng nhập (Username)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                  placeholder="Nhập tên tài khoản..."
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                  placeholder="example@gmail.com..."
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2B3674] mb-2">Mật khẩu</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-[#E0E5F2] rounded-xl focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] outline-none text-[#2B3674] font-medium"
                  placeholder="Tối thiểu 6 ký tự..."
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="bg-[#FFF8ED] p-4 rounded-xl border border-[#FFB547]/20 flex items-start gap-3 text-xs text-[#FFB547] font-medium">
                <ShieldAlert size={20} className="shrink-0" />
                <p>Tài khoản được đăng ký tại đây mặc định sẽ có vai trò là <strong>Khách hàng (User)</strong> và được kích hoạt hoạt động ngay.</p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-[#F4F7FE] text-[#2B3674] rounded-xl font-bold hover:bg-[#E0E5F2] transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-xl font-bold shadow-md hover:bg-[#3911D1] transition-all active:scale-95 disabled:opacity-50"
                >
                  {modalLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
