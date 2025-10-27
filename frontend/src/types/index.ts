// User types
export interface User {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Quiz types
export interface Question {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  timerSec: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  questionCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Session types
export interface Player {
  id: string;
  name: string;
  score: number;
  answers: PlayerAnswer[];
}

export interface PlayerAnswer {
  questionIndex: number;
  answerIndex: number;
  timeTakenMs: number;
  isCorrect: boolean;
  points: number;
}

export interface Session {
  id: string;
  pin: string;
  quiz: Quiz;
  players: Player[];
  currentQuestionIndex: number;
  isActive: boolean;
  isLocked: boolean;
  startedAt?: string;
  createdAt: string;
}

// Game types
export interface GameQuestion {
  text: string;
  options: [string, string, string, string];
  timerSec: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

// Socket event types
export interface SocketEvents {
  // Host events
  'host:authenticate': { token: string };
  'host:create_session': { quizId: string };
  'host:start_question': { questionIndex: number };
  'host:next_question': {};
  'host:end_game': {};
  
  // Player events
  'player:join': { pin: string; name: string };
  'player:submit_answer': { questionIndex: number; answerIndex: number; timeTakenMs: number };
  
  // Server events
  'server:authenticated': {};
  'server:session_created': { sessionId: string; pin: string; quiz: Quiz };
  'server:session_joined': { sessionId: string; pin: string; playerCount: number; isActive: boolean };
  'server:player_joined': { playerId: string; name: string; playerCount: number };
  'server:player_left': { playerId: string; name: string; playerCount: number };
  'server:question': { questionIndex: number; question: GameQuestion };
  'server:timer': { questionIndex: number; duration: number };
  'server:lock': { questionIndex: number };
  'server:leaderboard': { questionIndex: number; leaderboard: LeaderboardEntry[] };
  'server:game_over': { finalLeaderboard: LeaderboardEntry[] };
  'server:answer_received': { questionIndex: number; isCorrect: boolean; points: number; totalScore: number };
  'server:error': { message: string };
}

// API response types
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface QuizResponse {
  quiz: Quiz;
}

export interface QuizzesResponse {
  quizzes: Omit<Quiz, 'questions'>[];
}

export interface CreateSessionResponse {
  message?: string;
  session: {
    id: string;
    pin: string;
    quizId: string;
    playerCount: number;
    isActive: boolean;
  };
}

export interface SessionResponse {
  session: Session;
}

export interface SessionsResponse {
  sessions: Omit<Session, 'quiz' | 'players'>[];
}
