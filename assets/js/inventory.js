/**
 * ==============================================================================
 * PHỤ TRÁCH: MEMBER 3 - QUẢN LÝ VẬT TƯ (inventory.js)
 * Nhiệm vụ: Danh mục hàng hóa, Live search, Barcode scan, CRUD, validation min/max
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initLayout('inventory');
  renderInventoryTable();
  setupEventListeners();

  // Đăng ký nhận thông báo Realtime từ hệ thống
  if (window.DB && typeof window.DB.onUpdate === 'function') {
    window.DB.onUpdate(() => {
      renderInventoryTable();
    });
  }
});

function setupEventListeners() {
  // Live search
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', renderInventoryTable);

  const filterWarehouse = document.getElementById('filter-warehouse');
  if (filterWarehouse) filterWarehouse.addEventListener('change', renderInventoryTable);

  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) filterStatus.addEventListener('change', renderInventoryTable);

  // Barcode scanner simulator
  const barcodeInput = document.getElementById('barcode-input');
  if (barcodeInput) {
    barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const code = barcodeInput.value.trim();
        if (!code) return;
        const item = DB.getItems().find(i => i.barcode === code || i.id === code);
        if (item) {
          DB.showToast(`Tìm thấy: ${item.name} (Tồn: ${item.quantity} ${item.unit})`, 'success');
          searchInput.value = item.id;
          renderInventoryTable();
          barcodeInput.value = '';
        } else {
          DB.showToast(`Không tìm thấy mã vạch: ${code}`, 'error');
        }
      }
    });
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  const keyword = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const selectedWarehouse = document.getElementById('filter-warehouse')?.value || '';
  const selectedStatus = document.getElementById('filter-status')?.value || '';

  const items = DB.getItems();

  const filtered = items.filter(item => {
    const status = DB.getItemStatus(item.quantity, item.minThreshold);
    const matchKeyword = !keyword || 
      item.name.toLowerCase().includes(keyword) || 
      item.id.toLowerCase().includes(keyword) || 
      (item.barcode && item.barcode.includes(keyword)) ||
      (item.location && item.location.toLowerCase().includes(keyword));

    const matchWarehouse = !selectedWarehouse || item.warehouse === selectedWarehouse;
    const matchStatus = !selectedStatus || status.code === selectedStatus;

    return matchKeyword && matchWarehouse && matchStatus;
  });

  const recordCountText = document.getElementById('record-count-text');
  if (recordCountText) recordCountText.textContent = `Hiển thị ${filtered.length} / ${items.length} vật tư`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 24px; color: var(--text-muted);">Không tìm thấy vật tư phù hợp với bộ lọc.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const status = DB.getItemStatus(item.quantity, item.minThreshold);
    return `
      <tr>
        <td>
          <strong>${item.id}</strong><br>
          <small style="color: var(--text-muted); font-family: monospace;">${item.barcode || '---'}</small>
        </td>
        <td>
          <strong>${item.name}</strong>
        </td>
        <td><span class="badge badge-info">${item.category}</span></td>
        <td>${item.warehouse}</td>
        <td>${item.unit}</td>
        <td><strong style="color: ${status.colorHex}; font-size: 15px;">${item.quantity}</strong></td>
        <td>${item.minThreshold}</td>
        <td>${DB.formatCurrency(item.priceExport)}</td>
        <td><code>${item.location || 'N/A'}</code></td>
        <td><span class="badge ${status.badgeClass}">${status.label}</span></td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-outline btn-sm" onclick="openEditModal('${item.id}')">✏️ Sửa</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteItem('${item.id}')" ${item.quantity > 0 ? 'title="Chỉ xóa được khi tồn kho bằng 0"' : ''}>🗑️ Xóa</button>
        </td>
      </tr>
    `;
  }).join('');

  // Render danh sách thẻ card tối ưu cho Smartphone
  const mobileList = document.getElementById('inventory-mobile-list');
  if (mobileList) {
    mobileList.innerHTML = filtered.map(item => {
      const status = DB.getItemStatus(item.quantity, item.minThreshold);
      return `
        <div class="mobile-item-card">
          <div class="mobile-card-header">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="mobile-sku-badge">${item.id}</span>
              <span class="badge ${status.badgeClass}">${status.label}</span>
            </div>
            <span class="mobile-location-tag">📍 ${item.location || 'Kệ A'}</span>
          </div>
          <h4 class="mobile-item-title">${item.name}</h4>
          <div class="mobile-item-sub">${item.category} • ${item.warehouse}</div>
          <div class="mobile-item-meta-grid">
            <div>Tồn: <strong style="color: ${status.colorHex};">${item.quantity} ${item.unit}</strong></div>
            <div>Định mức: <strong>${item.minThreshold} ${item.unit}</strong></div>
            <div>Giá bán: <strong>${DB.formatCurrency(item.priceExport)}</strong></div>
            <div>Giá nhập: <strong>${DB.formatCurrency(item.priceImport)}</strong></div>
          </div>
          <div class="mobile-item-actions">
            <button class="btn btn-outline btn-sm" onclick="openEditModal('${item.id}')">✏️ Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteItem('${item.id}')" ${item.quantity > 0 ? 'disabled' : ''}>🗑️ Xóa</button>
            <button class="btn btn-primary btn-sm" onclick="triggerScanItem('${item.barcode || item.id}')">📷 Quét</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Modal Thêm / Sửa
function openAddModal() {
  document.getElementById('modal-title').textContent = 'Thêm Vật Tư Mới';
  document.getElementById('item-form').reset();
  document.getElementById('form-item-id').value = '';
  document.getElementById('form-sku').disabled = false;
  document.getElementById('item-modal').classList.add('active');
}

function openEditModal(id) {
  const item = DB.getItemById(id);
  if (!item) return;

  document.getElementById('modal-title').textContent = 'Cập Nhật Thông Tin Vật Tư: ' + item.id;
  document.getElementById('form-item-id').value = item.id;
  document.getElementById('form-sku').value = item.id;
  document.getElementById('form-sku').disabled = true;
  document.getElementById('form-barcode').value = item.barcode || '';
  document.getElementById('form-name').value = item.name;
  document.getElementById('form-category').value = item.category;
  document.getElementById('form-warehouse').value = item.warehouse;
  document.getElementById('form-unit').value = item.unit;
  document.getElementById('form-quantity').value = item.quantity;
  document.getElementById('form-min').value = item.minThreshold;
  document.getElementById('form-price-import').value = item.priceImport;
  document.getElementById('form-price-export').value = item.priceExport;
  document.getElementById('form-location').value = item.location || '';

  document.getElementById('item-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('item-modal').classList.remove('active');
}

function handleSaveItem(e) {
  e.preventDefault();

  const id = document.getElementById('form-item-id').value.trim();
  const sku = document.getElementById('form-sku').value.trim();
  const barcode = document.getElementById('form-barcode').value.trim();
  const name = document.getElementById('form-name').value.trim();
  const category = document.getElementById('form-category').value;
  const warehouse = document.getElementById('form-warehouse').value;
  const unit = document.getElementById('form-unit').value.trim();
  const quantity = parseInt(document.getElementById('form-quantity').value, 10);
  const minThreshold = parseInt(document.getElementById('form-min').value, 10);
  const priceImport = parseInt(document.getElementById('form-price-import').value, 10);
  const priceExport = parseInt(document.getElementById('form-price-export').value, 10);
  const location = document.getElementById('form-location').value.trim();

  // Ràng buộc số học HTML5 & JS
  if (quantity < 0 || minThreshold < 0 || priceImport < 0 || priceExport < 0) {
    DB.showToast('Số lượng và đơn giá không được mang giá trị âm!', 'error');
    return;
  }

  const itemData = {
    id: id || (sku || undefined),
    barcode,
    name,
    category,
    warehouse,
    unit,
    quantity,
    minThreshold,
    priceImport,
    priceExport,
    location
  };

  const isNew = !id;
  const saved = DB.saveItem(itemData);

  // Nếu thêm mới vật tư và có số lượng tồn kho > 0, tự động ghi nhận phiếu Nhập kho ban đầu
  if (isNew && quantity > 0) {
    DB.addLog({
      type: 'IMPORT',
      itemId: saved.id,
      itemName: saved.name,
      changeQty: quantity,
      balanceAfter: quantity,
      price: priceImport,
      partnerName: 'Tồn đầu kỳ / Nhập ban đầu',
      reason: 'Khởi tạo danh mục vật tư mới',
      operator: 'Nguyễn Hoàng Anh'
    });
  }

  DB.showToast(id ? 'Cập nhật vật tư thành công!' : 'Thêm vật tư mới thành công!', 'success');
  closeModal();
  renderInventoryTable();
}

function confirmDeleteItem(id) {
  const item = DB.getItemById(id);
  if (!item) return;

  if (item.quantity > 0) {
    alert(`CẢNH BÁO: Mặt hàng "${item.name}" hiện vẫn còn tồn ${item.quantity} ${item.unit} trong kho.\n\nTheo quy định an toàn kho, bạn KHÔNG ĐƯỢC PHÉP xóa mặt hàng còn tồn kho! Vui lòng xuất kho hết về 0 trước khi xóa.`);
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa vật tư "${item.name}" (${item.id}) không? Thao tác này không thể hoàn tác.`)) {
    const res = DB.deleteItem(id);
    if (res.success) {
      DB.showToast(res.message, 'success');
      renderInventoryTable();
    } else {
      DB.showToast(res.message, 'error');
    }
  }
}
