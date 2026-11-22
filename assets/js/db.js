/**
 * ==============================================================================
 * MODULE DÙNG CHUNG: DATABASE & LOCALSTORAGE ENGINE (db.js)
 * Phụ trách: Member 1 (Lead Logic) & Toàn đội ngũ sử dụng
 * Nguyên tắc: Các thành viên chỉ GỌI HÀM, KHÔNG sửa file này để tránh Git conflict.
 * ==============================================================================
 */

const STORAGE_KEYS = {
  ITEMS: 'INVENTORY_ITEMS',
  SUPPLIERS: 'INVENTORY_SUPPLIERS',
  LOGS: 'INVENTORY_LOGS'
};

// Dữ liệu hạt giống mặc định (Seed Data) phòng ngừa khi chạy file:/// không fetch được seed.json
const DEFAULT_SEED_DATA = {
  items: [
    { id: "VT001", barcode: "8931234567890", name: "Thép cuộn phi 10 Hòa Phát", category: "Vật liệu xây dựng", warehouse: "Kho A - Tổng kho", unit: "Tấn", quantity: 12, minThreshold: 15, priceImport: 14500000, priceExport: 16200000, location: "Kệ A1-02", updatedAt: "2026-11-20T08:30:00.000Z" },
    { id: "VT002", barcode: "8931234567891", name: "Xi măng PCB40 Vicem Hoàng Thạch", category: "Vật liệu xây dựng", warehouse: "Kho A - Tổng kho", unit: "Bao 50kg", quantity: 0, minThreshold: 20, priceImport: 85000, priceExport: 98000, location: "Kệ A2-01", updatedAt: "2026-11-19T14:15:00.000Z" },
    { id: "VT003", barcode: "8931234567892", name: "Dây cáp điện Cadivi 2x2.5", category: "Thiết bị điện", warehouse: "Kho B - Chi nhánh 1", unit: "Cuộn (100m)", quantity: 4, minThreshold: 10, priceImport: 750000, priceExport: 880000, location: "Kệ E3-04", updatedAt: "2026-11-21T09:00:00.000Z" },
    { id: "VT004", barcode: "8931234567893", name: "Ống nhựa PVC Tiền Phong D90", category: "Vật tư cấp thoát nước", warehouse: "Kho A - Tổng kho", unit: "Cây (4m)", quantity: 45, minThreshold: 15, priceImport: 115000, priceExport: 140000, location: "Kệ C1-05", updatedAt: "2026-11-18T10:20:00.000Z" },
    { id: "VT005", barcode: "8931234567894", name: "Gạch Ceramic 60x60 Viglacera", category: "Vật liệu hoàn thiện", warehouse: "Kho B - Chi nhánh 1", unit: "Hộp", quantity: 0, minThreshold: 30, priceImport: 175000, priceExport: 210000, location: "Kệ D2-01", updatedAt: "2026-11-22T08:00:00.000Z" },
    { id: "VT006", barcode: "8931234567895", name: "Sơn ngoại thất Dulux Weathershield", category: "Sơn & Hóa chất", warehouse: "Kho A - Tổng kho", unit: "Thùng 18L", quantity: 8, minThreshold: 10, priceImport: 1850000, priceExport: 2200000, location: "Kệ B3-02", updatedAt: "2026-11-15T16:45:00.000Z" },
    { id: "VT007", barcode: "8931234567896", name: "Aptomat 2P 32A Panasonic", category: "Thiết bị điện", warehouse: "Kho B - Chi nhánh 1", unit: "Cái", quantity: 60, minThreshold: 20, priceImport: 120000, priceExport: 155000, location: "Kệ E1-01", updatedAt: "2026-11-17T11:10:00.000Z" },
    { id: "VT008", barcode: "8931234567897", name: "Van bi đồng ren Miha DN25", category: "Vật tư cấp thoát nước", warehouse: "Kho A - Tổng kho", unit: "Cái", quantity: 18, minThreshold: 25, priceImport: 95000, priceExport: 125000, location: "Kệ C2-03", updatedAt: "2026-11-12T09:30:00.000Z" },
    { id: "VT009", barcode: "8931234567898", name: "Que hàn Kim Tín KT-421 3.2mm", category: "Cơ khí & Kim khí", warehouse: "Kho A - Tổng kho", unit: "Hộp 5kg", quantity: 35, minThreshold: 15, priceImport: 160000, priceExport: 195000, location: "Kệ F1-01", updatedAt: "2026-11-10T14:00:00.000Z" },
    { id: "VT010", barcode: "8931234567899", name: "Đèn LED Tuýp T8 1.2m Rạng Đông", category: "Thiết bị chiếu sáng", warehouse: "Kho B - Chi nhánh 1", unit: "Bóng", quantity: 110, minThreshold: 30, priceImport: 65000, priceExport: 85000, location: "Kệ E4-02", updatedAt: "2026-11-21T15:20:00.000Z" },
    { id: "VT011", barcode: "8931234567800", name: "Cát vàng xây dựng hạt lớn", category: "Vật liệu xây dựng", warehouse: "Kho A - Tổng kho", unit: "m3", quantity: 0, minThreshold: 10, priceImport: 280000, priceExport: 350000, location: "Bãi lộ thiên A", updatedAt: "2026-11-05T08:00:00.000Z" },
    { id: "VT012", barcode: "8931234567801", name: "Bulong mạ kẽm M12x50", category: "Cơ khí & Kim khí", warehouse: "Kho B - Chi nhánh 1", unit: "Bộ", quantity: 250, minThreshold: 50, priceImport: 4500, priceExport: 6500, location: "Kệ F2-04", updatedAt: "2026-11-14T10:15:00.000Z" }
  ],
  suppliers: [
    { id: "NCC001", name: "Công ty Cổ phần Tập đoàn Hòa Phát", phone: "02439876543", email: "kinhdoanh@hoaphat.com.vn", address: "66 Nguyễn Du, Hà Nội", categories: "Vật liệu xây dựng, Cơ khí", rating: 5 },
    { id: "NCC002", name: "Tổng Công ty Xi măng Việt Nam (Vicem)", phone: "02438512425", email: "contact@vicem.vn", address: "228 Lê Duẩn, Hà Nội", categories: "Vật liệu xây dựng", rating: 5 },
    { id: "NCC003", name: "Công ty CP Dây Cáp Điện Việt Nam (Cadivi)", phone: "02838299443", email: "cadivi@cadivi.vn", address: "70-72 Nam Kỳ Khởi Nghĩa, Q.1, TP.HCM", categories: "Thiết bị điện", rating: 4 },
    { id: "NCC004", name: "Công ty CP Nhựa Thiếu Niên Tiền Phong", phone: "02253813979", email: "contact@tienphongplastic.vn", address: "Số 2 An Đà, Hải Phòng", categories: "Vật tư cấp thoát nước", rating: 5 }
  ],
  logs: [
    { id: "LOG-20261120-01", timestamp: "2026-11-20T08:30:00.000Z", type: "IMPORT", itemId: "VT001", itemName: "Thép cuộn phi 10 Hòa Phát", changeQty: 5, balanceAfter: 12, price: 14500000, partnerName: "Công ty Cổ phần Tập đoàn Hòa Phát", reason: "Nhập định kỳ", operator: "Nguyễn Hoàng Anh" },
    { id: "LOG-20261121-02", timestamp: "2026-11-21T09:15:00.000Z", type: "EXPORT", itemId: "VT002", itemName: "Xi măng PCB40 Vicem Hoàng Thạch", changeQty: 20, balanceAfter: 0, price: 98000, partnerName: "Đội thi công số 3", reason: "Xuất đổ sàn tầng 2", operator: "Trần Thị Bình" },
    { id: "LOG-20261121-03", timestamp: "2026-11-21T14:40:00.000Z", type: "EXPORT", itemId: "VT003", itemName: "Dây cáp điện Cadivi 2x2.5", changeQty: 6, balanceAfter: 4, price: 880000, partnerName: "Tổ cơ điện M&E", reason: "Kéo dây trục kỹ thuật", operator: "Lê Hoàng Long" },
    { id: "LOG-20261122-04", timestamp: "2026-11-22T08:10:00.000Z", type: "IMPORT", itemId: "VT007", itemName: "Aptomat 2P 32A Panasonic", changeQty: 30, balanceAfter: 60, price: 120000, partnerName: "Công ty Thiết bị điện Minh Tâm", reason: "Bổ sung an toàn thiết bị", operator: "Nguyễn Hoàng Anh" },
    { id: "LOG-20261122-05", timestamp: "2026-11-22T09:30:00.000Z", type: "EXPORT", itemId: "VT005", itemName: "Gạch Ceramic 60x60 Viglacera", changeQty: 30, balanceAfter: 0, price: 210000, partnerName: "Công ty Xây dựng An Thịnh", reason: "Lát nền sảnh chính", operator: "Nguyễn Hoàng Anh" },
    { id: "LOG-20261122-06", timestamp: "2026-11-22T10:15:00.000Z", type: "EXPORT", itemId: "VT006", itemName: "Sơn ngoại thất Dulux Weathershield", changeQty: 2, balanceAfter: 8, price: 2200000, partnerName: "Đội sơn bả số 2", reason: "Sơn dặm mặt ngoài", operator: "Trần Thị Bình" },
    { id: "LOG-20261122-07", timestamp: "2026-11-22T11:00:00.000Z", type: "EXPORT", itemId: "VT009", itemName: "Que hàn Kim Tín KT-421 3.2mm", changeQty: 10, balanceAfter: 35, price: 195000, partnerName: "Xưởng kết cấu thép", reason: "Gia công khung giàn", operator: "Lê Hoàng Long" },
    { id: "LOG-20261122-08", timestamp: "2026-11-22T13:20:00.000Z", type: "EXPORT", itemId: "VT001", itemName: "Thép cuộn phi 10 Hòa Phát", changeQty: 3, balanceAfter: 12, price: 16200000, partnerName: "Đội cốt thép móng", reason: "Đan thép đài móng", operator: "Nguyễn Hoàng Anh" }
  ]
};

// Khởi tạo Database nếu chưa có
function initDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(DEFAULT_SEED_DATA.items));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SEED_DATA.suppliers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_SEED_DATA.logs));
  }
}
initDatabase();

// ĐỐI TƯỢNG DB TOÀN CỤC CUNG CẤP CÁC API CHO TOÀN BỘ 6 TRANG
window.DB = {
  // --- HỆ THỐNG PHÁT & NHẬN TÍN HIỆU ĐỒNG BỘ REALTIME ---
  notifyChange(action, payload) {
    try {
      window.dispatchEvent(new CustomEvent('db-updated', { detail: { action, payload, at: Date.now() } }));
      localStorage.setItem('INVENTORY_SYNC_PULSE', Date.now().toString());
    } catch (e) {
      console.warn('Realtime sync notification error', e);
    }
  },

  onUpdate(callback) {
    if (typeof callback !== 'function') return;
    window.addEventListener('db-updated', (e) => callback(e.detail));
    window.addEventListener('storage', (e) => {
      if (e.key === 'INVENTORY_SYNC_PULSE' || (e.key && e.key.startsWith('INVENTORY_'))) {
        callback({ action: 'STORAGE_SYNC', key: e.key, at: Date.now() });
      }
    });
  },

  // --- QUẢN LÝ VẬT TƯ (ITEMS) ---
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS)) || [];
    } catch (e) {
      return [];
    }
  },

  getItemById(id) {
    const items = this.getItems();
    return items.find(item => item.id === id || item.barcode === id) || null;
  },

  saveItem(itemData) {
    const items = this.getItems();
    const existingIndex = items.findIndex(i => i.id === itemData.id);
    itemData.updatedAt = new Date().toISOString();
    
    if (existingIndex >= 0) {
      items[existingIndex] = { ...items[existingIndex], ...itemData };
    } else {
      if (!itemData.id) {
        const nextNum = items.length + 1;
        itemData.id = 'VT' + String(nextNum).padStart(3, '0');
      }
      items.push(itemData);
    }
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    this.notifyChange('ITEM_SAVED', itemData);
    return itemData;
  },

  deleteItem(id) {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return { success: false, message: "Không tìm thấy vật tư!" };
    if (item.quantity > 0) {
      return { success: false, message: `Vật tư "${item.name}" vẫn còn tồn kho (${item.quantity} ${item.unit}). Không được phép xóa!` };
    }
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filtered));
    this.notifyChange('ITEM_DELETED', id);
    return { success: true, message: "Đã xóa vật tư thành công!" };
  },

  // --- TRẠNG THÁI VÀ MÀU SẮC THEO ĐÚNG CHUẨN ĐỀ BÀI ---
  getItemStatus(quantity, minThreshold) {
    const qty = Number(quantity);
    const min = Number(minThreshold);
    if (qty === 0) {
      return {
        code: 'OUT',
        label: 'Hết hàng',
        badgeClass: 'badge-danger', // Màu Đỏ
        colorHex: '#ef4444'
      };
    } else if (qty <= min) {
      return {
        code: 'LOW',
        label: 'Sắp hết',
        badgeClass: 'badge-warning', // Màu Vàng
        colorHex: '#f59e0b'
      };
    } else {
      return {
        code: 'IN_STOCK',
        label: 'Còn hàng',
        badgeClass: 'badge-success', // Màu Xanh lá
        colorHex: '#10b981'
      };
    }
  },

  // --- QUẢN LÝ NHÀ CUNG CẤP ---
  getSuppliers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveSupplier(supplierData) {
    const suppliers = this.getSuppliers();
    const existingIndex = suppliers.findIndex(s => s.id === supplierData.id);
    if (existingIndex >= 0) {
      suppliers[existingIndex] = { ...suppliers[existingIndex], ...supplierData };
    } else {
      if (!supplierData.id) {
        const nextNum = suppliers.length + 1;
        supplierData.id = 'NCC' + String(nextNum).padStart(3, '0');
      }
      suppliers.push(supplierData);
    }
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    this.notifyChange('SUPPLIER_SAVED', supplierData);
    return supplierData;
  },

  deleteSupplier(id) {
    const suppliers = this.getSuppliers().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    this.notifyChange('SUPPLIER_DELETED', id);
    return true;
  },

  // --- QUẢN LÝ LỊCH SỬ GIAO DỊCH & LOGS ---
  getLogs() {
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
      return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
      return [];
    }
  },

  addLog(logData) {
    const logs = this.getLogs();
    const newLog = {
      id: 'LOG-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...logData
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notifyChange('LOG_SAVED', newLog);
    return newLog;
  },

  // --- NGHIỆP VỤ NHẬP & XUẤT KHO ---
  importStock(itemId, quantity, price, partnerName, reason, operator = "Thủ kho") {
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      return { success: false, message: "Số lượng nhập phải lớn hơn 0!" };
    }
    const item = this.getItemById(itemId);
    if (!item) return { success: false, message: "Vật tư không tồn tại!" };

    item.quantity += quantity;
    if (price) item.priceImport = Number(price);
    this.saveItem(item);

    this.addLog({
      type: 'IMPORT',
      itemId: item.id,
      itemName: item.name,
      changeQty: quantity,
      balanceAfter: item.quantity,
      price: price || item.priceImport,
      partnerName: partnerName || "Không xác định",
      reason: reason || "Nhập kho bổ sung",
      operator: operator
    });

    return { success: true, message: `Nhập thành công ${quantity} ${item.unit} vào kho!`, newQuantity: item.quantity };
  },

  exportStock(itemId, quantity, partnerName, reason, operator = "Thủ kho") {
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      return { success: false, message: "Số lượng xuất phải lớn hơn 0!" };
    }
    const item = this.getItemById(itemId);
    if (!item) return { success: false, message: "Vật tư không tồn tại!" };

    // BẮT BUỘC THEO ĐỀ BÀI: CHẶN XUẤT VƯỢT QUÁ TỒN KHO
    if (quantity > item.quantity) {
      return { 
        success: false, 
        message: `Lỗi: Số lượng xuất (${quantity} ${item.unit}) vượt quá tồn kho hiện tại (${item.quantity} ${item.unit})!` 
      };
    }

    item.quantity -= quantity;
    this.saveItem(item);

    this.addLog({
      type: 'EXPORT',
      itemId: item.id,
      itemName: item.name,
      changeQty: quantity,
      balanceAfter: item.quantity,
      price: item.priceExport,
      partnerName: partnerName || "Đội thi công / Khách",
      reason: reason || "Xuất kho sử dụng",
      operator: operator
    });

    return { success: true, message: `Xuất thành công ${quantity} ${item.unit} ra khỏi kho!`, newQuantity: item.quantity };
  },

  // --- HELPER ĐỊNH DẠNG ---
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  },

  formatDateTime(isoString) {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  },

  // --- SAO LƯU & KHÔI PHỤC JSON ---
  exportBackup() {
    const data = {
      items: this.getItems(),
      suppliers: this.getSuppliers(),
      logs: this.getLogs(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Kho_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.items && Array.isArray(parsed.items)) {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(parsed.items));
      }
      if (parsed.suppliers && Array.isArray(parsed.suppliers)) {
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(parsed.suppliers));
      }
      if (parsed.logs && Array.isArray(parsed.logs)) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(parsed.logs));
      }
      this.notifyChange('BACKUP_RESTORED', null);
      return { success: true, message: "Khôi phục dữ liệu thành công!" };
    } catch (e) {
      return { success: false, message: "Dữ liệu JSON không hợp lệ: " + e.message };
    }
  },

  resetDefault() {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(DEFAULT_SEED_DATA.items));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SEED_DATA.suppliers));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_SEED_DATA.logs));
    this.notifyChange('RESET_DEFAULT', null);
    return true;
  },

  // --- HIỂN THỊ TOAST THÔNG BÁO ---
  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✔' : (type === 'error' ? '✖' : 'ℹ');
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
};
