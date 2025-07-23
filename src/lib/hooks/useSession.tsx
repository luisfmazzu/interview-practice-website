'use client';

import { useState, useEffect } from 'react';
import { SessionData, Category } from '@/types';
import { useServices } from './useServices';

export const useSession = () => {
  const { sessionManager } = useServices();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSession = () => {
    setIsLoading(true);
    // Only load session on client side
    if (typeof window !== 'undefined') {
      const session = sessionManager.loadSession();
      setSessionData(session);
    }
    setIsLoading(false);
  };

  const createSession = (category: Category, technologies: string[] = []) => {
    if (typeof window === 'undefined') {
      return null;
    }
    const newSession = sessionManager.createSession(category, technologies);
    setSessionData(newSession);
    return newSession;
  };

  const updateSession = (updates: Partial<SessionData>) => {
    const updatedSession = sessionManager.updateSession(updates);
    setSessionData(updatedSession);
    return updatedSession;
  };

  const addAccessedQuestion = (questionId: number) => {
    const updatedSession = sessionManager.addAccessedQuestion(questionId);
    setSessionData(updatedSession);
    return updatedSession;
  };

  const clearSession = () => {
    sessionManager.clearSession();
    setSessionData(null);
  };

  const isValidSession = () => {
    return sessionManager.isValidSession();
  };

  return {
    sessionData,
    isLoading,
    createSession,
    updateSession,
    addAccessedQuestion,
    clearSession,
    isValidSession,
    loadSession,
  };
};