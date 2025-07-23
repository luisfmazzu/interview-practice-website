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

    console.log('Validating form...');
    console.log('selectedCategory:', selectedCategory);
    console.log('selectedTechnologies:', selectedTechnologies);

    if (!selectedCategory) {
      errors.push('Please select a category');
      console.log('No category selected');
    }

    if (selectedCategory === 'general' && selectedTechnologies.length === 0) {
      errors.push('Please select at least one technology for General category');
      console.log('General category but no technologies selected');
    }

    setValidationErrors(errors);
    console.log('Validation errors:', errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('selectedCategory:', selectedCategory);
    console.log('selectedTechnologies:', selectedTechnologies);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Creating session...');
      // Create session with selected preferences
      const session = createSession(
        selectedCategory as Category,
        selectedCategory === 'general' ? selectedTechnologies : []
      );
      console.log('Session created:', session);
      
      // Navigate to practice page
      console.log('Navigating to practice page...');
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      router.push('/practice');
    } catch (error) {
      console.error('Error creating session:', error);
      setValidationErrors(['Failed to start practice session. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
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
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="space-y-3">
              {CATEGORIES.map((category) => (
                <label key={category.id} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={() => handleCategoryChange(category.id as Category)}
                    className="radio-input mt-1"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {category.label}
                    </div>
                    <div className="text-sm text-gray-500">
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Technologies (select at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {TECHNOLOGIES.map((tech) => (
                  <label key={tech.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={tech.id}
                      checked={selectedTechnologies.includes(tech.id)}
                      onChange={() => handleTechnologyChange(tech.id)}
                      className="checkbox-input"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {tech.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-700">
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedCategory}
              size="lg"
              className="w-full"
            >
              {isSubmitting ? 'Starting Practice...' : 'Start Practice'}
            </Button>
            
            {/* Debug button */}
            <Button
              onClick={() => {
                console.log('Debug button clicked');
                console.log('Current state:', { selectedCategory, selectedTechnologies });
                router.push('/practice');
              }}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Debug: Go to Practice (no validation)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SelectionPage;