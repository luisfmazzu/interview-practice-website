'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { useSession } from '@/lib/hooks';
import { Button, Card } from '@/components/ui';

interface Technology {
  id: string;
  label: string;
}

const SelectionPage: React.FC = () => {
  const router = useRouter();
  const { createSession } = useSession();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoadingTechnologies, setIsLoadingTechnologies] = useState(false);

  // Fetch available collections/technologies from MongoDB
  useEffect(() => {
    const fetchTechnologies = async () => {
      setIsLoadingTechnologies(true);
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        
        if (data.success) {
          setTechnologies(data.collections);
        } else {
          console.error('Failed to fetch collections:', data.error);
          setValidationErrors(['Failed to load available technologies']);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setValidationErrors(['Failed to load available technologies']);
      } finally {
        setIsLoadingTechnologies(false);
      }
    };

    fetchTechnologies();
  }, []);

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
          Software Interview Practice
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
                {isLoadingTechnologies ? (
                  <div className="col-span-full text-center py-4">
                    <div className="text-gray-600">Loading available technologies...</div>
                  </div>
                ) : technologies.length === 0 ? (
                  <div className="col-span-full text-center py-4">
                    <div className="text-gray-600">No technologies available</div>
                  </div>
                ) : (
                  technologies.map((tech) => (
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
                  ))
                )}
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