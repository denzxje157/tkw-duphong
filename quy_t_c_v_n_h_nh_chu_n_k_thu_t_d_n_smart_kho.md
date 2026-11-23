# 📜 QUY TẮC VẬN HÀNH & CHUẨN KỸ THUẬT DỰ ÁN SMART KHO
> **Vai trò ban hành:** System Analyst & Lead Architect  
> **Phạm vi áp dụng:** Bắt buộc đối với 100% thành viên (5/5) tham gia dự án.  
> **Mục tiêu:** 0% Merge Conflict khi Pull Request • 100% Đồng nhất UI/UX • Tương thích tuyệt đối GitHub Pages.

---

## 1. QUY TẮC PHÂN QUYỀN TỆP TIN (ZERO-CONFLICT FILE OWNERSHIP)

Để đảm bảo không bao giờ xảy ra xung đột mã nguồn khi gộp nhánh (Merge PR), dự án áp dụng cơ chế **Khóa vùng sở hữu (Strict File Ownership)**. Thành viên **CHỈ ĐƯỢC PHÉP** tạo/sửa các tệp thuộc phạm vi của mình.

| Thành viên | Nhánh Git (`Branch`) | Tệp được phép chỉnh sửa (`Allowed Files`) | Tệp CẤM chỉnh sửa (`Read-Only`) |
| :--- | :--- | :--- | :--- |
| **Member 1 (Lead)** | `feature/member-1-operations` | `operations.html`<br>`assets/js/operations.js` | Toàn bộ file của Member 2, 3, 4, 5 |
| **Member 2** | `feature/member-2-dashboard` | `index.html`<br>`assets/js/index.js` | `style.css`, `db.js`, `layout.js`, `seed.json` & file người khác |
| **Member 3** | `feature/member-3-inventory` | `inventory.html`<br>`assets/js/inventory.js` | `style.css`, `db.js`, `layout.js`, `seed.json` & file người khác |
| **Member 4** | `feature/member-4-history` | `history.html`<br>`assets/js/history.js` | `style.css`, `db.js`, `layout.js`, `seed.json` & file người khác |
| **Member 5** | `feature/member-5-analytics-suppliers` | `analytics.html`, `suppliers.html`<br>`assets/js/analytics.js`, `assets/js/suppliers.js` | `style.css`, `db.js`, `layout.js`, `seed.json` & file người khác |

### ⚠️ Quy định đối với Tầng Lõi (Shared Core Architecture):
* Các tệp: `assets/css/style.css`, `assets/js/db.js`, `assets/js/layout.js`, `data/seed.json` được xem là **Hạ tầng bất biến (Immutable Core)**.
* **Nghiêm cấm** tự ý sửa đổi các tệp này trên nhánh tính năng cá nhân.
* Nếu cần bổ sung CSS riêng cho trang của mình, hãy viết trong thẻ `<style>` đặt ở cuối `<head>` của file `.html` cá nhân, và **bắt buộc** bọc trong class tiền tố của trang (ví dụ: `.page-operations .custom-box { ... }`) để không làm vỡ giao diện trang khác.

---

## 2. QUY TẮC GIT & TRIỂN KHAI GITHUB PAGES (DEPLOYMENT WORKFLOW)

GitHub Pages chạy trực tiếp từ nhánh `main` và phân giải đường dẫn theo tên Repository (VD: `https://<user>.github.io/tkw-duphong/`). Mọi sai sót về đường dẫn sẽ làm sập toàn bộ hệ thống khi deploy.

### 2.1. Quy chuẩn Đường dẫn (BẮT BUỘC)
* **TUYỆT ĐỐI KHÔNG** dùng dấu gạch chéo `/` ở đầu đường dẫn.
  * ❌ **SAI:** `<link rel="stylesheet" href="/assets/css/style.css">` (Sẽ lỗi 404 trên GitHub Pages).
  * ✅ **ĐÚNG:** `<link rel="stylesheet" href="assets/css/style.css">`
* Mọi liên kết điều hướng giữa các trang phải dùng tên file trực tiếp: `href="index.html"`, `href="operations.html"`, v.v.

### 2.2. Quy trình Commit & Pull Request (PR)
1. **Kiểm tra nhánh trước khi code:** Luôn chạy `git branch` để chắc chắn đang đứng ở đúng nhánh `feature/member-X-...`. Tuyệt đối không code trực tiếp trên `main`.
2. **Chuẩn hóa thông điệp Commit:**
   * `feat: <mô tả tính năng mới>` (VD: `feat: hoan thien tinh nang xuat CSV`)
   * `fix: <mô tả lỗi đã sửa>` (VD: `fix: chan xuat am tai trang operations`)
   * `ui: <chỉnh sửa giao diện>` (VD: `ui: can chinh lai bang canh bao`)
3. **Đồng bộ trước khi tạo PR:**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/<ten-nhanh-cua-ban>
   git merge main
   # Kiểm tra chạy thử trên trình duyệt không có lỗi Console (F12)
   git push origin feature/<ten-nhanh-cua-ban>
   ```
4. **Quy tắc Merge lên `main`:** Chỉ **Lead (Member 1)** mới có quyền bấm **Merge Pull Request** vào `main` sau khi đã kiểm tra phần `Files changed` của PR **chỉ chứa đúng các file thuộc quyền sở hữu của thành viên đó**.

---

## 3. QUY CHUẨN ĐỒNG NHẤT GIAO DIỆN & DESIGN SYSTEM (UI/UX)

Để 6 trang trông như được thiết kế bởi cùng một kỹ sư, mọi thành viên phải tuân thủ khung xương HTML và bộ Design Tokens sau:

### 3.1. Bộ khung HTML chuẩn cho mọi trang
Mọi file `.html` (từ Trang 1 đến Trang 6) **bắt buộc** giữ nguyên cấu trúc nạp Layout dùng chung:
```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Tên Trang] - Smart Kho</title>
    <!-- BẮT BUỘC dùng đường dẫn tương đối không có dấu / ở đầu -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="app-layout">
        <!-- Tự động render bởi layout.js -->
        <div id="sidebar-container"></div>
        
        <main class="app-main">
            <!-- Tự động render bởi layout.js -->
            <div id="header-container"></div>
            
            <!-- NỘI DUNG RIÊNG CỦA TỪNG TRANG ĐẶT TẠI ĐÂY -->
            <div class="page-content">
                ...
            </div>
        </main>
    </div>

    <!-- Thứ tự nhúng JS BẮT BUỘC: db.js -> layout.js -> [page].js -->
    <script src="assets/js/db.js"></script>
    <script src="assets/js/layout.js"></script>
    <script src="assets/js/[ten-trang].js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Truyền đúng key: 'index' | 'inventory' | 'operations' | 'history' | 'analytics' | 'suppliers'
            initLayout('[page-key]'); 
        });
    </script>
</body>
</html>
```

### 3.2. Quy tắc sử dụng Màu sắc & Component (Cấm tự chế màu)
* **Không viết mã màu Hex tùy tiện** trong HTML/JS. Phải sử dụng các class có sẵn từ `style.css`:
  * **Nút bấm:** `.btn .btn-primary` (Xanh dương `#2563EB`), `.btn .btn-success` (Xanh lá `#10B981`), `.btn .btn-danger` (Đỏ `#EF4444`), `.btn .btn-outline` (Viền xám).
  * **Nhãn trạng thái tồn kho:**
    * Hết hàng (`qty === 0`): `<span class="badge badge-danger">Hết hàng</span>`
    * Sắp hết (`0 < qty <= min`): `<span class="badge badge-warning">Sắp hết</span>`
    * Còn hàng (`qty > min`): `<span class="badge badge-success">Còn hàng</span>`
    * *(Khuyến nghị: Gọi trực tiếp hàm `DB.getItemStatus(item)` để lấy tự động nhãn và class).*
  * **Khung chứa nội dung:** Bọc mọi bảng biểu, biểu đồ, form trong `<div class="card">...</div>`.
  * **Bảng dữ liệu:** Dùng `<div class="table-responsive"><table class="table">...</table></div>`.

---

## 4. HỢP ĐỒNG DỮ LIỆU & GIAO TIẾP LIÊN TRANG (DATA CONTRACT)

Vì ứng dụng chạy 100% phía Client qua `LocalStorage`, mọi thao tác đọc/ghi dữ liệu phải đi qua API chuẩn của `window.DB`.

### 4.1. Quy tắc gọi API `window.DB`
* **TUYỆT ĐỐI KHÔNG** gọi trực tiếp `localStorage.getItem(...)` hay `localStorage.setItem(...)` trong các file JS của từng trang. Phải thông qua `window.DB`:
  * Đọc dữ liệu: `DB.getItems()`, `DB.getItemById(id)`, `DB.getSuppliers()`, `DB.getLogs()`.
  * Ghi dữ liệu: `DB.saveItem(obj)`, `DB.deleteItem(id)`, `DB.importStock(...)`, `DB.exportStock(...)`, `DB.saveSupplier(obj)`, `DB.deleteSupplier(id)`.
  * Định dạng hiển thị: `DB.formatCurrency(number)`, `DB.formatDateTime(isoString)`.
  * Thông báo người dùng: Dùng `DB.showToast(message, type)` thay cho `alert()` thông thường (trừ cảnh báo chặn xóa an toàn hoặc lỗi nghiêm trọng).

### 4.2. Quy tắc truyền tham số giữa các trang (`sessionStorage`)
Để tính năng điều hướng thông minh hoạt động trơn tru giữa các thành viên, phải dùng đúng **tên khóa (Key)** sau:
1. **Từ Trang Chủ (`index.html`) $\rightarrow$ Trang Nhập/Xuất (`operations.html`):**
   * Member 2 khi click vào ô kệ Heatmap lưu: `sessionStorage.setItem('QUICK_RESTOCK_ITEM_ID', item.id);`
   * Member 1 khi load trang đọc khóa này, tự động mở tab Nhập kho, chọn đúng vật tư và gọi `sessionStorage.removeItem('QUICK_RESTOCK_ITEM_ID');`.
2. **Từ Trang Nhà Cung Cấp (`suppliers.html`) $\rightarrow$ Trang Nhập/Xuất (`operations.html`):**
   * Member 5 khi click nút `[📥 Đặt Hàng]` lưu: `sessionStorage.setItem('PRESELECT_SUPPLIER_NAME', supplier.name);`
   * Member 1 khi load trang đọc khóa này, tự động mở tab Nhập kho, chọn đúng đối tác và gọi `sessionStorage.removeItem('PRESELECT_SUPPLIER_NAME');`.

---

## 5. CHECKLIST NGHIỆM THU TRƯỚC KHI PUSH CODE (DEFINITION OF DONE)

Trước khi thực hiện `git push`, mỗi thành viên tự kiểm tra 5 tiêu chí sau:
- [ ] **1. Sạch lỗi Console:** Mở DevTools (`F12` $\rightarrow$ `Console`), thao tác toàn bộ chức năng trên trang của mình, đảm bảo **0 dòng lỗi màu đỏ**.
- [ ] **2. Đúng phạm vi file:** Chạy lệnh `git status`, xác nhận chỉ có file `.html` và `.js` của riêng mình được liệt kê.
- [ ] **3. Đồng bộ dữ liệu thực:** Thử thêm/nhập/xuất dữ liệu ở trang của mình, sau đó mở sang trang của thành viên khác kiểm tra xem số liệu có tự động cập nhật đúng không.
- [ ] **4. Responsive & Tràn viền:** Thu nhỏ cửa sổ trình duyệt xuống kích thước Laptop 13 inch (`1280x720`), đảm bảo bảng không bị vỡ layout và không xuất hiện thanh cuộn ngang toàn trang.
- [ ] **5. Chuẩn Form Validation:** Các ô nhập số lượng đều có thuộc tính HTML5 (`min`, `max`, `step`, `required`) hoạt động chính xác.