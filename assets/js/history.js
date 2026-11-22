/**
 * ==============================================================================
 * PHỤ TRÁCH: MEMBER 4 - LỊCH SỬ GIAO DỊCH (history.js)
 * Nhiệm vụ: Timeline trực quan Nhập/Xuất, Bộ lọc ngày/loại, Xuất báo cáo CSV
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initLayout('history');
  renderTimeline();
  setupFilterListeners();

  // Đăng ký nhận thông báo Realtime từ hệ thống
  if (window.DB && typeof window.DB.onUpdate === 'function') {
    window.DB.onUpdate(() => {
      renderTimeline();
    });
  }
});

function setupFilterListeners() {
  document.getElementById('filter-keyword')?.addEventListener('input', renderTimeline);
  document.getElementById('filter-type')?.addEventListener('change', renderTimeline);
  document.getElementById('filter-from-date')?.addEventListener('change', renderTimeline);
  document.getElementById('filter-to-date')?.addEventListener('change', renderTimeline);
}

let currentHistoryView = 'timeline';

function switchHistoryView(mode) {
  currentHistoryView = mode;
  const btnTimeline = document.getElementById('btn-view-timeline');
  const btnTable = document.getElementById('btn-view-table');
  const timelineContainer = document.getElementById('timeline-container');
  const tableContainer = document.getElementById('table-view-container');

  if (mode === 'timeline') {
    btnTimeline.classList.add('active');
    btnTable.classList.remove('active');
    timelineContainer.style.display = 'block';
    tableContainer.style.display = 'none';
  } else {
    btnTable.classList.add('active');
    btnTimeline.classList.remove('active');
    timelineContainer.style.display = 'none';
    tableContainer.style.display = 'block';
  }
}

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  const tableBody = document.getElementById('history-table-body');
  if (!container) return;

  const keyword = (document.getElementById('filter-keyword')?.value || '').toLowerCase().trim();
  const filterType = document.getElementById('filter-type')?.value || '';
  const fromDate = document.getElementById('filter-from-date')?.value || '';
  const toDate = document.getElementById('filter-to-date')?.value || '';

  const logs = DB.getLogs();

  let totalImportVal = 0;
  let totalExportVal = 0;

  const filtered = logs.filter(log => {
    const matchKeyword = !keyword ||
      log.itemName.toLowerCase().includes(keyword) ||
      log.id.toLowerCase().includes(keyword) ||
      (log.partnerName && log.partnerName.toLowerCase().includes(keyword)) ||
      (log.operator && log.operator.toLowerCase().includes(keyword));

    const matchType = !filterType || log.type === filterType;

    let matchDate = true;
    if (fromDate || toDate) {
      const logDate = log.timestamp ? log.timestamp.slice(0, 10) : '';
      if (fromDate && logDate < fromDate) matchDate = false;
      if (toDate && logDate > toDate) matchDate = false;
    }

    if (matchKeyword && matchType && matchDate) {
      const val = (log.changeQty || 0) * (log.price || 0);
      if (log.type === 'IMPORT') totalImportVal += val;
      else if (log.type === 'EXPORT') totalExportVal += val;
      return true;
    }
    return false;
  });

  // Cập nhật thống kê kỳ lọc
  const badge = document.getElementById('log-count-badge');
  if (badge) badge.textContent = `${filtered.length} giao dịch`;
  document.getElementById('stat-total-count').textContent = filtered.length;
  document.getElementById('stat-import-val').textContent = DB.formatCurrency(totalImportVal);
  document.getElementById('stat-export-val').textContent = DB.formatCurrency(totalExportVal);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--text-muted);">Không tìm thấy nhật ký luân chuyển nào phù hợp.</div>`;
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px;">Không có dữ liệu.</td></tr>`;
    return;
  }

  // 1. Render Dạng Timeline
  container.innerHTML = filtered.map(log => {
    const isImport = log.type === 'IMPORT';
    const dotClass = isImport ? 'import' : 'export';
    const icon = isImport ? '📥' : '📤';
    const typeLabel = isImport ? 'Nhập kho' : 'Xuất kho';
    const typeBadge = isImport ? 'badge-success' : 'badge-danger';
    const sign = isImport ? '+' : '-';

    return `
      <div class="timeline-item">
        <div class="timeline-dot ${dotClass}">
          ${isImport ? '↓' : '↑'}
        </div>
        <div class="timeline-card">
          <div class="timeline-head">
            <div class="timeline-title">
              <span class="badge ${typeBadge}">${icon} ${typeLabel}</span>
              <strong style="margin-left: 8px; font-size: 15px;">${log.itemName}</strong>
              <small style="color: var(--text-muted); margin-left: 6px;">(${log.itemId})</small>
            </div>
            <span class="timeline-time">🕒 ${DB.formatDateTime(log.timestamp)}</span>
          </div>

          <div style="font-size: 13.5px; margin: 8px 0;">
            Biến động: <strong style="font-size: 16px; color: ${isImport ? 'var(--success)' : 'var(--danger)'};">${sign}${log.changeQty}</strong> 
            | Tồn sau giao dịch: <strong>${log.balanceAfter}</strong>
            ${log.price ? ` | Đơn giá: <strong>${DB.formatCurrency(log.price)}</strong>` : ''}
          </div>

          <div class="timeline-meta">
            <span>👤 Người thực hiện: <strong>${log.operator || 'Thủ kho'}</strong></span>
            <span>🤝 Đối tác: <strong>${log.partnerName || 'Nội bộ'}</strong></span>
            <span>📝 Ghi chú: <em>"${log.reason || 'Không có ghi chú'}"</em></span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 2. Render Dạng Bảng Đối Soát (Table View)
  if (tableBody) {
    tableBody.innerHTML = filtered.map(log => {
      const isImport = log.type === 'IMPORT';
      const typeBadge = isImport ? 'badge-success' : 'badge-danger';
      const sign = isImport ? '+' : '-';
      return `
        <tr>
          <td><code>${log.id}</code></td>
          <td><small>${DB.formatDateTime(log.timestamp)}</small></td>
          <td><span class="badge ${typeBadge}">${isImport ? 'Nhập kho' : 'Xuất kho'}</span></td>
          <td><strong>${log.itemName}</strong><br><small style="color:var(--text-muted);">${log.itemId}</small></td>
          <td><strong style="color:${isImport ? 'var(--success)' : 'var(--danger)'}; font-size:14px;">${sign}${log.changeQty}</strong></td>
          <td><strong>${log.balanceAfter}</strong></td>
          <td>${DB.formatCurrency(log.price)}</td>
          <td>${log.partnerName || 'Nội bộ'}</td>
          <td>${log.operator || 'Thủ kho'}</td>
        </tr>
      `;
    }).join('');
  }
}

// XUẤT BÁO CÁO CSV (KHÔNG CẦN BACKEND - DÙNG BLOB API & UTF-8 BOM)
function exportHistoryCSV() {
  const logs = DB.getLogs();
  if (logs.length === 0) {
    DB.showToast('Không có dữ liệu lịch sử để xuất!', 'warning');
    return;
  }

  // Tiêu đề cột CSV
  const headers = ['Mã Phiếu', 'Thời Gian', 'Loại Giao Dịch', 'Mã Vật Tư', 'Tên Vật Tư', 'Biến Động', 'Tồn Sau GD', 'Đơn Giá (VNĐ)', 'Đối Tác', 'Lý Do', 'Người Lập'];

  const rows = logs.map(log => [
    `"${log.id}"`,
    `"${DB.formatDateTime(log.timestamp)}"`,
    `"${log.type === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}"`,
    `"${log.itemId}"`,
    `"${log.itemName.replace(/"/g, '""')}"`,
    log.type === 'IMPORT' ? log.changeQty : -log.changeQty,
    log.balanceAfter,
    log.price || 0,
    `"${(log.partnerName || '').replace(/"/g, '""')}"`,
    `"${(log.reason || '').replace(/"/g, '""')}"`,
    `"${log.operator || ''}"`
  ]);

  // \uFEFF là UTF-8 BOM để Excel hiển thị tiếng Việt không bị lỗi font
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lich_Su_Kho_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  DB.showToast('Đã xuất báo cáo CSV thành công!', 'success');
}
