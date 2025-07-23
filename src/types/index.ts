// Core data types
export interface Question {
  id: number;
  tag: string;
  question: string;
  answer: string;
  keywords?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt?: string;
}

// Session management types
export interface SessionData {
  selectedCategory: 'general' | 'systems_design' | 'behaviour';
  selectedTechnologies: string[];
  accessedQuestionIds: number[];
  sessionStartTime: number;
  currentQuestionId?: number;
  sessionId: string;
}

// User preferences types
export interface UserPreferences {
  timerVisible: boolean;
  showDifficulty: boolean;
  autoAdvanceTimer?: number;
}

// Tag types
export type TechnologyTag = 
  | 'javascript' | 'typescript' | 'react' | 'nextjs' | 'nodejs' 
  | 'expressjs' | 'nestjs' | 'python' | 'django' | 'flask' 
  | 'fastapi' | 'cicd' | 'aws' | 'serverless' | 'postgresql' 
  | 'mongodb' | 'docker' | 'graphql' | 'apis' | 'csharp' 
  | 'rust' | 'golang' | 'gin';

export type CategoryTag = 'systems_design' | 'behaviour';
export type QuestionTag = TechnologyTag | CategoryTag;
export type Category = 'general' | 'systems_design' | 'behaviour';

// API response types
export interface QuestionFile {
  technology: string;
  questions: Question[];
}

export interface QuestionIndex {
  totalQuestions: number;
  categories: {
    [key: string]: number;
  };
  lastUpdated: string;
  version: string;
}

// Component prop types
export interface TimerProps {
  onTick?: (seconds: number) => void;
  autoStart?: boolean;
  format?: 'MM:SS' | 'SS';
  onReset?: () => void;
}

export interface TimerRef {
  reset: () => void;
  start: () => void;
  pause: () => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}