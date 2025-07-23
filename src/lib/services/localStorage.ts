import { STORAGE_KEYS } from '../constants';

export class LocalStorageManager {
  private static instance: LocalStorageManager;

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  set<T>(key: string, value: T): boolean {
    try {
      if (!this.isAvailable()) return false;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`LocalStorage set error for key ${key}:`, error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      if (!this.isAvailable()) return null;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`LocalStorage get error for key ${key}:`, error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      if (!this.isAvailable()) return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`LocalStorage remove error for key ${key}:`, error);
    }
  }

  clear(): void {
    try {
      if (!this.isAvailable()) return;
      localStorage.clear();
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }

  // Specific methods for our app
  getSessionData() {
    return this.get(STORAGE_KEYS.SESSION_DATA);
  }

  setSessionData(data: any) {
    return this.set(STORAGE_KEYS.SESSION_DATA, data);
  }

  clearSessionData() {
    this.remove(STORAGE_KEYS.SESSION_DATA);
  }

  getUserPreferences() {
    return this.get(STORAGE_KEYS.USER_PREFERENCES);
  }

  setUserPreferences(preferences: any) {
    return this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }
}