/**
 * ==============================================================================
 * MODULE DÙNG CHUNG: RENDER SIDEBAR & HEADER CHUẨN + TRẠM QUÉT IOT (layout.js)
 * Tự động chèn thanh điều hướng, header, và TRẠM QUÉT MÃ VẠCH IOT cho mọi trang.
 * Có hiệu ứng tia Laser quét thực tế + Âm thanh "BÍP" chuẩn máy quét công nghiệp.
 * ==============================================================================
 */

function initLayout(activePageKey) {
  const sidebarContainer = document.getElementById('sidebar-container');
  const headerContainer = document.getElementById('header-container');

  const menuItems = [
    { key: 'index', title: 'Tổng Quan & Cảnh Báo', url: 'index.html', icon: '📊', member: 'Member 2' },
    { key: 'inventory', title: 'Quản Lý Vật Tư', url: 'inventory.html', icon: '📦', member: 'Member 3' },
    { key: 'operations', title: 'Nhập & Xuất Kho', url: 'operations.html', icon: '🔄', member: 'Member 1 (Lead)' },
    { key: 'history', title: 'Lịch Sử Giao Dịch', url: 'history.html', icon: '📜', member: 'Member 4' },
    { key: 'analytics', title: 'Phân Tích & Dự Báo', url: 'analytics.html', icon: '📈', member: 'Member 5' },
    { key: 'suppliers', title: 'Nhà Cung Cấp', url: 'suppliers.html', icon: '🏢', member: 'Member 5' }
  ];

  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileSidebar(false)"></div>
      <aside class="app-sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">🏭</div>
          <div class="brand-text">
            <h3>SMART KHO</h3>
            <span>Inventory System v2.0</span>
          </div>
          <button type="button" class="sidebar-close-btn" onclick="toggleMobileSidebar(false)" aria-label="Đóng menu">✕</button>
        </div>

        <div class="sidebar-section-title">PHÂN HỆ QUẢN TRỊ</div>
        <nav class="sidebar-nav">
          ${menuItems.map(item => `
            <a href="${item.url}" class="nav-item ${item.key === activePageKey ? 'active' : ''}" onclick="toggleMobileSidebar(false)">
              <span class="nav-icon">${item.icon}</span>
              <div class="nav-info">
                <span class="nav-title">${item.title}</span>
                <span class="nav-sub">${item.member}</span>
              </div>
            </a>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <div class="system-status">
            <span class="status-dot"></span>
            <span>Kho Online • IoT Ready</span>
          </div>
          <small class="version-tag">GitHub Pages Compatible</small>
        </div>
      </aside>
    `;
  }

  if (headerContainer) {
    const activeItem = menuItems.find(i => i.key === activePageKey) || menuItems[0];
    headerContainer.innerHTML = `
      <header class="app-header">
        <div class="header-left">
          <button type="button" class="mobile-menu-toggle" onclick="toggleMobileSidebar(true)" aria-label="Mở menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div class="header-title-box">
            <h2 class="page-main-title">${activeItem.icon} ${activeItem.title}</h2>
            <span class="page-desc">Phân hệ Quản lý Kho & Kiểm kê vật tư</span>
          </div>
        </div>
        <div class="header-right">
          <!-- NÚT MỞ TRẠM QUÉT IOT NỔI BẬT TẠI HEADER (DỄ THẤY TRÊN MỌI TRANG) -->
          <button class="btn btn-primary btn-sm iot-scanner-trigger-btn" onclick="openIoTScannerModal()" title="Mở máy quét mã vạch giả lập IoT">
            <span class="iot-pulse-dot"></span>
            <span class="iot-btn-text">📷 Trạm Quét Barcode IoT</span>
          </button>

          <div class="warehouse-badge">
            <span>📍 <strong>Tổng kho A</strong></span>
          </div>
          <div class="header-clock" id="live-clock">--:--:--</div>
          <div class="header-user">
            <div class="user-avatar">HA</div>
            <div class="user-info">
              <span class="user-name">Nguyễn Hoàng Anh</span>
              <span class="user-role">Thủ kho</span>
            </div>
          </div>
        </div>
      </header>
    `;

    // Đồng hồ thời gian thực
    function updateClock() {
      const clockEl = document.getElementById('live-clock');
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('vi-VN');
      }
    }
    setInterval(updateClock, 1000);
    updateClock();
  }

  // Tự động chèn Modal Trạm Quét Barcode IoT vào cuối body
  injectIoTScannerModal();

  // Tự động chèn Mobile App Bottom Navigation Bar
  injectMobileBottomNav(activePageKey);
}

// Bật / tắt thanh Menu Drawer trên thiết bị di động
function toggleMobileSidebar(open) {
  const sidebar = document.querySelector('.app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  const shouldOpen = (typeof open === 'boolean') ? open : !sidebar.classList.contains('mobile-open');
  if (shouldOpen) {
    sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('sidebar-locked');
  } else {
    sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('sidebar-locked');
  }
}
window.toggleMobileSidebar = toggleMobileSidebar;

// Tạo thanh điều hướng dưới đáy màn hình chuẩn Mobile App
function injectMobileBottomNav(activePageKey) {
  if (document.getElementById('mobile-bottom-nav')) return;

  const mobileNavItems = [
    { key: 'index', title: 'Tổng Quan', url: 'index.html', icon: '📊' },
    { key: 'inventory', title: 'Vật Tư', url: 'inventory.html', icon: '📦' },
    { key: 'operations', title: 'Nhập/Xuất', url: 'operations.html', icon: '🔄' },
    { key: 'history', title: 'Lịch Sử', url: 'history.html', icon: '📜' },
    { key: 'analytics', title: 'Báo Cáo', url: 'analytics.html', icon: '📈' },
    { key: 'suppliers', title: 'Đối Tác', url: 'suppliers.html', icon: '🏢' }
  ];

  const navHtml = `
    <nav class="mobile-bottom-nav" id="mobile-bottom-nav">
      ${mobileNavItems.map(item => `
        <a href="${item.url}" class="mobile-nav-link ${item.key === activePageKey ? 'active' : ''}">
          <span class="m-icon">${item.icon}</span>
          <span class="m-text">${item.title}</span>
        </a>
      `).join('')}
    </nav>
  `;
  document.body.insertAdjacentHTML('beforeend', navHtml);
}

/**
 * ==============================================================================
 * TRẠM QUÉT MÃ VẠCH IOT THỜI GIAN THỰC (SIMULATION ENGINE)
 * ==============================================================================
 */

// Phát âm thanh "BÍP" sắc nét mô phỏng máy quét mã vạch cầm tay cắm cổng USB
function playScannerBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime); // 1800Hz âm tít cao chuẩn máy quét
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch(e) {
    console.log("Audio not supported or permitted");
  }
}

function injectIoTScannerModal() {
  if (document.getElementById('iot-scanner-modal')) return;

  const modalHtml = `
    <div class="modal-overlay" id="iot-scanner-modal">
      <div class="modal-box iot-modal-box">
        <div class="modal-header iot-modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size: 22px;">📷</span>
            <div>
              <h3 class="modal-title" style="color: #fff; margin:0;">Trạm Quét Mã Vạch IoT (Barcode Station)</h3>
              <small style="color: #94a3b8;">Tương thích đầu đọc USB / Bluetooth & Mô phỏng Demo</small>
            </div>
          </div>
          <button class="modal-close" style="color:#fff;" onclick="closeIoTScannerModal()">&times;</button>
        </div>

        <div class="modal-body" style="padding: 20px;">
          <!-- KHUNG HÌNH MÁY QUÉT VỚI TIA LASER ĐỎ CHUYỂN ĐỘNG -->
          <div class="scanner-viewport">
            <div class="laser-beam"></div>
            <div class="scanner-target-box">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
              <div class="barcode-preview-stripes">
                <span class="bar b1"></span><span class="bar b2"></span><span class="bar b1"></span><span class="bar b3"></span>
                <span class="bar b2"></span><span class="bar b1"></span><span class="bar b4"></span><span class="bar b2"></span>
                <span class="bar b1"></span><span class="bar b3"></span><span class="bar b2"></span><span class="bar b1"></span>
              </div>
              <div class="scanner-status-text">Đang phát tia laser quét... (Sẵn sàng)</div>
            </div>
          </div>

          <!-- KHU VỰC BẮN MÃ NHANH (CHO PHÉP BẤM DEMO NGAY LẬP TỨC KHÔNG CẦN GÕ) -->
          <div style="margin: 16px 0 12px;">
            <label class="form-label" style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">
              🎯 Bấm để "Bắn mã" quét thử nghiệm tức thì:
            </label>
            <div class="quick-scan-buttons">
              <button type="button" class="btn-quick-scan" onclick="triggerScanItem('8931234567890')">
                🔫 Thép phi 10 (8931234567890)
              </button>
              <button type="button" class="btn-quick-scan" onclick="triggerScanItem('8931234567891')">
                🔫 Xi măng Vicem (8931234567891)
              </button>
              <button type="button" class="btn-quick-scan" onclick="triggerScanItem('8931234567892')">
                🔫 Cáp Cadivi (8931234567892)
              </button>
              <button type="button" class="btn-quick-scan" onclick="triggerScanItem('8931234567896')">
                🔫 Aptomat Pana (8931234567896)
              </button>
            </div>
          </div>

          <!-- Ô NHẬP DÀNH CHO MÁY QUÉT VẬT LÝ THẬT HOẶC TỰ GÕ -->
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label">Hoặc nhập/quét từ đầu đọc cầm tay (Bấm Enter):</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="iot-manual-barcode" class="form-control" placeholder="Quét hoặc nhập mã vạch / SKU...">
              <button type="button" class="btn btn-primary" onclick="submitManualScan()">Quét</button>
            </div>
          </div>

          <!-- KẾT QUẢ QUÉT HIỂN THỊ TRỰC QUAN -->
          <div id="scan-result-card" style="display: none;" class="scan-result-box">
            <!-- JS render kết quả -->
          </div>
        </div>

        <div class="modal-footer" style="background: #f1f5f9; padding: 12px 20px;">
          <small style="color: var(--text-muted);">Hỗ trợ phím tắt: Bắn mã bằng máy quét ngoài tự động nhận diện 100%</small>
          <button type="button" class="btn btn-outline btn-sm" onclick="closeIoTScannerModal()">Đóng Trạm Quét</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Lắng nghe phím Enter trong ô nhập
  const manualInput = document.getElementById('iot-manual-barcode');
  if (manualInput) {
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitManualScan();
      }
    });
  }
}

function openIoTScannerModal() {
  const modal = document.getElementById('iot-scanner-modal');
  if (modal) {
    modal.classList.add('active');
    const input = document.getElementById('iot-manual-barcode');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 200);
    }
  }
}

function closeIoTScannerModal() {
  const modal = document.getElementById('iot-scanner-modal');
  if (modal) modal.classList.remove('active');
}

function submitManualScan() {
  const input = document.getElementById('iot-manual-barcode');
  if (!input) return;
  const code = input.value.trim();
  if (code) {
    triggerScanItem(code);
    input.value = '';
  }
}

// Hàm kích hoạt quét một mã
function triggerScanItem(barcodeOrId) {
  openIoTScannerModal();
  playScannerBeep();

  const item = DB.getItemById(barcodeOrId);
  const resultCard = document.getElementById('scan-result-card');
  if (!resultCard) return;

  resultCard.style.display = 'block';

  // Nếu đang ở trang Danh mục (inventory.html), đồng bộ luôn vào bảng tìm kiếm
  const searchInput = document.getElementById('search-input');
  if (searchInput && item && typeof renderInventoryTable === 'function') {
    searchInput.value = item.id;
    renderInventoryTable();
  }

  if (!item) {
    resultCard.className = 'scan-result-box error';
    resultCard.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; color:#b91c1c;">
        <span style="font-size:24px;">❌</span>
        <div>
          <strong>KHÔNG TÌM THẤY VẬT TƯ NÀO KHỚP VỚI MÃ: "${barcodeOrId}"</strong>
          <div style="font-size:12px; margin-top:2px;">Vui lòng kiểm tra lại mã vạch trên bao bì hoặc thêm mới vật tư vào hệ thống.</div>
        </div>
      </div>
    `;
    DB.showToast(`Mã vạch ${barcodeOrId} không tồn tại trong kho!`, 'error');
    return;
  }

  const status = DB.getItemStatus(item.quantity, item.minThreshold);
  resultCard.className = 'scan-result-box success';
  resultCard.innerHTML = `
    <div class="result-header">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:26px;">📦</span>
        <div>
          <h4 style="margin:0; font-size:15px; color:#1e293b;">${item.name}</h4>
          <span style="font-size:12px; color:#64748b;">Mã SKU: <strong>${item.id}</strong> | Barcode: <code>${item.barcode}</code></span>
        </div>
      </div>
      <span class="badge ${status.badgeClass}">${status.label}</span>
    </div>

    <div class="result-grid">
      <div>Kho: <strong>${item.warehouse}</strong></div>
      <div>Vị trí: <code>${item.location || 'Kệ A'}</code></div>
      <div>Tồn kho: <strong style="font-size:16px; color:${status.colorHex};">${item.quantity} ${item.unit}</strong></div>
      <div>Định mức an toàn: <strong>${item.minThreshold} ${item.unit}</strong></div>
      <div>Đơn giá xuất: <strong>${DB.formatCurrency(item.priceExport)}</strong></div>
      <div>Đơn giá nhập: <strong>${DB.formatCurrency(item.priceImport)}</strong></div>
    </div>

    <div class="result-actions">
      <button class="btn btn-success btn-sm" onclick="navigateToOperations('${item.id}', 'import')">
        📥 Nhập thêm hàng này
      </button>
      <button class="btn btn-danger btn-sm" onclick="navigateToOperations('${item.id}', 'export')" ${item.quantity === 0 ? 'disabled' : ''}>
        📤 Xuất kho hàng này
      </button>
      <button class="btn btn-outline btn-sm" onclick="locateInInventory('${item.id}')">
        🔍 Định vị trong Danh Mục
      </button>
    </div>
  `;

  DB.showToast(`Đã nhận diện: ${item.name} (Tồn: ${item.quantity} ${item.unit})`, 'success');
}

function navigateToOperations(itemId, tab) {
  sessionStorage.setItem('QUICK_RESTOCK_ITEM_ID', itemId);
  closeIoTScannerModal();
  window.location.href = 'operations.html';
}

function locateInInventory(itemId) {
  closeIoTScannerModal();
  window.location.href = 'inventory.html';
}
