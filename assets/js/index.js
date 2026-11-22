/**
 * ==============================================================================
 * PHỤ TRÁCH: MEMBER 2 - TRANG CHỦ & CẢNH BÁO TỒN KHO (index.js)
 * Nhiệm vụ: Tính toán KPI, lọc hàng dưới định mức, render nhãn Đỏ/Vàng, vẽ Donut Chart
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo Layout chung
  initLayout('index');

  // 2. Tải và render dữ liệu
  loadDashboardData();

  // 3. Đăng ký nhận thông báo Realtime từ hệ thống
  if (window.DB && typeof window.DB.onUpdate === 'function') {
    window.DB.onUpdate(() => {
      loadDashboardData();
    });
  }
});

function loadDashboardData() {
  const items = DB.getItems();

  let totalItems = items.length;
  let totalValue = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let inStockCount = 0;

  const urgentItems = [];

  items.forEach(item => {
    const qty = Number(item.quantity);
    const min = Number(item.minThreshold);
    totalValue += qty * Number(item.priceImport || 0);

    const status = DB.getItemStatus(qty, min);

    if (status.code === 'OUT') {
      outOfStockCount++;
      urgentItems.push({ ...item, status });
    } else if (status.code === 'LOW') {
      lowStockCount++;
      urgentItems.push({ ...item, status });
    } else {
      inStockCount++;
    }
  });

  // Render KPIs
  document.getElementById('kpi-total-items').textContent = totalItems;
  document.getElementById('kpi-total-value').textContent = DB.formatCurrency(totalValue);
  document.getElementById('kpi-out-stock').textContent = outOfStockCount;
  document.getElementById('kpi-low-stock').textContent = lowStockCount;

  document.getElementById('legend-in-stock').textContent = inStockCount;
  document.getElementById('legend-low-stock').textContent = lowStockCount;
  document.getElementById('legend-out-stock').textContent = outOfStockCount;

  document.getElementById('warning-count-badge').textContent = `${urgentItems.length} mặt hàng nguy cấp`;

  // Render Bảng Cảnh Báo Nguy Cấp
  renderUrgentTable(urgentItems);

  // Vẽ Biểu đồ Donut Canvas
  renderDonutChart(inStockCount, lowStockCount, outOfStockCount);

  // Render Sơ Đồ Kệ Hàng Thời Gian Thực (Heatmap)
  renderRackHeatmap(items);
}

function renderUrgentTable(urgentItems) {
  const tbody = document.getElementById('urgent-table-body');
  if (!tbody) return;

  if (urgentItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--success);">🎉 Tuyệt vời! Hiện tại không có mặt hàng nào dưới định mức an toàn.</td></tr>`;
    return;
  }

  tbody.innerHTML = urgentItems.map(item => `
    <tr>
      <td><strong>${item.id}</strong></td>
      <td>
        <div><strong>${item.name}</strong></div>
        <small style="color: var(--text-muted);">${item.category} • ${item.warehouse}</small>
      </td>
      <td><code>${item.location || 'N/A'}</code></td>
      <td><strong style="color: ${item.status.colorHex}; font-size: 15px;">${item.quantity}</strong> ${item.unit}</td>
      <td>${item.minThreshold} ${item.unit}</td>
      <td>
        <span class="badge ${item.status.badgeClass}">
          ${item.status.label}
        </span>
      </td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="quickRestock('${item.id}')">
          ➕ Nhập hàng ngay
        </button>
      </td>
    </tr>
  `).join('');
}

// Chức năng điều hướng nhanh sang trang Nhập kho
function quickRestock(itemId) {
  sessionStorage.setItem('QUICK_RESTOCK_ITEM_ID', itemId);
  window.location.href = 'operations.html';
}

// Vẽ Donut Chart bằng HTML5 Canvas thuần (Không phụ thuộc thư viện ngoài)
function renderDonutChart(inStock, lowStock, outStock) {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const total = inStock + lowStock + outStock;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (total === 0) return;

  const data = [
    { value: inStock, color: '#10b981' },
    { value: lowStock, color: '#f59e0b' },
    { value: outStock, color: '#ef4444' }
  ];

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const outerRadius = 85;
  const innerRadius = 55;

  let startAngle = -Math.PI / 2;

  data.forEach(slice => {
    if (slice.value === 0) return;
    const sliceAngle = (slice.value / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = slice.color;
    ctx.fill();

    startAngle += sliceAngle;
  });

  // Vẽ chữ ở giữa donut
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px Segoe UI';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, centerX, centerY - 6);

  ctx.font = '11px Segoe UI';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Mặt hàng', centerX, centerY + 14);
}

// Render Sơ Đồ Kệ Kho Thông Minh (Warehouse Heatmap)
function renderRackHeatmap(items) {
  const container = document.getElementById('rack-heatmap-grid');
  if (!container) return;

  container.innerHTML = items.map(item => {
    const status = DB.getItemStatus(item.quantity, item.minThreshold);
    let statusClass = 'status-safe';
    if (status.code === 'OUT') statusClass = 'status-out';
    else if (status.code === 'LOW') statusClass = 'status-low';

    return `
      <div class="rack-cell ${statusClass}" onclick="quickRestock('${item.id}')" title="Kệ: ${item.location} - Nhấn để nhập hàng">
        <div class="rack-header-row">
          <span class="rack-code">📍 ${item.location || 'Kệ N/A'}</span>
          <span class="badge ${status.badgeClass} rack-badge">${status.label}</span>
        </div>
        <div class="rack-item-name" title="${item.name}">${item.name}</div>
        <div class="rack-qty-row">
          <span class="rack-qty-label">Tồn kho:</span>
          <span class="rack-qty-val"><strong style="color:${status.colorHex};">${item.quantity}</strong> ${item.unit}</span>
        </div>
      </div>
    `;
  }).join('');
}
