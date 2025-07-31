import { Question, Category } from '@/types';
import { COLLECTIONS, CollectionName } from '@/models/Question';

export class QuestionService {
  private questionIndex: Map<string, Question> = new Map();
  private questionsByTag: Map<string, Question[]> = new Map();
  private allQuestions: Question[] = [];
  private isLoaded = false;

  async loadQuestions(category: Category, technologies: string[] = []): Promise<Question[]> {
    if (category === 'general' && technologies.length > 0) {
      return this.loadTechnologyQuestions(technologies);
    } else if (category === 'systems_design') {
      return this.loadCategoryQuestions(COLLECTIONS.SYSTEMS_DESIGN);
    } else if (category === 'behaviour') {
      return this.loadCategoryQuestions(COLLECTIONS.BEHAVIOUR);
    }
    return [];
  }

  private async loadTechnologyQuestions(technologies: string[]): Promise<Question[]> {
    const questionSets = await Promise.all(
      technologies.map(tech => this.loadCollectionQuestions(tech as CollectionName))
    );
    return questionSets.flat();
  }

  private async loadCollectionQuestions(collection: CollectionName): Promise<Question[]> {
    try {
      const response = await fetch(`/api/questions?collection=${collection}&limit=1000`);
      if (!response.ok) {
        console.error(`Failed to load questions for ${collection}`);
        return [];
      }
      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error(`Error loading ${collection} questions:`, error);
      return [];
    }
  }

  private async loadCategoryQuestions(collection: CollectionName): Promise<Question[]> {
    return this.loadCollectionQuestions(collection);
  }

  async initializeQuestions(category: Category, technologies: string[] = []): Promise<void> {
    const questions = await this.loadQuestions(category, technologies);
    this.allQuestions = questions;
    this.buildIndexes(questions);
    this.isLoaded = true;
  }

  private buildIndexes(questions: Question[]): void {
    this.questionIndex.clear();
    this.questionsByTag.clear();

    questions.forEach(question => {
      // Build ID index (now using UUID strings)
      this.questionIndex.set(question.id, question);

      // Build tag index
      if (!this.questionsByTag.has(question.tag)) {
        this.questionsByTag.set(question.tag, []);
      }
      this.questionsByTag.get(question.tag)!.push(question);
    });
  }

  getRandomQuestion(excludeIds: string[] = []): Question | null {
    if (!this.isLoaded || this.allQuestions.length === 0) {
      return null;
    }

    // Filter out already accessed questions
    const availableQuestions = this.allQuestions.filter(
      q => !excludeIds.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      return null; // All questions exhausted
    }

    // Use Fisher-Yates shuffle for true randomness
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  }

  getQuestionById(id: string): Question | undefined {
    return this.questionIndex.get(id);
  }

  async getQuestionByIdFromAPI(id: string, collection: CollectionName): Promise<Question | null> {
    try {
      const response = await fetch(`/api/questions/${id}?collection=${collection}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error);
      return null;
    }
  }

  getQuestionsByTag(tag: string): Question[] {
    return this.questionsByTag.get(tag) || [];
  }

  getTotalQuestions(): number {
    return this.allQuestions.length;
  }

  getAvailableQuestions(excludeIds: string[] = []): Question[] {
    return this.allQuestions.filter(q => !excludeIds.includes(q.id));
  }

  getRemainingQuestionCount(excludeIds: string[] = []): number {
    return this.getAvailableQuestions(excludeIds).length;
  }

  async searchQuestions(
    query: string,
    collections: CollectionName[] = Object.values(COLLECTIONS),
    difficulty?: 'easy' | 'medium' | 'hard',
    limit: number = 50
  ): Promise<Question[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        collections: collections.join(','),
        limit: limit.toString()
      });

      if (difficulty) {
        params.set('difficulty', difficulty);
      }

      const response = await fetch(`/api/questions/search?${params}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('Error searching questions:', error);
      return [];
    }
  }

  async getCollectionStats(): Promise<{
    collections: Array<{
      name: string;
      key: string;
      count: number;
      category: string;
    }>;
    total: number;
  }> {
    try {
      const response = await fetch('/api/questions/collections');
      if (!response.ok) {
        throw new Error('Failed to fetch collection stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching collection stats:', error);
      return { collections: [], total: 0 };
    }
  }

  // Utility method to validate questions (updated for UUID)
  private validateQuestion(question: any): question is Question {
    return (
      typeof question.id === 'string' &&
      typeof question.tag === 'string' &&
      typeof question.question === 'string' &&
      typeof question.answer === 'string' &&
      question.id.length > 0 &&
      question.question.length >= 10 &&
      question.answer.length >= 20 &&
      (question.keywords === undefined || Array.isArray(question.keywords))
    );
  }

  // Filter questions by validation
  private filterValidQuestions(questions: any[]): Question[] {
    return questions.filter(this.validateQuestion);
  }

  // Get questions with fallback for errors
  async safeLoadQuestions(category: Category, technologies: string[] = []): Promise<Question[]> {
    try {
      const questions = await this.loadQuestions(category, technologies);
      return this.filterValidQuestions(questions);
    } catch (error) {
      console.error(`Failed to load questions for ${category}:`, error);
      return this.getFallbackQuestions(category);
    }
  }

  // Fallback questions in case of loading errors
  private getFallbackQuestions(category: Category): Question[] {
    const fallbackQuestion: Question = {
      id: `fallback-${category}-${Date.now()}`,
      tag: category,
      question: 'Sample question - Unable to load questions at this time.',
      answer: 'Please refresh the page and try again. If the problem persists, check your internet connection.',
      keywords: ['error handling', 'troubleshooting'],
      difficulty: 'easy'
    };
    return [fallbackQuestion];
  }

  // Get metadata about available questions
  async getQuestionMetadata(): Promise<{
    totalQuestions: number;
    categories: Record<string, number | Record<string, number>>;
  }> {
    try {
      const stats = await this.getCollectionStats();
      
      const metadata = {
        totalQuestions: stats.total,
        categories: {} as Record<string, number | Record<string, number>>
      };

      // Group by category
      const generalCounts: Record<string, number> = {};
      let systemsDesignCount = 0;
      let behaviourCount = 0;

      stats.collections.forEach(collection => {
        if (collection.category === 'general') {
          generalCounts[collection.key] = collection.count;
        } else if (collection.name === 'systems_design') {
          systemsDesignCount = collection.count;
        } else if (collection.name === 'behaviour') {
          behaviourCount = collection.count;
        }
      });

      if (Object.keys(generalCounts).length > 0) {
        metadata.categories.general = generalCounts;
      }
      if (systemsDesignCount > 0) {
        metadata.categories.systems_design = systemsDesignCount;
      }
      if (behaviourCount > 0) {
        metadata.categories.behaviour = behaviourCount;
      }

      return metadata;
    } catch (error) {
      console.error('Error generating question metadata:', error);
      return {
        totalQuestions: 0,
        categories: {}
      };
    }
  }
}