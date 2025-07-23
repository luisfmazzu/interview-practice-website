'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { CATEGORIES, TECHNOLOGIES } from '@/lib/constants';
import { useSession } from '@/lib/hooks';
import { Button, Card } from '@/components/ui';

const SelectionPage: React.FC = () => {
  const router = useRouter();
  const { createSession } = useSession();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setValidationErrors([]);
    
    // Clear technologies when switching away from general
    if (category !== 'general') {
      setSelectedTechnologies([]);
    }
  };

  const handleTechnologyChange = (technologyId: string) => {
    setSelectedTechnologies(prev => {
      if (prev.includes(technologyId)) {
        return prev.filter(id => id !== technologyId);
      } else {
        return [...prev, technologyId];
      }
    });
    setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!selectedCategory) {
      errors.push('Please select a category');
    }

    if (selectedCategory === 'general' && selectedTechnologies.length === 0) {
      errors.push('Please select at least one technology for General category');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create session with selected preferences
      const session = createSession(
        selectedCategory as Category,
        selectedCategory === 'general' ? selectedTechnologies : []
      );
      
      // Navigate to practice page
      router.push('/practice');
    } catch (error) {
      console.error('Error creating session:', error);
      setValidationErrors(['Failed to start practice session. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Interview Practice
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Choose your practice category to get started
        </p>
      </div>

      <Card title="Select Practice Category">
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Category
            </label>
            <div className="space-y-4">
              {CATEGORIES.map((category) => (
                <label key={category.id} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={() => handleCategoryChange(category.id as Category)}
                    className="radio-input mt-1 w-5 h-5"
                  />
                  <div className="ml-4">
                    <div className="text-base font-semibold text-gray-900">
                      {category.label}
                    </div>
                    <div className="text-base text-gray-600">
                      {category.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Technology Selection (only for General category) */}
          {selectedCategory === 'general' && (
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Technologies (select at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {TECHNOLOGIES.map((tech) => (
                  <label key={tech.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={tech.id}
                      checked={selectedTechnologies.includes(tech.id)}
                      onChange={() => handleTechnologyChange(tech.id)}
                      className="checkbox-input w-5 h-5"
                    />
                    <span className="ml-3 text-base text-gray-800 font-medium">
                      {tech.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-base text-red-800 font-medium">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedCategory}
              size="lg"
              className="w-full text-lg py-4 px-6 font-semibold"
            >
              {isSubmitting ? 'Starting Practice...' : 'Start Practice'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SelectionPage;