// Sidebar.jsx
export default function Sidebar() {
  const categories = [
    { name: '🔥 Chương trình khuyến mãi', isHot: true },
    { name: '🎧 Phụ kiện điện thoại', isHot: false },
    { name: '♻️ Máy cũ - giá cao', isHot: false },
    { name: 'ℹ️ Thông tin - dịch vụ tiện ích', isHot: false },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebarbg rounded shadow-sm border border-bordercustom h-fit overflow-hidden">
      <div className="p-3 border-b border-bordercustom font-bold text-lg text-text bg-gray-50 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
        <span>Danh Mục</span>
      </div>
      <nav className="flex flex-col py-1">
        {categories.map((cat, idx) => (
          <a
            key={idx}
            href="#"
            className="group flex flex-col justify-center px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition"
          >
            <div className={`font-medium flex items-center text-text group-hover:text-primary transition`}>
              {cat.name}
            </div>
          </a>
        ))}
      </nav>
    </aside>
  );
}
