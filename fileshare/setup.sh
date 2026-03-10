#!/bin/bash
# DropShare Quick Setup Script

set -e

echo "🚀 Setting up DropShare..."

# ---- BACKEND ----
echo ""
echo "📦 Setting up Django backend..."
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt --quiet

python manage.py migrate
echo "✅ Backend ready!"

deactivate
cd ..

# ---- FRONTEND ----
echo ""
echo "⚛️  Setting up React frontend..."
cd frontend

npm install --silent
echo "✅ Frontend ready!"
cd ..

echo ""
echo "============================================"
echo "✅  Setup complete!"
echo ""
echo "Start the backend:"
echo "  cd backend && source venv/bin/activate && python manage.py runserver"
echo ""
echo "Start the frontend (new terminal):"
echo "  cd frontend && npm start"
echo ""
echo "App:   http://localhost:3000"
echo "API:   http://localhost:8000/api/"
echo "Admin: http://localhost:8000/admin"
echo "============================================"
