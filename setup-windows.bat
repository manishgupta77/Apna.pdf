@echo off
echo ============================
echo  iConvertPDF - Setup Script
echo ============================

echo.
echo [1/3] Setting up Frontend...
cd frontend
call npm install
cd ..

echo.
echo [2/3] Setting up PDF Backend...
cd backend-pdf
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
call venv\Scripts\deactivate
cd ..

echo.
echo [3/3] Setting up Image Backend...
cd backend-image
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
call venv\Scripts\deactivate
cd ..

echo.
echo ============================
echo  SETUP COMPLETE!
echo  Now run: start-all.bat
echo ============================
pause
