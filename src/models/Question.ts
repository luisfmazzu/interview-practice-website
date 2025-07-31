import { ObjectId } from 'mongodb';

export interface Question {
  _id?: ObjectId;
  id: string; // UUID4
  tag: string;
  question: string;
  answer: string;
  keywords?: string[];
  studyTopics?: string[]; // New field for study topics
  difficulty?: 'easy' | 'medium' | 'hard';
  createdBy: string; // New field for creator
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionInput {
  tag: string;
  question: string;
  answer: string;
  keywords?: string[];
  studyTopics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  createdBy?: string; // Optional in input, will default to authenticated user
}

export interface QuestionFilter {
  tag?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  keywords?: string[];
  studyTopics?: string[];
  createdBy?: string;
}

export const COLLECTIONS = {
  // General technology questions
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  REACT: 'react',
  NEXTJS: 'nextjs',
  NODEJS: 'nodejs',
  EXPRESSJS: 'expressjs',
  NESTJS: 'nestjs',
  PYTHON: 'python',
  DJANGO: 'django',
  FLASK: 'flask',
  FASTAPI: 'fastapi',
  CICD: 'cicd',
  AWS: 'aws',
  SERVERLESS: 'serverless',
  POSTGRESQL: 'postgresql',
  MONGODB: 'mongodb',
  DOCKER: 'docker',
  GRAPHQL: 'graphql',
  APIS: 'apis',
  CSHARP: 'csharp',
  RUST: 'rust',
  GOLANG: 'golang',
  GIN: 'gin',
  CELERY: 'celery',
  DATABASES: 'databases',
  
  // Special categories
  SYSTEMS_DESIGN: 'systems_design',
  BEHAVIOUR: 'behaviour'
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

export const COLLECTION_MAPPINGS: Record<string, CollectionName> = {
  // Map file names to collection names
  'javascript.json': COLLECTIONS.JAVASCRIPT,
  'typescript.json': COLLECTIONS.TYPESCRIPT,
  'react.json': COLLECTIONS.REACT,
  'nextjs.json': COLLECTIONS.NEXTJS,
  'nodejs.json': COLLECTIONS.NODEJS,
  'expressjs.json': COLLECTIONS.EXPRESSJS,
  'nestjs.json': COLLECTIONS.NESTJS,
  'python.json': COLLECTIONS.PYTHON,
  'django.json': COLLECTIONS.DJANGO,
  'flask.json': COLLECTIONS.FLASK,
  'fastapi.json': COLLECTIONS.FASTAPI,
  'cicd.json': COLLECTIONS.CICD,
  'aws.json': COLLECTIONS.AWS,
  'serverless.json': COLLECTIONS.SERVERLESS,
  'postgresql.json': COLLECTIONS.POSTGRESQL,
  'mongodb.json': COLLECTIONS.MONGODB,
  'docker.json': COLLECTIONS.DOCKER,
  'graphql.json': COLLECTIONS.GRAPHQL,
  'apis.json': COLLECTIONS.APIS,
  'csharp.json': COLLECTIONS.CSHARP,
  'rust.json': COLLECTIONS.RUST,
  'golang.json': COLLECTIONS.GOLANG,
  'gin.json': COLLECTIONS.GIN,
  'celery.json': COLLECTIONS.CELERY,
  'databases.json': COLLECTIONS.DATABASES,
  'systems_design.json': COLLECTIONS.SYSTEMS_DESIGN,
  'behaviour.json': COLLECTIONS.BEHAVIOUR
};