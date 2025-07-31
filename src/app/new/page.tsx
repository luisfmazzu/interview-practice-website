'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthUser, clearAuthUser } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { TopicSelection } from '@/components/question-insert/TopicSelection';
import { QuestionInput } from '@/components/question-insert/QuestionInput';
import { SuccessPage } from '@/components/question-insert/SuccessPage';

type Step = 'login' | 'topic-selection' | 'question-input' | 'success';

interface InsertionResult {
  success: boolean;
  insertedCount: number;
  topic: string;
  errors?: string[];
}

export default function NewQuestionPage() {
  const [currentStep, setCurrentStep] = useState<Step>('login');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [insertionResult, setInsertionResult] = useState<InsertionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on page load
    if (isAuthenticated()) {
      setCurrentStep('topic-selection');
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setCurrentStep('topic-selection');
  };

  const handleTopicSelected = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentStep('question-input');
  };

  const handleQuestionsSubmitted = (result: InsertionResult) => {
    setInsertionResult(result);
    setCurrentStep('success');
  };

  const handleAddMore = () => {
    setSelectedTopic('');
    setInsertionResult(null);
    setCurrentStep('topic-selection');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    clearAuthUser();
    setCurrentStep('login');
    setSelectedTopic('');
    setInsertionResult(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const user = getAuthUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {user && currentStep !== 'login' && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Add Interview Questions
                </h1>
                <p className="text-sm text-gray-600">
                  Logged in as: <span className="font-medium">{user.username}</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 hover:border-gray-400"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {currentStep === 'login' && (
          <LoginForm onLogin={handleLogin} />
        )}

        {currentStep === 'topic-selection' && (
          <TopicSelection onTopicSelected={handleTopicSelected} />
        )}

        {currentStep === 'question-input' && (
          <QuestionInput
            topic={selectedTopic}
            onQuestionsSubmitted={handleQuestionsSubmitted}
            onBackToTopics={() => setCurrentStep('topic-selection')}
          />
        )}

        {currentStep === 'success' && insertionResult && (
          <SuccessPage
            result={insertionResult}
            onAddMore={handleAddMore}
            onGoHome={handleGoHome}
          />
        )}
      </main>
    </div>
  );
}