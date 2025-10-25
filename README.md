# QuizSync - Real-time Quiz Platform

A production-grade MERN + Socket.io real-time quiz platform with email/password authentication for hosts.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with refresh token rotation
- **Quiz Builder**: Create and edit quizzes with multiple choice questions
- **Real-time Gameplay**: Live quiz sessions with Socket.io
- **Host Dashboard**: Manage game sessions, control questions, view players
- **Player Interface**: Join games with PIN, answer questions in real-time
- **Live Leaderboard**: Real-time scoring and rankings
- **Responsive Design**: Modern UI with TailwindCSS and micro-animations

## 🛠 Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT authentication with refresh tokens
- Zod validation, Helmet security, CORS, rate limiting
- bcrypt password hashing

### Frontend
- React + TypeScript + Vite
- TailwindCSS for styling
- React Router for navigation
- Socket.io client for real-time features
- Framer Motion for animations
- Context API for state management

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/quizsync
JWT_ACCESS_SECRET=your-super-secret-access-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. Start MongoDB (if not running):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. Seed the database with sample data:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎮 Usage

### Demo Credentials
- **Email**: host@quizsync.com
- **Password**: password123

### Creating a Quiz
1. Register/Login as a host
2. Click "Create Quiz" on the dashboard
3. Add quiz title, description, and questions
4. Set timers for each question (5-300 seconds)
5. Save the quiz

### Hosting a Game
1. Select a quiz from your dashboard
2. Click "Start Game" to create a session
3. Share the 6-digit PIN with players
4. Use the host controls to start questions
5. Monitor player progress and leaderboard

### Playing a Game
1. Go to `/play/{PIN}` (replace PIN with the game PIN)
2. Enter your name to join
3. Answer questions before the timer runs out
4. View live leaderboard updates

## 🏗 Project Structure

```
QuizSync/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, logger config
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Seed script
│   │   ├── sockets/         # Socket.io game logic
│   │   └── utils/           # JWT, validation utilities
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/          # Route components
│   │   ├── services/       # API client, Socket service
│   │   ├── types/          # TypeScript definitions
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new host
- `POST /api/auth/login` - Login host
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout host

### Quizzes
- `GET /api/quiz` - Get all quizzes for host
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz` - Create new quiz
- `PUT /api/quiz/:id` - Update quiz
- `DELETE /api/quiz/:id` - Delete quiz

### Sessions
- `GET /api/session` - Get all sessions for host
- `GET /api/session/:id` - Get specific session
- `POST /api/session` - Create new session

## 🔌 Socket Events

### Host Events
- `host:create_session` - Create new game session
- `host:start_question` - Start a question
- `host:next_question` - Move to next question
- `host:end_game` - End the game

### Player Events
- `player:join` - Join game with PIN and name
- `player:submit_answer` - Submit answer for question

### Server Events
- `server:session_created` - Session created confirmation
- `server:session_joined` - Player joined confirmation
- `server:question` - New question broadcast
- `server:timer` - Timer countdown
- `server:lock` - Question locked
- `server:leaderboard` - Live leaderboard updates
- `server:game_over` - Game ended

## 🎯 Game Flow

1. **Host creates session** → Gets 6-digit PIN
2. **Players join** → Enter PIN + name
3. **Host starts question** → Question + timer broadcast
4. **Players answer** → Submit before timer ends
5. **Timer expires** → Answers locked, show results
6. **Host continues** → Next question or end game
7. **Final leaderboard** → Game complete

## 🔒 Security Features

- JWT access tokens (15min) + refresh tokens (7 days)
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers
- Input validation with Zod
- Protected API routes

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Update MongoDB URI for production
3. Set secure JWT secrets
4. Configure CORS for production domain
5. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Update API URLs in environment
2. Build for production: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.
