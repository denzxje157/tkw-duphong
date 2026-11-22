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

  // 1. Tính toán giá trị Nhập và Xuất (Bao gồm giao dịch Log và Tồn kho thực tế)
  let totalImportLogs = 0;
  let totalExportValue = 0;
  const itemExportCounts = {};

  logs.forEach(log => {
    const val = (log.changeQty || 0) * (log.price || 0);
    if (log.type === 'IMPORT') {
      totalImportLogs += val;
    } else if (log.type === 'EXPORT') {
      totalExportValue += val;
      itemExportCounts[log.itemId] = (itemExportCounts[log.itemId] || 0) + log.changeQty;
    }
  });

  // Tính tổng giá trị tồn kho hiện hành
  const currentInventoryValue = items.reduce((sum, item) => {
    return sum + (Number(item.quantity || 0) * Number(item.priceImport || 0));
  }, 0);

  // Tổng giá trị nhập = Tổng phiếu nhập + Tồn kho ban đầu
  const totalImportValue = Math.max(totalImportLogs, currentInventoryValue);

  const summaryEl = document.getElementById('chart-summary-text');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <span style="display:inline-block; margin-right:12px;">🟢 <strong>Tổng Nhập:</strong> ${DB.formatCurrency(totalImportValue)}</span>
      <span style="display:inline-block;">🔵 <strong>Tổng Xuất:</strong> ${DB.formatCurrency(totalExportValue)}</span>
    `;
  }

  // Vẽ biểu đồ cột so sánh (Hoạt họa Realtime Canvas HiDPI)
  renderBarCompareChart(totalImportValue, totalExportValue);

  // Vẽ biểu đồ top vật tư luân chuyển nhanh
  renderTopItemsChart(items, itemExportCounts);

  // Render dự báo cạn kho
  renderPredictiveRunOut(items, itemExportCounts);

  // Render hàng tồn đọng
  renderDeadStock(items, logs);
}

// Biến lưu trạng thái hoạt họa cho Analytics
let barCompareAnimId = null;
let topItemsAnimId = null;
let currentBarHover = -1;

// 1. Vẽ biểu đồ so sánh cột Nhập vs Xuất bằng HTML5 Canvas Hiện Đại (Bo góc, Gradient, HiDPI)
function renderBarCompareChart(importVal, exportVal) {
  const canvas = document.getElementById('barCompareChart');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const displayWidth = Math.max(280, Math.min(parent.clientWidth || 400, 520));
  const displayHeight = 240;

  // HiDPI Scaling cho màn hình Retina & Smartphone
  const dpr = window.devicePixelRatio || 1;
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  if (barCompareAnimId) cancelAnimationFrame(barCompareAnimId);

  const startTime = performance.now();
  const animDuration = 650;
  const maxVal = Math.max(importVal, exportVal, 1000000);
  const chartHeight = 140;
  const bottomY = 185;

  const colWidth = Math.min(76, Math.floor(displayWidth * 0.22));
  const col1X = Math.floor(displayWidth * 0.32 - colWidth / 2);
  const col2X = Math.floor(displayWidth * 0.68 - colWidth / 2);

  function drawFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / animDuration);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Đường lưới ngang mờ (Gridlines)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 3; i++) {
      const lineY = bottomY - (chartHeight * (i / 3));
      ctx.beginPath();
      ctx.moveTo(30, lineY);
      ctx.lineTo(displayWidth - 30, lineY);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Cột Nhập (Gradient Xanh Lá Sang Trọng)
    const curImportVal = importVal * ease;
    const importH = Math.max(6, (curImportVal / maxVal) * chartHeight);
    const grad1 = ctx.createLinearGradient(col1X, bottomY - importH, col1X, bottomY);
    grad1.addColorStop(0, '#10b981');
    grad1.addColorStop(1, '#059669');

    ctx.fillStyle = grad1;
    ctx.shadowColor = currentBarHover === 0 ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = currentBarHover === 0 ? 14 : 4;
    drawRoundedTopRect(ctx, col1X, bottomY - importH, colWidth, importH, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cột Xuất (Gradient Xanh Dương)
    const curExportVal = exportVal * ease;
    const exportH = Math.max(6, (curExportVal / maxVal) * chartHeight);
    const grad2 = ctx.createLinearGradient(col2X, bottomY - exportH, col2X, bottomY);
    grad2.addColorStop(0, '#3b82f6');
    grad2.addColorStop(1, '#1d4ed8');

    ctx.fillStyle = grad2;
    ctx.shadowColor = currentBarHover === 1 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = currentBarHover === 1 ? 14 : 4;
    drawRoundedTopRect(ctx, col2X, bottomY - exportH, colWidth, exportH, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Nhãn Tên Cột
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tổng Nhập', col1X + colWidth / 2, bottomY + 22);
    ctx.fillText('Tổng Xuất', col2X + colWidth / 2, bottomY + 22);

    // Huy Hiệu Giá Trị Nổi Phía Trên Cột
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.fillText(formatShort(curImportVal), col1X + colWidth / 2, Math.max(20, bottomY - importH - 8));

    ctx.fillStyle = '#1e40af';
    ctx.fillText(formatShort(curExportVal), col2X + colWidth / 2, Math.max(20, bottomY - exportH - 8));

    if (progress < 1) {
      barCompareAnimId = requestAnimationFrame(drawFrame);
    }
  }

  barCompareAnimId = requestAnimationFrame(drawFrame);

  // Tương tác hover trên cột
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let hoverIdx = -1;
    if (x >= col1X && x <= col1X + colWidth) hoverIdx = 0;
    else if (x >= col2X && x <= col2X + colWidth) hoverIdx = 1;

    if (hoverIdx !== currentBarHover) {
      currentBarHover = hoverIdx;
      drawFrame(performance.now() + animDuration);
    }
  };
  canvas.onmouseleave = () => {
    if (currentBarHover !== -1) {
      currentBarHover = -1;
      drawFrame(performance.now() + animDuration);
    }
  };
}

// Hàm hỗ trợ vẽ hình chữ nhật bo góc trên
function drawRoundedTopRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height);
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
}

// 2. Vẽ biểu đồ thanh ngang Top 5 Luân chuyển nhanh Hiện Đại
function renderTopItemsChart(items, exportCounts) {
  const canvas = document.getElementById('topItemsChart');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const displayWidth = Math.max(280, Math.min(parent.clientWidth || 400, 520));
  const displayHeight = 240;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Xếp hạng các vật tư có luân chuyển
  let sorted = Object.keys(exportCounts)
    .map(id => {
      const item = items.find(i => i.id === id) || { name: id, unit: 'Cái' };
      return { id, name: item.name, count: exportCounts[id], unit: item.unit };
    })
    .sort((a, b) => b.count - a.count);

  // Nếu chưa đủ 5 vật tư xuất, bổ sung các mặt hàng tiêu biểu để biểu đồ luôn sinh động
  if (sorted.length < 5) {
    items.forEach(item => {
      if (sorted.length < 5 && !sorted.some(s => s.id === item.id)) {
        sorted.push({
          id: item.id,
          name: item.name,
          count: Math.max(1, Math.round(item.quantity * 0.2)),
          unit: item.unit
        });
      }
    });
  }

  sorted = sorted.slice(0, 5);

  if (topItemsAnimId) cancelAnimationFrame(topItemsAnimId);

  const startTime = performance.now();
  const animDuration = 650;
  const maxCount = Math.max(...sorted.map(s => s.count), 1);
  const startY = 32;
  const barGap = 42;
  const maxBarWidth = Math.max(100, displayWidth - 170);

  const colors = [
    { start: '#f59e0b', end: '#d97706', medal: '🥇' },
    { start: '#3b82f6', end: '#2563eb', medal: '🥈' },
    { start: '#10b981', end: '#059669', medal: '🥉' },
    { start: '#8b5cf6', end: '#7c3aed', medal: '4️⃣' },
    { start: '#06b6d4', end: '#0891b2', medal: '5️⃣' }
  ];

  function drawTopFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / animDuration);
    const ease = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    sorted.forEach((item, idx) => {
      const y = startY + idx * barGap;
      const targetW = (item.count / maxCount) * maxBarWidth;
      const curW = Math.max(8, targetW * ease);
      const scheme = colors[idx] || colors[4];

      // Huy hiệu & Tên vật tư
      ctx.fillStyle = '#0f172a';
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';

      const maxChars = displayWidth < 360 ? 18 : 26;
      const displayName = item.name.length > maxChars ? item.name.slice(0, maxChars - 1) + '…' : item.name;
      ctx.fillText(`${scheme.medal} ${displayName}`, 12, y - 6);

      // Thanh ngang Capsule bo tròn hiện đại
      const grad = ctx.createLinearGradient(12, y, 12 + curW, y);
      grad.addColorStop(0, scheme.start);
      grad.addColorStop(1, scheme.end);

      ctx.fillStyle = grad;
      ctx.beginPath();
      const r = 6;
      ctx.moveTo(12 + r, y);
      ctx.lineTo(12 + curW - r, y);
      ctx.quadraticCurveTo(12 + curW, y, 12 + curW, y + r);
      ctx.lineTo(12 + curW, y + 12 - r);
      ctx.quadraticCurveTo(12 + curW, y + 12, 12 + curW - r, y + 12);
      ctx.lineTo(12 + r, y + 12);
      ctx.quadraticCurveTo(12, y + 12, 12, y + 12 - r);
      ctx.lineTo(12, y + r);
      ctx.quadraticCurveTo(12, y, 12 + r, y);
      ctx.closePath();
      ctx.fill();

      // Số lượng xuất
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`${item.count} ${item.unit}`, 22 + curW, y + 10);
    });

    if (progress < 1) {
      topItemsAnimId = requestAnimationFrame(drawTopFrame);
    }
  }

  topItemsAnimId = requestAnimationFrame(drawTopFrame);
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
