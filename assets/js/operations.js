/**
 * ==============================================================================
 * PHỤ TRÁCH: MEMBER 1 (LEAD LOGIC) - ĐIỀU PHỐI NHẬP & XUẤT KHO (operations.js)
 * Trọng tâm đề bài: Thuộc tính min/max HTML5, kiểm tra số lượng xuất <= tồn kho,
 * cảnh báo và chặn nút thao tác nếu xuất quá tồn kho.
 * ==============================================================================
 */

let currentSelectedItemForExport = null;

document.addEventListener('DOMContentLoaded', () => {
  initLayout('operations');
  populateSelectOptions();
  setupCalculationListeners();
  checkQuickRestockParam();

  // Đăng ký nhận thông báo Realtime từ hệ thống
  if (window.DB && typeof window.DB.onUpdate === 'function') {
    window.DB.onUpdate(() => {
      populateSelectOptions();
    });
  }
});

// Chuyển đổi qua lại giữa Tab Nhập và Tab Xuất
function switchTab(tabName) {
  const btnImport = document.getElementById('btn-tab-import');
  const btnExport = document.getElementById('btn-tab-export');
  const paneImport = document.getElementById('pane-import');
  const paneExport = document.getElementById('pane-export');

  if (tabName === 'import') {
    btnImport.classList.add('active');
    btnExport.classList.remove('active');
    paneImport.classList.add('active');
    paneExport.classList.remove('active');
  } else {
    btnExport.classList.add('active');
    btnImport.classList.remove('active');
    paneExport.classList.add('active');
    paneImport.classList.remove('active');
  }
}

// Nạp danh sách vào thẻ <select>
function populateSelectOptions() {
  const items = DB.getItems();
  const suppliers = DB.getSuppliers();

  // Nạp items vào cả 2 tab
  const importSelect = document.getElementById('import-item-select');
  const exportSelect = document.getElementById('export-item-select');
  const supplierSelect = document.getElementById('import-supplier-select');

  const itemOptionsHtml = '<option value="">-- Chọn mặt hàng trong danh mục --</option>' + 
    items.map(item => `<option value="${item.id}">${item.id} - ${item.name} (Tồn: ${item.quantity} ${item.unit})</option>`).join('');

  if (importSelect) importSelect.innerHTML = itemOptionsHtml;
  if (exportSelect) exportSelect.innerHTML = itemOptionsHtml;

  if (supplierSelect) {
    supplierSelect.innerHTML = '<option value="">-- Chọn nhà cung cấp liên kết --</option>' + 
      suppliers.map(sup => `<option value="${sup.name}">${sup.name} (${sup.phone})</option>`).join('');
  }
}

// Tự động tính tổng tiền phiếu nhập
function setupCalculationListeners() {
  const qtyInput = document.getElementById('import-quantity');
  const priceInput = document.getElementById('import-price');
  const totalDisplay = document.getElementById('import-total-calc');

  function calculate() {
    const q = parseInt(qtyInput.value, 10) || 0;
    const p = parseInt(priceInput.value, 10) || 0;
    totalDisplay.textContent = DB.formatCurrency(q * p);
  }

  if (qtyInput) qtyInput.addEventListener('input', calculate);
  if (priceInput) priceInput.addEventListener('input', calculate);
}

// Khi người dùng chọn vật tư ở Tab Nhập
function onImportItemChange() {
  const select = document.getElementById('import-item-select');
  const preview = document.getElementById('import-item-preview');
  const priceInput = document.getElementById('import-price');

  const item = DB.getItemById(select.value);
  if (item) {
    preview.style.display = 'block';
    preview.innerHTML = `
      <strong>📦 ${item.name} (${item.id})</strong><br>
      Kho: <strong>${item.warehouse}</strong> | Vị trí: <strong>${item.location || 'N/A'}</strong> | Tồn hiện tại: <strong style="color:var(--primary); font-size:15px;">${item.quantity} ${item.unit}</strong>
    `;
    priceInput.value = item.priceImport || 0;
    document.getElementById('import-quantity').focus();
    document.getElementById('import-total-calc').textContent = DB.formatCurrency((parseInt(document.getElementById('import-quantity').value, 10) || 0) * (item.priceImport || 0));
  } else {
    preview.style.display = 'none';
  }
}

// ============================================================================
// LOGIC CỐT LÕI KIỂM SOÁT XUẤT KHO: MIN / MAX HTML5 & CHẶN XUẤT ÂM
// ============================================================================

function onExportItemChange() {
  const select = document.getElementById('export-item-select');
  const notice = document.getElementById('export-stock-notice');
  const exportQtyInput = document.getElementById('export-quantity');
  const maxHint = document.getElementById('max-hint');
  const btnSubmit = document.getElementById('btn-submit-export');

  const item = DB.getItemById(select.value);
  currentSelectedItemForExport = item;

  if (item) {
    notice.style.display = 'block';
    
    // GÁN THUỘC TÍNH MAX DYNAMIC THEO CHUẨN HTML5 ĐỀ BÀI YÊU CẦU
    exportQtyInput.max = item.quantity;
    exportQtyInput.min = 1;
    maxHint.textContent = `(Tối đa: ${item.quantity} ${item.unit})`;

    if (item.quantity === 0) {
      notice.style.background = '#fee2e2';
      notice.style.border = '1px solid #f87171';
      notice.style.color = '#991b1b';
      notice.innerHTML = `🚨 <strong>Mặt hàng này đã HẾT HÀNG (Tồn: 0 ${item.unit})!</strong> Không thể tạo phiếu xuất.`;
      
      exportQtyInput.value = '';
      exportQtyInput.disabled = true;
      btnSubmit.disabled = true;
    } else {
      notice.style.background = '#ecfdf5';
      notice.style.border = '1px solid #6ee7b7';
      notice.style.color = '#065f46';
      notice.innerHTML = `
        ✅ <strong>Vật tư khả dụng:</strong> Tồn kho hiện có <strong>${item.quantity} ${item.unit}</strong> tại <strong>${item.warehouse}</strong> (${item.location || 'N/A'}).
      `;
      exportQtyInput.disabled = false;
      exportQtyInput.value = '';
      exportQtyInput.focus();
      validateExportQuantity();
    }
  } else {
    notice.style.display = 'none';
    exportQtyInput.removeAttribute('max');
    maxHint.textContent = '';
    btnSubmit.disabled = false;
  }
}

// HÀM KIỂM TRA LOGIC & HIỆN CẢNH BÁO, CHẶN THAO TÁC NẾU VƯỢT QUÁ TỒN KHO
function validateExportQuantity() {
  const exportQtyInput = document.getElementById('export-quantity');
  const errorMsg = document.getElementById('export-error-msg');
  const btnSubmit = document.getElementById('btn-submit-export');

  if (!currentSelectedItemForExport) {
    btnSubmit.disabled = false;
    return;
  }

  const requestedQty = parseInt(exportQtyInput.value, 10);
  const currentStock = currentSelectedItemForExport.quantity;

  // Trường hợp 1: Người dùng nhập số lượng vượt quá tồn kho
  if (requestedQty > currentStock) {
    exportQtyInput.classList.add('is-invalid');
    errorMsg.classList.add('show-feedback');
    errorMsg.innerHTML = `⚠️ <strong>Cảnh báo vi phạm an toàn kho:</strong> Số lượng xuất (<strong>${requestedQty}</strong>) vượt quá số lượng tồn kho khả dụng (<strong>${currentStock} ${currentSelectedItemForExport.unit}</strong>). Vui lòng giảm số lượng!`;
    
    // CHẶN THAO TÁC: VÔ HIỆU HÓA NÚT SUBMIT
    btnSubmit.disabled = true;
    btnSubmit.title = "Bị khóa do số lượng xuất vượt quá tồn kho!";
  } 
  // Trường hợp 2: Số lượng nhỏ hơn 1 hoặc không hợp lệ
  else if (isNaN(requestedQty) || requestedQty <= 0) {
    if (exportQtyInput.value !== '') {
      exportQtyInput.classList.add('is-invalid');
      errorMsg.classList.add('show-feedback');
      errorMsg.innerHTML = `⚠️ Số lượng xuất phải lớn hơn hoặc bằng 1!`;
    } else {
      exportQtyInput.classList.remove('is-invalid');
      errorMsg.classList.remove('show-feedback');
    }
    btnSubmit.disabled = true;
  } 
  // Trường hợp 3: Hợp lệ
  else {
    exportQtyInput.classList.remove('is-invalid');
    errorMsg.classList.remove('show-feedback');
    btnSubmit.disabled = false;
    btnSubmit.removeAttribute('title');
  }
}

// Xử lý gửi Form Nhập Kho
function handleImportSubmit(e) {
  e.preventDefault();
  const itemId = document.getElementById('import-item-select').value;
  const supplierName = document.getElementById('import-supplier-select').value;
  const qty = parseInt(document.getElementById('import-quantity').value, 10);
  const price = parseInt(document.getElementById('import-price').value, 10);
  const reason = document.getElementById('import-reason').value;

  const item = DB.getItemById(itemId);
  const result = DB.importStock(itemId, qty, price, supplierName, reason);
  if (result.success) {
    DB.showToast(result.message, 'success');
    document.getElementById('form-import').reset();
    document.getElementById('import-item-preview').style.display = 'none';
    document.getElementById('import-total-calc').textContent = '0 đ';
    populateSelectOptions();

    // BẬT HÓA ĐƠN / PHIẾU NHẬP KHO CHUẨN KẾ TOÁN ĐỂ IN
    showVoucherModal({
      type: 'IMPORT',
      title: 'PHIẾU NHẬP KHO VẬT TƯ',
      voucherCode: 'PNK-' + Date.now().toString().slice(-6),
      date: new Date(),
      partner: supplierName,
      partnerLabel: 'Nhà cung cấp đối tác:',
      item: item,
      qty: qty,
      price: price,
      total: qty * price,
      reason: reason || 'Nhập bổ sung tồn kho an toàn',
      operator: 'Nguyễn Hoàng Anh'
    });
  } else {
    DB.showToast(result.message, 'error');
  }
}

// Xử lý gửi Form Xuất Kho
function handleExportSubmit(e) {
  e.preventDefault();
  const itemId = document.getElementById('export-item-select').value;
  const qty = parseInt(document.getElementById('export-quantity').value, 10);
  const reason = document.getElementById('export-reason').value;
  const partner = document.getElementById('export-partner').value;

  // Kiểm tra lần cuối trước khi ghi DB (Phòng ngừa can thiệp devtools)
  const item = DB.getItemById(itemId);
  if (!item || qty > item.quantity) {
    alert("CẢNH BÁO LỖI: Thao tác xuất kho bị chặn vì số lượng vượt quá tồn kho khả dụng!");
    return;
  }

  const result = DB.exportStock(itemId, qty, partner, reason);
  if (result.success) {
    DB.showToast(result.message, 'success');
    resetExportForm();
    populateSelectOptions();

    // BẬT HÓA ĐƠN / PHIẾU XUẤT KHO CHUẨN KẾ TOÁN ĐỂ IN
    showVoucherModal({
      type: 'EXPORT',
      title: 'PHIẾU XUẤT KHO VẬT TƯ',
      voucherCode: 'PXK-' + Date.now().toString().slice(-6),
      date: new Date(),
      partner: partner,
      partnerLabel: 'Đơn vị / Người nhận hàng:',
      item: item,
      qty: qty,
      price: item.priceExport,
      total: qty * item.priceExport,
      reason: reason || 'Xuất phục vụ thi công',
      operator: 'Nguyễn Hoàng Anh'
    });
  } else {
    DB.showToast(result.message, 'error');
  }
}

function resetExportForm() {
  document.getElementById('form-export').reset();
  document.getElementById('export-stock-notice').style.display = 'none';
  document.getElementById('export-quantity').classList.remove('is-invalid');
  document.getElementById('export-error-msg').classList.remove('show-feedback');
  document.getElementById('btn-submit-export').disabled = false;
  currentSelectedItemForExport = null;
}

// Kiểm tra xem có điều hướng nhanh từ Trang Chủ hoặc Trang NCC sang không
function checkQuickRestockParam() {
  const quickItemId = sessionStorage.getItem('QUICK_RESTOCK_ITEM_ID');
  if (quickItemId) {
    sessionStorage.removeItem('QUICK_RESTOCK_ITEM_ID');
    switchTab('import');
    const select = document.getElementById('import-item-select');
    if (select) {
      select.value = quickItemId;
      onImportItemChange();
    }
  }

  const preselectSupplier = sessionStorage.getItem('PRESELECT_SUPPLIER_NAME');
  if (preselectSupplier) {
    sessionStorage.removeItem('PRESELECT_SUPPLIER_NAME');
    switchTab('import');
    const supSelect = document.getElementById('import-supplier-select');
    if (supSelect) {
      supSelect.value = preselectSupplier;
      DB.showToast(`Đã tự động chọn Nhà cung cấp: ${preselectSupplier}`, 'info');
    }
  }
}

// ============================================================================
// HỆ THỐNG MẪU IN PHIẾU KHO CHUẨN (PRINTABLE VOUCHER SYSTEM)
// ============================================================================
function showVoucherModal(v) {
  const modal = document.getElementById('voucher-modal');
  const printArea = document.getElementById('voucher-printable-area');
  if (!modal || !printArea) return;

  const dateStr = v.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = v.date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  printArea.innerHTML = `
    <div class="voucher-gov-header">
      <div style="text-align: left;">
        <strong>Đơn vị: CÔNG TY QUẢN TRỊ SMART KHO</strong><br>
        <span>Bộ phận: Ban Điều Phối & Quản Lý Kho Vật Tư</span><br>
        <span>Địa điểm: <strong>Tổng kho A - TP. Hà Nội</strong></span>
      </div>
      <div style="text-align: right;">
        <strong>Mẫu số: 02-VT</strong><br>
        <span style="font-size:12px;">(Ban hành theo Thông tư BTC)</span><br>
        <span>Mã phiếu: <strong>${v.voucherCode}</strong></span>
      </div>
    </div>

    <div class="voucher-title-section">
      <h2>${v.title}</h2>
      <div style="font-size: 13.5px; font-style: italic;">Ngày ${v.date.getDate()} tháng ${v.date.getMonth() + 1} năm ${v.date.getFullYear()} (Lúc ${timeStr})</div>
    </div>

    <div class="voucher-info-grid">
      <div>- ${v.partnerLabel} <strong>${v.partner}</strong></div>
      <div>- Thủ kho phụ trách: <strong>${v.operator}</strong></div>
      <div>- Lý do lập phiếu: <em>${v.reason}</em></div>
      <div>- Địa điểm lưu kho: <strong>${v.item.warehouse} (${v.item.location || 'Kệ A'})</strong></div>
    </div>

    <table class="voucher-table">
      <thead>
        <tr>
          <th style="width: 40px;">STT</th>
          <th>Tên Nhãn Hiệu Vật Tư</th>
          <th style="width: 100px;">Mã SKU</th>
          <th style="width: 70px;">ĐVT</th>
          <th style="width: 80px;">Số Lượng</th>
          <th style="width: 120px;">Đơn Giá</th>
          <th style="width: 130px;">Thành Tiền (VNĐ)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center;">1</td>
          <td><strong>${v.item.name}</strong><br><small style="color:#64748b;">Mã vạch: ${v.item.barcode}</small></td>
          <td style="text-align: center;"><code>${v.item.id}</code></td>
          <td style="text-align: center;">${v.item.unit}</td>
          <td style="text-align: center; font-weight: 700; font-size: 14px;">${v.qty}</td>
          <td style="text-align: right;">${DB.formatCurrency(v.price)}</td>
          <td style="text-align: right; font-weight: 700;">${DB.formatCurrency(v.total)}</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: 700;">
          <td colspan="4" style="text-align: right;">TỔNG CỘNG TIỀN PHIẾU:</td>
          <td style="text-align: center;">${v.qty}</td>
          <td></td>
          <td style="text-align: right; color: #1e40af; font-size: 14px;">${DB.formatCurrency(v.total)}</td>
        </tr>
      </tbody>
    </table>

    <div style="font-size: 13px; margin: 10px 0; font-style: italic;">
      * Tổng số tiền (viết bằng chữ): <strong>${DB.formatCurrency(v.total)} đồng chẵn.</strong>
    </div>

    <div class="voucher-signatures">
      <div>
        <div class="signature-role">Người Lập Phiếu</div>
        <div class="signature-name">(Ký, họ tên)<br><br><br><strong>${v.operator}</strong></div>
      </div>
      <div>
        <div class="signature-role">${v.type === 'IMPORT' ? 'Người Giao Hàng' : 'Người Nhận Hàng'}</div>
        <div class="signature-name">(Ký, họ tên)<br><br><br><strong>${v.partner}</strong></div>
      </div>
      <div>
        <div class="signature-role">Thủ Kho Trưởng</div>
        <div class="signature-name">(Ký, đóng dấu)<br><br><br><strong>ĐÃ XÁC NHẬN KHO</strong></div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeVoucherModal() {
  const modal = document.getElementById('voucher-modal');
  if (modal) modal.classList.remove('active');
}

function printVoucher() {
  window.print();
}
