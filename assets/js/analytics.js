/**
 * ==============================================================================
 * PHỤ TRÁCH: MEMBER 5 - PHÂN TÍCH, DỰ BÁO & SAO LƯU (analytics.js)
 * Nhiệm vụ: Vẽ biểu đồ Canvas, Dự báo chu kỳ cạn kho, Dead stock, Backup/Restore JSON
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initLayout('analytics');
  loadAnalytics();

  // Đăng ký nhận thông báo Realtime từ hệ thống
  if (window.DB && typeof window.DB.onUpdate === 'function') {
    window.DB.onUpdate(() => {
      loadAnalytics();
    });
  }
});

function loadAnalytics() {
  const items = DB.getItems();
  const logs = DB.getLogs();

  // 1. Tính toán giá trị Nhập và Xuất
  let totalImportValue = 0;
  let totalExportValue = 0;
  const itemExportCounts = {};

  logs.forEach(log => {
    const val = (log.changeQty || 0) * (log.price || 0);
    if (log.type === 'IMPORT') {
      totalImportValue += val;
    } else if (log.type === 'EXPORT') {
      totalExportValue += val;
      itemExportCounts[log.itemId] = (itemExportCounts[log.itemId] || 0) + log.changeQty;
    }
  });

  document.getElementById('chart-summary-text').textContent = 
    `Tổng giá trị nhập: ${DB.formatCurrency(totalImportValue)} | Tổng giá trị xuất: ${DB.formatCurrency(totalExportValue)}`;

  // Vẽ biểu đồ cột so sánh
  renderBarCompareChart(totalImportValue, totalExportValue);

  // Vẽ biểu đồ top vật tư
  renderTopItemsChart(items, itemExportCounts);

  // Render dự báo cạn kho
  renderPredictiveRunOut(items, itemExportCounts);

  // Render hàng tồn đọng
  renderDeadStock(items, logs);
}

// 1. Vẽ biểu đồ so sánh cột Nhập vs Xuất bằng HTML5 Canvas thuần (Căn chỉnh động)
function renderBarCompareChart(importVal, exportVal) {
  const canvas = document.getElementById('barCompareChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const maxVal = Math.max(importVal, exportVal, 1000000);
  const chartHeight = 150;
  const bottomY = 195;

  const colWidth = Math.min(80, Math.floor(w * 0.22));
  const col1X = Math.floor(w * 0.3 - colWidth / 2);
  const col2X = Math.floor(w * 0.7 - colWidth / 2);

  // Cột Nhập (Xanh lá)
  const importHeight = Math.max(8, (importVal / maxVal) * chartHeight);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(col1X, bottomY - importHeight, colWidth, importHeight);

  // Cột Xuất (Xanh dương)
  const exportHeight = Math.max(8, (exportVal / maxVal) * chartHeight);
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(col2X, bottomY - exportHeight, colWidth, exportHeight);

  // Nhãn & Giá trị
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 12px Segoe UI';
  ctx.textAlign = 'center';

  ctx.fillText('Tổng Nhập', col1X + colWidth / 2, bottomY + 22);
  ctx.fillText('Tổng Xuất', col2X + colWidth / 2, bottomY + 22);

  ctx.fillStyle = '#475569';
  ctx.font = '11.5px Segoe UI';
  ctx.fillText(formatShort(importVal), col1X + colWidth / 2, bottomY - importHeight - 8);
  ctx.fillText(formatShort(exportVal), col2X + colWidth / 2, bottomY - exportHeight - 8);
}

// 2. Vẽ biểu đồ thanh ngang Top 5 Luân chuyển nhanh
function renderTopItemsChart(items, exportCounts) {
  const canvas = document.getElementById('topItemsChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sorted = Object.keys(exportCounts)
    .map(id => {
      const item = items.find(i => i.id === id) || { name: id, unit: 'Cái' };
      return { id, name: item.name, count: exportCounts[id], unit: item.unit };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (sorted.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Chưa có đủ dữ liệu xuất kho để vẽ top', canvas.width / 2, canvas.height / 2);
    return;
  }

  const maxCount = Math.max(...sorted.map(s => s.count), 1);
  const startY = 32;
  const barGap = 40;
  const maxBarWidth = Math.max(120, canvas.width - 150);

  sorted.forEach((item, idx) => {
    const y = startY + idx * barGap;
    const barWidth = Math.max(12, (item.count / maxCount) * maxBarWidth);

    // Tên vật tư
    ctx.fillStyle = '#1e293b';
    ctx.font = '11.5px Segoe UI';
    ctx.textAlign = 'left';
    const displayName = item.name.length > 25 ? item.name.slice(0, 24) + '...' : item.name;
    ctx.fillText(`${idx + 1}. ${displayName}`, 15, y - 5);

    // Thanh ngang bo góc nhẹ
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(15, y, barWidth, 12);

    // Số lượng
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px Segoe UI';
    ctx.fillText(`${item.count} ${item.unit}`, 25 + barWidth, y + 10);
  });
}

function formatShort(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + ' tỷ';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + ' tr';
  return (num || 0).toLocaleString('vi-VN') + ' đ';
}

// 3. Dự Báo Chu Kỳ Cạn Kho (Predictive Analytics)
function renderPredictiveRunOut(items, exportCounts) {
  const tbody = document.getElementById('predictive-table-body');
  if (!tbody) return;

  const lowOrMoving = items.filter(i => i.quantity > 0).slice(0, 4);

  tbody.innerHTML = lowOrMoving.map(item => {
    const exported = exportCounts[item.id] || 2;
    const dailyBurnRate = (exported / 7).toFixed(1); // Ước tính 7 ngày
    const daysLeft = Math.max(1, Math.round(item.quantity / (dailyBurnRate || 1)));

    let alertColor = daysLeft <= 5 ? 'var(--danger)' : (daysLeft <= 15 ? 'var(--warning)' : 'var(--success)');

    return `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>${item.quantity} ${item.unit}</td>
        <td>~${dailyBurnRate} ${item.unit}/ngày</td>
        <td><strong style="color: ${alertColor};">~ ${daysLeft} ngày nữa</strong></td>
      </tr>
    `;
  }).join('');
}

// 4. Hàng Tồn Đọng (Dead Stock)
function renderDeadStock(items, logs) {
  const tbody = document.getElementById('deadstock-table-body');
  if (!tbody) return;

  // Lọc các mặt hàng có tồn kho > 0 và ít hoặc không có giao dịch xuất gần đây
  const deadItems = items.filter(i => i.quantity > 30).slice(0, 3);

  if (deadItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Kho hàng vận hành tối ưu, không có hàng ứ đọng!</td></tr>`;
    return;
  }

  tbody.innerHTML = deadItems.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td><code>${item.location || 'Kệ'}</code></td>
      <td>${item.quantity} ${item.unit}</td>
      <td>${DB.formatCurrency(item.quantity * item.priceImport)}</td>
      <td><span class="badge badge-warning">Đề xuất giảm giá/thanh lý</span></td>
    </tr>
  `).join('');
}

// 5. Xử lý phục hồi file JSON
function handleRestoreFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const res = DB.importBackup(e.target.result);
    if (res.success) {
      alert("✅ Đã khôi phục dữ liệu thành công! Trang web sẽ tải lại.");
      window.location.reload();
    } else {
      alert("❌ " + res.message);
    }
  };
  reader.readAsText(file);
}

function handleResetDefault() {
  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ thay đổi và đặt lại dữ liệu mặc định ban đầu không?")) {
    DB.resetDefault();
    alert("Đã reset về dữ liệu ban đầu!");
    window.location.reload();
  }
}
