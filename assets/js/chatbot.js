/**
 * ==============================================================================
 * MODULE TRỢ LÝ ẢO THỦ KHO AI (chatbot.js) - PHIÊN BẢN ĐIỀU HÀNH TƯƠNG TÁC (ACTION-DRIVEN)
 * Phụ trách: Shared AI Assistant (100% Vanilla HTML5, CSS3 & JavaScript ES6)
 * Tính năng thông minh:
 * 1. TRA CỨU: Tồn kho, vị trí kệ, hàng sắp hết, thông tin nhà cung cấp, tổng tài sản
 * 2. ĐIỀU HÀNH THAO TÁC (ACTIONS):
 *    - Nhập thêm hàng trực tiếp từ đoạn chat (tự động nhận diện số lượng + tên vật tư)
 *    - Xuất kho vật tư trực tiếp có kiểm tra tồn kho an toàn
 *    - Trích xuất & In hóa đơn / Phiếu xuất/nhập kho (Mẫu số 02-VT chuẩn Bộ Tài chính)
 *    - Xử lý xóa đơn hàng / xóa vật tư (theo quy tắc an toàn kế toán kho)
 *    - Tải bản sao lưu (.json) ngay từ chat
 * 3. Gợi ý câu hỏi nhanh (Interactive Suggestion Chips)
 * 4. Lưu trữ và phục hồi lịch sử trò chuyện qua localStorage
 * ==============================================================================
 */

const CHAT_STORAGE_KEY = 'SMART_KHO_CHAT_HISTORY';

// Tin nhắn chào mừng ban đầu
const BOT_GREETING = {
  sender: 'bot',
  text: 'Xin chào! Tôi là **Trợ Lý Ảo Thủ Kho AI** 🤖\n\nTôi có thể giúp bạn:\n• 🔍 **Tra cứu:** Tồn kho, vị trí kệ, hàng sắp hết, SĐT đối tác.\n• ⚡ **Điều hành:** Nhập thêm hàng, xuất kho, trích xuất & in phiếu kho (Mẫu 02-VT), xóa đơn/vật tư an toàn.\n\nBạn muốn thực hiện thao tác gì?',
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
        <span class="bot-label-tooltip">Trợ Lý Điều Hành AI</span>
      </button>

      <!-- HỘP THOẠI TRÒ CHUYỆN (CHAT PANEL) -->
      <div id="chatbot-panel" class="chatbot-panel" style="display: none;">
        <!-- HEADER -->
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">🤖</div>
            <div>
              <h4 class="chat-title">Trợ Lý Kho AI • Action Mode</h4>
              <span class="chat-status"><span class="status-dot-live"></span> Sẵn sàng điều hành & In phiếu</span>
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
            <button type="button" class="chat-chip" onclick="handleChipClick('Nhập thêm hàng')">📥 Nhập thêm hàng?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Trích xuất hóa đơn')">🖨️ In hóa đơn / Phiếu kho?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Hàng nào sắp hết?')">⚠️ Hàng sắp hết?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Kiểm tra xi măng')">📦 Tồn kho xi măng?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Thép để ở kệ nào?')">📍 Vị trí thép?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('SĐT Hòa Phát')">🏢 SĐT Hòa Phát?</button>
            <button type="button" class="chat-chip" onclick="handleChipClick('Xóa đơn hàng')">🗑️ Xóa đơn hàng?</button>
          </div>
        </div>

        <!-- FORM NHẬP TIN NHẮN -->
        <form id="chatbot-form" class="chat-input-form" onsubmit="handleChatSubmit(event)">
          <input 
            type="text" 
            id="chatbot-input" 
            class="chat-input-field" 
            placeholder="Gõ lệnh: nhập hàng, in hóa đơn, xóa đơn..." 
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
      text: 'Đã làm mới đoạn chat! Bạn có thể yêu cầu tôi nhập hàng, xuất kho, in hóa đơn hoặc tra cứu tồn kho bất cứ lúc nào.',
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

    playChatChime();
  }, 350);
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
// ĐỘNG CƠ ĐIỀU HÀNH & XỬ LÝ LỆNH THÔNG MINH (ACTION & NLP ENGINE)
// ==============================================================================
function generateBotAnswer(query) {
  const cleanQuery = removeVietnameseTones(query.toLowerCase().trim());
  const items = (window.DB && typeof window.DB.getItems === 'function') ? window.DB.getItems() : [];
  const suppliers = (window.DB && typeof window.DB.getSuppliers === 'function') ? window.DB.getSuppliers() : [];
  const logs = (window.DB && typeof window.DB.getLogs === 'function') ? window.DB.getLogs() : [];

  // Trích xuất số lượng nếu có trong câu hỏi (VD: "nhập 10 bao xi măng" -> 10)
  const numMatch = query.match(/\b(\d+)\b/);
  const parsedQty = numMatch ? parseInt(numMatch[1], 10) : null;

  // Tìm mặt hàng được nhắc tới trong câu hỏi
  const matchedItem = items.find(item => {
    const nameClean = removeVietnameseTones(item.name.toLowerCase());
    const idClean = item.id.toLowerCase();
    return cleanQuery.includes(idClean) || 
           nameClean.split(' ').some(w => w.length >= 3 && cleanQuery.includes(w));
  });

  // ----------------------------------------------------------------------------
  // 1. LỆNH TRÍCH XUẤT HÓA ĐƠN / IN PHIẾU XUẤT - NHẬP KHO (MẪU SỐ 02-VT)
  // ----------------------------------------------------------------------------
  if (
    cleanQuery.includes('hoa don') || 
    cleanQuery.includes('in phieu') || 
    cleanQuery.includes('trich xuat') || 
    cleanQuery.includes('xuat hoa don') ||
    cleanQuery.includes('in hoa don') ||
    cleanQuery.includes('phieu xuat kho') ||
    cleanQuery.includes('phieu nhap kho') ||
    cleanQuery.includes('in chung tu')
  ) {
    if (logs.length === 0) {
      return {
        text: 'Chưa có phiếu xuất/nhập nào trong sổ nhật ký để in hóa đơn.\n\nBạn có thể thực hiện một lệnh nhập hoặc xuất kho trước nhé!',
        actionHtml: `
          <button class="btn btn-primary btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('operations.html')">
            🔄 Đi Đến Trang Lập Phiếu Kho
          </button>
        `
      };
    }

    const latest = logs[0];
    const isImport = latest.type === 'IMPORT';
    const typeLabel = isImport ? 'Phiếu Nhập Kho' : 'Phiếu Xuất Kho';

    return {
      text: `📄 **Tôi đã tìm thấy ${typeLabel} gần nhất để trích xuất hóa đơn:**\n\n• **Mã phiếu:** \`${latest.id}\`\n• **Vật tư:** **${latest.itemName}** (${latest.changeQty} mục)\n• **Đối tác / Đơn vị:** ${latest.partnerName}\n• **Thời gian lập:** ${new Date(latest.timestamp).toLocaleString('vi-VN')}\n\nBạn có thể bấm nút bên dưới để mở bản in theo chuẩn **Mẫu số 02-VT của Bộ Tài chính**:`,
      actionHtml: `
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
          <button class="btn btn-primary btn-sm" style="width:100%; font-weight:700;" onclick="botPrintVoucher('${latest.id}')">
            🖨️ In Phiếu / Xuất Hóa Đơn Ngay (Mẫu 02-VT)
          </button>
          <button class="btn btn-outline btn-sm" style="width:100%;" onclick="window.smoothNavigate('history.html')">
            📜 Xem Toàn Bộ Lịch Sử Phiếu Trong Sổ Kho
          </button>
        </div>
      `
    };
  }

  // ----------------------------------------------------------------------------
  // 2. LỆNH NHẬP THÊM HÀNG (IMPORT ACTION)
  // ----------------------------------------------------------------------------
  if (
    cleanQuery.startsWith('nhap') || 
    cleanQuery.includes('nhap them') || 
    cleanQuery.includes('nhap hang') || 
    cleanQuery.includes('nhap kho') ||
    cleanQuery.includes('mua them') ||
    cleanQuery.includes('dat hang')
  ) {
    // Trường hợp A: Đã xác định được mặt hàng cụ thể
    if (matchedItem) {
      const qty = parsedQty || 10;
      const totalAmount = qty * (matchedItem.priceImport || 0);

      return {
        text: `📥 **LẬP LỆNH NHẬP KHO NHANH:**\n\n• **Vật tư:** **${matchedItem.name}** (\`${matchedItem.id}\`)\n• **Số lượng nhập:** **${qty} ${matchedItem.unit}**\n• **Tồn hiện tại:** ${matchedItem.quantity} ➔ **Tồn mới:** <strong style="color:#10b981;">${matchedItem.quantity + qty} ${matchedItem.unit}</strong>\n• **Đơn giá nhập:** ${DB.formatCurrency(matchedItem.priceImport)} | **Thành tiền:** **${DB.formatCurrency(totalAmount)}**\n• **Vị trí lưu kho:** \`${matchedItem.location || 'Kệ A'}\``,
        actionHtml: `
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
            <button class="btn btn-success btn-sm" style="width:100%; font-weight:700;" onclick="botExecuteImport('${matchedItem.id}', ${qty}, ${matchedItem.priceImport || 0}, 'Nhập nhanh qua Trợ lý AI')">
              ⚡ Xác Nhận Nhập Kho ${qty} ${matchedItem.unit} Ngay
            </button>
            <div style="display:flex; gap:4px;">
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="botExecuteImport('${matchedItem.id}', 5, ${matchedItem.priceImport || 0})">+5</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="botExecuteImport('${matchedItem.id}', 20, ${matchedItem.priceImport || 0})">+20</button>
              <button class="btn btn-outline btn-sm" style="flex:1;" onclick="botExecuteImport('${matchedItem.id}', 50, ${matchedItem.priceImport || 0})">+50</button>
            </div>
          </div>
        `
      };
    }

    // Trường hợp B: Nói chung "nhập thêm hàng" -> Gợi ý các mặt hàng đang cần nhập gấp
    const urgentItems = items.filter(i => {
      const st = DB.getItemStatus(i.quantity, i.minThreshold);
      return st.code === 'OUT' || st.code === 'LOW';
    });

    if (urgentItems.length > 0) {
      let list = `📥 **Bạn muốn nhập mặt hàng nào? Dưới đây là các mặt hàng đang nguy cấp nhất:**\n\n`;
      urgentItems.slice(0, 3).forEach((item, idx) => {
        list += `${idx + 1}. **${item.name}** (Tồn: ${item.quantity} / Tối thiểu: ${item.minThreshold} ${item.unit})\n`;
      });
      list += `\n*Hãy bấm nhanh vào mặt hàng bên dưới để tiến hành nhập:*`;

      const buttons = urgentItems.slice(0, 3).map(item => `
        <button class="btn btn-primary btn-sm" style="width:100%; margin-bottom:4px; text-align:left;" onclick="botExecuteImport('${item.id}', ${item.minThreshold || 10}, ${item.priceImport || 0})">
          ➕ Nhập ${item.minThreshold || 10} ${item.unit} ${item.name}
        </button>
      `).join('');

      return {
        text: list,
        actionHtml: `
          <div style="margin-top:8px;">
            ${buttons}
            <button class="btn btn-outline btn-sm" style="width:100%; margin-top:4px;" onclick="window.smoothNavigate('operations.html')">
              📝 Mở Phiếu Nhập Thủ Công Toàn Diện
            </button>
          </div>
        `
      };
    }

    return {
      text: 'Kho hiện đang đầy đủ định mức an toàn. Bạn muốn nhập thêm mặt hàng nào? Bạn có thể gõ: *"Nhập 10 thép"*, *"Nhập 20 xi măng"*, hoặc mở trang Lập phiếu:',
      actionHtml: `
        <button class="btn btn-primary btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('operations.html')">
          🔄 Mở Trang Lập Phiếu Nhập Kho
        </button>
      `
    };
  }

  // ----------------------------------------------------------------------------
  // 3. LỆNH XUẤT KHO VẬT TƯ (EXPORT ACTION)
  // ----------------------------------------------------------------------------
  if (
    cleanQuery.startsWith('xuat') || 
    cleanQuery.includes('xuat kho') || 
    cleanQuery.includes('xuat hang')
  ) {
    if (matchedItem) {
      const qty = parsedQty || 1;
      if (matchedItem.quantity < qty) {
        return {
          text: `⚠️ **Không đủ hàng để xuất!**\n\nVật tư **${matchedItem.name}** hiện chỉ còn **${matchedItem.quantity} ${matchedItem.unit}** trong kho, không đủ để xuất **${qty} ${matchedItem.unit}**.\n\nBạn hãy kiểm tra lại hoặc nhập thêm hàng trước nhé!`
        };
      }

      return {
        text: `📤 **LẬP LỆNH XUẤT KHO:**\n\n• **Vật tư:** **${matchedItem.name}** (\`${matchedItem.id}\`)\n• **Số lượng xuất:** **${qty} ${matchedItem.unit}**\n• **Tồn hiện tại:** ${matchedItem.quantity} ➔ **Còn lại sau xuất:** **${matchedItem.quantity - qty} ${matchedItem.unit}**\n• **Đơn giá xuất:** ${DB.formatCurrency(matchedItem.priceExport)}`,
        actionHtml: `
          <button class="btn btn-danger btn-sm" style="width:100%; font-weight:700; margin-top:8px;" onclick="botExecuteExport('${matchedItem.id}', ${qty}, 'Xuất kho nhanh qua Trợ lý AI')">
            🚀 Xác Nhận Xuất ${qty} ${matchedItem.unit} Khỏi Kho
          </button>
        `
      };
    }

    return {
      text: 'Bạn muốn xuất mặt hàng nào? Hãy gõ cú pháp rõ ràng, ví dụ: *"Xuất 2 tấn thép"*, *"Xuất 5 bao xi măng"* hoặc mở trang Lập phiếu Xuất:',
      actionHtml: `
        <button class="btn btn-primary btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('operations.html')">
          🔄 Mở Trang Lập Phiếu Xuất Kho
        </button>
      `
    };
  }

  // ----------------------------------------------------------------------------
  // 4. LỆNH XÓA ĐƠN HÀNG / XÓA GIAO DỊCH / XÓA VẬT TƯ (DELETE ACTION)
  // ----------------------------------------------------------------------------
  if (
    cleanQuery.includes('xoa don hang') || 
    cleanQuery.includes('xoa don') || 
    cleanQuery.includes('xoa giao dich') || 
    cleanQuery.includes('xoa phieu') ||
    cleanQuery.includes('xoa vat tu') ||
    cleanQuery.startsWith('xoa ')
  ) {
    // Trường hợp A: Muốn xóa vật tư cụ thể
    if (matchedItem) {
      if (matchedItem.quantity > 0) {
        return {
          text: `❌ **Không Thể Xóa Vật Tư Này!**\n\nVật tư **${matchedItem.name}** (\`${matchedItem.id}\`) hiện **vẫn còn tồn kho (${matchedItem.quantity} ${matchedItem.unit})**.\n\n🔒 **Quy tắc an toàn kho:** Bạn không được phép xóa vật tư khi số lượng tồn > 0 để tránh sai lệch thất thoát tài sản! Hãy xuất hết tồn kho về 0 trước khi xóa.`,
          actionHtml: `
            <button class="btn btn-outline btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('inventory.html')">
              📦 Xem Vật Tư Trong Danh Mục
            </button>
          `
        };
      } else {
        return {
          text: `⚠️ **XÁC NHẬN XÓA MÃ VẬT TƯ:**\n\nVật tư **${matchedItem.name}** (\`${matchedItem.id}\`) hiện có Tồn kho = 0 (Đủ điều kiện xóa an toàn).\n\nBạn có chắc chắn muốn xóa mặt hàng này khỏi danh mục?`,
          actionHtml: `
            <button class="btn btn-danger btn-sm" style="width:100%; font-weight:700; margin-top:8px;" onclick="botExecuteDelete('${matchedItem.id}')">
              🗑️ Xóa Vĩnh Viễn Mã ${matchedItem.id}
            </button>
          `
        };
      }
    }

    // Trường hợp B: Muốn xóa đơn hàng / lịch sử giao dịch
    return {
      text: `⚠️ **Quy Chuẩn Kế Toán & Quản Lý Kho:**\n\nCác phiếu Nhập / Xuất kho đã ký duyệt và lưu vào Sổ nhật ký **không được tự ý xóa từng dòng** để bảo vệ tính toàn vẹn dữ liệu và đối soát kiểm kê.\n\nNếu bạn đang **chạy thử nghiệm (Test/Demo)** và muốn làm sạch hoặc đưa toàn bộ hệ thống về ban đầu, hãy chọn tùy chọn bên dưới:`,
      actionHtml: `
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
          <button class="btn btn-danger btn-sm" style="width:100%; font-weight:700;" onclick="botExecuteReset()">
            🔄 Reset Toàn Bộ Dữ Liệu Gốc (Xóa Giao Dịch Test)
          </button>
          <button class="btn btn-outline btn-sm" style="width:100%;" onclick="DB.exportBackup()">
            📥 Tải Bản Sao Lưu Trước Khi Reset (.json)
          </button>
        </div>
      `
    };
  }

  // ----------------------------------------------------------------------------
  // 5. LỆNH SAO LƯU DỮ LIỆU / TRÍCH XUẤT FILE
  // ----------------------------------------------------------------------------
  if (
    cleanQuery.includes('sao luu') || 
    cleanQuery.includes('backup') || 
    cleanQuery.includes('xuat json') || 
    cleanQuery.includes('tai file')
  ) {
    setTimeout(() => {
      if (window.DB && typeof window.DB.exportBackup === 'function') {
        window.DB.exportBackup();
      }
    }, 600);

    return {
      text: `📥 **Đã Kích Hoạt Tải Bản Sao Lưu Kho!**\n\nHệ thống đang tải xuống tệp \`backup_kho_smartkho_*.json\` chứa đầy đủ danh mục hàng hóa, nhà cung cấp và sổ nhật ký giao dịch vào máy tính của bạn.`
    };
  }

  // ----------------------------------------------------------------------------
  // 6. CÁC LỆNH TRA CỨU ĐÃ CÓ (HÀNG SẮP HẾT, NCC, VỊ TRÍ, TỔNG QUAN)
  // ----------------------------------------------------------------------------
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

  // Tra cứu Nhà cung cấp
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

  // Tra cứu Tổng quan tài sản
  if (
    cleanQuery.includes('tong quan') || 
    cleanQuery.includes('tai san') || 
    cleanQuery.includes('gia tri kho') || 
    cleanQuery.includes('thong ke') || 
    cleanQuery.includes('bao cao')
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

  // Tra cứu theo vị trí kệ hoặc tên vật tư
  if (matchedItem) {
    const status = DB.getItemStatus(matchedItem.quantity, matchedItem.minThreshold);
    const isAskingLoc = cleanQuery.includes('o dau') || cleanQuery.includes('vi tri') || cleanQuery.includes('ke nao') || cleanQuery.includes('nam o');

    if (isAskingLoc) {
      return {
        text: `📍 Vật tư **${matchedItem.name}** (Mã: \`${matchedItem.id}\`) hiện được xếp tại:\n\n• **Vị trí kệ:** **\`${matchedItem.location || 'Kệ A'}\`**\n• **Khu vực:** ${matchedItem.warehouse}\n• **Tồn hiện tại:** **${matchedItem.quantity} ${matchedItem.unit}** [${status.label}]`,
        actionHtml: `
          <button class="btn btn-outline btn-sm" style="width:100%; margin-top:6px;" onclick="botExecuteImport('${matchedItem.id}', 10, ${matchedItem.priceImport || 0})">
            📥 Nhập Thêm 10 ${matchedItem.unit} Hàng Này
          </button>
        `
      };
    }

    return {
      text: `📦 **Thông Tin Vật Tư: ${matchedItem.name}**\n\n• **Mã SKU:** \`${matchedItem.id}\` | **Barcode:** \`${matchedItem.barcode || 'N/A'}\`\n• **Tồn kho:** **${matchedItem.quantity} ${matchedItem.unit}** (Định mức tối thiểu: ${matchedItem.minThreshold} ${matchedItem.unit})\n• **Trạng thái:** **${status.label}** (${status.code === 'OUT' ? '🔴 Hết hàng' : status.code === 'LOW' ? '🟡 Sắp hết' : '🟢 Đủ an toàn'})\n• **Vị trí lưu kho:** \`${matchedItem.location || 'Kệ A'}\` (${matchedItem.warehouse})\n• **Đơn giá:** Nhập ${DB.formatCurrency(matchedItem.priceImport)} | Xuất ${DB.formatCurrency(matchedItem.priceExport)}`,
      actionHtml: `
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="botExecuteImport('${matchedItem.id}', 10, ${matchedItem.priceImport || 0})">➕ Nhập 10 ${matchedItem.unit}</button>
          <button class="btn btn-outline btn-sm" style="flex:1;" onclick="window.smoothNavigate('inventory.html')">🔍 Danh mục</button>
        </div>
      `
    };
  }

  // Lời chào
  if (cleanQuery === 'xin chao' || cleanQuery === 'chao' || cleanQuery === 'hello' || cleanQuery === 'hi') {
    return {
      text: 'Chào bạn! 👋 Tôi có thể trực tiếp thực thi các lệnh cho bạn:\n\n1. 📥 **Nhập hàng:** *"Nhập 10 xi măng"*, *"Nhập thêm hàng"*\n2. 📤 **Xuất kho:** *"Xuất 2 tấn thép"*\n3. 🖨️ **Hóa đơn:** *"In hóa đơn"*, *"Trích xuất phiếu xuất kho"*\n4. 🗑️ **Xóa:** *"Xóa đơn hàng"*, *"Xóa vật tư"*\n5. 🔍 **Tra cứu:** *"Xi măng còn bao nhiêu?", "Thép để ở đâu?"*\n\nHãy thử gõ một lệnh hoặc bấm nút gợi ý bên dưới nhé!'
    };
  }

  // Mặc định không hiểu
  return {
    text: `Tôi chưa hiểu rõ yêu cầu **"${query}"**.\n\n💡 **Bạn có thể yêu cầu tôi thực hiện:**\n• 📥 *"Nhập thêm 20 bao xi măng"*\n• 🖨️ *"Trích xuất hóa đơn"* hoặc *"In phiếu kho"*\n• 🗑️ *"Xóa đơn hàng"* hoặc *"Xóa vật tư"*\n• 🔍 *"Kiểm tra tồn kho thép"*`,
    actionHtml: `
      <div style="display:flex; gap:6px; margin-top:6px;">
        <button class="btn btn-primary btn-sm" style="flex:1;" onclick="handleChipClick('Nhập thêm hàng')">📥 Nhập hàng</button>
        <button class="btn btn-outline btn-sm" style="flex:1;" onclick="handleChipClick('Trích xuất hóa đơn')">🖨️ In hóa đơn</button>
      </div>
    `
  };
}

// ==============================================================================
// CÁC HÀM THỰC THI HÀNH ĐỘNG (ACTION EXECUTORS TRỰC TIẾP TỪ CHATBOT)
// ==============================================================================

// 1. Thực hiện Nhập Kho Trực Tiếp
window.botExecuteImport = function(itemId, qty, price, reason) {
  qty = parseInt(qty, 10);
  const item = DB.getItemById(itemId);
  if (!item) {
    DB.showToast('Không tìm thấy vật tư để nhập!', 'error');
    return;
  }

  const res = DB.importStock(
    itemId, 
    qty, 
    price || item.priceImport, 
    'Công ty Đối tác Cung ứng', 
    reason || 'Nhập nhanh qua Trợ lý AI', 
    'Nguyễn Hoàng Anh'
  );

  if (res.success) {
    DB.showToast(`Đã nhập thành công ${qty} ${item.unit} vào kho!`, 'success');
    
    // Thêm tin nhắn xác nhận của bot vào chat
    const history = getChatHistory();
    const updatedItem = DB.getItemById(itemId);
    const successMsg = {
      sender: 'bot',
      text: `✅ **LỆNH NHẬP KHO THỰC HIỆN THÀNH CÔNG!**\n\n• Vật tư: **${updatedItem.name}** (\`${updatedItem.id}\`)\n• Đã nhập thêm: **${qty} ${updatedItem.unit}**\n• Tồn kho mới hiện tại: <strong style="color:#10b981;">${updatedItem.quantity} ${updatedItem.unit}</strong>\n• Vị trí lưu kho: \`${updatedItem.location || 'Kệ A'}\`\n\nToàn bộ KPIs, sơ đồ kệ và biểu đồ phân tích đã được cập nhật thời gian thực!`,
      actionHtml: `
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn btn-primary btn-sm" style="flex:1; font-weight:700;" onclick="botPrintVoucher('latest')">
            🖨️ In Phiếu Nhập Kho Ngay
          </button>
          <button class="btn btn-outline btn-sm" style="flex:1;" onclick="window.smoothNavigate('index.html')">
            📊 Xem Bảng Tổng Quan
          </button>
        </div>
      `,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    history.push(successMsg);
    saveChatHistory(history);
    renderChatHistory();
    playChatChime();
  } else {
    DB.showToast(res.message, 'error');
  }
};

// 2. Thực hiện Xuất Kho Trực Tiếp
window.botExecuteExport = function(itemId, qty, reason) {
  qty = parseInt(qty, 10);
  const item = DB.getItemById(itemId);
  if (!item) {
    DB.showToast('Không tìm thấy vật tư để xuất!', 'error');
    return;
  }

  const res = DB.exportStock(
    itemId, 
    qty, 
    'Đội thi công / Bộ phận nhận hàng', 
    reason || 'Xuất kho nhanh qua Trợ lý AI', 
    'Nguyễn Hoàng Anh'
  );

  if (res.success) {
    DB.showToast(`Đã xuất thành công ${qty} ${item.unit} khỏi kho!`, 'success');

    const history = getChatHistory();
    const updatedItem = DB.getItemById(itemId);
    const successMsg = {
      sender: 'bot',
      text: `✅ **LỆNH XUẤT KHO THỰC HIỆN THÀNH CÔNG!**\n\n• Vật tư: **${updatedItem.name}** (\`${updatedItem.id}\`)\n• Đã xuất: **${qty} ${updatedItem.unit}**\n• Tồn kho còn lại: <strong style="color:#2563eb;">${updatedItem.quantity} ${updatedItem.unit}</strong>\n\nPhiếu xuất kho Mẫu 02-VT đã được lập và ghi vào sổ nhật ký kho.`,
      actionHtml: `
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn btn-primary btn-sm" style="flex:1; font-weight:700;" onclick="botPrintVoucher('latest')">
            🖨️ In Phiếu Xuất Kho (Mẫu 02-VT)
          </button>
          <button class="btn btn-outline btn-sm" style="flex:1;" onclick="window.smoothNavigate('history.html')">
            📜 Xem Sổ Kho
          </button>
        </div>
      `,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    history.push(successMsg);
    saveChatHistory(history);
    renderChatHistory();
    playChatChime();
  } else {
    DB.showToast(res.message, 'error');
  }
};

// 3. Thực hiện Xóa Vật Tư
window.botExecuteDelete = function(itemId) {
  const res = DB.deleteItem(itemId);
  if (res.success) {
    DB.showToast(res.message, 'success');
    const history = getChatHistory();
    const newMsg = {
      sender: 'bot',
      text: `🗑️ **ĐÃ XÓA VẬT TƯ THÀNH CÔNG!**\n\nMã vật tư \`${itemId}\` đã được xóa an toàn khỏi danh mục do số lượng tồn kho bằng 0.`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    history.push(newMsg);
    saveChatHistory(history);
    renderChatHistory();
  } else {
    DB.showToast(res.message, 'error');
  }
};

// 4. Thực hiện Reset Dữ Liệu Gốc (Xóa Giao Dịch Test)
window.botExecuteReset = function() {
  if (confirm('Bạn có chắc chắn muốn reset toàn bộ dữ liệu kho về trạng thái ban đầu? Toàn bộ giao dịch thử nghiệm sẽ được làm sạch.')) {
    DB.resetDefault();
    DB.showToast('Đã khôi phục dữ liệu gốc thành công!', 'success');
    const history = getChatHistory();
    const newMsg = {
      sender: 'bot',
      text: `🔄 **ĐÃ RESET TOÀN BỘ KHO VỀ BAN ĐẦU!**\n\nToàn bộ 12 vật tư chuẩn, 4 nhà cung cấp và 8 phiếu giao dịch mẫu đã được phục hồi sạch sẽ.`,
      actionHtml: `
        <button class="btn btn-outline btn-sm" style="width:100%; margin-top:6px;" onclick="window.smoothNavigate('index.html')">
          📊 Trở Về Bảng Điều Khiển
        </button>
      `,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    history.push(newMsg);
    saveChatHistory(history);
    renderChatHistory();
  }
};

// 5. Trích Xuất & In Phiếu Xuất/Nhập Kho Mẫu số 02-VT Từ Bất Kỳ Trang Nào
window.botPrintVoucher = function(logId) {
  const logs = DB.getLogs();
  if (logs.length === 0) {
    DB.showToast('Chưa có phiếu giao dịch nào để in!', 'warning');
    return;
  }

  let log = logs[0];
  if (logId && logId !== 'latest') {
    log = logs.find(l => l.id === logId) || logs[0];
  }

  const item = DB.getItemById(log.itemId) || { id: log.itemId, name: log.itemName, unit: 'Cái', barcode: '8930000000000', warehouse: 'Tổng kho A' };
  const isImport = log.type === 'IMPORT';
  const price = log.price || (isImport ? item.priceImport : item.priceExport) || 0;
  const total = (log.changeQty || 0) * price;
  const dateObj = new Date(log.timestamp);

  // Tạo hoặc cập nhật modal in phiếu toàn cục
  let printModal = document.getElementById('bot-print-modal');
  if (!printModal) {
    printModal = document.createElement('div');
    printModal.id = 'bot-print-modal';
    printModal.className = 'modal-overlay';
    document.body.appendChild(printModal);
  }

  printModal.innerHTML = `
    <div class="modal-box" style="max-width: 780px;">
      <div class="modal-header">
        <h3 class="modal-title">🖨️ Bản Xem Trước In Phiếu Kho (Mẫu số 02-VT)</h3>
        <button class="modal-close" onclick="document.getElementById('bot-print-modal').classList.remove('active')">&times;</button>
      </div>
      <div class="modal-body" style="padding: 24px; background: #fff;" id="bot-printable-area">
        <div class="voucher-gov-header" style="display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:12px; margin-bottom:16px;">
          <div>
            <strong style="font-size:14px;">Đơn vị: CÔNG TY QUẢN TRỊ SMART KHO</strong><br>
            <span style="font-size:12px; color:#475569;">Bộ phận: Ban Điều Phối & Quản Lý Kho Vật Tư</span><br>
            <span style="font-size:12px; color:#475569;">Địa điểm: <strong>Tổng kho A - TP. Hà Nội</strong></span>
          </div>
          <div style="text-align: right;">
            <strong style="font-size:14px;">Mẫu số: 02-VT</strong><br>
            <span style="font-size:11.5px; color:#64748b;">(Ban hành theo TT 200/2014/TT-BTC)</span><br>
            <span style="font-size:12px;">Mã phiếu: <strong>${log.id}</strong></span>
          </div>
        </div>

        <div style="text-align: center; margin: 16px 0;">
          <h2 style="font-size: 19px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
            ${isImport ? 'PHIẾU NHẬP KHO VẬT TƯ' : 'PHIẾU XUẤT KHO VẬT TƯ'}
          </h2>
          <div style="font-size: 13px; font-style: italic; color: #475569; margin-top: 4px;">
            Ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()} (Lúc ${dateObj.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})})
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 16px; background:#f8fafc; padding:12px; border-radius:8px;">
          <div>- ${isImport ? 'Nhà cung cấp / Đối tác:' : 'Người / Đơn vị nhận hàng:'} <strong>${log.partnerName}</strong></div>
          <div>- Thủ kho phụ trách: <strong>${log.operator || 'Nguyễn Hoàng Anh'}</strong></div>
          <div>- Lý do lập phiếu: <em>${log.reason}</em></div>
          <div>- Địa điểm lưu kho: <strong>${item.warehouse} (${item.location || 'Kệ A'})</strong></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f1f5f9; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a;">
              <th style="padding: 8px; text-align: center;">STT</th>
              <th style="padding: 8px; text-align: left;">Tên Nhãn Hiệu Vật Tư</th>
              <th style="padding: 8px; text-align: center;">Mã SKU</th>
              <th style="padding: 8px; text-align: center;">ĐVT</th>
              <th style="padding: 8px; text-align: center;">Số Lượng</th>
              <th style="padding: 8px; text-align: right;">Đơn Giá</th>
              <th style="padding: 8px; text-align: right;">Thành Tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; text-align: center;">1</td>
              <td style="padding: 10px;"><strong>${item.name}</strong><br><small style="color:#64748b;">Mã vạch: ${item.barcode || 'N/A'}</small></td>
              <td style="padding: 10px; text-align: center;"><code>${item.id}</code></td>
              <td style="padding: 10px; text-align: center;">${item.unit}</td>
              <td style="padding: 10px; text-align: center; font-weight: 700; font-size: 14px;">${log.changeQty}</td>
              <td style="padding: 10px; text-align: right;">${DB.formatCurrency(price)}</td>
              <td style="padding: 10px; text-align: right; font-weight: 700; color: #2563eb;">${DB.formatCurrency(total)}</td>
            </tr>
            <tr style="font-weight: 700; background: #f8fafc; border-top: 2px solid #cbd5e1;">
              <td colspan="6" style="padding: 10px; text-align: right;">TỔNG CỘNG TIỀN THANH TOÁN:</td>
              <td style="padding: 10px; text-align: right; color: #b91c1c; font-size: 15px;">${DB.formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; margin-top: 30px; font-size: 12.5px;">
          <div>
            <strong>Người Lập Phiếu</strong><br><span style="font-size:11px; font-style:italic;">(Ký, họ tên)</span>
            <div style="height: 55px;"></div>
            <strong>${log.operator || 'Nguyễn Hoàng Anh'}</strong>
          </div>
          <div>
            <strong>Người Giao / Nhận</strong><br><span style="font-size:11px; font-style:italic;">(Ký, họ tên)</span>
            <div style="height: 55px;"></div>
            <strong>${log.partnerName.split('-')[0].trim()}</strong>
          </div>
          <div>
            <strong>Thủ Kho</strong><br><span style="font-size:11px; font-style:italic;">(Ký, họ tên)</span>
            <div style="height: 55px;"></div>
            <strong>Nguyễn Hoàng Anh</strong>
          </div>
          <div>
            <strong>Kế Toán Trưởng</strong><br><span style="font-size:11px; font-style:italic;">(Ký, họ tên)</span>
            <div style="height: 55px;"></div>
            <strong>Trần Kế Toán</strong>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="padding: 12px 24px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-outline" onclick="document.getElementById('bot-print-modal').classList.remove('active')">Đóng</button>
        <button type="button" class="btn btn-primary" onclick="window.print()">🖨️ Tiến Hành In Phiếu</button>
      </div>
    </div>
  `;

  printModal.classList.add('active');
};

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
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.04, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    gain2.gain.setValueAtTime(0.04, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Bỏ qua an toàn
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
