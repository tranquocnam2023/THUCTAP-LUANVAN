import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line
} from 'recharts';
import { ShoppingCart, Gift, Package, TrendingUp } from 'lucide-react';
import { MOCK_DASHBOARD } from '../utils/mockData';

const THEME = {
  primary: '#5856d6',
  success: '#34c759',
  warning: '#ff9500',
  danger: '#ff3b30',
  info: '#007aff',
  border: '#f0f0f0'
};

export default function AdminDashboard() {
  const [revenueData, setRevenueData] = useState(MOCK_DASHBOARD.revenue);
  const [birthdays, setBirthdays] = useState(MOCK_DASHBOARD.birthdays);
  const [recentOrders, setRecentOrders] = useState(MOCK_DASHBOARD.recentOrders);
  const [brandPerformance, setBrandPerformance] = useState(MOCK_DASHBOARD.performance);

  useEffect(() => {
    // Giả định các API này tồn tại hoặc sẽ được tạo
    fetch('http://localhost:5000/api/Dashboard/Revenue')
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setRevenueData(data); })
      .catch(e => console.log("Sử dụng dữ liệu ảo Doanh thu"));

    fetch('http://localhost:5000/api/User/Birthdays')
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setBirthdays(data); })
      .catch(e => console.log("Sử dụng dữ liệu ảo Sinh nhật"));

    fetch('http://localhost:5000/api/Order/Recent')
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setRecentOrders(data); })
      .catch(e => console.log("Sử dụng dữ liệu ảo Đơn hàng mới"));

    fetch('http://localhost:5000/api/Product/Performance')
      .then(res => res.json())
      .then(data => { if (data && data.length > 0) setBrandPerformance(data); })
      .catch(e => console.log("Sử dụng dữ liệu ảo Hiệu suất"));
  }, []);
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-extrabold text-gray-800">Thống kê cửa hàng</h2>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cập nhật: Vừa xong</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. BIỂU ĐỒ DOANH THU */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Doanh thu (7 ngày & Tháng)
            </h3>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Daily</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Monthly</span>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Legend iconType="circle" />
                <Bar dataKey="daily" name="Doanh thu ngày" fill={THEME.info} radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="monthly" name="Doanh thu tháng (x10)" stroke={THEME.primary} strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. HIỆU SUẤT THEO THƯƠNG HIỆU (TỒN & BÁN) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-orange-500" />
              Tồn kho & Bán ra theo Hiệu
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
             {brandPerformance.length > 0 ? (
               <div className="space-y-5">
                  {brandPerformance.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-gray-700">{item.brand}</span>
                        <div className="flex gap-3 text-[11px] font-bold">
                          <span className="text-gray-400">Tồn: {item.stock}</span>
                          <span className="text-green-600">Bán: {item.sold}</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                         <div 
                          className="h-full bg-orange-400 transition-all duration-1000" 
                          style={{ width: `${(item.stock / (item.stock + item.sold)) * 100}%` }}
                         ></div>
                         <div 
                          className="h-full bg-green-500 transition-all duration-1000" 
                          style={{ width: `${(item.sold / (item.stock + item.sold)) * 100}%` }}
                         ></div>
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                Chưa có dữ liệu tồn kho
              </div>
             )}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-center gap-6 text-[11px] font-bold">
            <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-orange-400"></div> Tồn kho</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-green-500"></div> Đã bán</span>
          </div>
        </div>

        {/* 3. ĐƠN HÀNG GẦN ĐÂY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col transition-all hover:shadow-md">
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={20} className="text-purple-500" />
              Đơn hàng mới nhận
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-400 text-left uppercase tracking-widest font-black">
                    <th className="py-3 px-2">Mã</th>
                    <th className="py-3 px-2">Khách</th>
                    <th className="py-3 px-2 text-right">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-2 font-bold text-blue-600">{order.id}</td>
                      <td className="py-4 px-2">
                        <p className="font-bold text-gray-700">{order.customer}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          order.status === 'Đã giao' ? 'bg-green-100 text-green-600' : 
                          order.status === 'Đã hủy' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-black text-gray-800">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                Chưa có đơn hàng nào
              </div>
            )}
          </div>
        </div>

        {/* 4. KHÁCH HÀNG SINH NHẬT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Gift size={20} className="text-pink-500" />
              Khách hàng sinh nhật
            </h3>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {birthdays.length > 0 ? (
              birthdays.map((person, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-100 hover:bg-pink-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-xs group-hover:scale-110 transition-transform">
                      {person.name.split(' ').pop().charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-700">{person.name}</p>
                      <p className="text-[11px] text-gray-400 font-bold">{person.date} • {person.age} tuổi</p>
                    </div>
                  </div>
                  <button className="p-2 text-pink-400 hover:text-pink-600 transition-colors">
                    <Gift size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                Không có sinh nhật nào trong tháng
              </div>
            )}
          </div>
          <button className="mt-6 w-full py-3 bg-pink-50 text-pink-600 rounded-xl text-xs font-black hover:bg-pink-100 transition-all active:scale-95">
            Gửi lời chúc hàng loạt
          </button>
        </div>

      </div>
    </div>
  );
}
