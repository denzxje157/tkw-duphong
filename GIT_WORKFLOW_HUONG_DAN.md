# HƯỚNG DẪN LÀM VIỆC NHÓM 5 THÀNH VIÊN - KHÔNG BAO GIỜ CONFLICT TRÊN GIT

## 1. PHÂN CÔNG QUYỀN SỞ HỮU FILE (100% CÁCH LY TRÁNH XUNG ĐỘT)

| Thành viên | Trang phụ trách | File HTML sở hữu | File JS sở hữu | Quy tắc bắt buộc |
|:---|:---|:---|:---|:---|
| **Member 1 (Lead)** | Trang 3: Nhập & Xuất kho | `operations.html` | `assets/js/operations.js` | Chỉ Member 1 được sửa 2 file này |
| **Member 2** | Trang 1: Trang chủ & Cảnh báo | `index.html` | `assets/js/index.js` | Chỉ Member 2 được sửa 2 file này |
| **Member 3** | Trang 2: Quản lý vật tư | `inventory.html` | `assets/js/inventory.js` | Chỉ Member 3 được sửa 2 file này |
| **Member 4** | Trang 4: Lịch sử giao dịch | `history.html` | `assets/js/history.js` | Chỉ Member 4 được sửa 2 file này |
| **Member 5** | Trang 5 & Trang 6: Phân tích & NCC | `analytics.html`<br>`suppliers.html` | `assets/js/analytics.js`<br>`assets/js/suppliers.js` | Chỉ Member 5 được sửa các file này |

> **QUY TẮC SỐ 1 ĐỂ KHÔNG BỊ CONFLICT:**
> * Các file dùng chung: `assets/css/style.css`, `assets/js/db.js`, `assets/js/layout.js`, `data/seed.json` là **KHUNG NỀN TẢNG ĐÃ HOÀN THIỆN**.
> * Tất cả 5 thành viên **CHỈ GỌI HÀM CÓ SẴN TRONG `window.DB`** (như `DB.getItems()`, `DB.saveItem()`, `DB.getItemStatus()`), tuyệt đối **KHÔNG SỬA** các file dùng chung này.

---

## 2. QUY TRÌNH TẠO NHÁNH VÀ PUSH CODE (GIT WORKFLOW)

### Bước 1: Trưởng nhóm tạo Repo và đẩy code gốc lên nhánh `main`
```bash
git init
git add .
git commit -m "feat: setup clean architecture 6 pages for 5 members"
git branch -M main
git remote add origin https://github.com/denzxje157/tkw-duphong.git
git push -u origin main --force
```

### Bước 2: 4 thành viên còn lại Clone repo về và tạo nhánh riêng
* **Member 1:**
  ```bash
  git checkout -b feature/member-1-operations
  # Chỉnh sửa trong operations.html và assets/js/operations.js
  git add operations.html assets/js/operations.js
  git commit -m "feat(member-1): hoàn thiện logic chặn xuất âm và min max"
  git push origin feature/member-1-operations
  ```

* **Member 2:**
  ```bash
  git checkout -b feature/member-2-dashboard
  # Chỉnh sửa trong index.html và assets/js/index.js
  git add index.html assets/js/index.js
  git commit -m "feat(member-2): hoàn thiện KPI và donut chart"
  git push origin feature/member-2-dashboard
  ```

* **Member 3:**
  ```bash
  git checkout -b feature/member-3-inventory
  # Chỉnh sửa trong inventory.html và assets/js/inventory.js
  git add inventory.html assets/js/inventory.js
  git commit -m "feat(member-3): hoàn thiện live search và modal CRUD"
  git push origin feature/member-3-inventory
  ```

* **Member 4:**
  ```bash
  git checkout -b feature/member-4-history
  # Chỉnh sửa trong history.html và assets/js/history.js
  git add history.html assets/js/history.js
  git commit -m "feat(member-4): hoàn thiện timeline và xuất CSV"
  git push origin feature/member-4-history
  ```

* **Member 5:**
  ```bash
  git checkout -b feature/member-5-analytics-suppliers
  # Chỉnh sửa analytics.html, suppliers.html, assets/js/analytics.js, assets/js/suppliers.js
  git add analytics.html suppliers.html assets/js/analytics.js assets/js/suppliers.js
  git commit -m "feat(member-5): hoàn thiện biểu đồ canvas và danh bạ NCC"
  git push origin feature/member-5-analytics-suppliers
  ```

### Bước 3: Hợp nhất (Merge) lên GitHub
* Lên GitHub tạo Pull Request (PR) từ nhánh của từng thành viên vào nhánh `main`.
* Vì **mỗi người chỉ chỉnh sửa file của riêng mình**, GitHub sẽ báo: **"Able to merge automatically" (Xanh lá cây)** mà **không có bất kỳ xung đột (conflict) nào**!

---

## 3. CÁCH KÍCH HOẠT GITHUB PAGES ĐỂ DEMO
1. Vào repository trên GitHub > Chọn tab **Settings** (Cài đặt).
2. Ở thanh bên trái, chọn mục **Pages**.
3. Tại phần **Branch**, chọn nhánh `main` và thư mục `/ (root)`, sau đó nhấn **Save**.
4. Chờ 1-2 phút, GitHub sẽ cấp cho bạn đường link website trực tiếp:
   `https://<ten-user>.github.io/<ten-repo>/index.html`
5. Thầy cô chỉ cần click vào link là web chạy ngay lập tức với đầy đủ dữ liệu mẫu!
