#!/bin/bash
echo "==========================="
echo " iConvertPDF - Setup"
echo "==========================="

echo ""
echo "[1/3] Frontend setup..."
cd frontend && npm install && cd ..

echo ""
echo "[2/3] PDF backend setup..."
cd backend-pdf
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo ""
echo "[3/3] Image backend setup..."
cd backend-image
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo ""
echo "==========================="
echo " Setup complete!"
echo " Run: ./start-all.sh"
echo "==========================="
