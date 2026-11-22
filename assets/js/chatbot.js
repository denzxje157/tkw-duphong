/**
 * ==============================================================================
 * MODULE TRỢ LÝ ẢO THỦ KHO AI (chatbot.js)
 * Phụ trách: Shared AI Assistant (100% Vanilla HTML5, CSS3 & JavaScript ES6)
 * Tính năng:
 * - Tra cứu tồn kho, vị trí kệ, hàng sắp hết, thông tin nhà cung cấp thời gian thực
 * - Gợi ý câu hỏi nhanh (Interactive Suggestion Chips)
 * - Lưu trữ và phục hồi lịch sử trò chuyện qua localStorage
 * - Âm thanh thông báo nhẹ nhàng qua Web Audio API (Không phụ thuộc file ngoài)
 * ==============================================================================
 */

const CHAT_STORAGE_KEY = 'SMART_KHO_CHAT_HISTORY';

// Tin nhắn chào mừng ban đầu
const BOT_GREETING = {
  sender: 'bot',
  text: 'Xin chào! Tôi là **Trợ Lý Ảo Thủ Kho AI** 🤖\n\nTôi có thể hỗ trợ bạn tra cứu nhanh tồn kho, vị trí kệ, cảnh báo hàng nguy cấp, hoặc tìm số điện thoại đối tác cung ứng. Bạn cần kiểm tra thông tin gì hôm nay?',
  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
};

// Khởi tạo Chatbot
function initSmartChatbot() {
  if (document.getElementById('chatbot-widget-container')) return;

  // 1. Tạo container giao diện
  const widgetHtml = `
    <div id="chatbot-widget-container" class="chatbot-container">
      <!-- NÚT BẬT / TẮT CHATBOT NỔI GÓC DƯỚI -->
      <button type="button" id="chatbot-toggle-btn" class="chatbot-floating-btn" onclick="toggleChatbot()" aria-label="Mở Trợ lý ảo Kho">
        <span class="bot-icon">🤖</span>
        <span class="bot-pulse-dot"></span>
        <span class="bot-label-tooltip">Hỏi Trợ Lý AI</span>
      </button>

      <!-- HỘP THOẠI TRÒ CHUYỆN (CHAT PANEL) -->
      <div id="chatbot-panel" class="chatbot-panel" style="display: none;">
        <!-- HEADER -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">🤖</div>
            <div>
              <h4 class="chat-title">Trợ Lý Kho AI</h4>
              <span class="chat-status"><span class="status-dot-live"></span> Trực tuyến • Realtime DB</span>
            </div>
          </div>
          <div class="chat-header-actions">
            <button type="button" class="chat-action-btn" onclick="clearChatHistory()" title="Xóa lịch sử trò chuyện">🗑️</button>
            <button type="button" class="chat-action-btn" onclick="toggleChatbot(false)" title="Thu nhỏ">✕</button>
          </div>
        </div>

        <!-- DANH SÁCH TIN NHẮN (MESSAGES BODY) -->
        <div id="chatbot-messages" class="chat-messages-body">
          <!-- Render từ LocalStorage -->
        </div>

        <!-- THANH GỢI Ý CÂU HỎI NHANH (SUGGESTION CHIPS) -->
        <div class="chat-suggestions-wrapper">
          <div class="chat-suggestions-scroll" id="chatbot-suggestions">
            <button type="button" class="chat-chip" onclick="handleChipClick('Hàng nào sắp hết?')">⚠️ Hàng sắp hết?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Kiểm tra xi măng')">📦 Tồn kho xi măng?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Thép để ở kệ nào?')">📍 Vị trí thép?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('SĐT Hòa Phát')">🏢 SĐT Hòa Phát?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Tổng giá trị kho')">💰 Tổng tài sản kho?</button>
          </div>
        </div>

        <!-- FORM NHẬP TIN NHẮN -->
        <form id="chatbot-form" class="chat-input-form" onsubmit="handleChatSubmit(event)">
          <input 
            type="text" 
            id="chatbot-input" 
            class="chat-input-field" 
            placeholder="Hỏi về tồn kho, kệ hàng, đối tác..." 
            autocomplete="off" 
            required
          />
          <button type="submit" class="chat-send-btn" id="chatbot-send-btn" aria-label="Gửi tin nhắn">
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHtml);

  // 2. Render lịch sử chat từ localStorage
  renderChatHistory();
}

// Lấy lịch sử chat từ localStorage
function getChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Lỗi đọc chat history:', e);
  }
  return [BOT_GREETING];
}

// Lưu lịch sử chat vào localStorage
function saveChatHistory(history) {
  try {
    // Giữ tối đa 50 tin nhắn gần nhất để tối ưu bộ nhớ
    const trimmed = history.slice(-50);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Lỗi lưu chat history:', e);
  }
}

// Xóa sạch lịch sử chat
function clearChatHistory() {
  const resetHistory = [
    {
      sender: 'bot',
      text: 'Đã làm mới đoạn chat! Bạn có thể hỏi tôi bất kỳ thông tin nào về vật tư, vị trí kệ hoặc nhà cung cấp.',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ];
  saveChatHistory(resetHistory);
  renderChatHistory();
  if (window.DB && typeof window.DB.showToast === 'function') {
    window.DB.showToast('Đã xóa sạch lịch sử trò chuyện!', 'info');
  }
}

// Bật / tắt mở hộp thoại Chat
function toggleChatbot(forceState) {
  const panel = document.getElementById('chatbot-panel');
  const btn = document.getElementById('chatbot-toggle-btn');
  if (!panel) return;

  const isOpen = (typeof forceState === 'boolean') ? forceState : (panel.style.display === 'none' || panel.style.display === '');

  if (isOpen) {
    panel.style.display = 'flex';
    if (btn) btn.classList.add('chat-open');
    scrollToBottom();
    const input = document.getElementById('chatbot-input');
    if (input) setTimeout(() => input.focus(), 150);
  } else {
    panel.style.display = 'none';
    if (btn) btn.classList.remove('chat-open');
  }
}

// Render toàn bộ tin nhắn ra giao diện
function renderChatHistory() {
  const container = document.getElementById('chatbot-messages');
  if (!container) return;

  const history = getChatHistory();
  container.innerHTML = history.map(msg => renderMessageHTML(msg)).join('');
  scrollToBottom();
}

// Render 1 tin nhắn thành HTML
function renderMessageHTML(msg) {
  const isUser = msg.sender === 'user';
  const formattedText = formatMarkdownText(msg.text);

  return `
    <div class="chat-message-row ${isUser ? 'user-row' : 'bot-row'}">
      ${!isUser ? '<div class="chat-msg-avatar">🤖</div>' : ''}
      <div class="chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}">
        <div class="chat-bubble-content">${formattedText}</div>
        ${msg.actionHtml ? `<div class="chat-bubble-actions">${msg.actionHtml}</div>` : ''}
        <span class="chat-bubble-time">${msg.time || ''}</span>
      </div>
    </div>
  `;
}

// Cuộn xuống tin nhắn mới nhất
function scrollToBottom() {
  const container = document.getElementById('chatbot-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Xử lý khi nhấn chip gợi ý
function handleChipClick(text) {
  const input = document.getElementById('chatbot-input');
  if (input) {
    input.value = text;
    processMessage(text);
    input.value = '';
  }
}

// Xử lý khi submit form chat
function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatbot-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  processMessage(text);
}

// Xử lý gửi tin nhắn của User & sinh phản hồi từ Bot
function processMessage(userText) {
  const history = getChatHistory();
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // 1. Thêm tin nhắn của User vào danh sách
  const userMsg = {
    sender: 'user',
    text: userText,
    time: now
  };
  history.push(userMsg);
  saveChatHistory(history);
  renderChatHistory();

  // 2. Hiển thị hiệu ứng Bot đang gõ (...)
  showTypingIndicator();

  // 3. Xử lý phản hồi thông minh sau 350ms
  setTimeout(() => {
    hideTypingIndicator();
    const botResponse = generateBotAnswer(userText);
    
    const botMsg = {
      sender: 'bot',
      text: botResponse.text,
      actionHtml: botResponse.actionHtml || null,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    history.push(botMsg);
    saveChatHistory(history);
    renderChatHistory();

    // Phát âm thanh nhẹ nhàng
    playChatChime();
  }, 400);
}

// Hiệu ứng Bot đang suy nghĩ / gõ
function showTypingIndicator() {
  const container = document.getElementById('chatbot-messages');
  if (!container) return;

  let indicator = document.getElementById('chat-typing-indicator');
  if (!indicator) {
    const html = `
      <div id="chat-typing-indicator" class="chat-message-row bot-row typing-row">
        <div class="chat-msg-avatar">🤖</div>
        <div class="chat-bubble bot-bubble typing-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  }
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('chat-typing-indicator');
  if (indicator) indicator.remove();
}

// ==============================================================================
// ĐỘNG CƠ XỬ LÝ NGÔN NGỮ TỰ NHIÊN (NLP & KHO DỮ LIỆU THỜI GIAN THỰC)
// ==============================================================================
function generateBotAnswer(query) {
  const cleanQuery = removeVietnameseTones(query.toLowerCase().trim());
  const items = (window.DB && typeof window.DB.getItems === 'function') ? window.DB.getItems() : [];
  const suppliers = (window.DB && typeof window.DB.getSuppliers === 'function') ? window.DB.getSuppliers() : [];

  // 1. HỎI VỀ HÀNG NGUY CẤP / SẮP HẾT / HẾT HÀNG
  if (
    cleanQuery.includes('sap het') || 
    cleanQuery.includes('het hang') || 
    cleanQuery.includes('canh bao') || 
    cleanQuery.includes('nguy cap') || 
    cleanQuery.includes('duoi dinh muc') ||
    cleanQuery.includes('bao dong')
  ) {
    const urgent = items.filter(item => {
      const status = DB.getItemStatus(item.quantity, item.minThreshold);
      return status.code === 'OUT' || status.code === 'LOW';
    });

    if (urgent.length === 0) {
      return {
        text: '🎉 **Tuyệt vời!** Hiện tại toàn bộ vật tư trong kho đều đang ở mức an toàn trên định mức tối thiểu. Không có mặt hàng nào cần bổ sung khẩn cấp!'
      };
    }

    let listText = `⚠️ **Báo Cáo: Hiện có ${urgent.length} mặt hàng nguy cấp cần chú ý:**\n\n`;
    urgent.forEach((item, idx) => {
      const status = DB.getItemStatus(item.quantity, item.minThreshold);
      const icon = status.code === 'OUT' ? '🔴' : '🟡';
      listText += `${idx + 1}. ${icon} **${item.name}**\n   • Tồn: **${item.quantity} ${item.unit}** (Định mức: ${item.minThreshold} ${item.unit})\n   • Kệ: \`${item.location || 'N/A'}\` • [${status.label}]\n\n`;
    });

    return {
      text: listText.trim(),
      actionHtml: `
        <button class="btn btn-primary btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('operations.html')">
          ➕ Mở Phiếu Nhập Hàng Ngay
        </button>
      `
    };
  }

  // 2. HỎI VỀ NHÀ CUNG CẤP / ĐỐI TÁC / SỐ ĐIỆN THOẠI / EMAIL
  if (
    cleanQuery.includes('nha cung cap') || 
    cleanQuery.includes('ncc') || 
    cleanQuery.includes('doi tac') || 
    cleanQuery.includes('so dien thoai') || 
    cleanQuery.includes('sdt') || 
    cleanQuery.includes('email') || 
    cleanQuery.includes('lien he') ||
    cleanQuery.includes('hoa phat') ||
    cleanQuery.includes('vicem') ||
    cleanQuery.includes('cadivi') ||
    cleanQuery.includes('tien phong')
  ) {
    // Tìm đối tác cụ thể
    let matchedSup = suppliers.filter(s => {
      const nameClean = removeVietnameseTones(s.name.toLowerCase());
      const catClean = removeVietnameseTones((s.categories || '').toLowerCase());
      return nameClean.includes(cleanQuery) || cleanQuery.includes(nameClean.split(' ')[0]) || catClean.includes(cleanQuery);
    });

    if (matchedSup.length === 0) matchedSup = suppliers;

    let res = `🏢 **Danh Bạ Nhà Cung Cấp Đối Tác (${matchedSup.length} đơn vị):**\n\n`;
    matchedSup.slice(0, 3).forEach(s => {
      res += `• **${s.name}** (${'⭐'.repeat(s.rating || 5)})\n  📞 SĐT: [${s.phone}](tel:${s.phone})\n  ✉️ Email: [${s.email}](mailto:${s.email})\n  📍 ${s.address || 'Hà Nội'}\n\n`;
    });

    return {
      text: res.trim(),
      actionHtml: `
        <button class="btn btn-outline btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('suppliers.html')">
          🏢 Xem Đầy Đủ Danh Bạ Đối Tác
        </button>
      `
    };
  }

  // 3. HỎI VỀ TỔNG QUAN KHO / TÀI SẢN / THỐNG KÊ
  if (
    cleanQuery.includes('tong quan') || 
    cleanQuery.includes('tai san') || 
    cleanQuery.includes('gia tri kho') || 
    cleanQuery.includes('thong ke') || 
    cleanQuery.includes('bao cao') ||
    cleanQuery.includes('co bao nhieu vat tu') ||
    cleanQuery.includes('tong so')
  ) {
    let totalItems = items.length;
    let totalVal = 0;
    let outCount = 0;
    let lowCount = 0;

    items.forEach(item => {
      totalVal += (Number(item.quantity) * Number(item.priceImport || 0));
      const st = DB.getItemStatus(item.quantity, item.minThreshold);
      if (st.code === 'OUT') outCount++;
      else if (st.code === 'LOW') lowCount++;
    });

    return {
      text: `📊 **Tóm Tắt Báo Cáo Tài Sản Kho Hàng:**\n\n• **Tổng số mặt hàng:** ${totalItems} chủng loại\n• **Tổng giá trị tài sản:** **${DB.formatCurrency(totalVal)}**\n• **Mặt hàng hết hàng (Đỏ):** 🔴 ${outCount} mục\n• **Mặt hàng sắp hết (Vàng):** 🟡 ${lowCount} mục\n• **Độ an toàn kho:** ${Math.round(((totalItems - outCount - lowCount) / (totalItems || 1)) * 100)}%`,
      actionHtml: `
        <button class="btn btn-primary btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('analytics.html')">
          📈 Xem Biểu Đồ Phân Tích Chi Tiết
        </button>
      `
    };
  }

  // 4. HỎI VỀ VỊ TRÍ KỆ HÀNG (Ở ĐÂU, KỆ NÀO)
  const isAskingLocation = cleanQuery.includes('o dau') || cleanQuery.includes('vi tri') || cleanQuery.includes('ke nao') || cleanQuery.includes('nam o');

  // 5. TÌM KIẾM THEO TÊN VẬT TƯ / SKU / BARCODE
  const matchedItems = items.filter(item => {
    const nameClean = removeVietnameseTones(item.name.toLowerCase());
    const idClean = item.id.toLowerCase();
    const barcodeClean = (item.barcode || '').toLowerCase();
    const locClean = removeVietnameseTones((item.location || '').toLowerCase());

    return (
      cleanQuery.includes(idClean) ||
      cleanQuery.includes(barcodeClean) ||
      cleanQuery.includes(locClean) ||
      nameClean.split(' ').some(word => word.length >= 2 && cleanQuery.includes(word)) ||
      cleanQuery.split(' ').some(word => word.length >= 3 && nameClean.includes(word))
    );
  });

  if (matchedItems.length > 0) {
    const topItem = matchedItems[0];
    const status = DB.getItemStatus(topItem.quantity, topItem.minThreshold);

    if (isAskingLocation) {
      return {
        text: `📍 Vật tư **${topItem.name}** (Mã: \`${topItem.id}\`) hiện được xếp tại:\n\n• **Vị trí kệ:** **\`${topItem.location || 'Kệ A'}\`**\n• **Khu vực:** ${topItem.warehouse}\n• **Tồn hiện tại:** **${topItem.quantity} ${topItem.unit}** [${status.label}]`,
        actionHtml: `
          <button class="btn btn-outline btn-sm" style="width:100%; margin-top:6px;" onclick="window.quickRestock('${topItem.id}')">
            📦 Nhập Thêm Hàng Này
          </button>
        `
      };
    }

    let reply = `📦 **Thông Tin Vật Tư: ${topItem.name}**\n\n`;
    reply += `• **Mã SKU:** \`${topItem.id}\` | **Barcode:** \`${topItem.barcode || 'N/A'}\`\n`;
    reply += `• **Tồn kho:** **${topItem.quantity} ${topItem.unit}** (Định mức tối thiểu: ${topItem.minThreshold} ${topItem.unit})\n`;
    reply += `• **Trạng thái:** **${status.label}** (${status.code === 'OUT' ? '🔴 Hết hàng' : status.code === 'LOW' ? '🟡 Sắp hết' : '🟢 Đủ an toàn'})\n`;
    reply += `• **Vị trí lưu kho:** \`${topItem.location || 'Kệ A'}\` (${topItem.warehouse})\n`;
    reply += `• **Đơn giá:** Nhập ${DB.formatCurrency(topItem.priceImport)} | Xuất ${DB.formatCurrency(topItem.priceExport)}`;

    let actionBtn = `
      <div style="display:flex; gap:6px; margin-top:8px;">
        <button class="btn btn-primary btn-sm" style="flex:1;" onclick="window.quickRestock('${topItem.id}')">➕ Nhập hàng</button>
        <button class="btn btn-outline btn-sm" style="flex:1;" onclick="window.smoothNavigate('inventory.html')">🔍 Danh mục</button>
      </div>
    `;

    return {
      text: reply,
      actionHtml: actionBtn
    };
  }

  // 6. LỜI CHÀO & CÂU HỎI XÃ GIAO
  if (
    cleanQuery === 'xin chao' || 
    cleanQuery === 'chao' || 
    cleanQuery === 'hello' || 
    cleanQuery === 'hi' ||
    cleanQuery.includes('tro giup') ||
    cleanQuery.includes('help')
  ) {
    return {
      text: 'Chào bạn! 👋 Tôi có thể hỗ trợ bạn:\n\n1. 🔍 **Tra cứu tồn kho:** *"Xi măng còn bao nhiêu?", "Kiểm tra VT001"*\n2. 📍 **Vị trí kệ:** *"Thép để ở đâu?", "Que hàn nằm kệ nào?"*\n3. ⚠️ **Cảnh báo kho:** *"Hàng nào sắp hết?", "Báo cáo nguy cấp"*\n4. 🏢 **Đối tác:** *"Số điện thoại Hòa Phát", "Nhà cung cấp xi măng"*\n5. 💰 **Tài sản:** *"Tổng giá trị kho hiện tại"*\n\nBạn hãy thử chọn một gợi ý phía dưới nhé!'
    };
  }

  // 7. TRƯỜNG HỢP KHÔNG TÌM THẤY KẾT QUẢ CHÍNH XÁC
  return {
    text: `Xin lỗi, tôi chưa tìm thấy vật tư hoặc thông tin phù hợp với từ khóa **"${query}"** trong kho.\n\n💡 **Gợi ý tra cứu:**\n• Thử tìm theo tên ngắn gọn: *thép, xi măng, gạch, sơn, dây cáp, que hàn...*\n• Hoặc tra theo mã SKU: *VT001, VT002, VT003...*\n• Hoặc bấm vào các nút gợi ý câu hỏi nhanh bên dưới!`,
    actionHtml: `
      <button class="btn btn-outline btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('inventory.html')">
        📦 Mở Danh Mục Tra Cứu Toàn Bộ Vật Tư
      </button>
    `
  };
}

// Hàm bỏ dấu Tiếng Việt để tìm kiếm thông minh không phân biệt có/không dấu
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

// Chuyển đổi Markdown cơ bản sang HTML an toàn
function formatMarkdownText(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--primary); font-weight:600; text-decoration:underline;">$1</a>')
    .replace(/\n/g, '<br>');
  return html;
}

// Âm thanh thông báo nhẹ nhàng qua Web Audio API thuần (Không cần tải file mp3)
function playChatChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Nốt 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.04, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);

    // Nốt 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain2.gain.setValueAtTime(0.04, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Trình duyệt chặn âm thanh tự động, bỏ qua an toàn
  }
}

// Tự động khởi chạy Chatbot khi tài liệu sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmartChatbot);
} else {
  initSmartChatbot();
}

window.initSmartChatbot = initSmartChatbot;
window.toggleChatbot = toggleChatbot;
window.clearChatHistory = clearChatHistory;
window.handleChipClick = handleChipClick;
window.handleChatSubmit = handleChatSubmit;
