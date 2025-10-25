import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { apiClient } from '../services/api';
import { Session, Player, Quiz, SocketEvents } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Play, SkipForward, Square, Copy, Check } from 'lucide-react';

const HostPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [isGameActive, setIsGameActive] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
      connectSocket();
    }

    return () => {
      socketService.disconnect();
    };
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSession(sessionId!);
      setSession(response.session);
      setCurrentQuestionIndex(response.session.currentQuestionIndex);
      setIsGameActive(response.session.isActive);
    } catch (err: any) {
      setError('Failed to load session');
      console.error('Load session error:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    socketService.connect();
    
    socketService.on('server:session_created', (data: SocketEvents['server:session_created']) => {
      if (data.sessionId === sessionId) {
        setSession(prev => prev ? { ...prev, pin: data.pin } : null);
      }
    });

    socketService.on('server:player_joined', (data: SocketEvents['server:player_joined']) => {
      setSession(prev => prev ? {
        ...prev,
        players: [...prev.players, {
          id: data.playerId,
          name: data.name,
          score: 0,
          answers: []
        }]
      } : null);
    });

    socketService.on('server:player_left', (data: SocketEvents['server:player_left']) => {
      setSession(prev => prev ? {
        ...prev,
        players: prev.players.filter(p => p.id !== data.playerId)
      } : null);
    });

    socketService.on('server:question', (data: SocketEvents['server:question']) => {
      setCurrentQuestionIndex(data.questionIndex);
    });

    socketService.on('server:lock', (data: SocketEvents['server:lock']) => {
      // Question is locked, show results
    });

    socketService.on('server:leaderboard', (data: SocketEvents['server:leaderboard']) => {
      // Update leaderboard
    });

    socketService.on('server:game_over', (data: SocketEvents['server:game_over']) => {
      setIsGameActive(false);
      navigate(`/leaderboard/${sessionId}`);
    });
  };

  const copyPin = async () => {
    if (session?.pin) {
      try {
        await navigator.clipboard.writeText(session.pin);
        setPinCopied(true);
        setTimeout(() => setPinCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy PIN:', err);
      }
    }
  };

  const startQuestion = (questionIndex: number) => {
    socketService.emit('host:start_question', { questionIndex });
    setCurrentQuestionIndex(questionIndex);
    setIsGameActive(true);
  };

  const nextQuestion = () => {
    socketService.emit('host:next_question', {});
  };

  const endGame = () => {
    socketService.emit('host:end_game', {});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{session.quiz.title}</h1>
              <p className="text-gray-600">{session.quiz.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Game PIN</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-primary-600">{session.pin}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPin}
                    className="flex items-center"
                  >
                    {pinCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Controls */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
              
              {!isGameActive ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Share the PIN with players to let them join the game.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {session.quiz.questions.map((_, index) => (
                      <Button
                        key={index}
                        onClick={() => startQuestion(index)}
                        className="flex items-center justify-center"
                        disabled={session.players.length === 0}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Question {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-900">
                      Question {currentQuestionIndex + 1} is active
                    </h3>
                    <p className="text-primary-700">
                      Players are answering. Wait for the timer to finish.
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={nextQuestion}
                      className="flex items-center"
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Next Question
                    </Button>
                    <Button
                      variant="danger"
                      onClick={endGame}
                      className="flex items-center"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      End Game
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Players List */}
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Players</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {session.players.length}
                </div>
              </div>

              {session.players.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No players joined yet</p>
                  <p className="text-sm">Share the PIN to invite players</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {session.players.map((player) => (
                    <div key={player.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-gray-500">{player.score} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            {session.players.length > 0 && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
                <div className="space-y-2">
                  {session.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div key={player.id} className="flex justify-between items-center py-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{player.score}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostPage;
