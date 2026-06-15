import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Smile, ExternalLink, Calendar, MapPin, CreditCard, Tag } from 'lucide-react';

export default function OrderDetailsTracker({ order }) {
  if (!order) return null;

  // Bản đồ trạng thái API sang thứ tự timeline (1-4)
  const getStatusStep = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 1;
    if (s === 'confirmed' || s === 'processing') return 2;
    if (s === 'shipping' || s === 'shipped') return 3;
    if (s === 'delivered' || s === 'completed') return 4;
    return 1;
  };

  const currentStep = getStatusStep(order.status);

  // Helper định dạng thời gian giả lập chính xác theo mốc
  const getStepTime = (createdAtStr, stepIndex) => {
    const baseDate = new Date(createdAtStr);
    if (isNaN(baseDate.getTime())) return '';

    let stepDate = new Date(baseDate);
    if (stepIndex === 1) {
      // Đúng lúc tạo đơn
    } else if (stepIndex === 2) {
      // 15 phút sau
      stepDate.setMinutes(baseDate.getMinutes() + 15);
    } else if (stepIndex === 3) {
      // 2 giờ 30 phút sau
      stepDate.setMinutes(baseDate.getMinutes() + 150);
    } else if (stepIndex === 4) {
      // 1 ngày sau
      stepDate.setDate(baseDate.getDate() + 1);
    }

    // Nếu bước hiện tại chưa đạt tới mốc thời gian đó (trong thực tế)
    // Hoặc đơn hàng chưa có trạng thái đó
    if (stepIndex > currentStep) return null;

    return stepDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Các mốc trạng thái
  const steps = [
    {
      title: 'Đặt hàng thành công',
      desc: 'Đơn hàng mới đã được ghi nhận trên hệ thống.',
      icon: Clock,
    },
    {
      title: 'Đã xác nhận & Đóng gói',
      desc: 'Nhân viên cửa hàng đã xác nhận đơn và bàn giao cho kho đóng gói.',
      icon: Package,
    },
    {
      title: 'Đang vận chuyển',
      desc: 'Đơn hàng đã bàn giao cho đối tác vận chuyển Giao Hàng Nhanh (GHN).',
      icon: Truck,
      hasTracking: true,
    },
    {
      title: 'Giao hàng thành công',
      desc: 'Người nhận đã kiểm tra, nhận hàng và hoàn tất thanh toán.',
      icon: Smile,
    }
  ];

  return (
    <div className="w-full bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-300">
      {/* Header đơn hàng */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-50 pb-6 gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Đơn hàng <span className="text-blue-600">#PS{order.id}</span>
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1">
            <Calendar size={12} />
            Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
            currentStep === 4
              ? 'bg-green-50 border-green-200 text-green-600'
              : currentStep === 3
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-orange-50 border-orange-200 text-orange-500'
          }`}>
            {order.status === 'Pending' ? 'Chờ xác nhận' :
             order.status === 'Confirmed' ? 'Đã xác nhận' :
             order.status === 'Processing' ? 'Đang đóng gói' :
             order.status === 'Shipping' ? 'Đang giao hàng' :
             order.status === 'Delivered' ? 'Đã giao hàng' : order.status}
          </span>
        </div>
      </div>

      {/* TIMELINE / STEPPER TRẠNG THÁI (Green theme kiểu TGDĐ/ĐMX) */}
      <div className="space-y-6 pt-2">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest pl-1">Trạng thái vận chuyển</h3>
        
        <div className="relative pl-8 md:pl-10 space-y-8">
          {/* Đường thẳng chạy dọc kết nối */}
          <div className="absolute left-4 top-4 bottom-4 w-1 bg-gray-100 rounded-full">
            <div 
              className="w-full bg-green-500 rounded-full transition-all duration-700"
              style={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Render các bước trong Timeline */}
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep >= stepNum;
            const StepIcon = step.icon;
            const stepTime = getStepTime(order.createdAt, stepNum);

            return (
              <div key={idx} className="relative flex gap-4 md:gap-6 animate-in slide-in-from-left duration-300">
                {/* Node hình tròn ở cột bên trái */}
                <div className={`absolute -left-7 md:-left-[1.875rem] w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-green-500 border-green-100 text-white scale-110 shadow-md shadow-green-100' 
                    : 'bg-white border-gray-200 text-gray-300'
                }`}>
                  {isCompleted ? <CheckCircle2 size={10} className="stroke-[3]" /> : <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>}
                </div>

                {/* Nội dung text */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className={`text-sm font-black ${isCompleted ? 'text-gray-900 font-black' : 'text-gray-400'}`}>
                      {step.title}
                    </h4>
                    {stepTime && (
                      <span className="text-[10px] bg-gray-100 font-bold px-2 py-0.5 rounded text-gray-500 shrink-0">
                        {stepTime}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isCompleted ? 'text-gray-600' : 'text-gray-400 opacity-60'}`}>
                    {step.desc}
                  </p>

                  {/* Bài toán Đơn vị vận chuyển thứ 3: GHN tracking code */}
                  {step.hasTracking && isCompleted && (
                    <div className="mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-4 animate-in zoom-in-95">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Đối tác giao nhận</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-orange-600 font-extrabold uppercase">Giao Hàng Nhanh</strong>
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded">
                            Mã vận đơn: GHN-PS{order.id}128
                          </span>
                        </div>
                      </div>
                      <a 
                        href="https://giaohangnhanh.vn" 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-black text-gray-700 flex items-center gap-1 shadow-sm transition-all"
                      >
                        Tra cứu trang GHN
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHI TIẾT SẢN PHẨM MUA */}
      <div className="border-t border-gray-50 pt-6 space-y-4">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest pl-1">Sản phẩm trong đơn hàng</h3>
        <div className="space-y-4">
          {order.items && order.items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-gray-50 rounded-xl p-1.5 border border-gray-100 shrink-0 shadow-inner flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 truncate">{item.productName}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic">
                  {item.variantName} | Số lượng: {item.quantity}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-blue-600">
                  {(item.priceAtPurchase * item.quantity).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THÔNG TIN NGƯỜI NHẬN & PHƯƠNG THỨC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-6">
        <div className="space-y-3 bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100">
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin size={14} className="text-blue-500" />
            Thông tin nhận hàng
          </h4>
          <div className="space-y-1.5 text-xs text-gray-600 font-medium">
            <p className="font-bold text-gray-800 text-sm">{order.receiverName || order.customerName}</p>
            <p>SĐT: <strong className="text-gray-800">{order.receiverPhone || order.customerPhone}</strong></p>
            <p className="leading-relaxed">Địa chỉ: {order.shippingAddress || order.addressLine}</p>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100">
          <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
            <CreditCard size={14} className="text-blue-500" />
            Thanh toán chi tiết
          </h4>
          <div className="space-y-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
            <div className="flex justify-between">
              <span>Phương thức thanh toán:</span>
              <span className="text-gray-800 font-black">Chuyển khoản / COD</span>
            </div>
            {order.promotionCode && (
              <div className="flex justify-between text-green-600">
                <span>Voucher đã dùng:</span>
                <span className="font-black">{order.promotionCode}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200/50 text-sm font-black text-gray-900 normal-case tracking-normal">
              <span>Tổng cộng thanh toán:</span>
              <span className="text-red-600 font-black text-base">{order.totalPrice.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
