import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Session } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trophy, Medal, Award, Home } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSession(sessionId!);
      setSession(response.session);
    } catch (err: any) {
      setError('Failed to load session');
      console.error('Load session error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
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
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const sortedPlayers = session.players.sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Final Results</h1>
              <p className="text-gray-600">{session.quiz.title}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
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

        <div className="card">
          {/* Quiz Info */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 text-primary-600 mb-4">
              <Trophy className="h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">
              {session.players.length} players participated
            </p>
          </div>

          {/* Leaderboard */}
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              return (
                <div
                  key={player.id}
                  className={`flex justify-between items-center py-4 px-6 rounded-lg border-2 ${getRankColor(rank)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(rank)}
                      <span className="text-lg font-bold text-gray-700">
                        {rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-600">
                        {player.answers.filter(a => a.isCorrect).length} correct answers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{player.score}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{session.players.length}</p>
              <p className="text-sm text-gray-600">Total Players</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{session.quiz.questions.length}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(...session.players.map(p => p.score))}
              </p>
              <p className="text-sm text-gray-600">Highest Score</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 text-center space-x-4">
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="px-8"
            >
              Play Another Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="px-8"
            >
              Create New Quiz
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
