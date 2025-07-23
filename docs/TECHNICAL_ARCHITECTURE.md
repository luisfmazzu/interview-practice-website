# Technical Architecture Documentation
# Interview Practice Website

## 1. System Overview

### 1.1 Architecture Pattern
The application follows a **Client-Side Single Page Application (SPA)** architecture with **Static Site Generation (SSG)** capabilities using Next.js.

### 1.2 Key Architectural Decisions
- **Framework**: Next.js for React-based SSG and optimal performance
- **Styling**: TailwindCSS for utility-first styling approach  
- **State Management**: Browser localStorage + React Context for session state
- **Data Storage**: Static JSON files for questions, no backend required
- **Deployment**: Static hosting (Vercel/Netlify) for cost-effective scaling

## 2. Application Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌─────────────────────────────────────────────────────────┤
│  │                    Next.js App                          │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┤
│  │  │  Selection Page │  │         Practice Page           │
│  │  │    (/)         │  │        (/practice)              │
│  │  │                │  │                                 │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ ┌─────────────┤ │
│  │  │ │  Category   │ │  │ │   Timer     │ │  Question   │ │
│  │  │ │  Selection  │ │  │ │ Component   │ │  Display    │ │
│  │  │ └─────────────┘ │  │ └─────────────┘ │             │ │
│  │  │                 │  │                 │             │ │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │ ┌─────────┤ │ │
│  │  │ │ Technology  │ │  │ │   Answer    │ │ │ Action  │ │ │
│  │  │ │ Multi-Select│ │  │ │   Display   │ │ │ Buttons │ │ │
│  │  │ └─────────────┘ │  │ └─────────────┘ │ └─────────┤ │ │
│  │  └─────────────────┘  └─────────────────────────────────┤ │
│  └─────────────────────────────────────────────────────────┤ │
│                                                             │ │
│  ┌─────────────────────────────────────────────────────────┤ │
│  │                 Shared Services Layer                   │ │
│  │                                                         │ │
│  │ ┌─────────────┐ ┌──────────────┐ ┌──────────────────┤ │ │
│  │ │ Question    │ │ LocalStorage │ │ Session          │ │ │
│  │ │ Service     │ │ Manager      │ │ Manager          │ │ │
│  │ └─────────────┘ └──────────────┘ └──────────────────┤ │ │
│  └─────────────────────────────────────────────────────────┤ │
│                                                             │ │
│  ┌─────────────────────────────────────────────────────────┤ │
│  │                 Static Data Layer                       │ │
│  │                                                         │ │
│  │ ┌─────────────┐ ┌──────────────┐ ┌──────────────────┤ │ │
│  │ │ Questions   │ │ Technology   │ │ Category         │ │ │
│  │ │ JSON Files  │ │ Questions    │ │ Questions        │ │ │
│  │ └─────────────┘ └──────────────┘ └──────────────────┤ │ │
│  └─────────────────────────────────────────────────────────┤ │
│                                                             │ │
│  ┌─────────────────────────────────────────────────────────┤ │
│  │                  Browser APIs                           │ │
│  │             (localStorage, Timer API)                   │ │
│  └─────────────────────────────────────────────────────────┤ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy

```
App (Next.js Root)
├── Layout
│   ├── Header
│   └── Main Content Area
├── Selection Page (/)
│   ├── CategorySelector
│   ├── TechnologySelector (conditional)
│   └── StartButton
└── Practice Page (/practice)
    ├── Timer
    ├── QuestionDisplay
    ├── AnswerDisplay (conditional)
    └── ActionButtons
        ├── ShowAnswerButton
        ├── NextQuestionButton
        └── EndSessionButton
```

## 3. Data Flow Architecture

### 3.1 Data Flow Diagram

```
User Selection → localStorage → Question Service → Random Selection → Display
     ↓               ↓              ↓                    ↓            ↓
┌─────────┐    ┌─────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────┐
│Category │    │Session  │   │Filter       │   │Randomize    │   │Question │
│Tech     │───▶│Storage  │──▶│Questions by │──▶│& Exclude    │──▶│Display  │
│Selection│    │         │   │Selection    │   │Used IDs     │   │         │
└─────────┘    └─────────┘   └─────────────┘   └─────────────┘   └─────────┘
                     │                                 │
                     ▼                                 ▼
               ┌─────────────┐                 ┌─────────────┐
               │Track        │                 │Update       │
               │Accessed     │◀────────────────│Accessed     │
               │Question IDs │                 │Questions    │
               └─────────────┘                 └─────────────┘
```

### 3.2 State Management Flow

```
Initial Load → Check localStorage → Route Decision
                        │
                ┌───────┴──────┐
                ▼              ▼
        Valid Session?     No Session
                │              │
                ▼              ▼
        Practice Page    Selection Page
                │              │
        Load Questions     User Selection
                │              │
                ▼              ▼  
        Display Question   Store Session
                │              │
        User Actions       Navigate to Practice
                │              │
                ▼──────────────┘
          Update Session State
```

## 4. Service Layer Architecture

### 4.1 Core Services

#### QuestionService
```typescript
class QuestionService {
  private questionIndex: Map<number, Question>;
  private questionsByTag: Map<string, Question[]>;
  
  async loadQuestions(tags: string[]): Promise<Question[]>
  getRandomQuestion(excludeIds: number[]): Question | null
  filterQuestionsByTags(tags: string[]): Question[]
  preloadNextQuestions(count: number): void
}
```

#### SessionManager  
```typescript
class SessionManager {
  private sessionKey = 'interview_practice_session';
  
  saveSession(sessionData: SessionData): void
  loadSession(): SessionData | null
  clearSession(): void
  addAccessedQuestion(questionId: number): void
  isQuestionAccessed(questionId: number): boolean
}
```

#### LocalStorageManager
```typescript
class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  set<T>(key: string, value: T): boolean
  get<T>(key: string): T | null
  remove(key: string): void
  clear(): void
  isAvailable(): boolean
}
```

### 4.2 Service Integration Pattern

```typescript
// Dependency injection pattern for services
interface ServiceContainer {
  questionService: QuestionService;
  sessionManager: SessionManager;
  storageManager: LocalStorageManager;
}

// React Context for service access
const ServiceContext = createContext<ServiceContainer | null>(null);

export const useServices = () => {
  const services = useContext(ServiceContext);
  if (!services) {
    throw new Error('Services not available');
  }
  return services;
};
```

## 5. Component Architecture

### 5.1 Component Design Principles

- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Use component composition
- **Props Interface**: Well-defined TypeScript interfaces
- **Error Boundaries**: Graceful error handling
- **Performance**: Memoization where appropriate

### 5.2 Key Components Specification

#### SelectionPage Component
```typescript
interface SelectionPageProps {}

interface SelectionPageState {
  selectedCategory: Category;
  selectedTechnologies: string[];
  isSubmitting: boolean;
  validationErrors: string[];
}
```

#### PracticePage Component  
```typescript
interface PracticePageProps {}

interface PracticePageState {
  currentQuestion: Question | null;
  showAnswer: boolean;
  timeElapsed: number;
  isLoading: boolean;
  sessionData: SessionData;
}
```

#### Timer Component
```typescript
interface TimerProps {
  onTick?: (seconds: number) => void;
  autoStart?: boolean;
  format?: 'MM:SS' | 'SS';
}

interface TimerState {
  seconds: number;
  isRunning: boolean;
  startTime: number;
}
```

### 5.3 Component Communication Patterns

**Parent-Child Communication**: Props and callbacks
```typescript
// Parent passes data down, child sends events up
<Timer 
  autoStart={true}
  onTick={handleTimerTick}
  onReset={handleTimerReset}
/>
```

**Global State**: React Context for cross-cutting concerns
```typescript
// Session state available throughout app
const { sessionData, updateSession } = useSessionContext();
```

**Service Integration**: Custom hooks for business logic
```typescript
// Encapsulate service calls in hooks
const { currentQuestion, nextQuestion, endSession } = useQuestionService();
```

## 6. Routing Architecture

### 6.1 Next.js Routing Structure

```
pages/
├── _app.tsx          # App wrapper with providers
├── _document.tsx     # Custom document structure  
├── index.tsx         # Selection page (/)
└── practice.tsx      # Practice page (/practice)
```

### 6.2 Route Protection Pattern

```typescript
// Practice page protection
export default function PracticePage() {
  const router = useRouter();
  const { sessionData } = useSession();
  
  useEffect(() => {
    if (!sessionData?.selectedCategory) {
      router.push('/');  // Redirect to selection if no session
    }
  }, [sessionData, router]);
  
  if (!sessionData) {
    return <LoadingSpinner />;
  }
  
  return <PracticeInterface />;
}
```

### 6.3 Navigation Flow

```
/ (Selection) ──────────▶ /practice
     ▲                      │
     │                      │
     └──────── End Session ─┘
```

## 7. Performance Architecture

### 7.1 Loading Strategies

**Code Splitting**: Automatic Next.js route-based splitting
```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
});
```

**Data Preloading**: Question prefetching
```typescript
// Preload next questions in background
useEffect(() => {
  if (currentQuestion) {
    questionService.preloadNextQuestions(3);
  }
}, [currentQuestion]);
```

### 7.2 Caching Strategy

**Static Generation**: Pre-build pages at build time
```typescript
// Static generation for selection page
export async function getStaticProps() {
  const technologies = await loadTechnologyList();
  return {
    props: { technologies },
    revalidate: 3600  // Revalidate every hour
  };
}
```

**Browser Caching**: Service worker for offline support
```typescript
// Cache questions for offline access
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/data/questions/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

### 7.3 Optimization Techniques

**Bundle Optimization**: 
- Tree shaking for unused code elimination
- Dynamic imports for code splitting
- Image optimization with Next.js Image component

**Runtime Optimization**:
- React.memo for expensive renders
- useCallback/useMemo for expensive calculations
- Virtual scrolling for large lists (future enhancement)

## 8. Security Architecture

### 8.1 Client-Side Security

**Input Validation**: 
- Validate all user inputs before processing
- Sanitize data before localStorage storage
- Type checking with TypeScript

**Data Protection**:
- No sensitive data stored in localStorage
- Session data encryption for enhanced security
- XSS prevention through React's built-in protections

### 8.2 Content Security

**Static Assets**: All question data served as static files
**No Backend**: Eliminates server-side attack vectors
**HTTPS Only**: Enforce HTTPS in production environment

## 9. Error Handling Architecture

### 9.1 Error Boundary Strategy

```typescript
class AppErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('App Error:', error, errorInfo);
    
    // Provide fallback UI
    this.setState({ hasError: true, error });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 9.2 Service Error Handling

```typescript
// Service-level error handling
async function safeServiceCall<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error);
    return fallback;
  }
}
```

## 10. Testing Architecture

### 10.1 Testing Strategy

**Unit Tests**: Individual components and services
**Integration Tests**: Component interactions and data flow  
**E2E Tests**: Full user journey testing

### 10.2 Testing Structure

```
tests/
├── unit/
│   ├── components/
│   ├── services/
│   └── utils/
├── integration/
│   ├── user-flows/
│   └── data-management/
└── e2e/
    ├── selection-flow.spec.ts
    └── practice-session.spec.ts
```

## 11. Deployment Architecture

### 11.1 Build Process

```typescript
// Next.js build configuration
module.exports = {
  output: 'export',        // Static export
  trailingSlash: true,     // Compatible with static hosting
  images: {
    unoptimized: true      // For static deployment
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/app' : ''
};
```

### 11.2 Deployment Pipeline

```
Development → Build → Test → Deploy → Monitor
     │          │      │       │        │
     ├─ ESLint  ├─ SSG  ├─ E2E  ├─ CDN   ├─ Analytics
     ├─ Type    ├─ Test ├─ Perf ├─ SSL   └─ Error Tracking
     └─ Format  └─ Opt  └─ A11y └─ Cache
```

## 12. Scalability Considerations

### 12.1 Horizontal Scaling
- Static file hosting scales automatically
- CDN distribution for global performance
- No database bottlenecks

### 12.2 Future Architecture Evolution
- **Progressive Web App**: Add service worker for offline capability
- **Backend Integration**: API layer for user progress tracking
- **Real-time Features**: WebSocket integration for collaborative features
- **Machine Learning**: Question recommendation system