@echo off
chcp 65001 >nul
echo ============================================
echo   CSV 差异比对工具 - 一键打包脚本
echo ============================================
echo.

:: 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Python，请先安装 Python 3.x
    echo    下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: 安装 pyinstaller
echo [1/2] 安装 PyInstaller...
pip install pyinstaller -i https://pypi.tuna.tsinghua.edu.cn/simple

:: 打包
echo.
echo [2/2] 打包中，请稍候...
pyinstaller --onefile --console --name csv_diff csv_diff.py

echo.
echo ============================================
if exist dist\csv_diff.exe (
    echo ✅ 打包成功！
    echo    exe 路径: %cd%\dist\csv_diff.exe
) else (
    echo ❌ 打包失败，请检查错误信息
)
echo ============================================
pause
