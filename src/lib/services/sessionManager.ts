import { SessionData, Category } from '@/types';
import { LocalStorageManager } from './localStorage';
import { STORAGE_KEYS } from '../constants';

export class SessionManager {
  private storageManager: LocalStorageManager;
  private sessionKey = STORAGE_KEYS.SESSION_DATA;

  constructor() {
    this.storageManager = LocalStorageManager.getInstance();
  }

  generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ses_${timestamp}_${random}`;
  }

  createSession(
    category: Category,
    technologies: string[] = []
  ): SessionData {
    const sessionData: SessionData = {
      selectedCategory: category,
      selectedTechnologies: technologies,
      accessedQuestionIds: [],
      sessionStartTime: Date.now(),
      sessionId: this.generateSessionId()
    };

    this.saveSession(sessionData);
    return sessionData;
  }

  saveSession(sessionData: SessionData): void {
    this.storageManager.set(this.sessionKey, sessionData);
  }

  loadSession(): SessionData | null {
    return this.storageManager.get<SessionData>(this.sessionKey);
  }

  updateSession(updates: Partial<SessionData>): SessionData | null {
    const currentSession = this.loadSession();
    if (!currentSession) return null;

    const updatedSession = { ...currentSession, ...updates };
    this.saveSession(updatedSession);
    return updatedSession;
  }

  addAccessedQuestion(questionId: number): SessionData | null {
    const currentSession = this.loadSession();
    if (!currentSession) return null;

    const updatedAccessedIds = [...currentSession.accessedQuestionIds];
    if (!updatedAccessedIds.includes(questionId)) {
      updatedAccessedIds.push(questionId);
    }

    return this.updateSession({
      accessedQuestionIds: updatedAccessedIds,
      currentQuestionId: questionId
    });
  }

  isQuestionAccessed(questionId: number): boolean {
    const session = this.loadSession();
    return session?.accessedQuestionIds.includes(questionId) ?? false;
  }

  clearSession(): void {
    this.storageManager.remove(this.sessionKey);
  }

  isValidSession(): boolean {
    const session = this.loadSession();
    if (!session) return false;

    // Check if session has required fields
    const hasRequiredFields = !!(
      session.selectedCategory &&
      session.sessionStartTime &&
      session.sessionId
    );

    // Check if general category has technologies selected
    if (session.selectedCategory === 'general') {
      return hasRequiredFields && session.selectedTechnologies.length > 0;
    }

    return hasRequiredFields;
  }

  getSessionDuration(): number {
    const session = this.loadSession();
    if (!session) return 0;
    return Date.now() - session.sessionStartTime;
  }

  getAccessedQuestionCount(): number {
    const session = this.loadSession();
    return session?.accessedQuestionIds.length ?? 0;
  }
}