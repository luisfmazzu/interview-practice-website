// LocalStorage keys
export const STORAGE_KEYS = {
  SESSION_DATA: 'interview_practice_session',
  USER_PREFERENCES: 'interview_practice_preferences',
  QUESTION_CACHE: 'interview_practice_cache'
} as const;

// Technology options for General category
export const TECHNOLOGIES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'react', label: 'React' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'nodejs', label: 'Node.js' },
  { id: 'expressjs', label: 'Express.js' },
  { id: 'nestjs', label: 'Nest.js' },
  { id: 'python', label: 'Python' },
  { id: 'django', label: 'Django' },
  { id: 'flask', label: 'Flask' },
  { id: 'fastapi', label: 'FastAPI' },
  { id: 'cicd', label: 'CI/CD' },
  { id: 'aws', label: 'AWS' },
  { id: 'serverless', label: 'Serverless' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'mongodb', label: 'MongoDB' },
  { id: 'docker', label: 'Docker' },
  { id: 'graphql', label: 'GraphQL' },
  { id: 'apis', label: 'APIs' },
  { id: 'celery', label: 'Celery' },
  { id: 'csharp', label: 'C#' },
  { id: 'rust', label: 'Rust' },
  { id: 'golang', label: 'Golang' },
  { id: 'gin', label: 'Gin' },
] as const;

// Category options
export const CATEGORIES = [
  { id: 'general', label: 'General', description: 'Technology-specific technical questions' },
  { id: 'systems_design', label: 'Systems Design', description: 'Architecture and design questions' },
  { id: 'behaviour', label: 'Behaviour', description: 'Behavioral interview questions' },
] as const;