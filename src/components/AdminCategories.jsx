import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, Image as ImageIcon, ChevronDown, ChevronUp, Plus, X, Edit, Loader2, UploadCloud, Trash2, AlertCircle, AlertTriangle, HelpCircle, FolderPlus } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService'; // Cho uploadLocalImage
import { generateBrandOrCategoryCode, generateSlug } from '../utils/codeGenerator';

// Component đệ quy hiển thị 1 dòng danh mục và (tùy chọn) bảng danh mục con bên dưới
const CategoryRow = ({ category, level = 1, onEdit, onAddSubCategory, onDelete, allCategories = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleToggle = async () => {
    if (!expanded && !details) {
      setLoadingDetails(true);
      try {
        const res = await categoryService.getDetails(category.id, true);
        setDetails(res.subCategories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    }
    setExpanded(!expanded);
  };

  const getLevelBadgeColor = (lvl) => {
    if (lvl === 1) return 'bg-[#E0E5F2] text-[#2B3674]';
    if (lvl === 2) return 'bg-[#EBF4FF] text-[#4318FF]';
    return 'bg-[#D3F5E4] text-[#01B574]';
  };

  // Check if any ancestor is inactive
  const checkInheritedInactive = (cat) => {
    let parentId = cat.parentId;
    while (parentId) {
      const parent = allCategories.find(c => c.id === parentId);
      if (!parent) break;
      if (parent.isActive === false) return true;
      parentId = parent.parentId;
    }
    return false;
  };

  const inheritedInactive = checkInheritedInactive(category);
  const currentLevel = category.level || level;

  return (
    <>
      <tr className={`hover:bg-[#F4F7FE] transition-colors group border-b border-[#E0E5F2] ${inheritedInactive ? 'opacity-60 grayscale bg-gray-50/50' : ''}`}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {currentLevel > 1 && (
              <span className="text-[#A3AED0] font-mono select-none flex-shrink-0 mr-1 text-sm tracking-widest">
                {currentLevel === 2 ? '├──' : '└──'}
              </span>
            )}
            <div className="w-10 h-10 rounded-md bg-[#FFFFFF] border border-[#E0E5F2] flex items-center justify-center overflow-hidden flex-shrink-0">
              {category.iconUrl ? (
                <img src={category.iconUrl} alt={category.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-[#A3AED0]" size={20} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#2B3674]">{category.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getLevelBadgeColor(currentLevel)}`}>
                  Cấp {currentLevel}
                </span>
                {inheritedInactive && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FEECEB] text-[#EE5D50]">
                    Kế thừa ẩn
                  </span>
                )}
              </div>
              {category.categoryCode && (
                <span className="block text-xs text-[#A3AED0] mt-0.5">Mã: {category.categoryCode}</span>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="text-sm font-semibold text-[#2B3674]">
            {category.subCategoriesCount || 0} <span className="text-[#A3AED0] font-normal">danh mục con</span>
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="text-sm font-semibold text-[#2B3674]">
            {(category.productsCount || 0).toLocaleString('vi-VN')} <span className="text-[#A3AED0] font-normal">Sản phẩm</span>
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <label className={`relative inline-flex items-center ${inheritedInactive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={inheritedInactive ? false : (category.isActive !== false)} 
                disabled={inheritedInactive}
                readOnly 
              />
              <div className="w-11 h-6 bg-[#E0E5F2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#01B574]"></div>
            </label>
            {inheritedInactive && (
              <span className="text-[9px] text-[#EE5D50] font-bold block max-w-[120px] text-center leading-tight">
                Danh mục cha đang tắt
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {currentLevel < 3 && (
              <button
                onClick={() => onAddSubCategory(category.id, currentLevel + 1, category.name)}
                className="p-2 text-[#01B574] hover:bg-[#D3F5E4] rounded-md transition-colors"
                title={`Thêm danh mục con cho ${category.name}`}
              >
                <FolderPlus size={18} />
              </button>
            )}
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-[#4318FF] hover:bg-[#EBF4FF] rounded-md transition-colors"
              title="Chỉnh sửa"
            >
              <Edit size={18} />
            </button>
            {category.subCategoriesCount === 0 && category.productsCount === 0 && (
              <button
                onClick={() => onDelete(category.id)}
                className="p-2 text-[#EE5D50] hover:bg-[#FEECEB] rounded-md transition-colors"
                title="Xóa danh mục"
              >
                <Trash2 size={18} />
              </button>
            )}
            {category.subCategoriesCount > 0 && (
              <button
                onClick={handleToggle}
                className={`p-2 rounded-md transition-all ${expanded ? 'bg-[#4318FF] text-white' : 'text-[#A3AED0] hover:text-[#4318FF] hover:bg-[#F4F7FE]'}`}
                title={expanded ? 'Thu gọn' : 'Xem danh mục con'}
              >
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            )}
          </div>
        </td>
      </tr>
      
      {/* Expanded Row */}
      {expanded && (
        <tr className="bg-[#F8FAFC]/40">
          <td colSpan="5" className="p-0 border-b border-[#E0E5F2]">
            <div className="pl-12 pr-6 py-1 border-l-2 border-dashed border-[#4318FF]/20 ml-12">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 size={24} className="animate-spin text-[#4318FF]" />
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {details && details.length > 0 ? (
                      details.map(sub => (
                        <CategoryRow 
                          key={sub.id} 
                          category={sub} 
                          level={currentLevel + 1}
                          onEdit={onEdit}
                          onAddSubCategory={onAddSubCategory}
                          onDelete={onDelete}
                          allCategories={allCategories}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-[#A3AED0] text-sm">
                          Chưa có danh mục con nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function AdminCategories() {
  const [rootCategories, setRootCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    categoryCode: '',
    description: '',
    iconUrl: '',
    parentId: '',
    isActive: true
  });
  const [catErrorMessage, setCatErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [hideParentSelect, setHideParentSelect] = useState(false);
  const [lockParentRoot, setLockParentRoot] = useState(false);
  const [isCodeEditable, setIsCodeEditable] = useState(true);
  const [parentName, setParentName] = useState('');

  // Custom Toast & Modal Form Error states
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'warning', message: '', description: '' }
  const [formError, setFormError] = useState(null); // { message: '', details: [] }

  const showToast = (type, message, description = '') => {
    setToast({ type, message, description });
  };

  const parseError = (err) => {
    let msg = typeof err === 'object' && err !== null ? (err.message || JSON.stringify(err)) : String(err);
    if (err && err.response && err.response.data) {
      msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data));
    }
    if (typeof err === 'object' && err.errors) msg = JSON.stringify(err.errors);
    
    let parsed = {
      message: msg,
      details: []
    };

    const msgLower = msg.toLowerCase();
    if (msgLower.includes("vòng lặp gia phả") || msgLower.includes("loop") || msgLower.includes("ancestor")) {
      parsed.message = "Phát hiện vòng lặp gia phả (Nghịch lý phả hệ)";
      parsed.details = [
        "Lý do: Bạn đang chọn một danh mục con hoặc cháu của chính danh mục này làm cha của nó.",
        "Hành động bị chặn: Tránh vòng lặp vô hạn hệ thống và lỗi hiển thị giao diện.",
        "Cách khắc phục: Chọn một danh mục cha khác cao hơn, hoặc đặt làm '-- Là danh mục gốc (Cấp 1) --'."
      ];
    } else if (msgLower.includes("vượt quá giới hạn") || msgLower.includes("over-depth") || msgLower.includes("tối đa 3 cấp")) {
      parsed.message = "Vượt quá giới hạn phân cấp (Tối đa 3 cấp)";
      parsed.details = [
        "Lý do: Cấu trúc hiện tại có quá nhiều cấp con cháu (độ sâu hiện tại của cây này khi cộng thêm cấp của cha mới sẽ lớn hơn 3).",
        "Hành động bị chặn: Tránh phá vỡ cấu trúc hiển thị sơ đồ 3 cấp.",
        "Cách khắc phục: Hãy di chuyển danh mục cha mới lên cấp cao hơn, hoặc di chuyển các danh mục con hiện tại sang nhánh khác trước."
      ];
    } else if (msgLower.includes("mã này đã tồn tại") || msgLower.includes("trùng mã") || msgLower.includes("categorycode")) {
      parsed.message = "Mã danh mục (CategoryCode) đã tồn tại";
      parsed.details = [
        "Lý do: Mỗi danh mục phải có một mã định danh duy nhất.",
        "Hành động bị chặn: Không được phép lưu trùng mã.",
        "Cách khắc phục: Thay đổi mã danh mục khác, hoặc xóa trắng trường mã để hệ thống tự động sinh mã."
      ];
    } else if (msgLower.includes("sản phẩm") || msgLower.includes("product")) {
      parsed.message = "Không thể thực hiện thao tác";
      parsed.details = [
        "Lý do: Danh mục này đang chứa các sản phẩm liên kết trực tiếp.",
        "Hành động bị chặn: Không cho phép xóa hoặc ẩn danh mục chứa sản phẩm để đảm bảo tính toàn vẹn dữ liệu.",
        "Cách khắc phục: Di chuyển toàn bộ sản phẩm thuộc danh mục này sang danh mục khác trước khi thực hiện."
      ];
    } else if (msgLower.includes("danh mục con") || msgLower.includes("subcategory")) {
      parsed.message = "Không thể thực hiện thao tác";
      parsed.details = [
        "Lý do: Danh mục này đang chứa các danh mục con trực thuộc.",
        "Hành động bị chặn: Không thể xóa danh mục cha khi vẫn còn danh mục con.",
        "Cách khắc phục: Hãy xóa các danh mục con trước, hoặc đổi danh mục cha của chúng sang nhóm khác."
      ];
    } else {
      parsed.details = [
        "Chi tiết lỗi từ máy chủ: " + msg,
        "Vui lòng kiểm tra lại kết nối mạng hoặc thông tin nhập liệu."
      ];
    }

    return parsed;
  };

  const isDescendantOrSelf = (cat, targetId) => {
    if (!targetId) return false;
    if (cat.id === targetId) return true;
    let parent = allCategories.find(c => c.id === cat.parentId);
    while (parent) {
      if (parent.id === targetId) return true;
      parent = allCategories.find(c => c.id === parent.parentId);
    }
    return false;
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      categoryService.getRoots(true).catch(() => []),
      categoryService.getAll(true).catch(() => [])
    ])
      .then(([rootsData, allData]) => {
        setRootCategories(Array.isArray(rootsData) ? rootsData : []);
        setAllCategories(Array.isArray(allData) ? allData : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.type === 'success' ? 4000 : 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.isContentEditable)) {
          return;
        }
        e.preventDefault();
        handleOpenModal(null, '', false, true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenModal = (category = null, defaultParentId = '', hideParent = false, lockParentToRoot = false, parentNameVal = '') => {
    setFormError(null);
    setParentName(parentNameVal);
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        categoryCode: category.categoryCode || '',
        description: category.description || '',
        iconUrl: category.iconUrl || '',
        parentId: category.parentId || '',
        isActive: category.isActive !== false
      });
      setIsCodeEditable(false);
      setLockParentRoot(false);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        categoryCode: '',
        description: '',
        iconUrl: '',
        parentId: defaultParentId,
        isActive: true
      });
      setIsCodeEditable(true);
      setLockParentRoot(lockParentToRoot || !!defaultParentId);
    }
    setCatErrorMessage('');
    setHideParentSelect(false);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.')) return;
    try {
      await categoryService.delete(id);
      showToast('success', 'Xóa danh mục thành công!');
      loadData();
    } catch (err) {
      console.error(err);
      const parsed = parseError(err);
      showToast('error', 'Lỗi xóa danh mục: ' + parsed.message, parsed.details.join('\n'));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      return showToast('warning', 'File quá lớn (>2MB)', 'Vui lòng chọn ảnh nhỏ hơn.');
    }
    
    setUploading(true);
    try {
      const res = await productService.uploadLocalImage(file);
      if (res && res.url) {
        let finalUrl = res.url;
        if (finalUrl.startsWith('/')) {
          const apiBase = import.meta.env.VITE_API_URL || 'https://localhost:7279/api';
          const hostBase = apiBase.replace('/api', '');
          finalUrl = `${hostBase}${finalUrl}`;
        }
        setFormData({ ...formData, iconUrl: finalUrl });
      }
    } catch (err) {
      showToast('error', 'Lỗi tải ảnh', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return showToast('warning', 'Thiếu dữ liệu', 'Vui lòng nhập tên danh mục.');

    setCatErrorMessage('');
    setFormError(null);
    setSaving(true);
    try {
      const generatedCode = formData.categoryCode.trim() || generateBrandOrCategoryCode(formData.name, 20);
      const payload = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name.trim()),
        categoryCode: generatedCode,
        description: formData.description.trim(),
        iconUrl: formData.iconUrl,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        isActive: formData.isActive
      };

      if (editingCategory) {
        // Prevent self-parenting
        if (payload.parentId === editingCategory.id) {
          throw new Error("Không thể chọn chính nó làm danh mục cha.");
        }
        await categoryService.update(editingCategory.id, payload);
        showToast('success', 'Cập nhật danh mục thành công!');
      } else {
        await categoryService.create(payload);
        showToast('success', 'Tạo danh mục mới thành công!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const parsed = parseError(err);
      setFormError(parsed);
      
      const msgLower = parsed.message.toLowerCase();
      if (msgLower.includes('mã này đã tồn tại')) {
        setCatErrorMessage('Mã này đã tồn tại trong hệ thống.');
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredRoots = rootCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.categoryCode && cat.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B3674]">Quản lý Danh Mục</h2>
          <p className="text-sm text-[#A3AED0] font-medium mt-1">Quản lý cấu trúc danh mục kinh doanh 3 cấp</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm danh mục gốc..."
              className="w-full pl-11 pr-4 py-3 border border-[#E0E5F2] rounded-md focus:outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF] transition-all bg-[#FFFFFF] font-medium text-[#2B3674] placeholder-[#A3AED0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal(null, '', false, true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4318FF] text-[#FFFFFF] rounded-md font-bold hover:bg-[#3911D1] transition-all active:scale-95 whitespace-nowrap"
              title="Thêm danh mục gốc mới. Phím tắt: Shift + N"
            >
              <Plus size={18} />
              <span>Thêm danh mục gốc</span>
            </button>
            <div className="relative group">
              <div className="p-2 bg-[#F4F7FE] hover:bg-[#E0E5F2] text-[#A3AED0] hover:text-[#4318FF] rounded-md cursor-help transition-all">
                <HelpCircle size={18} />
              </div>
              <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-[#0B1437] text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-white/10">
                <div className="font-bold text-sm mb-1 text-white">Thêm danh mục gốc</div>
                <div className="text-[#A3AED0] leading-relaxed">
                  Tạo một danh mục cha cấp cao nhất (Cấp 1) dùng để phân chia các ngành hàng chính.
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] bg-white/10 px-2.5 py-1 rounded-md font-bold text-white w-full border border-white/5">
                  <span>Phím tắt mở nhanh:</span>
                  <span className="bg-[#4318FF] px-1.5 py-0.5 rounded text-white font-mono">Shift + N</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#FFFFFF] rounded-md overflow-hidden mb-8 border border-[#E0E5F2]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={40} className="animate-spin text-[#4318FF]" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8FAFC]">
                <tr className="border-b border-[#E0E5F2]">
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] uppercase">Tên danh mục gốc</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] uppercase text-center">Số danh mục con</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] uppercase text-center">Tổng sản phẩm</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] uppercase text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#A3AED0] uppercase text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm bg-white">
                {filteredRoots.length > 0 ? (
                  filteredRoots.map((cat) => (
                    <CategoryRow 
                      key={cat.id} 
                      category={cat} 
                      level={1} 
                      onEdit={(c) => handleOpenModal(c)}
                      onAddSubCategory={(parentId, nextLevel, parentNameVal) => handleOpenModal(null, parentId, false, true, parentNameVal)}
                      onDelete={handleDeleteCategory}
                      allCategories={allCategories}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-[#A3AED0]">
                        <FolderOpen size={64} strokeWidth={1} className="mb-4 opacity-50 text-[#4318FF]" />
                        <p className="text-lg font-bold text-[#2B3674]">Không tìm thấy danh mục gốc nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Cập nhật/Thêm mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B1437]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-md w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E0E5F2] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="text-xl font-bold text-[#2B3674] flex items-center gap-2">
                {editingCategory ? <Edit size={20} className="text-[#4318FF]" /> : <Plus size={20} className="text-[#4318FF]" />}
                {editingCategory 
                  ? 'Cập nhật danh mục' 
                  : parentName 
                    ? `Thêm danh mục con cho ${parentName}` 
                    : 'Thêm danh mục gốc'
                }
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#A3AED0] hover:text-[#EE5D50] hover:bg-red-50 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              {formError && (
                <div className="mb-6 p-4 bg-[#FEECEB] border border-[#EE5D50]/30 rounded-md flex gap-3 items-start animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-[#EE5D50]/15 text-[#EE5D50] flex items-center justify-center font-bold flex-shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-[#EE5D50] text-sm">{formError.message}</h5>
                    {formError.details && formError.details.length > 0 && (
                      <ul className="list-none text-xs text-[#2B3674] mt-2 space-y-1.5 bg-white/60 p-3 rounded-md border border-[#EE5D50]/10">
                        {formError.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-[#EE5D50] mt-0.5">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Upload Area */}
                <div className="md:col-span-2 flex flex-col items-center sm:flex-row gap-6 p-4 bg-[#F4F7FE] rounded-md border border-[#E0E5F2] border-dashed">
                  <div className="w-24 h-24 bg-white rounded-md border border-[#E0E5F2] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {uploading ? (
                      <Loader2 className="animate-spin text-[#4318FF]" size={24} />
                    ) : formData.iconUrl ? (
                      <img src={formData.iconUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-[#A3AED0]" size={32} />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-[#2B3674] mb-1">Ảnh đại diện (Tùy chọn)</h4>
                    <p className="text-xs text-[#A3AED0] mb-3">Chỉ hỗ trợ định dạng ảnh (JPG, PNG, WEBP, SVG). Tối đa 2MB.</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E5F2] text-[#2B3674] text-sm font-bold rounded-md cursor-pointer hover:bg-[#F8FAFC] transition-colors">
                      <UploadCloud size={16} />
                      Tải ảnh lên
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.webp,.svg" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Tên danh mục *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Điện thoại, Tai nghe..."
                      className="w-full px-4 py-3 border border-[#E0E5F2] rounded-md focus:border-[#4318FF] outline-none text-[#2B3674] font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-[#2B3674]">Mã (CategoryCode)</label>
                      {editingCategory && !isCodeEditable && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Việc đổi mã danh mục sẽ không cập nhật lại các mã SKU đã tạo trước đó. Bạn vẫn muốn sửa?")) {
                              setIsCodeEditable(true);
                            }
                          }}
                          className="text-xs text-[#4318FF] hover:underline font-bold"
                        >
                          Thay đổi mã
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Tự động tạo nếu để trống"
                      className="w-full px-4 py-3 border border-[#E0E5F2] rounded-md focus:border-[#4318FF] outline-none text-[#2B3674] font-medium uppercase disabled:bg-[#F4F7FE] disabled:text-[#A3AED0]"
                      value={formData.categoryCode}
                      onChange={(e) => setFormData({...formData, categoryCode: e.target.value.toUpperCase().replace(/\s+/g, '')})}
                      disabled={!isCodeEditable}
                    />
                    {catErrorMessage && <p className="text-[#EE5D50] text-xs font-bold mt-1">{catErrorMessage}</p>}
                  </div>
                </div>

                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Phân cấp (Danh mục cha)</label>
                    <select
                      className="w-full px-4 py-3 border border-[#E0E5F2] rounded-md focus:border-[#4318FF] outline-none text-[#2B3674] font-medium bg-white disabled:bg-[#F4F7FE] disabled:text-[#A3AED0] disabled:cursor-not-allowed"
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                      disabled={lockParentRoot}
                    >
                      <option value="">-- Là danh mục gốc (Cấp 1) --</option>
                      {allCategories
                        .filter(c => {
                          if (editingCategory) {
                            return !isDescendantOrSelf(c, editingCategory.id);
                          }
                          return true;
                        })
                        .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.level === 1 ? `[Cấp 1] ${c.name}` : `[Cấp ${c.level || 2}] ${c.name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Trạng thái hiển thị</label>
                    {(() => {
                      const checkInheritedInactiveForId = (parentId) => {
                        let currentId = parentId;
                        while (currentId) {
                          const parent = allCategories.find(c => c.id === parseInt(currentId));
                          if (!parent) break;
                          if (parent.isActive === false) return true;
                          currentId = parent.parentId;
                        }
                        return false;
                      };
                      const inheritedInactiveModal = checkInheritedInactiveForId(formData.parentId);

                      return (
                        <>
                          <label className={`flex items-center gap-3 p-3 border border-[#E0E5F2] rounded-md bg-[#F8FAFC] ${inheritedInactiveModal ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className="relative inline-flex items-center">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={inheritedInactiveModal ? false : formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                disabled={inheritedInactiveModal}
                              />
                              <div className="w-11 h-6 bg-[#E0E5F2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#01B574]"></div>
                            </div>
                            <span className="text-sm font-bold text-[#2B3674]">
                              {inheritedInactiveModal ? 'Đã ẩn (Kế thừa từ cha)' : (formData.isActive ? 'Đang hoạt động' : 'Đã ẩn')}
                            </span>
                          </label>
                          {inheritedInactiveModal && (
                            <span className="text-xs text-[#EE5D50] font-bold mt-1 block">
                              Danh mục cha đang bị ẩn, không thể kích hoạt danh mục này.
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2B3674] mb-2">Mô tả danh mục</label>
                  <textarea
                    rows="3"
                    placeholder="Mô tả tóm tắt..."
                    className="w-full px-4 py-3 border border-[#E0E5F2] rounded-md focus:border-[#4318FF] outline-none text-[#2B3674] font-medium resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-[#E0E5F2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-[#F4F7FE] text-[#2B3674] rounded-md font-bold hover:bg-[#E0E5F2] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2.5 bg-[#4318FF] text-[#FFFFFF] rounded-md font-bold hover:bg-[#3911D1] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? "Đang lưu..." : (editingCategory ? "Cập nhật" : "Tạo mới")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[200] max-w-sm w-full bg-white rounded-md shadow-xl border p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' ? 'border-l-4 border-l-[#01B574] border-[#E0E5F2]' : 
          toast.type === 'error' ? 'border-l-4 border-l-[#EE5D50] border-[#E0E5F2]' : 
          'border-l-4 border-l-[#FFB800] border-[#E0E5F2]'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-[#D3F5E4] text-[#01B574] flex items-center justify-center font-bold">✓</div>
            ) : toast.type === 'error' ? (
              <div className="w-8 h-8 rounded-full bg-[#FEECEB] text-[#EE5D50] flex items-center justify-center font-bold">✕</div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FFF9E6] text-[#FFB800] flex items-center justify-center font-bold">!</div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#2B3674] text-sm">
              {toast.type === 'success' ? 'Thành công' : toast.type === 'error' ? 'Lỗi hệ thống' : 'Cảnh báo'}
            </h4>
            <p className="text-xs text-[#A3AED0] mt-1 font-semibold leading-relaxed">{toast.message}</p>
            {toast.description && (
              <p className="text-[10px] text-[#EE5D50] mt-1.5 bg-[#FEECEB] p-2 rounded-md font-mono break-all leading-normal whitespace-pre-wrap">{toast.description}</p>
            )}
          </div>
          <button onClick={() => setToast(null)} className="text-[#A3AED0] hover:text-[#2B3674] flex-shrink-0 transition-colors p-1 hover:bg-[#F4F7FE] rounded-md">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
