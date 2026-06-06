@echo off
echo Starting all services...

start "PDF Backend" cmd /k "cd backend-pdf && venv\Scripts\activate && uvicorn main:app --reload --port 8001"
timeout /t 2
start "Image Backend" cmd /k "cd backend-image && venv\Scripts\activate && uvicorn main:app --reload --port 8002"
timeout /t 2
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo  All services starting!
echo  Frontend: http://localhost:3000
echo  PDF API:  http://localhost:8001/docs
echo  IMG API:  http://localhost:8002/docs
echo ================================
