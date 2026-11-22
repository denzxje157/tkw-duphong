@echo off
chcp 65001 >nul
title HE THONG KHO THONG MINH - SMART KHO (TKW) - DIEU HUONG THANH VIEN
color 0B

:MAIN_MENU
cls
echo ================================================================================
echo        HE THONG QUAN LY KHO THONG MINH - SMART KHO (DU AN TKW)
echo    CONG CU DIEU HUONG VA MO MOI TRUONG LAM VIEC CHO TUNG THANH VIEN
echo ================================================================================
echo.
echo  Moi ban chon vai tro cua minh trong nhom:
echo.
echo    [1] Nguyen Hoang Anh - Mem 1: Trang 3 (operations.html, operations.css, operations.js)
echo    [2] Tran Quang Huy   - Mem 2: Trang 1 (index.html, index.css, index.js)
echo    [3] Ha Van Kien      - Mem 3: Trang 2 (inventory.html, inventory.css, inventory.js)
echo    [4] Nguyen Le Dong   - Mem 4: Trang 4 (history.html, history.css, history.js)
echo    [5] Hoang Minh Phat  - Mem 5: Trang 5 va 6 (analytics.html, suppliers.html, analytics.css, analytics.js, suppliers.js)
echo    [0] Thoat chuong trinh
echo.
echo ================================================================================
set /p choice="Nhap lua chon cua ban (1-5 hoac 0): "

if "%choice%"=="1" goto MEM_1
if "%choice%"=="2" goto MEM_2
if "%choice%"=="3" goto MEM_3
if "%choice%"=="4" goto MEM_4
if "%choice%"=="5" goto MEM_5
if "%choice%"=="0" exit /b
goto MAIN_MENU

:: ----------------------------------------------------------------------------------
:: MEMBER 1: NGUYEN HOANG ANH
:: ----------------------------------------------------------------------------------
:MEM_1
cls
echo ================================================================================
echo  THANH VIEN: NGUYEN HOANG ANH (MEMBER 1 - TRUONG NHOM)
echo  PHAN HE   : Dieu Phoi Nhap va Xuat Kho
echo  FILE SO HUU RIENG:
echo    - operations.html
echo    - assets/css/operations.css
echo    - assets/js/operations.js
echo ================================================================================
echo.
echo  Cac thao tac ho tro cho Member 1:
echo    [1] Mo 3 file cua ban bang Visual Studio Code
echo    [2] Mo trang Nhap/Xuat Kho tren Trinh duyet Web
echo    [3] Xem huong dan lenh Git chuan de ban tu go (Khong push tu dong)
echo    [B] Quay lai Menu Chinh
echo    [0] Thoat
echo.
set /p m1_act="Nhap thao tac (1-3, B, 0): "
if /i "%m1_act%"=="1" (
    echo Dang mo VS Code...
    start "" code operations.html assets/css/operations.css assets/js/operations.js
    pause
    goto MEM_1
)
if /i "%m1_act%"=="2" (
    echo Dang mo trinh duyet...
    start "" operations.html
    pause
    goto MEM_1
)
if /i "%m1_act%"=="3" (
    cls
    echo ================================================================================
    echo  HUONG DAN LENH GIT CHUAN CHO NGUYEN HOANG ANH (MEM 1) TU GO:
    echo ================================================================================
    echo.
    echo  Buoc 1: Chuyen sang dung nhanh cua ban:
    echo     git checkout feature/member-1-operations
    echo.
    echo  Buoc 2: Kiem tra trang thai cac file da sua:
    echo     git status
    echo.
    echo  Buoc 3: Chi add DUNG 3 file cua ban (TUYET DOI KHONG DUNG 'git add .'):
    echo     git add operations.html assets/css/operations.css assets/js/operations.js
    echo.
    echo  Buoc 4: Commit ghi ro noi dung da lam:
    echo     git commit -m "feat(member-1): hoan thien phan he nhap xuat kho va in hoa don Mau 02-VT"
    echo.
    echo  Buoc 5: Day len GitHub de tao Pull Request:
    echo     git push origin feature/member-1-operations
    echo.
    echo ================================================================================
    pause
    goto MEM_1
)
if /i "%m1_act%"=="B" goto MAIN_MENU
if /i "%m1_act%"=="0" exit /b
goto MEM_1

:: ----------------------------------------------------------------------------------
:: MEMBER 2: TRAN QUANG HUY
:: ----------------------------------------------------------------------------------
:MEM_2
cls
echo ================================================================================
echo  THANH VIEN: TRAN QUANG HUY (MEMBER 2)
echo  PHAN HE   : Trang Chu va Ban Do Ke Kho Heatmap va Donut Chart
echo  FILE SO HUU RIENG:
echo    - index.html
echo    - assets/css/index.css
echo    - assets/js/index.js
echo ================================================================================
echo.
echo  Cac thao tac ho tro cho Member 2:
echo    [1] Mo 3 file cua ban bang Visual Studio Code
echo    [2] Mo Trang Chu tren Trinh duyet Web
echo    [3] Xem huong dan lenh Git chuan de ban tu go (Khong push tu dong)
echo    [B] Quay lai Menu Chinh
echo    [0] Thoat
echo.
set /p m2_act="Nhap thao tac (1-3, B, 0): "
if /i "%m2_act%"=="1" (
    echo Dang mo VS Code...
    start "" code index.html assets/css/index.css assets/js/index.js
    pause
    goto MEM_2
)
if /i "%m2_act%"=="2" (
    echo Dang mo trinh duyet...
    start "" index.html
    pause
    goto MEM_2
)
if /i "%m2_act%"=="3" (
    cls
    echo ================================================================================
    echo  HUONG DAN LENH GIT CHUAN CHO TRAN QUANG HUY (MEM 2) TU GO:
    echo ================================================================================
    echo.
    echo  Buoc 1: Chuyen sang dung nhanh cua ban:
    echo     git checkout feature/member-2-dashboard
    echo.
    echo  Buoc 2: Kiem tra trang thai cac file da sua:
    echo     git status
    echo.
    echo  Buoc 3: Chi add DUNG 3 file cua ban (TUYET DOI KHONG DUNG 'git add .'):
    echo     git add index.html assets/css/index.css assets/js/index.js
    echo.
    echo  Buoc 4: Commit ghi ro noi dung da lam:
    echo     git commit -m "feat(member-2): hoan thien KPI cards, ban do ke kho heatmap va bieu do donut"
    echo.
    echo  Buoc 5: Day len GitHub de tao Pull Request:
    echo     git push origin feature/member-2-dashboard
    echo.
    echo ================================================================================
    pause
    goto MEM_2
)
if /i "%m2_act%"=="B" goto MAIN_MENU
if /i "%m2_act%"=="0" exit /b
goto MEM_2

:: ----------------------------------------------------------------------------------
:: MEMBER 3: HA VAN KIEN
:: ----------------------------------------------------------------------------------
:MEM_3
cls
echo ================================================================================
echo  THANH VIEN: HA VAN KIEN (MEMBER 3)
echo  PHAN HE   : Quan Ly Danh Muc Vat Tu va Tram Quet Barcode IoT
echo  FILE SO HUU RIENG:
echo    - inventory.html
echo    - assets/css/inventory.css
echo    - assets/js/inventory.js
echo ================================================================================
echo.
echo  Cac thao tac ho tro cho Member 3:
echo    [1] Mo 3 file cua ban bang Visual Studio Code
echo    [2] Mo Trang Danh Muc Vat Tu tren Trinh duyet Web
echo    [3] Xem huong dan lenh Git chuan de ban tu go (Khong push tu dong)
echo    [B] Quay lai Menu Chinh
echo    [0] Thoat
echo.
set /p m3_act="Nhap thao tac (1-3, B, 0): "
if /i "%m3_act%"=="1" (
    echo Dang mo VS Code...
    start "" code inventory.html assets/css/inventory.css assets/js/inventory.js
    pause
    goto MEM_3
)
if /i "%m3_act%"=="2" (
    echo Dang mo trinh duyet...
    start "" inventory.html
    pause
    goto MEM_3
)
if /i "%m3_act%"=="3" (
    cls
    echo ================================================================================
    echo  HUONG DAN LENH GIT CHUAN CHO HA VAN KIEN (MEM 3) TU GO:
    echo ================================================================================
    echo.
    echo  Buoc 1: Chuyen sang dung nhanh cua ban:
    echo     git checkout feature/member-3-inventory
    echo.
    echo  Buoc 2: Kiem tra trang thai cac file da sua:
    echo     git status
    echo.
    echo  Buoc 3: Chi add DUNG 3 file cua ban (TUYET DOI KHONG DUNG 'git add .'):
    echo     git add inventory.html assets/css/inventory.css assets/js/inventory.js
    echo.
    echo  Buoc 4: Commit ghi ro noi dung da lam:
    echo     git commit -m "feat(member-3): hoan thien live search, modal CRUD vat tu va chan xoa con ton"
    echo.
    echo  Buoc 5: Day len GitHub de tao Pull Request:
    echo     git push origin feature/member-3-inventory
    echo.
    echo ================================================================================
    pause
    goto MEM_3
)
if /i "%m3_act%"=="B" goto MAIN_MENU
if /i "%m3_act%"=="0" exit /b
goto MEM_3

:: ----------------------------------------------------------------------------------
:: MEMBER 4: NGUYEN LE DONG
:: ----------------------------------------------------------------------------------
:MEM_4
cls
echo ================================================================================
echo  THANH VIEN: NGUYEN LE DONG (MEMBER 4)
echo  PHAN HE   : Dong Thoi Gian Lich Su Giao Dich va Bang Doi Soat
echo  FILE SO HUU RIENG:
echo    - history.html
echo    - assets/css/history.css
echo    - assets/js/history.js
echo ================================================================================
echo.
echo  Cac thao tac ho tro cho Member 4:
echo    [1] Mo 3 file cua ban bang Visual Studio Code
echo    [2] Mo Trang Lich Su tren Trinh duyet Web
echo    [3] Xem huong dan lenh Git chuan de ban tu go (Khong push tu dong)
echo    [B] Quay lai Menu Chinh
echo    [0] Thoat
echo.
set /p m4_act="Nhap thao tac (1-3, B, 0): "
if /i "%m4_act%"=="1" (
    echo Dang mo VS Code...
    start "" code history.html assets/css/history.css assets/js/history.js
    pause
    goto MEM_4
)
if /i "%m4_act%"=="2" (
    echo Dang mo trinh duyet...
    start "" history.html
    pause
    goto MEM_4
)
if /i "%m4_act%"=="3" (
    cls
    echo ================================================================================
    echo  HUONG DAN LENH GIT CHUAN CHO NGUYEN LE DONG (MEM 4) TU GO:
    echo ================================================================================
    echo.
    echo  Buoc 1: Chuyen sang dung nhanh cua ban:
    echo     git checkout feature/member-4-history
    echo.
    echo  Buoc 2: Kiem tra trang thai cac file da sua:
    echo     git status
    echo.
    echo  Buoc 3: Chi add DUNG 3 file cua ban (TUYET DOI KHONG DUNG 'git add .'):
    echo     git add history.html assets/css/history.css assets/js/history.js
    echo.
    echo  Buoc 4: Commit ghi ro noi dung da lam:
    echo     git commit -m "feat(member-4): hoan thien toggle timeline, bang doi soat va xuat file CSV"
    echo.
    echo  Buoc 5: Day len GitHub de tao Pull Request:
    echo     git push origin feature/member-4-history
    echo.
    echo ================================================================================
    pause
    goto MEM_4
)
if /i "%m4_act%"=="B" goto MAIN_MENU
if /i "%m4_act%"=="0" exit /b
goto MEM_4

:: ----------------------------------------------------------------------------------
:: MEMBER 5: HOANG MINH PHAT
:: ----------------------------------------------------------------------------------
:MEM_5
cls
echo ================================================================================
echo  THANH VIEN: HOANG MINH PHAT (MEMBER 5)
echo  PHAN HE   : Bao Cao Phan Tich Kho va Quan Ly Nha Cung Cap
echo  FILE SO HUU RIENG:
echo    - analytics.html
echo    - suppliers.html
echo    - assets/css/analytics.css
echo    - assets/js/analytics.js
echo    - assets/js/suppliers.js
echo ================================================================================
echo.
echo  Cac thao tac ho tro cho Member 5:
echo    [1] Mo cac file cua ban bang Visual Studio Code
echo    [2] Mo Trang Bao Cao Phan Tich tren Trinh duyet Web
echo    [3] Mo Trang Nha Cung Cap tren Trinh duyet Web
echo    [4] Xem huong dan lenh Git chuan de ban tu go (Khong push tu dong)
echo    [B] Quay lai Menu Chinh
echo    [0] Thoat
echo.
set /p m5_act="Nhap thao tac (1-4, B, 0): "
if /i "%m5_act%"=="1" (
    echo Dang mo VS Code...
    start "" code analytics.html suppliers.html assets/css/analytics.css assets/js/analytics.js assets/js/suppliers.js
    pause
    goto MEM_5
)
if /i "%m5_act%"=="2" (
    echo Dang mo trinh duyet (Analytics)...
    start "" analytics.html
    pause
    goto MEM_5
)
if /i "%m5_act%"=="3" (
    echo Dang mo trinh duyet (Suppliers)...
    start "" suppliers.html
    pause
    goto MEM_5
)
if /i "%m5_act%"=="4" (
    cls
    echo ================================================================================
    echo  HUONG DAN LENH GIT CHUAN CHO HOANG MINH PHAT (MEM 5) TU GO:
    echo ================================================================================
    echo.
    echo  Buoc 1: Chuyen sang dung nhanh cua ban:
    echo     git checkout feature/member-5-analytics-suppliers
    echo.
    echo  Buoc 2: Kiem tra trang thai cac file da sua:
    echo     git status
    echo.
    echo  Buoc 3: Chi add DUNG 5 file cua ban (TUYET DOI KHONG DUNG 'git add .'):
    echo     git add analytics.html suppliers.html assets/css/analytics.css assets/js/analytics.js assets/js/suppliers.js
    echo.
    echo  Buoc 4: Commit ghi ro noi dung da lam:
    echo     git commit -m "feat(member-5): hoan thien bieu do analytics, du bao can kho va danh ba doi tac"
    echo.
    echo  Buoc 5: Day len GitHub de tao Pull Request:
    echo     git push origin feature/member-5-analytics-suppliers
    echo.
    echo ================================================================================
    pause
    goto MEM_5
)
if /i "%m5_act%"=="B" goto MAIN_MENU
if /i "%m5_act%"=="0" exit /b
goto MEM_5
