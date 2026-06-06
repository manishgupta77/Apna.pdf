#!/bin/bash
echo "Starting all services..."

# Start PDF backend
cd backend-pdf && source venv/bin/activate && uvicorn main:app --reload --port 8001 &
cd ..

# Start Image backend
cd backend-image && source venv/bin/activate && uvicorn main:app --reload --port 8002 &
cd ..

# Start Frontend
cd frontend && npm run dev &

echo ""
echo "================================"
echo " Frontend: http://localhost:3000"
echo " PDF API:  http://localhost:8001/docs"
echo " IMG API:  http://localhost:8002/docs"
echo "================================"
wait
