'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Question, TimerRef } from '@/types';
import { useSession, useServices } from '@/lib/hooks';
import { Button, Card, Timer, LoadingSpinner } from '@/components/ui';

const PracticePage: React.FC = () => {
  const router = useRouter();
  const { sessionData, addAccessedQuestion, clearSession, isValidSession, isLoading: sessionLoading } = useSession();
  const { questionService } = useServices();
  const timerRef = useRef<TimerRef>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionsExhausted, setQuestionsExhausted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionLoading && !isInitialized) {
      initializePracticeSession();
    }
  }, [sessionData, sessionLoading, isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setIsInitialized(true);
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
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    // Mark question as accessed when user shows the answer
    if (currentQuestion) {
      addAccessedQuestion(currentQuestion.id);
    }
  };

  const handleNextQuestion = () => {
    loadNextQuestion();
    // Reset the timer using the ref
    if (timerRef.current) {
      timerRef.current.reset();
    }
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
  if (isLoading || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your practice session...</p>
          <p className="mt-2 text-sm text-gray-500">Session data: {sessionData ? 'Available' : 'Not available'}</p>
        </div>
      </div>
    );
  }

  // Show no session state
  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No Practice Session Found</h2>
          <p className="text-gray-600 mb-4">Please start a new practice session.</p>
          <Button onClick={() => router.push('/')}>
            Go to Selection Page
          </Button>
        </div>
      </div>
    );
  }

  // Show questions exhausted state
  if (questionsExhausted) {
    const totalQuestions = questionService.getTotalQuestions();
    const accessedCount = sessionData.accessedQuestionIds.length;
    
    return (
      <div className="max-w-4xl mx-auto text-center">
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
    <div className="max-w-6xl mx-auto relative min-h-screen">
      {/* Header with timer and progress */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="text-lg text-gray-700 font-medium">
            Question {sessionData.accessedQuestionIds.length} of {totalQuestions}
          </div>
          <Timer 
            ref={timerRef}
            autoStart={true}
            onTick={handleTimerTick}
            onReset={handleTimerReset}
          />
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Top Navigation Buttons */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} size="lg" className="text-lg py-3 px-6">
                Show Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg" className="text-lg py-3 px-6">
                Next Question
              </Button>
            )}
          </div>
          
          <div className="text-base text-gray-600 flex items-center font-medium">
            {remainingQuestions} questions remaining
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card title="Question" className="w-full">
        <div className="space-y-8">
          {/* Question text */}
          <div className="text-xl text-gray-900 leading-relaxed font-medium">
            {currentQuestion.question}
          </div>

          {/* Difficulty badge */}
          {currentQuestion.difficulty && (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
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
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Answer:</h3>
                <div 
                  className="prose prose-lg max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ 
                    __html: currentQuestion.answer.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
              </div>

              {/* Keywords section */}
              {currentQuestion.keywords && currentQuestion.keywords.length > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Key Points to Cover:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full border border-blue-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-blue-700 mt-3 italic">
                    💡 These are the key concepts and terms interviewers typically expect to hear in your answer.
                  </p>
                </div>
              ) : null}

              {/* Study Topics section */}
              {currentQuestion.studyTopics && currentQuestion.studyTopics.length > 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Study Topics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.studyTopics.map((topic, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full border border-green-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-green-700 mt-3 italic">
                    📚 Related topics and areas you should study to deepen your understanding.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} size="lg" className="text-lg py-3 px-6">
                Show Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg" className="text-lg py-3 px-6">
                Next Question
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Fixed End Session Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button 
          onClick={handleEndSession} 
          variant="danger"
          size="lg"
          className="text-lg py-3 px-6 shadow-lg"
        >
          End Session
        </Button>
      </div>
    </div>
  );
};

export default PracticePage;