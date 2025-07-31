'use client';

import { useState } from 'react';
import { getAuthUser } from '@/lib/auth';

interface QuestionInputProps {
  topic: string;
  onQuestionsSubmitted: (result: InsertionResult) => void;
  onBackToTopics: () => void;
}

interface InsertionResult {
  success: boolean;
  insertedCount: number;
  topic: string;
  errors?: string[];
}

interface QuestionData {
  question: string;
  answer: string;
  keywords?: string[];
  studyTopics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Sample JSON for download (tag will be automatically set based on selected topic)
const SAMPLE_JSON = [
  {
    question: "What is the difference between `let`, `const`, and `var` in JavaScript?",
    answer: "**var:**\n- Function-scoped or globally-scoped\n- Can be redeclared and updated\n- Hoisted with undefined initialization\n\n**let:**\n- Block-scoped\n- Can be updated but not redeclared in same scope\n- Hoisted but not initialized (temporal dead zone)\n\n**const:**\n- Block-scoped\n- Cannot be updated or redeclared\n- Must be initialized at declaration",
    keywords: ["block scope", "function scope", "hoisting", "temporal dead zone"],
    studyTopics: ["ES6 features", "variable declarations", "JavaScript fundamentals"],
    difficulty: "easy"
  },
  {
    question: "Explain closures in JavaScript with an example.",
    answer: "A closure is a function that has access to variables in its outer scope even after the outer function has returned.\n\nExample:\n```javascript\nfunction outerFunction(x) {\n  return function innerFunction(y) {\n    return x + y;\n  };\n}\n\nconst addFive = outerFunction(5);\nconsole.log(addFive(3)); // 8\n```",
    keywords: ["closures", "lexical scoping", "functions"],
    studyTopics: ["JavaScript functions", "scope and closures", "advanced JavaScript"],
    difficulty: "medium"
  }
];

export function QuestionInput({ topic, onQuestionsSubmitted, onBackToTopics }: QuestionInputProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const downloadSampleJson = () => {
    const dataStr = JSON.stringify(SAMPLE_JSON, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sample-questions-${topic}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const validateJson = async () => {
    setIsValidating(true);
    setValidationErrors([]);
    setIsValid(false);

    try {
      if (!jsonInput.trim()) {
        setValidationErrors(['JSON input is required']);
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonInput);
      } catch (parseError) {
        setValidationErrors(['Invalid JSON format. Please check your syntax.']);
        return;
      }

      if (!Array.isArray(parsedData)) {
        setValidationErrors(['JSON must be an array of questions']);
        return;
      }

      if (parsedData.length === 0) {
        setValidationErrors(['At least one question is required']);
        return;
      }

      const errors: string[] = [];

      parsedData.forEach((question: any, index: number) => {
        const questionNum = index + 1;

        // Check for forbidden tag field (should be auto-set from topic selection)
        if (question.tag !== undefined) {
          errors.push(`Question ${questionNum}: 'tag' field is not allowed (automatically set from selected topic)`);
        }
        if (!question.question || typeof question.question !== 'string') {
          errors.push(`Question ${questionNum}: 'question' field is required and must be a string`);
        } else if (question.question.length < 10) {
          errors.push(`Question ${questionNum}: 'question' must be at least 10 characters long`);
        }
        if (!question.answer || typeof question.answer !== 'string') {
          errors.push(`Question ${questionNum}: 'answer' field is required and must be a string`);
        } else if (question.answer.length < 20) {
          errors.push(`Question ${questionNum}: 'answer' must be at least 20 characters long`);
        }

        // Optional fields validation
        if (question.keywords !== undefined) {
          if (!Array.isArray(question.keywords)) {
            errors.push(`Question ${questionNum}: 'keywords' must be an array`);
          } else if (question.keywords.some((k: any) => typeof k !== 'string')) {
            errors.push(`Question ${questionNum}: all 'keywords' must be strings`);
          }
        }

        if (question.studyTopics !== undefined) {
          if (!Array.isArray(question.studyTopics)) {
            errors.push(`Question ${questionNum}: 'studyTopics' must be an array`);
          } else if (question.studyTopics.some((t: any) => typeof t !== 'string')) {
            errors.push(`Question ${questionNum}: all 'studyTopics' must be strings`);
          }
        }

        if (question.difficulty !== undefined) {
          if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
            errors.push(`Question ${questionNum}: 'difficulty' must be 'easy', 'medium', or 'hard'`);
          }
        }

        // Check for forbidden fields
        const forbiddenFields = ['id', 'tag', 'createdAt', 'updatedAt', 'createdBy', '_id'];
        forbiddenFields.forEach(field => {
          if (question[field] !== undefined) {
            errors.push(`Question ${questionNum}: '${field}' field is not allowed (auto-generated)`);
          }
        });
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
      } else {
        setIsValid(true);
        setValidationErrors([]);
      }

    } catch (error) {
      console.error('Validation error:', error);
      setValidationErrors(['An unexpected error occurred during validation']);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) {
      await validateJson();
      return;
    }

    setIsSubmitting(true);
    const user = getAuthUser();

    try {
      const parsedQuestions = JSON.parse(jsonInput) as QuestionData[];
      
      const response = await fetch('/api/questions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: topic,
          questions: parsedQuestions,
          createdBy: user?.username || 'Anonymous'
        }),
      });

      const result = await response.json();

      onQuestionsSubmitted({
        success: result.success,
        insertedCount: result.insertedCount || 0,
        topic,
        errors: result.errors
      });

    } catch (error) {
      console.error('Submission error:', error);
      onQuestionsSubmitted({
        success: false,
        insertedCount: 0,
        topic,
        errors: ['Network error occurred while submitting questions']
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
            Add Questions to: {topic.charAt(0).toUpperCase() + topic.slice(1)}
          </h2>
          <p className="text-gray-600 mt-2 lg:mt-4 text-base lg:text-xl">
            Paste your questions in JSON format below. Make sure to validate before submitting.
          </p>
        </div>
        <button
          onClick={onBackToTopics}
          className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 lg:px-6 lg:py-3 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base lg:text-lg"
        >
          <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Topics
        </button>
      </div>

      {/* Sample JSON Download */}
      <div className="mb-6 lg:mb-12 p-4 lg:p-8 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900 lg:text-xl">Need a template?</h3>
            <p className="text-sm lg:text-base text-blue-700">Download a sample JSON file to see the expected format.</p>
            <p className="text-xs lg:text-sm text-blue-600 mt-2 italic">Note: The 'tag' field will be automatically set to the selected topic ({topic}).</p>
          </div>
          <button
            onClick={downloadSampleJson}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 text-sm lg:text-base px-3 py-1 lg:px-6 lg:py-3 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Sample
          </button>
        </div>
      </div>

      {/* JSON Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* JSON Editor */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg lg:text-2xl font-medium text-gray-900">Questions JSON</h3>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Do not include a 'tag' field - it will be set automatically to: <span className="font-medium">{topic}</span></p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={validateJson}
                disabled={isValidating || !jsonInput.trim()}
                className="bg-gray-200 text-gray-800 text-sm lg:text-base px-3 py-1 lg:px-6 lg:py-3 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </button>
            </div>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setIsValid(false);
              setValidationErrors([]);
            }}
            placeholder="Paste your questions JSON here..."
            className="w-full h-96 lg:h-[500px] p-4 lg:p-6 border border-gray-300 rounded-lg font-mono text-sm lg:text-base text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Validation Results */}
        <div>
          <h3 className="text-lg lg:text-2xl font-medium text-gray-900 mb-4 lg:mb-8">Validation Results</h3>
          
          <div className="h-96 lg:h-[500px] overflow-y-auto border border-gray-300 rounded-lg p-4 lg:p-6">
            {validationErrors.length === 0 && !isValid && !isValidating && (
              <div className="text-gray-500 text-center py-8 lg:py-16 text-base lg:text-lg">
                Click "Validate" to check your JSON format
              </div>
            )}

            {isValidating && (
              <div className="flex items-center justify-center py-8 lg:py-16">
                <svg className="animate-spin h-6 w-6 lg:h-10 lg:w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-gray-600 lg:text-lg">Validating JSON...</span>
              </div>
            )}

            {isValid && validationErrors.length === 0 && (
              <div className="text-center py-8 lg:py-16">
                <svg className="w-12 h-12 lg:w-20 lg:h-20 text-green-500 mx-auto mb-4 lg:mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg lg:text-2xl font-medium text-green-800 mb-2 lg:mb-4">JSON is Valid!</h4>
                <p className="text-green-700 lg:text-lg">Your questions are ready to be submitted.</p>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-3 lg:mb-6 flex items-center text-base lg:text-xl">
                  <svg className="w-5 h-5 lg:w-7 lg:h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validation Errors ({validationErrors.length})
                </h4>
                <ul className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm lg:text-base text-red-700 bg-red-50 p-2 lg:p-4 rounded border-l-4 border-red-400">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Section */}
      <div className="mt-8 lg:mt-16 flex justify-end gap-4 lg:gap-8">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="px-8 py-3 lg:px-12 lg:py-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base lg:text-xl font-medium"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 lg:h-7 lg:w-7" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Questions...
            </>
          ) : (
            'Submit Questions'
          )}
        </button>
      </div>
    </div>
  );
}