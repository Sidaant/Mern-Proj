import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { apiClient } from '../services/api';
import { Session, SocketEvents } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Play, SkipForward, Square, Copy, Check, Share2, Trophy } from 'lucide-react';

const HostPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [isGameActive, setIsGameActive] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [joinLinkCopied, setJoinLinkCopied] = useState(false);

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
    
    // Authenticate as host
    const tokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
    if (tokens.accessToken) {
      socketService.authenticateHost(tokens.accessToken);
    }
    
    socketService.on('server:authenticated', () => {
      console.log('Socket authenticated as host');
    });

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

    socketService.on('server:lock', (_data: SocketEvents['server:lock']) => {
      // Question is locked, show results
    });

    socketService.on('server:leaderboard', (_data: SocketEvents['server:leaderboard']) => {
      // Update leaderboard
    });

    socketService.on('server:game_over', (_data: SocketEvents['server:game_over']) => {
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

  const copyJoinLink = async () => {
    const joinUrl = `${window.location.origin}/play/${session?.pin}`;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setJoinLinkCopied(true);
      setTimeout(() => setJoinLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareViaWebShare = async () => {
    const joinUrl = `${window.location.origin}/play/${session?.pin}`;
    const shareData = {
      title: `Join ${session?.quiz.title}`,
      text: `Join the quiz "${session?.quiz.title}"! Use PIN: ${session?.pin}`,
      url: joinUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
        copyJoinLink();
      }
    } else {
      copyJoinLink();
    }
  };

  const getJoinUrl = () => {
    return `${window.location.origin}/play/${session?.pin}`;
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
              <div className="text-right mr-4">
                <p className="text-sm text-gray-500">Game PIN</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-primary-600">{session.pin}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPin}
                    className="flex items-center"
                    title="Copy PIN"
                  >
                    {pinCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => setShowShareModal(true)}
                className="flex items-center"
                variant="primary"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Game
              </Button>
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 font-medium mb-2">Ready to Start</p>
                    <p className="text-blue-700 text-sm">
                      {session.players.length === 0 
                        ? "Share the PIN with players to let them join the game."
                        : `${session.players.length} player${session.players.length > 1 ? 's' : ''} ready! Click a question to start.`
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {session.quiz.questions.map((_, index) => (
                      <Button
                        key={index}
                        onClick={() => startQuestion(index)}
                        className="flex items-center justify-center h-auto py-4"
                        disabled={session.players.length === 0}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        <div className="text-left">
                          <div className="font-semibold">Question {index + 1}</div>
                          <div className="text-xs opacity-75">
                            {session.quiz.questions[index].text.substring(0, 30)}...
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-900">
                      Question {currentQuestionIndex + 1} of {session.quiz.questions.length}
                    </h3>
                    <p className="text-primary-700">
                      Players are answering. Wait for the timer to finish.
                    </p>
                  </div>
                  
                  {/* Current Question Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Current Question:</p>
                    <p className="font-medium text-gray-900">
                      {session.quiz.questions[currentQuestionIndex]?.text}
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    {currentQuestionIndex + 1 < session.quiz.questions.length ? (
                      <Button
                        onClick={nextQuestion}
                        className="flex items-center flex-1"
                      >
                        <SkipForward className="h-4 w-4 mr-2" />
                        Next Question
                      </Button>
                    ) : (
                      <Button
                        onClick={endGame}
                        variant="primary"
                        className="flex items-center flex-1"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Finish Quiz
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setIsGameActive(false)}
                      className="flex items-center"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      End Early
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
                  {session.players.map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400 w-6">#{index + 1}</span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary-600">{player.score}</span>
                        <span className="text-xs text-gray-500 ml-1">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            {session.players.length > 0 && (
              <div className="card mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Leaderboard
                  </h3>
                  <span className="text-xs text-gray-500">
                    {isGameActive ? 'Live' : 'Waiting'}
                  </span>
                </div>
                <div className="space-y-2">
                  {session.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => {
                      const isTopThree = index < 3;
                      return (
                        <div 
                          key={player.id} 
                          className={`flex justify-between items-center py-2 px-3 rounded-lg transition ${
                            isTopThree ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-bold ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              index === 2 ? 'text-orange-500' : 
                              'text-gray-400'
                            }`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            <span className="font-medium">{player.name}</span>
                          </div>
                          <span className="font-bold text-primary-600">{player.score}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Players</h3>
              
              <div className="space-y-4">
                {/* PIN Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game PIN
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={session.pin}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-2xl font-bold text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPin}
                      title="Copy PIN"
                    >
                      {pinCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Join Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={getJoinUrl()}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyJoinLink}
                      title="Copy Link"
                    >
                      {joinLinkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={shareViaWebShare}
                    className="flex-1 flex items-center justify-center"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>How to join:</strong><br />
                    1. Share the PIN or link with players<br />
                    2. Players visit the link or enter the PIN<br />
                    3. They enter their name to join the game
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostPage;
