import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line
} from 'recharts';
import { ShoppingCart, Gift, Package, TrendingUp } from 'lucide-react';
// import { MOCK_DASHBOARD } from '../utils/mockData'; // Removed mock data
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';

const THEME = {
  primary: '#4318FF',
  success: '#01B574',
  warning: '#FFB547',
  danger: '#EE5D50',
  info: '#39B8FF',
  border: '#E0E5F2',
  textMain: '#2B3674',
  textMuted: '#A3AED0',
  bgCard: '#FFFFFF',
  bgPage: '#F4F7FE'
};

export default function AdminDashboard() {
  const [revenueData, setRevenueData] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [brandPerformance, setBrandPerformance] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });

  useEffect(() => {
    // Sử dụng service thay vì fetch trực tiếp
    dashboardService.getRevenue()
      .then(data => { if (data && data.length > 0) setRevenueData(data); })
      .catch(e => console.error("Lỗi tải Doanh thu:", e));

    dashboardService.getRecentOrders()
      .then(data => { if (data && data.length > 0) setRecentOrders(data); })
      .catch(e => console.error("Lỗi tải Đơn hàng mới:", e));

    dashboardService.getStats()
      .then(data => { if (data) setStats(data); })
      .catch(e => console.error("Lỗi tải Thống kê:", e));

    // Fetch products to show performance (by category)
    productService.getAll()
      .then(data => {
        if (data && data.length > 0) {
          // Group by category for performance chart
          const performance = {};
          data.forEach(p => {
            const brand = p.categoryName || 'Khác';
            if (!performance[brand]) performance[brand] = { brand, stock: 0, sold: 0 };
            performance[brand].stock += p.availableStock ?? p.totalStock ?? p.stockQuantity ?? p.stock ?? 0;
            performance[brand].sold += 5; // Dummy sold count for visual
          });
          setBrandPerformance(Object.values(performance));
        }
      });
  }, []);
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between bg-[#FFFFFF] p-5 rounded-[20px] shadow-sm">
        <h2 className="text-xl font-bold text-[#2B3674]">Thống kê cửa hàng</h2>
        <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-widest bg-[#F4F7FE] px-3 py-1.5 rounded-lg">Cập nhật: Vừa xong</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. BIỂU ĐỒ DOANH THU */}
        <div className="bg-[#FFFFFF] p-6 rounded-[20px] shadow-sm h-[400px] flex flex-col transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-lg">
                <TrendingUp size={20} className="text-[#4318FF]" />
              </div>
              Doanh thu (7 ngày & Tháng)
            </h3>
            <div className="flex gap-4 text-[12px] font-medium text-[#A3AED0]">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.info }}></div> Ngày</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME.primary }}></div> Tháng</span>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: THEME.textMuted, fontSize: 12, fontWeight: 500}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: THEME.textMuted, fontSize: 12, fontWeight: 500}} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Legend iconType="circle" />
                <Bar dataKey="daily" name="Doanh thu ngày" fill={THEME.info} radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="monthly" name="Doanh thu tháng (x10)" stroke={THEME.primary} strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. HIỆU SUẤT THEO THƯƠNG HIỆU (TỒN & BÁN) */}
        <div className="bg-[#FFFFFF] p-6 rounded-[20px] shadow-sm h-[400px] flex flex-col transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-lg">
                <Package size={20} className="text-[#FFB547]" />
              </div>
              Tồn kho & Bán ra theo Hiệu
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
             {brandPerformance.length > 0 ? (
               <div className="space-y-5">
                  {brandPerformance.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#2B3674]">{item.brand}</span>
                        <div className="flex gap-3 text-[12px] font-medium">
                          <span className="text-[#A3AED0]">Tồn: {item.stock}</span>
                          <span className="text-[#01B574] font-bold">Bán: {item.sold}</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-[#F4F7FE] rounded-full overflow-hidden flex">
                         <div 
                          className="h-full transition-all duration-1000" 
                          style={{ width: `${(item.stock / (item.stock + item.sold)) * 100}%`, backgroundColor: THEME.warning }}
                         ></div>
                         <div 
                          className="h-full transition-all duration-1000" 
                          style={{ width: `${(item.sold / (item.stock + item.sold)) * 100}%`, backgroundColor: THEME.success }}
                         ></div>
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
              <div className="h-full flex items-center justify-center text-[#A3AED0] text-sm font-medium">
                Chưa có dữ liệu tồn kho
              </div>
             )}
          </div>
          <div className="mt-4 pt-4 border-t border-[#E0E5F2] flex justify-center gap-6 text-[12px] font-medium text-[#A3AED0]">
            <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: THEME.warning }}></div> Tồn kho</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: THEME.success }}></div> Đã bán</span>
          </div>
        </div>

        {/* 3. ĐƠN HÀNG GẦN ĐÂY */}
        <div className="bg-[#FFFFFF] p-6 rounded-[20px] shadow-sm h-[400px] flex flex-col transition-all">
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-lg">
                <ShoppingCart size={20} className="text-[#39B8FF]" />
              </div>
              Đơn hàng mới nhận
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#FFFFFF] z-10 border-b border-[#E0E5F2]">
                  <tr className="text-[#A3AED0] text-left font-medium">
                    <th className="py-3 px-2">Mã</th>
                    <th className="py-3 px-2">Khách</th>
                    <th className="py-3 px-2 text-right">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E5F2]">
                  {recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-[#F4F7FE] transition-colors">
                      <td className="py-4 px-2 font-bold text-[#4318FF]">{order.id}</td>
                      <td className="py-4 px-2">
                        <p className="font-bold text-[#2B3674]">{order.customer}</p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                          order.status === 'Đã giao' ? 'bg-[#01B574]/10 text-[#01B574]' : 
                          order.status === 'Đã hủy' ? 'bg-[#EE5D50]/10 text-[#EE5D50]' : 'bg-[#FFB547]/10 text-[#FFB547]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-[#2B3674]">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-[#A3AED0] text-sm font-medium">
                Chưa có đơn hàng nào
              </div>
            )}
          </div>
        </div>

        {/* 4. KHÁCH HÀNG SINH NHẬT */}
        <div className="bg-[#FFFFFF] p-6 rounded-[20px] shadow-sm h-[400px] flex flex-col transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-lg">
                <Gift size={20} className="text-[#EE5D50]" />
              </div>
              Khách hàng sinh nhật
            </h3>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {birthdays.length > 0 ? (
              birthdays.map((person, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-[#E0E5F2] hover:bg-[#F4F7FE] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4318FF]/10 flex items-center justify-center text-[#4318FF] font-bold text-sm group-hover:scale-110 transition-transform">
                      {person.name.split(' ').pop().charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2B3674]">{person.name}</p>
                      <p className="text-[12px] text-[#A3AED0] font-medium">{person.date} • {person.age} tuổi</p>
                    </div>
                  </div>
                  <button className="p-2 text-[#A3AED0] hover:text-[#4318FF] transition-colors">
                    <Gift size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-[#A3AED0] text-sm font-medium">
                Không có sinh nhật nào trong tháng
              </div>
            )}
          </div>
          <button className="mt-6 w-full py-3 bg-[#4318FF]/10 text-[#4318FF] rounded-xl text-sm font-bold hover:bg-[#4318FF] hover:text-[#FFFFFF] transition-all active:scale-95">
            Gửi lời chúc hàng loạt
          </button>
        </div>

      </div>
    </div>
  );
}
