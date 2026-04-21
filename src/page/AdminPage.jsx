import React, { useState } from 'react';
import AdminProducts from './AdminProducts';

export default function AdminPage() {
  const [activeAdminTab, setActiveAdminTab] = useState('products'); // Mở lên là thấy luôn phần Sản phẩm
  // Khai báo state lưu trữ trạng thái hiển thị (viewAllOrders) và dữ liệu tìm kiếm (filterDate, searchTerm)
  const [viewAllOrders, setViewAllOrders] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = { users: 0, revenue: 0, orders: 0, products: 0 };
  const recentOrders = [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-wider text-white">Quản Lý PhoneShop</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveAdminTab('dashboard'); }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${activeAdminTab === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <svg className={`w-5 h-5 mr-3 ${activeAdminTab === 'dashboard' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Bảng thống kê
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveAdminTab('products'); }}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${activeAdminTab === 'products' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <svg className={`w-5 h-5 mr-3 ${activeAdminTab === 'products' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Sản phẩm
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Khách hàng
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Đơn hàng
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group">
            <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Cài đặt
          </a>
        </nav>
        <div className="p-4 bg-gray-800">
          <a href="/" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Quay lại trang chủ cửa hàng
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 bg-white border-b border-gray-200 items-center justify-between px-6 shadow-sm z-10 w-full">
          <div className="flex items-center">
            <button className="text-gray-500 focus:outline-none md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800 ml-3 md:ml-0">Bảng thống kê số liệu</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow">
              A
            </div>
          </div>
        </header>

        {/* Bảng thống kê */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeAdminTab === 'products' ? (
             <AdminProducts />
          ) : (
            <>
              {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng số khách hàng</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.users}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng doanh thu</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.revenue.toLocaleString('vi-VN')}đ</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng đơn hàng</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.orders}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng sản phẩm</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.products}</h3>
              </div>
            </div>
          </div>

          {/* Đơn hàng mới Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden">
            {/*  Cập nhật Tiêu đề bảng thay đổi linh hoạt và gắn nút Đóng bộ lọc */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {viewAllOrders ? 'Toàn bộ đơn hàng' : 'Đơn hàng mới'}
              </h3>
              {viewAllOrders && (
                <button
                  onClick={() => setViewAllOrders(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors border-none cursor-pointer"
                >
                  Đóng
                </button>
              )}
            </div>

            {/*  Thiết kế giao diện thanh Bộ lọc xuất hiện khi bấm 'Xem toàn bộ' */}
            {viewAllOrders && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="flex flex-col">
                    <label htmlFor="filterDate" className="text-xs font-semibold text-gray-600 mb-1">Ngày tháng</label>
                    <input
                      type="date"
                      id="filterDate"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col flex-1 sm:w-80">
                    <label htmlFor="searchOrder" className="text-xs font-semibold text-gray-600 mb-1">Tìm kiếm</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                      <input
                        type="text"
                        id="searchOrder"
                        placeholder="Mã đơn, tên khách, tên sản phẩm..."
                        className="border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-auto self-end sm:self-center mt-5 sm:mt-0 flex">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer w-full sm:w-auto flex-1 mt-1 sm:mt-0">
                    Lọc kết quả
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto w-full">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Mã đơn</th>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Ngày</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-blue-600 font-medium">{order.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{order.customer}</td>
                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{order.amount.toLocaleString('vi-VN')}đ</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/*  Chuyển thẻ <a> 'Xem toàn bộ' thông thường thành <button> để kích hoạt State xuất hiện bộ lọc */}
            {!viewAllOrders && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-center">
                <button
                  onClick={() => setViewAllOrders(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-transparent cursor-pointer border-none"
                >
                  Xem toàn bộ đơn hàng &rarr;
                </button>
              </div>
            )}
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
