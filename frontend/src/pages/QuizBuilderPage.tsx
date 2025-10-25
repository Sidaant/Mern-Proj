import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Quiz, Question } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const QuizBuilderPage: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!quizId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    questions: []
  });

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getQuiz(quizId!);
      setQuiz(response.quiz);
    } catch (err: any) {
      setError('Failed to load quiz');
      console.error('Load quiz error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      timerSec: 30
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      ) || []
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => 
                j === optionIndex ? value : opt
              ) as [string, string, string, string]
            }
          : q
      ) || []
    }));
  };

  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = async () => {
    if (!quiz.title?.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (!quiz.questions?.length) {
      setError('Quiz must have at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} must have all options filled`);
        return;
      }
    }

    try {
      setSaving(true);
      setError('');

      if (quizId) {
        await apiClient.updateQuiz(quizId, quiz);
      } else {
        const response = await apiClient.createQuiz(quiz);
        navigate(`/builder/${response.quiz.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save quiz');
    } finally {
      setSaving(false);
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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                {quizId ? 'Edit Quiz' : 'Create Quiz'}
              </h1>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Quiz
              </Button>
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

        <div className="space-y-6">
          {/* Quiz Details */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
            <div className="space-y-4">
              <Input
                label="Quiz Title"
                value={quiz.title || ''}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title"
                required
              />
              <Input
                label="Description (Optional)"
                value={quiz.description || ''}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter quiz description"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions ({quiz.questions?.length || 0})</h2>
              <Button
                onClick={addQuestion}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {quiz.questions?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No questions yet. Click "Add Question" to get started.
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions?.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Question Text"
                        value={question.text}
                        onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                        placeholder="Enter your question"
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.correctIndex === optionIndex}
                                onChange={() => updateQuestion(index, 'correctIndex', optionIndex)}
                                className="h-4 w-4 text-primary-600"
                              />
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Select the correct answer by clicking the radio button
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Timer (seconds)"
                          type="number"
                          value={question.timerSec}
                          onChange={(e) => updateQuestion(index, 'timerSec', parseInt(e.target.value) || 30)}
                          min="5"
                          max="300"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizBuilderPage;
