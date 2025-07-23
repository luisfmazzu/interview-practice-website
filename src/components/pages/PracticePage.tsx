'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/types';
import { useSession, useServices } from '@/lib/hooks';
import { Button, Card, Timer, LoadingSpinner } from '@/components/ui';

const PracticePage: React.FC = () => {
  const router = useRouter();
  const { sessionData, addAccessedQuestion, clearSession, isValidSession } = useSession();
  const { questionService } = useServices();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionsExhausted, setQuestionsExhausted] = useState(false);

  useEffect(() => {
    initializePracticeSession();
  }, [sessionData]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializePracticeSession = async () => {
    // Check if session is valid
    if (!isValidSession() || !sessionData) {
      router.push('/');
      return;
    }

    setIsLoading(true);
    
    try {
      // Initialize questions based on session data
      await questionService.initializeQuestions(
        sessionData.selectedCategory,
        sessionData.selectedTechnologies
      );
      
      // Load first question
      loadNextQuestion();
    } catch (error) {
      console.error('Error initializing practice session:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextQuestion = () => {
    if (!sessionData) return;

    const nextQuestion = questionService.getRandomQuestion(sessionData.accessedQuestionIds);
    
    if (!nextQuestion) {
      setQuestionsExhausted(true);
      return;
    }

    setCurrentQuestion(nextQuestion);
    setShowAnswer(false);
    
    // Add question to accessed list
    addAccessedQuestion(nextQuestion.id);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    loadNextQuestion();
  };

  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this practice session?')) {
      clearSession();
      router.push('/');
    }
  };

  const handleTimerTick = (seconds: number) => {
    setTimeElapsed(seconds);
  };

  const handleTimerReset = () => {
    setTimeElapsed(0);
  };

  // Show loading state
  if (isLoading || !sessionData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your practice session...</p>
        </div>
      </div>
    );
  }

  // Show questions exhausted state
  if (questionsExhausted) {
    const totalQuestions = questionService.getTotalQuestions();
    const accessedCount = sessionData.accessedQuestionIds.length;
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Congratulations!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              You&apos;ve completed all available questions in this category.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Session Summary:</strong><br />
                Questions completed: {accessedCount} of {totalQuestions}<br />
                Time spent: {Math.floor(timeElapsed / 60)} minutes {timeElapsed % 60} seconds
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => router.push('/')} size="lg">
                Start New Practice Session
              </Button>
              <div>
                <Button 
                  onClick={handleEndSession} 
                  variant="secondary"
                  size="lg"
                >
                  Return to Selection
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-gray-600">No questions available.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Return to Selection
          </Button>
        </div>
      </div>
    );
  }

  const remainingQuestions = questionService.getRemainingQuestionCount(sessionData.accessedQuestionIds);
  const totalQuestions = questionService.getTotalQuestions();
  const progress = totalQuestions > 0 ? ((totalQuestions - remainingQuestions) / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with timer and progress */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Question {sessionData.accessedQuestionIds.length} of {totalQuestions}
          </div>
          <Timer 
            autoStart={true}
            onTick={handleTimerTick}
            onReset={handleTimerReset}
          />
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card title="Question">
        <div className="space-y-6">
          {/* Question text */}
          <div className="text-lg text-gray-800 leading-relaxed">
            {currentQuestion.question}
          </div>

          {/* Difficulty badge */}
          {currentQuestion.difficulty && (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === 'easy' 
                  ? 'bg-green-100 text-green-800'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </span>
            </div>
          )}

          {/* Answer section */}
          {showAnswer && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Answer:</h3>
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: currentQuestion.answer.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} size="lg">
                Show Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg">
                Next Question
              </Button>
            )}
            
            <Button 
              onClick={handleEndSession} 
              variant="danger"
              size="lg"
            >
              End Session
            </Button>
            
            <div className="text-sm text-gray-500 flex items-center sm:ml-auto">
              {remainingQuestions} questions remaining
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PracticePage;