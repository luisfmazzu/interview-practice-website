import { Question, QuestionFile, Category } from '@/types';

export class QuestionService {
  private questionIndex: Map<number, Question> = new Map();
  private questionsByTag: Map<string, Question[]> = new Map();
  private allQuestions: Question[] = [];
  private isLoaded = false;

  async loadQuestions(category: Category, technologies: string[] = []): Promise<Question[]> {
    if (category === 'general' && technologies.length > 0) {
      return this.loadTechnologyQuestions(technologies);
    } else if (category === 'systems_design') {
      return this.loadCategoryQuestions('systems_design');
    } else if (category === 'behaviour') {
      return this.loadCategoryQuestions('behaviour');
    }
    return [];
  }

  private async loadTechnologyQuestions(technologies: string[]): Promise<Question[]> {
    const questionSets = await Promise.all(
      technologies.map(tech => this.loadTechnologyFile(tech))
    );
    return questionSets.flat();
  }

  private async loadTechnologyFile(technology: string): Promise<Question[]> {
    try {
      const response = await fetch(`/data/questions/general/${technology}.json`);
      if (!response.ok) {
        console.error(`Failed to load questions for ${technology}`);
        return [];
      }
      const data: QuestionFile = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error(`Error loading ${technology} questions:`, error);
      return [];
    }
  }

  private async loadCategoryQuestions(category: string): Promise<Question[]> {
    try {
      const response = await fetch(`/data/questions/${category}.json`);
      if (!response.ok) {
        console.error(`Failed to load questions for ${category}`);
        return [];
      }
      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error(`Error loading ${category} questions:`, error);
      return [];
    }
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
      // Build ID index
      this.questionIndex.set(question.id, question);

      // Build tag index
      if (!this.questionsByTag.has(question.tag)) {
        this.questionsByTag.set(question.tag, []);
      }
      this.questionsByTag.get(question.tag)!.push(question);
    });
  }

  getRandomQuestion(excludeIds: number[] = []): Question | null {
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

  getQuestionById(id: number): Question | undefined {
    return this.questionIndex.get(id);
  }

  getQuestionsByTag(tag: string): Question[] {
    return this.questionsByTag.get(tag) || [];
  }

  getTotalQuestions(): number {
    return this.allQuestions.length;
  }

  getAvailableQuestions(excludeIds: number[] = []): Question[] {
    return this.allQuestions.filter(q => !excludeIds.includes(q.id));
  }

  getRemainingQuestionCount(excludeIds: number[] = []): number {
    return this.getAvailableQuestions(excludeIds).length;
  }

  // Utility method to validate questions
  private validateQuestion(question: any): question is Question {
    return (
      typeof question.id === 'number' &&
      typeof question.tag === 'string' &&
      typeof question.question === 'string' &&
      typeof question.answer === 'string' &&
      question.id > 0 &&
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
    // Use appropriate ID range for fallback based on category
    const getBaseId = (cat: Category): number => {
      switch (cat) {
        case 'general': return 999; // Top of JavaScript range
        case 'systems_design': return 3999; // Top of Systems Design range
        case 'behaviour': return 4999; // Top of Behavioral range
        default: return 99999; // Fallback for unknown categories
      }
    };

    const fallbackQuestion: Question = {
      id: getBaseId(category),
      tag: category,
      question: 'Sample question - Unable to load questions at this time.',
      answer: 'Please refresh the page and try again. If the problem persists, check your internet connection.',
      keywords: ['error handling', 'troubleshooting'],
      difficulty: 'easy'
    };
    return [fallbackQuestion];
  }

  // Get metadata about available questions (replaces the old index.json approach)
  async getQuestionMetadata(): Promise<{
    totalQuestions: number;
    categories: Record<string, number | Record<string, number>>;
  }> {
    const metadata = {
      totalQuestions: 0,
      categories: {} as Record<string, number | Record<string, number>>
    };

    try {
      // Load general category technologies
      const technologies = ['javascript', 'react', 'typescript'];
      const generalCounts: Record<string, number> = {};
      
      for (const tech of technologies) {
        const questions = await this.loadTechnologyFile(tech);
        generalCounts[tech] = questions.length;
        metadata.totalQuestions += questions.length;
      }
      metadata.categories.general = generalCounts;

      // Load other categories
      const otherCategories = ['systems_design', 'behaviour'];
      for (const category of otherCategories) {
        const questions = await this.loadCategoryQuestions(category);
        metadata.categories[category] = questions.length;
        metadata.totalQuestions += questions.length;
      }

    } catch (error) {
      console.error('Error generating question metadata:', error);
    }

    return metadata;
  }
}