import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Quiz } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Edit, Trash2, Play, Users } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getQuizzes();
      setQuizzes(response.quizzes as Quiz[]);
    } catch (err: any) {
      setError('Failed to load quizzes');
      console.error('Load quizzes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await apiClient.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (err: any) {
      setError('Failed to delete quiz');
      console.error('Delete quiz error:', err);
    }
  };

  const handleCreateSession = async (quizId: string) => {
    try {
      const response = await apiClient.createSession(quizId);
      navigate(`/host/${response.session.session.id}`);
    } catch (err: any) {
      setError('Failed to create session');
      console.error('Create session error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
              <h1 className="text-3xl font-bold text-gray-900">QuizSync</h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/builder')}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Quiz
              </Button>
              <Button
                variant="secondary"
                onClick={logout}
              >
                Logout
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

        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Quizzes</h2>
            <Button
              onClick={() => navigate('/builder')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new quiz.</p>
              <div className="mt-6">
                <Button onClick={() => navigate('/builder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {quiz.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/builder/${quiz.id}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit quiz"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete quiz"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {quiz.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{quiz.questionCount || quiz.questions.length} questions</span>
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleCreateSession(quiz.id)}
                      className="flex-1"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Game
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/builder/${quiz.id}`)}
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
