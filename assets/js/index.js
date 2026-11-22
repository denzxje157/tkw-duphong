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
  const mobileList = document.getElementById('urgent-mobile-list');

  // 1. Render Bảng Desktop
  if (tbody) {
    if (urgentItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--success); font-weight: 500;">🎉 Tuyệt vời! Hiện tại không có mặt hàng nào dưới định mức an toàn.</td></tr>`;
    } else {
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
  }

  // 2. Render Danh Sách Thẻ Tối Ưu Cho Smartphone (Tránh tràn bảng, dễ thao tác ngón tay)
  if (mobileList) {
    if (urgentItems.length === 0) {
      mobileList.innerHTML = `
        <div style="text-align:center; padding: 24px; background:#f0fdf4; border-radius:12px; border:1px solid #bbf7d0; color:#15803d; font-size:13.5px; font-weight:600;">
          🎉 Tuyệt vời! Tất cả vật tư đều trên định mức an toàn.
        </div>
      `;
    } else {
      mobileList.innerHTML = urgentItems.map(item => `
        <div class="mobile-item-card urgent-mobile-card">
          <div class="mobile-card-header">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="mobile-sku-badge">${item.id}</span>
              <span class="badge ${item.status.badgeClass}">${item.status.label}</span>
            </div>
            <span class="mobile-location-tag">📍 ${item.location || 'Kệ N/A'}</span>
          </div>

          <h4 class="mobile-item-title">${item.name}</h4>
          <div class="mobile-item-sub">${item.category} • ${item.warehouse}</div>

          <div class="mobile-item-meta-grid">
            <div>Tồn kho: <strong style="color: ${item.status.colorHex}; font-size:15px;">${item.quantity} ${item.unit}</strong></div>
            <div>Định mức tối thiểu: <strong>${item.minThreshold} ${item.unit}</strong></div>
          </div>

          <button class="btn btn-primary" style="width:100%; min-height:42px; font-weight:600;" onclick="quickRestock('${item.id}')">
            ➕ Nhập hàng ngay
          </button>
        </div>
      `).join('');
    }
  }
}

// Biến lưu trạng thái hoạt họa Donut Chart
let donutAnimId = null;
let currentDonutHover = -1;

// Vẽ Donut Chart bằng HTML5 Canvas Hiện Đại với Hoạt Họa & Tương Tác Tooltip
function renderDonutChart(inStock, lowStock, outStock) {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;

  const total = inStock + lowStock + outStock;

  // Tính tỷ lệ phần trăm
  const pctIn = total > 0 ? Math.round((inStock / total) * 100) : 0;
  const pctLow = total > 0 ? Math.round((lowStock / total) * 100) : 0;
  const pctOut = total > 0 ? Math.max(0, 100 - pctIn - pctLow) : 0;

  // Cập nhật nhãn và thanh tỷ lệ an toàn
  const elPctIn = document.getElementById('pct-in-stock');
  const elPctLow = document.getElementById('pct-low-stock');
  const elPctOut = document.getElementById('pct-out-stock');
  if (elPctIn) elPctIn.textContent = `(${pctIn}%)`;
  if (elPctLow) elPctLow.textContent = `(${pctLow}%)`;
  if (elPctOut) elPctOut.textContent = `(${pctOut}%)`;

  const barIn = document.getElementById('bar-in-stock');
  const barLow = document.getElementById('bar-low-stock');
  const barOut = document.getElementById('bar-out-stock');
  if (barIn) barIn.style.width = `${pctIn}%`;
  if (barLow) barLow.style.width = `${pctLow}%`;
  if (barOut) barOut.style.width = `${pctOut}%`;

  // Thiết lập Canvas HiDPI cho màn hình Retina & Smartphone siêu sắc nét
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = 220;
  const displayHeight = 220;
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const data = [
    { label: 'Còn hàng', value: inStock, color: '#10b981', hoverColor: '#059669', pct: pctIn },
    { label: 'Sắp hết', value: lowStock, color: '#f59e0b', hoverColor: '#d97706', pct: pctLow },
    { label: 'Hết hàng', value: outStock, color: '#ef4444', hoverColor: '#dc2626', pct: pctOut }
  ];

  const centerX = displayWidth / 2;
  const centerY = displayHeight / 2;
  const outerRadius = 88;
  const innerRadius = 58;

  // Hủy animation cũ nếu có
  if (donutAnimId) cancelAnimationFrame(donutAnimId);

  const startTime = performance.now();
  const animDuration = 650; // ms

  function drawFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / animDuration);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      return;
    }

    let startAngle = -Math.PI / 2;
    const gapAngle = (total > 1 ? 0.04 : 0); // Khoảng hở phân đoạn hiện đại

    data.forEach((slice, idx) => {
      if (slice.value === 0) return;
      const sliceAngle = (slice.value / total) * 2 * Math.PI * ease;
      const drawSliceAngle = Math.max(0, sliceAngle - gapAngle);

      const isHovered = currentDonutHover === idx;
      const currentOuter = isHovered ? outerRadius + 4 : outerRadius;
      const currentInner = isHovered ? innerRadius - 2 : innerRadius;

      ctx.beginPath();
      ctx.arc(centerX, centerY, currentOuter, startAngle + gapAngle / 2, startAngle + gapAngle / 2 + drawSliceAngle);
      ctx.arc(centerX, centerY, currentInner, startAngle + gapAngle / 2 + drawSliceAngle, startAngle + gapAngle / 2, true);
      ctx.closePath();

      ctx.fillStyle = isHovered ? slice.hoverColor : slice.color;
      ctx.shadowColor = isHovered ? slice.color : 'transparent';
      ctx.shadowBlur = isHovered ? 12 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;

      slice.startAngle = startAngle;
      slice.endAngle = startAngle + sliceAngle;
      startAngle += sliceAngle;
    });

    // Vẽ Vòng Tròn Tâm
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Hiển thị số lượng động ở giữa
    const currentCount = Math.round(total * ease);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentCount, centerX, centerY - 6);

    ctx.font = '500 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Mặt hàng', centerX, centerY + 15);

    if (progress < 1) {
      donutAnimId = requestAnimationFrame(drawFrame);
    }
  }

  donutAnimId = requestAnimationFrame(drawFrame);

  // Xử lý tương tác Hover & Touch Tooltip trực tiếp trên Canvas
  function handlePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= innerRadius && dist <= outerRadius + 6) {
      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) angle += 2 * Math.PI;

      let found = -1;
      let curAngle = -Math.PI / 2;
      data.forEach((slice, idx) => {
        const sliceAngle = (slice.value / total) * 2 * Math.PI;
        if (angle >= curAngle && angle <= curAngle + sliceAngle) {
          found = idx;
        }
        curAngle += sliceAngle;
      });

      if (found !== currentDonutHover) {
        currentDonutHover = found;
        requestAnimationFrame((now) => drawFrame(now + animDuration));
      }
    } else {
      if (currentDonutHover !== -1) {
        currentDonutHover = -1;
        requestAnimationFrame((now) => drawFrame(now + animDuration));
      }
    }
  }

  canvas.onmousemove = (e) => handlePointer(e.clientX, e.clientY);
  canvas.onmouseleave = () => {
    if (currentDonutHover !== -1) {
      currentDonutHover = -1;
      requestAnimationFrame((now) => drawFrame(now + animDuration));
    }
  };
  canvas.ontouchstart = (e) => {
    if (e.touches && e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
  };
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
