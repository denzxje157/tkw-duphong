@echo off
chcp 65001 >nul
title XUAT FOLDER CODE THANH VIEN - SMART KHO (TKW)
color 0A

:MAIN_MENU
cls
echo ================================================================================
echo        HE THONG QUAN LY KHO THONG MINH - SMART KHO (DU AN TKW)
echo    CONG CU XUAT FOLDER CODE RIENG CHO TUNG THANH VIEN (1-CLICK EXPORT)
echo ================================================================================
echo.
echo  Chon thanh vien can xuat folder code:
echo.
echo    [1] Nguyen Hoang Anh - Mem 1: Xuat folder 'mem1' (operations.html, CSS, JS)
echo    [2] Tran Quang Huy   - Mem 2: Xuat folder 'mem2' (index.html, CSS, JS)
echo    [3] Ha Van Kien      - Mem 3: Xuat folder 'mem3' (inventory.html, CSS, JS)
echo    [4] Nguyen Le Dong   - Mem 4: Xuat folder 'mem4' (history.html, CSS, JS)
echo    [5] Hoang Minh Phat  - Mem 5: Xuat folder 'mem5' (analytics, suppliers, CSS, JS)
echo    [A] Xuat tat ca 5 folder (mem1 -> mem5) cung luc
echo    [0] Thoat
echo.
echo ================================================================================
set /p choice="Nhap lua chon cua ban (1-5, A hoac 0): "

if "%choice%"=="1" goto EXPORT_MEM1
if "%choice%"=="2" goto EXPORT_MEM2
if "%choice%"=="3" goto EXPORT_MEM3
if "%choice%"=="4" goto EXPORT_MEM4
if "%choice%"=="5" goto EXPORT_MEM5
if /i "%choice%"=="A" goto EXPORT_ALL
if "%choice%"=="0" exit /b
goto MAIN_MENU

:: ----------------------------------------------------------------------------------
:: XUAT MEM 1
:: ----------------------------------------------------------------------------------
:EXPORT_MEM1
cls
echo Dang xuat folder 'mem1' cho Nguyen Hoang Anh (Member 1)...
if not exist mem1\assets\css mkdir mem1\assets\css
if not exist mem1\assets\js mkdir mem1\assets\js
if not exist mem1\data mkdir mem1\data

copy /y operations.html mem1\ >nul
copy /y assets\css\common.css mem1\assets\css\ >nul
copy /y assets\css\operations.css mem1\assets\css\ >nul
copy /y assets\js\db.js mem1\assets\js\ >nul
copy /y assets\js\layout.js mem1\assets\js\ >nul
copy /y assets\js\chatbot.js mem1\assets\js\ >nul
copy /y assets\js\operations.js mem1\assets\js\ >nul
copy /y data\seed.json mem1\data\ >nul

echo.
echo ================================================================================
echo  [THANH CONG] Da xuat day du code vao folder: mem1\
echo ================================================================================
echo  Thu muc 'mem1' bao gom:
echo    - operations.html
echo    - assets\css\common.css va operations.css
echo    - assets\js\db.js, layout.js, chatbot.js, operations.js
echo    - data\seed.json
echo.
echo  Thanh vien Member 1 chi can mo 'mem1' de chay va code doc lap!
echo ================================================================================
echo Dang mo thu muc mem1...
start "" explorer "mem1"
pause
goto MAIN_MENU

:: ----------------------------------------------------------------------------------
:: XUAT MEM 2
:: ----------------------------------------------------------------------------------
:EXPORT_MEM2
cls
echo Dang xuat folder 'mem2' cho Tran Quang Huy (Member 2)...
if not exist mem2\assets\css mkdir mem2\assets\css
if not exist mem2\assets\js mkdir mem2\assets\js
if not exist mem2\data mkdir mem2\data

copy /y index.html mem2\ >nul
copy /y assets\css\common.css mem2\assets\css\ >nul
copy /y assets\css\index.css mem2\assets\css\ >nul
copy /y assets\js\db.js mem2\assets\js\ >nul
copy /y assets\js\layout.js mem2\assets\js\ >nul
copy /y assets\js\chatbot.js mem2\assets\js\ >nul
copy /y assets\js\index.js mem2\assets\js\ >nul
copy /y data\seed.json mem2\data\ >nul

echo.
echo ================================================================================
echo  [THANH CONG] Da xuat day du code vao folder: mem2\
echo ================================================================================
echo  Thu muc 'mem2' bao gom:
echo    - index.html
echo    - assets\css\common.css va index.css
echo    - assets\js\db.js, layout.js, chatbot.js, index.js
echo    - data\seed.json
echo.
echo  Thanh vien Member 2 chi can mo 'mem2' de chay va code doc lap!
echo ================================================================================
echo Dang mo thu muc mem2...
start "" explorer "mem2"
pause
goto MAIN_MENU

:: ----------------------------------------------------------------------------------
:: XUAT MEM 3
:: ----------------------------------------------------------------------------------
:EXPORT_MEM3
cls
echo Dang xuat folder 'mem3' cho Ha Van Kien (Member 3)...
if not exist mem3\assets\css mkdir mem3\assets\css
if not exist mem3\assets\js mkdir mem3\assets\js
if not exist mem3\data mkdir mem3\data

copy /y inventory.html mem3\ >nul
copy /y assets\css\common.css mem3\assets\css\ >nul
copy /y assets\css\inventory.css mem3\assets\css\ >nul
copy /y assets\js\db.js mem3\assets\js\ >nul
copy /y assets\js\layout.js mem3\assets\js\ >nul
copy /y assets\js\chatbot.js mem3\assets\js\ >nul
copy /y assets\js\inventory.js mem3\assets\js\ >nul
copy /y data\seed.json mem3\data\ >nul

echo.
echo ================================================================================
echo  [THANH CONG] Da xuat day du code vao folder: mem3\
echo ================================================================================
echo  Thu muc 'mem3' bao gom:
echo    - inventory.html
echo    - assets\css\common.css va inventory.css
echo    - assets\js\db.js, layout.js, chatbot.js, inventory.js
echo    - data\seed.json
echo.
echo  Thanh vien Member 3 chi can mo 'mem3' de chay va code doc lap!
echo ================================================================================
echo Dang mo thu muc mem3...
start "" explorer "mem3"
pause
goto MAIN_MENU

:: ----------------------------------------------------------------------------------
:: XUAT MEM 4
:: ----------------------------------------------------------------------------------
:EXPORT_MEM4
cls
echo Dang xuat folder 'mem4' cho Nguyen Le Dong (Member 4)...
if not exist mem4\assets\css mkdir mem4\assets\css
if not exist mem4\assets\js mkdir mem4\assets\js
if not exist mem4\data mkdir mem4\data

copy /y history.html mem4\ >nul
copy /y assets\css\common.css mem4\assets\css\ >nul
copy /y assets\css\history.css mem4\assets\css\ >nul
copy /y assets\js\db.js mem4\assets\js\ >nul
copy /y assets\js\layout.js mem4\assets\js\ >nul
copy /y assets\js\chatbot.js mem4\assets\js\ >nul
copy /y assets\js\history.js mem4\assets\js\ >nul
copy /y data\seed.json mem4\data\ >nul

echo.
echo ================================================================================
echo  [THANH CONG] Da xuat day du code vao folder: mem4\
echo ================================================================================
echo  Thu muc 'mem4' bao gom:
echo    - history.html
echo    - assets\css\common.css va history.css
echo    - assets\js\db.js, layout.js, chatbot.js, history.js
echo    - data\seed.json
echo.
echo  Thanh vien Member 4 chi can mo 'mem4' de chay va code doc lap!
echo ================================================================================
echo Dang mo thu muc mem4...
start "" explorer "mem4"
pause
goto MAIN_MENU

:: ----------------------------------------------------------------------------------
:: XUAT MEM 5
:: ----------------------------------------------------------------------------------
:EXPORT_MEM5
cls
echo Dang xuat folder 'mem5' cho Hoang Minh Phat (Member 5)...
if not exist mem5\assets\css mkdir mem5\assets\css
if not exist mem5\assets\js mkdir mem5\assets\js
if not exist mem5\data mkdir mem5\data

copy /y analytics.html mem5\ >nul
copy /y suppliers.html mem5\ >nul
copy /y assets\css\common.css mem5\assets\css\ >nul
copy /y assets\css\analytics.css mem5\assets\css\ >nul
copy /y assets\js\db.js mem5\assets\js\ >nul
copy /y assets\js\layout.js mem5\assets\js\ >nul
copy /y assets\js\chatbot.js mem5\assets\js\ >nul
copy /y assets\js\analytics.js mem5\assets\js\ >nul
copy /y assets\js\suppliers.js mem5\assets\js\ >nul
copy /y data\seed.json mem5\data\ >nul

echo.
echo ================================================================================
echo  [THANH CONG] Da xuat day du code vao folder: mem5\
echo ================================================================================
echo  Thu muc 'mem5' bao gom:
echo    - analytics.html va suppliers.html
echo    - assets\css\common.css va analytics.css
echo    - assets\js\db.js, layout.js, chatbot.js, analytics.js, suppliers.js
echo    - data\seed.json
echo.
echo  Thanh vien Member 5 chi can mo 'mem5' de chay va code doc lap!
echo ================================================================================
echo Dang mo thu muc mem5...
start "" explorer "mem5"
pause
goto MAIN_MENU

:: ----------------------------------------------------------------------------------
:: XUAT TAT CA 5 MEM
:: ----------------------------------------------------------------------------------
:EXPORT_ALL
cls
echo Dang xuat tat ca 5 folder mem1, mem2, mem3, mem4, mem5...
call :EXPORT_MEM1_SILENT
call :EXPORT_MEM2_SILENT
call :EXPORT_MEM3_SILENT
call :EXPORT_MEM4_SILENT
call :EXPORT_MEM5_SILENT
echo.
echo ================================================================================
echo  [HOAN TAT] DA XUAT THANH CONG CA 5 FOLDER:
echo    - mem1\ (Nguyen Hoang Anh)
echo    - mem2\ (Tran Quang Huy)
echo    - mem3\ (Ha Van Kien)
echo    - mem4\ (Nguyen Le Dong)
echo    - mem5\ (Hoang Minh Phat)
echo ================================================================================
start "" explorer .
pause
goto MAIN_MENU

:EXPORT_MEM1_SILENT
if not exist mem1\assets\css mkdir mem1\assets\css
if not exist mem1\assets\js mkdir mem1\assets\js
if not exist mem1\data mkdir mem1\data
copy /y operations.html mem1\ >nul
copy /y assets\css\common.css mem1\assets\css\ >nul
copy /y assets\css\operations.css mem1\assets\css\ >nul
copy /y assets\js\db.js mem1\assets\js\ >nul
copy /y assets\js\layout.js mem1\assets\js\ >nul
copy /y assets\js\chatbot.js mem1\assets\js\ >nul
copy /y assets\js\operations.js mem1\assets\js\ >nul
copy /y data\seed.json mem1\data\ >nul
exit /b

:EXPORT_MEM2_SILENT
if not exist mem2\assets\css mkdir mem2\assets\css
if not exist mem2\assets\js mkdir mem2\assets\js
if not exist mem2\data mkdir mem2\data
copy /y index.html mem2\ >nul
copy /y assets\css\common.css mem2\assets\css\ >nul
copy /y assets\css\index.css mem2\assets\css\ >nul
copy /y assets\js\db.js mem2\assets\js\ >nul
copy /y assets\js\layout.js mem2\assets\js\ >nul
copy /y assets\js\chatbot.js mem2\assets\js\ >nul
copy /y assets\js\index.js mem2\assets\js\ >nul
copy /y data\seed.json mem2\data\ >nul
exit /b

:EXPORT_MEM3_SILENT
if not exist mem3\assets\css mkdir mem3\assets\css
if not exist mem3\assets\js mkdir mem3\assets\js
if not exist mem3\data mkdir mem3\data
copy /y inventory.html mem3\ >nul
copy /y assets\css\common.css mem3\assets\css\ >nul
copy /y assets\css\inventory.css mem3\assets\css\ >nul
copy /y assets\js\db.js mem3\assets\js\ >nul
copy /y assets\js\layout.js mem3\assets\js\ >nul
copy /y assets\js\chatbot.js mem3\assets\js\ >nul
copy /y assets\js\inventory.js mem3\assets\js\ >nul
copy /y data\seed.json mem3\data\ >nul
exit /b

:EXPORT_MEM4_SILENT
if not exist mem4\assets\css mkdir mem4\assets\css
if not exist mem4\assets\js mkdir mem4\assets\js
if not exist mem4\data mkdir mem4\data
copy /y history.html mem4\ >nul
copy /y assets\css\common.css mem4\assets\css\ >nul
copy /y assets\css\history.css mem4\assets\css\ >nul
copy /y assets\js\db.js mem4\assets\js\ >nul
copy /y assets\js\layout.js mem4\assets\js\ >nul
copy /y assets\js\chatbot.js mem4\assets\js\ >nul
copy /y assets\js\history.js mem4\assets\js\ >nul
copy /y data\seed.json mem4\data\ >nul
exit /b

:EXPORT_MEM5_SILENT
if not exist mem5\assets\css mkdir mem5\assets\css
if not exist mem5\assets\js mkdir mem5\assets\js
if not exist mem5\data mkdir mem5\data
copy /y analytics.html mem5\ >nul
copy /y suppliers.html mem5\ >nul
copy /y assets\css\common.css mem5\assets\css\ >nul
copy /y assets\css\analytics.css mem5\assets\css\ >nul
copy /y assets\js\db.js mem5\assets\js\ >nul
copy /y assets\js\layout.js mem5\assets\js\ >nul
copy /y assets\js\chatbot.js mem5\assets\js\ >nul
copy /y assets\js\analytics.js mem5\assets\js\ >nul
copy /y assets\js\suppliers.js mem5\assets\js\ >nul
copy /y data\seed.json mem5\data\ >nul
exit /b
