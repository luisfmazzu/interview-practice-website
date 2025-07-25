# Data Structure Documentation
# Interview Practice Website

## 1. Overview

This document defines the JSON data structure, schema definitions, and data management strategies for the interview practice website.

## 2. Question Data Schema

### 2.1 Question Object Structure

```typescript
interface Question {
  id: number;           // Unique identifier for the question
  tag: string;          // Category/technology tag for filtering
  question: string;     // The question text
  answer: string;       // The answer content (supports HTML/Markdown)
  difficulty?: 'easy' | 'medium' | 'hard';  // Optional difficulty level
  createdAt?: string;   // Optional timestamp
}
```

### 2.2 Example Question Objects

```json
{
  "id": 1,
  "tag": "javascript",
  "question": "Explain the difference between `let`, `const`, and `var` in JavaScript.",
  "answer": "- `var`: Function-scoped, can be redeclared, hoisted with undefined value\n- `let`: Block-scoped, cannot be redeclared, hoisted but not initialized\n- `const`: Block-scoped, cannot be redeclared or reassigned, must be initialized",
  "difficulty": "easy"
}
```

```json
{
  "id": 50,
  "tag": "systems_design",
  "question": "Design a URL shortening service like bit.ly. Consider scalability, performance, and reliability.",
  "answer": "Key components:\n1. **Load Balancer**: Distribute requests\n2. **Application Servers**: Handle business logic\n3. **Database**: Store URL mappings (consider sharding)\n4. **Cache**: Redis/Memcached for frequent URLs\n5. **Analytics Service**: Track clicks and usage\n6. **Rate Limiting**: Prevent abuse\n\nConsiderations:\n- Base62 encoding for short URLs\n- Database partitioning strategies\n- CDN for global performance\n- Monitoring and alerting"
}
```

## 3. Tag System

### 3.1 Tag Categories

**Technology Tags** (for General category):
- `javascript`
- `typescript`  
- `react`
- `nextjs`
- `nodejs`
- `expressjs`
- `nestjs`
- `python`
- `django`
- `flask`
- `fastapi`
- `cicd`
- `aws`
- `serverless`
- `postgresql`
- `mongodb`
- `docker`
- `graphql`
- `csharp`
- `rust`
- `golang`
- `gin`

**Category Tags**:
- `systems_design`
- `behaviour`

### 3.2 Tag Validation Schema

```typescript
type TechnologyTag = 
  | 'javascript' | 'typescript' | 'react' | 'nextjs' | 'nodejs' 
  | 'expressjs' | 'nestjs' | 'python' | 'django' | 'flask' 
  | 'fastapi' | 'cicd' | 'aws' | 'serverless' | 'postgresql' 
  | 'mongodb' | 'docker' | 'graphql' | 'csharp' 
  | 'rust' | 'golang' | 'gin';

type CategoryTag = 'systems_design' | 'behaviour';

type QuestionTag = TechnologyTag | CategoryTag;
```

## 4. Data File Organization

### 4.1 File Structure

```
/data
├── questions/
│   ├── general/
│   │   ├── javascript.json
│   │   ├── typescript.json
│   │   ├── react.json
│   │   ├── python.json
│   │   └── ... (one file per technology)
│   ├── systems_design.json
│   ├── behaviour.json
│   └── index.json           // Master index for fast lookups
└── schemas/
    └── question.schema.json  // JSON schema for validation
```

### 4.2 Individual Technology Files

Each technology file contains an array of questions:

```json
// /data/questions/general/javascript.json
{
  "technology": "javascript",
  "questions": [
    {
      "id": 1,
      "tag": "javascript",
      "question": "What is closure in JavaScript?",
      "answer": "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned..."
    },
    {
      "id": 2,
      "tag": "javascript", 
      "question": "Explain event bubbling and capturing.",
      "answer": "Event bubbling is when an event starts from the target element and bubbles up to parent elements..."
    }
  ]
}
```

### 4.3 Master Index File

```json
// /data/questions/index.json
{
  "totalQuestions": 150,
  "categories": {
    "general": {
      "javascript": 25,
      "typescript": 20,
      "react": 22,
      "python": 18,
      "systems_design": 30,
      "behaviour": 15
    }
  },
  "lastUpdated": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## 5. LocalStorage Schema

### 5.1 Session Data Structure

```typescript
interface SessionData {
  selectedCategory: 'general' | 'systems_design' | 'behaviour';
  selectedTechnologies: string[];      // Only populated for 'general' category
  accessedQuestionIds: number[];       // IDs of questions already shown
  sessionStartTime: number;            // Unix timestamp
  currentQuestionId?: number;          // Currently displayed question
  sessionId: string;                   // Unique session identifier
}
```

### 5.2 LocalStorage Keys

```typescript
const STORAGE_KEYS = {
  SESSION_DATA: 'interview_practice_session',
  USER_PREFERENCES: 'interview_practice_preferences',
  QUESTION_CACHE: 'interview_practice_cache'
} as const;
```

### 5.3 Example LocalStorage Data

```json
{
  "interview_practice_session": {
    "selectedCategory": "general",
    "selectedTechnologies": ["javascript", "react", "nodejs"],
    "accessedQuestionIds": [1, 15, 23, 8, 45],
    "sessionStartTime": 1705312200000,
    "currentQuestionId": 45,
    "sessionId": "ses_1705312200000_abc123"
  },
  "interview_practice_preferences": {
    "timerVisible": true,
    "showDifficulty": false,
    "autoAdvanceTimer": 30
  }
}
```

## 6. Data Loading Strategies

### 6.1 Question Loading Algorithm

```typescript
async function loadQuestionsBySelection(
  category: string, 
  technologies?: string[]
): Promise<Question[]> {
  if (category === 'general' && technologies) {
    // Load multiple technology files
    const questionSets = await Promise.all(
      technologies.map(tech => loadTechnologyQuestions(tech))
    );
    return questionSets.flat();
  } else {
    // Load single category file
    return await loadCategoryQuestions(category);
  }
}
```

### 6.2 Randomization Strategy

```typescript
function getRandomQuestion(
  availableQuestions: Question[],
  excludeIds: number[]
): Question | null {
  // Filter out already accessed questions
  const unAccessedQuestions = availableQuestions.filter(
    q => !excludeIds.includes(q.id)
  );
  
  if (unAccessedQuestions.length === 0) {
    return null; // All questions exhausted
  }
  
  // Use Fisher-Yates shuffle for true randomness
  const randomIndex = Math.floor(Math.random() * unAccessedQuestions.length);
  return unAccessedQuestions[randomIndex];
}
```

## 7. Performance Considerations

### 7.1 Data Optimization

**File Size Optimization**:
- Keep individual technology files under 100KB
- Use concise question and answer formatting
- Implement lazy loading for question content

**Caching Strategy**:
- Cache frequently accessed questions in localStorage
- Implement question preloading for next questions
- Use service worker for offline question access

### 7.2 Lookup Performance

**Index-Based Lookups**:
```typescript
// Build lookup index for O(1) question access
const questionIndex = new Map<number, Question>();
questions.forEach(q => questionIndex.set(q.id, q));

// Fast question retrieval
function getQuestionById(id: number): Question | undefined {
  return questionIndex.get(id);
}
```

**Tag-Based Filtering**:
```typescript
// Pre-group questions by tag for efficient filtering
const questionsByTag = new Map<string, Question[]>();
questions.forEach(q => {
  if (!questionsByTag.has(q.tag)) {
    questionsByTag.set(q.tag, []);
  }
  questionsByTag.get(q.tag)!.push(q);
});
```

## 8. Data Validation

### 8.1 JSON Schema for Questions

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "tag", "question", "answer"],
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1
    },
    "tag": {
      "type": "string",
      "enum": ["javascript", "typescript", "react", "systems_design", "behaviour"]
    },
    "question": {
      "type": "string",
      "minLength": 10,
      "maxLength": 1000
    },
    "answer": {
      "type": "string",
      "minLength": 20,
      "maxLength": 5000
    },
    "difficulty": {
      "type": "string",
      "enum": ["easy", "medium", "hard"]
    }
  }
}
```

### 8.2 Runtime Validation

```typescript
function validateQuestion(question: any): question is Question {
  return (
    typeof question.id === 'number' &&
    typeof question.tag === 'string' &&
    typeof question.question === 'string' &&
    typeof question.answer === 'string' &&
    question.id > 0 &&
    question.question.length >= 10 &&
    question.answer.length >= 20
  );
}
```

## 9. Error Handling

### 9.1 Data Loading Errors

```typescript
async function safeLoadQuestions(category: string): Promise<Question[]> {
  try {
    const questions = await loadQuestions(category);
    return questions.filter(validateQuestion);
  } catch (error) {
    console.error(`Failed to load questions for ${category}:`, error);
    return getFallbackQuestions(category);
  }
}
```

### 9.2 LocalStorage Errors

```typescript
function safeLocalStorageGet(key: string): any | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`LocalStorage read error for key ${key}:`, error);
    return null;
  }
}
```

## 10. Future Enhancements

### 10.1 Planned Extensions

- **Difficulty Levels**: Add difficulty-based filtering
- **Question Metadata**: Track creation date, author, last updated
- **User Ratings**: Allow users to rate question quality
- **Custom Question Sets**: User-created question collections
- **Question Analytics**: Track which questions are most challenging

### 10.2 Schema Evolution

- **Versioning**: Add schema version field for backward compatibility
- **Migration**: Implement data migration strategies for schema updates
- **Validation**: Enhanced validation rules for new fields