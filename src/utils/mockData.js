// src/utils/mockData.js

export const MOCK_ORDERS = [
  { id: 'ORD001', customer: 'Nguyễn Văn A', phone: '0901234567', date: '2026-04-25', payment: 'Đã thanh toán', amount: 25990000, status: 'delivered' },
  { id: 'ORD002', customer: 'Trần Thị B', phone: '0912345678', date: '2026-04-26', payment: 'Chưa thanh toán', amount: 34990000, status: 'pending' },
  { id: 'ORD003', customer: 'Lê Văn C', phone: '0923456789', date: '2026-04-27', payment: 'Đã thanh toán', amount: 15490000, status: 'shipping' },
  { id: 'ORD004', customer: 'Phạm Thị D', phone: '0934567890', date: '2026-04-28', payment: 'Đã thanh toán', amount: 12990000, status: 'confirmed' },
  { id: 'ORD005', customer: 'Hoàng Văn E', phone: '0945678901', date: '2026-04-28', payment: 'Chưa thanh toán', amount: 5990000, status: 'cancelled' },
];

export const MOCK_CUSTOMERS = [
  { id: 'KH001', name: 'Nguyễn Văn A', phone: '0901234567', points: 2500, joinDate: '2023-10-15' },
  { id: 'KH002', name: 'Trần Thị B', phone: '0912345678', points: 1200, joinDate: '2024-01-20' },
  { id: 'KH003', name: 'Lê Văn C', phone: '0923456789', points: 800, joinDate: '2024-03-05' },
  { id: 'KH004', name: 'Phạm Thị D', phone: '0934567890', points: 3000, joinDate: '2023-05-12' },
  { id: 'KH005', name: 'Ngô Văn F', phone: '0956789012', points: 150, joinDate: '2024-04-27' },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: 'iPhone' },
  { id: 2, name: 'Samsung' },
  { id: 3, name: 'Xiaomi' },
  { id: 4, name: 'Oppo' },
];

export const MOCK_PRODUCTS = {
  'iPhone': [
    { id: 101, name: 'iPhone 15 Pro Max 256GB', stockQuantity: 15, price: 29590000 },
    { id: 102, name: 'iPhone 15 Pro 128GB', stockQuantity: 8, price: 24990000 },
    { id: 103, name: 'iPhone 14 Plus 128GB', stockQuantity: 0, price: 19990000 },
  ],
  'Samsung': [
    { id: 201, name: 'Samsung Galaxy S24 Ultra', stockQuantity: 12, price: 31990000 },
    { id: 202, name: 'Samsung Galaxy Z Fold5', stockQuantity: 5, price: 40990000 },
  ],
  'Xiaomi': [
    { id: 301, name: 'Xiaomi 14 Pro', stockQuantity: 20, price: 22990000 },
    { id: 302, name: 'Redmi Note 13 Pro', stockQuantity: 45, price: 7990000 },
  ]
};

export const MOCK_DASHBOARD = {
  revenue: [
    { name: 'T2', daily: 45, monthly: 350 },
    { name: 'T3', daily: 52, monthly: 380 },
    { name: 'T4', daily: 48, monthly: 410 },
    { name: 'T5', daily: 61, monthly: 440 },
    { name: 'T6', daily: 55, monthly: 480 },
    { name: 'T7', daily: 72, monthly: 520 },
    { name: 'CN', daily: 85, monthly: 580 },
  ],
  performance: [
    { brand: 'iPhone', stock: 150, sold: 85 },
    { brand: 'Samsung', stock: 120, sold: 65 },
    { brand: 'Xiaomi', stock: 200, sold: 110 },
    { brand: 'Oppo', stock: 90, sold: 45 },
    { brand: 'Realme', stock: 110, sold: 30 },
  ],
  recentOrders: [
    { id: 'ORD001', customer: 'Nguyễn Văn A', total: '25.990.000đ', status: 'Đã giao' },
    { id: 'ORD002', customer: 'Trần Thị B', total: '34.990.000đ', status: 'Đang xử lý' },
    { id: 'ORD003', customer: 'Lê Văn C', total: '15.490.000đ', status: 'Đang giao' },
    { id: 'ORD004', customer: 'Phạm Thị D', total: '12.990.000đ', status: 'Hoàn thành' },
  ],
  birthdays: [
    { name: 'Trần Văn Hùng', date: 'Hôm nay', age: 25 },
    { name: 'Lê Thị Mai', date: '29/04', age: 22 },
    { name: 'Phạm Minh Tuấn', date: '01/05', age: 30 },
  ]
};

export const MOCK_REVIEWS = [
  { id: 4, user: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', variantId: 11, stars: 5, content: 'Sản phẩm tuyệt vời, đóng gói kỹ.', createdAt: '10:34:52 24/11/2025', updatedAt: '10:34:52 24/11/2025' },
  { id: 3, user: 'Trần Thị B', email: 'tranthib@gmail.com', variantId: 8, stars: 5, content: 'Máy mượt, nhân viên tư vấn nhiệt tình.', createdAt: '10:56:39 24/11/2025', updatedAt: '17:20:14 24/11/2025' },
  { id: 2, user: 'Lê Văn C', email: 'levanc@gmail.com', variantId: 21, stars: 2, content: 'Giao hàng hơi lâu so với dự kiến.', createdAt: '09:41:31 24/11/2025', updatedAt: '13:56:47 26/11/2025' },
  { id: 1, user: 'Phạm Thị D', email: 'phamthid@gmail.com', variantId: 20, stars: 1, content: 'Sản phẩm bị trầy xước nhẹ ở cạnh.', createdAt: '09:40:24 24/11/2025', updatedAt: '09:53:43 26/11/2025' },
];
