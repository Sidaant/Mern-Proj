# QuizSync - Complete Code Explanation

## 🎯 Project Overview

QuizSync is a production-grade real-time quiz platform built with MERN stack + Socket.io. It allows hosts to create quizzes and conduct live quiz sessions where players can join using a PIN and answer questions in real-time.

## 🏗 Architecture

### Backend (Node.js + Express + TypeScript)
```
backend/
├── src/
│   ├── config/          # Database and logger configuration
│   ├── controllers/     # Route handlers for API endpoints
│   ├── middleware/      # Authentication, validation, error handling
│   ├── models/         # MongoDB/Mongoose data models
│   ├── routes/         # API route definitions
│   ├── scripts/        # Database seeding script
│   ├── sockets/        # Socket.io real-time game logic
│   └── utils/          # JWT utilities and validation schemas
```

### Frontend (React + TypeScript + Vite)
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context for authentication
│   ├── pages/          # Route-based page components
│   ├── services/       # API client and Socket service
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main application component
```

## 🔧 Core Components Explained

### 1. Authentication System

**Backend (`src/controllers/authController.ts`)**
- **Register**: Creates new user with bcrypt password hashing
- **Login**: Validates credentials and generates JWT tokens
- **Refresh**: Rotates refresh tokens for security
- **Logout**: Invalidates refresh tokens

**Frontend (`src/context/AuthContext.tsx`)**
- Manages authentication state across the app
- Handles token storage and automatic refresh
- Provides login/logout functions to components

**Security Features:**
- JWT access tokens (15min expiry)
- Refresh tokens (7 days) with rotation
- bcrypt password hashing (12 rounds)
- Rate limiting on auth endpoints

### 2. Database Models

**User Model (`src/models/User.ts`)**
```typescript
interface IUser {
  email: string;
  password: string;
  refreshTokens: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}
```

**Quiz Model (`src/models/Quiz.ts`)**
```typescript
interface IQuiz {
  title: string;
  description: string;
  questions: IQuestion[];
  hostId: ObjectId;
}

interface IQuestion {
  text: string;
  options: [string, string, string, string];
  correctIndex: number; // 0-3
  timerSec: number;
}
```

**Session Model (`src/models/Session.ts`)**
```typescript
interface ISession {
  quizId: ObjectId;
  hostId: ObjectId;
  pin: string; // 6-digit game PIN
  players: IPlayer[];
  currentQuestionIndex: number;
  isActive: boolean;
  isLocked: boolean;
}

interface IPlayer {
  id: string;
  name: string;
  score: number;
  answers: PlayerAnswer[];
}
```

### 3. Real-time Game Engine

**Socket.io Implementation (`src/sockets/gameSocket.ts`)**

**Host Events:**
- `host:create_session` - Creates new game session
- `host:start_question` - Broadcasts question to all players
- `host:next_question` - Moves to next question
- `host:end_game` - Ends the game session

**Player Events:**
- `player:join` - Player joins with PIN and name
- `player:submit_answer` - Player submits answer with timing

**Server Events:**
- `server:question` - Question broadcast with timer
- `server:timer` - Timer countdown updates
- `server:lock` - Question locked, no more answers
- `server:leaderboard` - Live score updates
- `server:game_over` - Final results

**Scoring Algorithm:**
```typescript
const basePoints = 1000;
const speedBonus = Math.max(0, 500 - timeTakenMs / 10);
const points = isCorrect ? basePoints + speedBonus : 0;
```

### 4. Frontend Pages

**Authentication Pages:**
- `LoginPage.tsx` - User login with form validation
- `RegisterPage.tsx` - User registration with password confirmation

**Host Interface:**
- `DashboardPage.tsx` - Quiz management, create/start sessions
- `QuizBuilderPage.tsx` - Create/edit quizzes with questions
- `HostPage.tsx` - Live game control, player management

**Player Interface:**
- `PlayPage.tsx` - Join game, answer questions, view results
- `LeaderboardPage.tsx` - Final results and rankings

### 5. API Endpoints

**Authentication Routes (`/api/auth`)**
- `POST /register` - Create new host account
- `POST /login` - Authenticate host
- `POST /refresh` - Refresh access token
- `POST /logout` - Invalidate refresh token

**Quiz Routes (`/api/quiz`)**
- `GET /` - Get all quizzes for host
- `GET /:id` - Get specific quiz
- `POST /` - Create new quiz
- `PUT /:id` - Update quiz
- `DELETE /:id` - Delete quiz

**Session Routes (`/api/session`)**
- `GET /` - Get all sessions for host
- `GET /:id` - Get specific session
- `POST /` - Create new session

### 6. Real-time Game Flow

1. **Host creates session** → Gets 6-digit PIN
2. **Players join** → Enter PIN + name via Socket.io
3. **Host starts question** → Question + timer broadcast
4. **Players answer** → Submit before timer expires
5. **Timer expires** → Answers locked, show results
6. **Host continues** → Next question or end game
7. **Final leaderboard** → Game complete

### 7. Security Implementation

**Backend Security:**
- Helmet for security headers
- CORS with allowlist
- Rate limiting on auth routes
- Input validation with Zod
- JWT token rotation
- Password hashing with bcrypt

**Frontend Security:**
- Protected routes with authentication
- Token refresh interceptor
- Input sanitization
- XSS protection

### 8. UI/UX Features

**Design System:**
- TailwindCSS for styling
- Responsive design
- Micro-animations with Framer Motion
- Loading states and error handling
- Clean, modern interface

**Components:**
- `Button` - Reusable button with variants
- `Input` - Form input with validation
- `LoadingSpinner` - Loading indicators
- `ProtectedRoute` - Route protection

### 9. TypeScript Integration

**Type Safety:**
- End-to-end TypeScript
- Strict type checking
- Interface definitions for all data
- Socket event typing
- API response typing

**Key Types:**
```typescript
interface User { id: string; email: string; }
interface Quiz { id: string; title: string; questions: Question[]; }
interface Session { id: string; pin: string; players: Player[]; }
interface SocketEvents { /* Socket event definitions */ }
```

### 10. Development Setup

**Backend Setup:**
```bash
cd backend
npm install
cp env.example .env
npm run seed  # Creates sample data
npm run dev   # Start development server
```

**Frontend Setup:**
```bash
cd frontend
npm install
cp env.example .env
npm run dev   # Start development server
```

**Environment Variables:**
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/quizsync
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Key Features Implemented

1. **Complete Authentication System**
   - JWT with refresh token rotation
   - Secure password hashing
   - Automatic token refresh

2. **Real-time Quiz Engine**
   - Socket.io for live communication
   - Timer-based questions
   - Live scoring and leaderboard

3. **Quiz Builder**
   - Full CRUD operations
   - Question management
   - Timer configuration

4. **Host Dashboard**
   - Session management
   - Player monitoring
   - Game controls

5. **Player Experience**
   - PIN-based joining
   - Real-time gameplay
   - Live leaderboard updates

6. **Production Ready**
   - Error handling
   - Input validation
   - Security middleware
   - TypeScript throughout

## 📱 Usage Flow

1. **Host Registration/Login**
2. **Create Quiz** with questions and timers
3. **Start Session** to get game PIN
4. **Players Join** using PIN and name
5. **Host Controls** question flow
6. **Real-time Gameplay** with scoring
7. **Final Leaderboard** with results

## 🔒 Security Considerations

- All inputs validated with Zod
- JWT tokens with rotation
- Rate limiting on sensitive endpoints
- CORS protection
- Helmet security headers
- Password hashing with bcrypt
- XSS and injection protection

This is a complete, production-ready real-time quiz platform with comprehensive features, security, and a polished user experience.
