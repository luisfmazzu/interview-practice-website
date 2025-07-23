'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { QuestionService, SessionManager, LocalStorageManager } from '../services';

interface ServiceContainer {
  questionService: QuestionService;
  sessionManager: SessionManager;
  storageManager: LocalStorageManager;
}

const ServiceContext = createContext<ServiceContainer | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const services: ServiceContainer = {
    questionService: new QuestionService(),
    sessionManager: new SessionManager(),
    storageManager: LocalStorageManager.getInstance(),
  };

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = (): ServiceContainer => {
  const services = useContext(ServiceContext);
  if (!services) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return services;
};