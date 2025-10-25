#!/bin/bash

# QuizSync Startup Script
echo "🚀 Starting QuizSync..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb-community"
    echo "   or"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
    exit 1
fi

# Start backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🌱 Seeding database..."
npm run seed

echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🎨 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ QuizSync is running!"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "   Demo credentials:"
echo "   Email: host@quizsync.com"
echo "   Password: password123"
echo ""
echo "   Press Ctrl+C to stop all services"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping services..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "✅ All services stopped"
