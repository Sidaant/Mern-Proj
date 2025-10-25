import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { SocketEvents, GameQuestion, LeaderboardEntry } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Trophy, Clock } from 'lucide-react';

const PlayPage: React.FC = () => {
  const { pin } = useParams();
  const navigate = useNavigate();
  
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    connectSocket();
    return () => {
      socketService.disconnect();
    };
  }, []);

  const connectSocket = () => {
    socketService.connect();
    
    socketService.on('server:session_joined', (data: SocketEvents['server:session_joined']) => {
      setIsJoined(true);
      setError('');
    });

    socketService.on('server:question', (data: SocketEvents['server:question']) => {
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsLocked(false);
      setShowLeaderboard(false);
    });

    socketService.on('server:timer', (data: SocketEvents['server:timer']) => {
      setTimeLeft(data.duration);
      startTimer(data.duration);
    });

    socketService.on('server:lock', (data: SocketEvents['server:lock']) => {
      setIsLocked(true);
      setShowLeaderboard(true);
    });

    socketService.on('server:leaderboard', (data: SocketEvents['server:leaderboard']) => {
      setLeaderboard(data.leaderboard);
    });

    socketService.on('server:answer_received', (data: SocketEvents['server:answer_received']) => {
      setPlayerScore(data.totalScore);
      setIsAnswered(true);
    });

    socketService.on('server:game_over', (data: SocketEvents['server:game_over']) => {
      setLeaderboard(data.finalLeaderboard);
      setShowLeaderboard(true);
      setCurrentQuestion(null);
    });

    socketService.on('server:error', (data: SocketEvents['server:error']) => {
      setError(data.message);
    });
  };

  const startTimer = (duration: number) => {
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      socketService.emit('player:join', { pin, name: playerName.trim() });
    } catch (err) {
      setError('Failed to join game');
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isLocked || isAnswered) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isLocked || isAnswered) return;

    const timeTakenMs = (currentQuestion?.timerSec || 30) * 1000 - (timeLeft * 1000);
    
    socketService.emit('player:submit_answer', {
      questionIndex,
      answerIndex: selectedAnswer,
      timeTakenMs: Math.max(0, timeTakenMs)
    });
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'text-red-600';
    if (timeLeft <= 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Quiz Game</h1>
            <p className="text-gray-600">Enter your name to join the game</p>
          </div>

          <div className="card">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your name"
                  maxLength={50}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={handleJoin}
                loading={isLoading}
                className="w-full"
                size="lg"
                disabled={!playerName.trim()}
              >
                Join Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Game</h1>
              <p className="text-gray-600">Welcome, {playerName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Your Score</p>
                <p className="text-xl font-bold text-primary-600">{playerScore}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!currentQuestion && !showLeaderboard ? (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Clock className="h-12 w-12" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Waiting for game to start</h2>
              <p className="text-gray-600">The host will begin the quiz shortly</p>
            </div>
          </div>
        ) : showLeaderboard ? (
          <div className="card">
            <div className="text-center mb-6">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h2>
              <p className="text-gray-600">
                {currentQuestion ? 'Question Results' : 'Final Results'}
              </p>
            </div>

            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`flex justify-between items-center py-3 px-4 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border border-gray-200' :
                    index === 2 ? 'bg-orange-50 border border-orange-200' :
                    'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-500">#{entry.rank}</span>
                    <span className="font-medium">{entry.name}</span>
                    {index < 3 && (
                      <Trophy className={`h-5 w-5 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-orange-500'
                      }`} />
                    )}
                  </div>
                  <span className="font-bold text-primary-600">{entry.score}</span>
                </div>
              ))}
            </div>

            {!currentQuestion && (
              <div className="text-center mt-6">
                <p className="text-gray-600">Thanks for playing!</p>
              </div>
            )}
          </div>
        ) : currentQuestion ? (
          <div className="card">
            {/* Timer */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Time Remaining</span>
                <span className={`text-2xl font-bold ${getTimerColor()}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-red-500' :
                    timeLeft <= 10 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(timeLeft / currentQuestion.timerSec) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.text}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isLocked || isAnswered}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === index
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${isLocked || isAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            {selectedAnswer !== null && !isAnswered && (
              <div className="text-center">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isLocked}
                  size="lg"
                  className="px-8"
                >
                  Submit Answer
                </Button>
              </div>
            )}

            {isAnswered && (
              <div className="text-center py-4">
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  ✓ Answer submitted! Waiting for results...
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default PlayPage;
