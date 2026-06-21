import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line
} from 'recharts';
import { ShoppingCart, Gift, Package, TrendingUp, ShoppingBag } from 'lucide-react';
// import { MOCK_DASHBOARD } from '../utils/mockData'; // Removed mock data
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';

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
  const [productStats, setProductStats] = useState([]);
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

    // Thống kê theo từng mặt hàng từ tất cả đơn hàng
    orderService.getAll()
      .then(data => {
        if (data && data.length > 0) {
          const statsMap = {};
          data.forEach(order => {
            // Bỏ qua đơn hàng đã hủy
            const isCancelled = order.status && (order.status.toLowerCase() === 'cancelled' || order.status === 'Đã hủy');
            if (isCancelled) return;

            if (order.items && order.items.length > 0) {
              order.items.forEach(item => {
                const name = item.productName || 'Sản phẩm không tên';
                if (!statsMap[name]) {
                  statsMap[name] = {
                    name,
                    quantity: 0,
                    revenue: 0
                  };
                }
                statsMap[name].quantity += item.quantity || 0;
                statsMap[name].revenue += (item.quantity || 0) * (item.priceAtPurchase || 0);
              });
            }
          });
          // Sắp xếp giảm dần theo số lượng đã bán
          const sortedStats = Object.values(statsMap).sort((a, b) => b.quantity - a.quantity);
          setProductStats(sortedStats);
        }
      })
      .catch(e => console.error("Lỗi tải Thống kê mặt hàng:", e));
  }, []);
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between bg-[#FFFFFF] p-5 rounded-md">
        <h2 className="text-xl font-bold text-[#2B3674]">Thống kê cửa hàng</h2>
        <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-widest bg-[#F4F7FE] px-3 py-1.5 rounded-md">Cập nhật: Vừa xong</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. BIỂU ĐỒ DOANH THU */}
        <div className="bg-[#FFFFFF] p-6 rounded-md h-[400px] flex flex-col transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-md">
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
        <div className="bg-[#FFFFFF] p-6 rounded-md h-[400px] flex flex-col transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-md">
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
        <div className="bg-[#FFFFFF] p-6 rounded-md h-[400px] flex flex-col transition-all">
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-md">
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

        {/* 4. THỐNG KÊ THEO TỪNG MẶT HÀNG */}
        <div className="bg-[#FFFFFF] p-6 rounded-md h-[400px] flex flex-col transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#2B3674] flex items-center gap-2">
              <div className="p-2 bg-[#F4F7FE] rounded-md">
                <ShoppingBag size={20} className="text-[#4318FF]" />
              </div>
              Thống kê theo từng mặt hàng
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {productStats.length > 0 ? (
              productStats.map((item, idx) => {
                const colorPalette = ['#4318FF', '#39B8FF', '#01B574', '#FFB547', '#EE5D50', '#707EAE'];
                const itemColor = colorPalette[idx % colorPalette.length];
                const maxQty = productStats[0].quantity || 1;
                const percentage = Math.round((item.quantity / maxQty) * 100);

                return (
                  <div key={idx} className="p-3 rounded-md border border-[#E0E5F2] hover:border-[#E0E5F2] hover:bg-[#F4F7FE]/40 transition-all flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Color Picker Dot representing the item */}
                        <div 
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-transform hover:scale-125 cursor-pointer" 
                          style={{ backgroundColor: itemColor }}
                          title={`Mã màu: ${itemColor}`}
                        />
                        <span className="text-sm font-bold text-[#2B3674] truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <span 
                        className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: `${itemColor}15`, color: itemColor }}
                      >
                        Đã bán: {item.quantity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[12px] text-[#A3AED0] font-semibold">
                      <span>Doanh thu</span>
                      <span className="text-[#2B3674] font-bold">
                        {item.revenue.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Progress bar using the item's corresponding color */}
                    <div className="w-full h-2 bg-[#F4F7FE] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: itemColor
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-[#A3AED0] text-sm font-medium">
                Chưa có dữ liệu bán hàng
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
