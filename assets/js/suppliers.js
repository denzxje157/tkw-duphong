/**
 * ==============================================================================
 * PHỤ TRÁCH: MEMBER 5 - QUẢN LÝ NHÀ CUNG CẤP & ĐỐI TÁC (suppliers.js)
 * Nhiệm vụ: Danh bạ đối tác, CRUD nhà cung cấp, validate Email & SĐT HTML5
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initLayout('suppliers');
  renderSuppliersTable();

  // Đăng ký nhận thông báo Realtime từ hệ thống
  if (window.DB && typeof window.DB.onUpdate === 'function') {
    window.DB.onUpdate(() => {
      renderSuppliersTable();
    });
  }
});

function renderSuppliersTable() {
  const tbody = document.getElementById('suppliers-table-body');
  const mobileList = document.getElementById('suppliers-mobile-list');
  const suppliers = DB.getSuppliers();
  const logs = DB.getLogs();

  if (suppliers.length === 0) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">Chưa có đối tác nhà cung cấp nào trong danh bạ.</td></tr>`;
    }
    if (mobileList) {
      mobileList.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted);">Chưa có đối tác nhà cung cấp nào trong danh bạ.</div>`;
    }
    return;
  }

  // 1. Render Bảng Desktop
  if (tbody) {
    tbody.innerHTML = suppliers.map(s => {
      const stars = '⭐'.repeat(s.rating || 5);
      const totalBought = logs
        .filter(l => l.type === 'IMPORT' && l.partnerName === s.name)
        .reduce((sum, l) => sum + ((l.changeQty || 0) * (l.price || 0)), 0);

      return `
        <tr>
          <td><strong>${s.id}</strong></td>
          <td>
            <strong>${s.name}</strong><br>
            <small style="color:var(--text-muted);">${s.address || 'Hà Nội'}</small>
          </td>
          <td>
            <a href="tel:${s.phone}" style="color: var(--primary); text-decoration: none; font-weight: 500;">
              📞 ${s.phone}
            </a>
          </td>
          <td>
            <a href="mailto:${s.email}" style="color: var(--text-muted); text-decoration: none;">
              ✉️ ${s.email}
            </a>
          </td>
          <td><span class="badge badge-info">${s.categories || 'Vật tư tổng hợp'}</span></td>
          <td><strong style="color:var(--primary); font-size:13.5px;">${DB.formatCurrency(totalBought)}</strong></td>
          <td><span title="${s.rating || 5} sao">${stars}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-success btn-sm" onclick="restockFromSupplier('${s.name}')" title="Tạo phiếu nhập từ đối tác này">
              📥 Đặt Hàng
            </button>
            <button class="btn btn-outline btn-sm" onclick="openEditSupplierModal('${s.id}')">✏️ Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteSupplier('${s.id}')">🗑️ Xóa</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Render Danh sách Thẻ cho Smartphone (Mobile App Card)
  if (mobileList) {
    mobileList.innerHTML = suppliers.map(s => {
      const stars = '⭐'.repeat(s.rating || 5);
      const totalBought = logs
        .filter(l => l.type === 'IMPORT' && l.partnerName === s.name)
        .reduce((sum, l) => sum + ((l.changeQty || 0) * (l.price || 0)), 0);

      return `
        <div class="mobile-item-card">
          <div class="mobile-card-header">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="mobile-sku-badge">${s.id}</span>
              <span style="font-size:12px;">${stars}</span>
            </div>
            <span class="badge badge-info">${s.categories || 'Vật tư tổng hợp'}</span>
          </div>
          <h4 class="mobile-item-title">${s.name}</h4>
          <div class="mobile-item-sub">📍 ${s.address || 'Trụ sở đối tác'}</div>
          
          <div class="mobile-contact-pill-row">
            <a href="tel:${s.phone}" class="mobile-contact-pill">
              📞 <strong>${s.phone}</strong>
            </a>
            <a href="mailto:${s.email}" class="mobile-contact-pill">
              ✉️ ${s.email}
            </a>
          </div>

          <div class="mobile-item-meta-grid">
            <div>Tổng nhập lũy kế:</div>
            <div style="text-align:right;"><strong style="color:var(--primary);">${DB.formatCurrency(totalBought)}</strong></div>
          </div>

          <div class="mobile-item-actions">
            <button class="btn btn-success btn-sm" onclick="restockFromSupplier('${s.name}')">📥 Đặt hàng</button>
            <button class="btn btn-outline btn-sm" onclick="openEditSupplierModal('${s.id}')">✏️ Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteSupplier('${s.id}')">🗑️ Xóa</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// 1-Click Nhập hàng từ nhà cung cấp
function restockFromSupplier(supplierName) {
  sessionStorage.setItem('PRESELECT_SUPPLIER_NAME', supplierName);
  window.location.href = 'operations.html';
}

function openAddSupplierModal() {
  document.getElementById('sup-modal-title').textContent = 'Thêm Nhà Cung Cấp Mới';
  document.getElementById('supplier-form').reset();
  document.getElementById('form-sup-id').value = '';
  document.getElementById('supplier-modal').classList.add('active');
}

function openEditSupplierModal(id) {
  const supplier = DB.getSuppliers().find(s => s.id === id);
  if (!supplier) return;

  document.getElementById('sup-modal-title').textContent = 'Cập Nhật Nhà Cung Cấp: ' + supplier.name;
  document.getElementById('form-sup-id').value = supplier.id;
  document.getElementById('form-sup-name').value = supplier.name;
  document.getElementById('form-sup-phone').value = supplier.phone;
  document.getElementById('form-sup-email').value = supplier.email;
  document.getElementById('form-sup-address').value = supplier.address || '';
  document.getElementById('form-sup-categories').value = supplier.categories || '';
  document.getElementById('form-sup-rating').value = supplier.rating || 5;

  document.getElementById('supplier-modal').classList.add('active');
}

function closeSupplierModal() {
  document.getElementById('supplier-modal').classList.remove('active');
}

function handleSaveSupplier(e) {
  e.preventDefault();

  const id = document.getElementById('form-sup-id').value.trim();
  const name = document.getElementById('form-sup-name').value.trim();
  const phone = document.getElementById('form-sup-phone').value.trim();
  const email = document.getElementById('form-sup-email').value.trim();
  const address = document.getElementById('form-sup-address').value.trim();
  const categories = document.getElementById('form-sup-categories').value.trim();
  const rating = parseInt(document.getElementById('form-sup-rating').value, 10);

  const supplierData = {
    id: id || undefined,
    name,
    phone,
    email,
    address,
    categories,
    rating
  };

  DB.saveSupplier(supplierData);
  DB.showToast(id ? 'Cập nhật nhà cung cấp thành công!' : 'Thêm nhà cung cấp mới thành công!', 'success');
  closeSupplierModal();
  renderSuppliersTable();
}

function confirmDeleteSupplier(id) {
  const supplier = DB.getSuppliers().find(s => s.id === id);
  if (!supplier) return;

  if (confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.name}" không?`)) {
    DB.deleteSupplier(id);
    DB.showToast('Đã xóa nhà cung cấp!', 'success');
    renderSuppliersTable();
  }
}
