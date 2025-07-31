'use client';

import { useState } from 'react';
import { COLLECTIONS } from '@/models/Question';

interface TopicSelectionProps {
  onTopicSelected: (topic: string) => void;
}

// Map collection names to display names
const TOPIC_DISPLAY_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  nextjs: 'Next.js',
  nodejs: 'Node.js',
  expressjs: 'Express.js',
  nestjs: 'Nest.js',
  python: 'Python',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  cicd: 'CI/CD',
  aws: 'AWS',
  serverless: 'Serverless',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  docker: 'Docker',
  graphql: 'GraphQL',
  apis: 'APIs',
  csharp: 'C#',
  rust: 'Rust',
  golang: 'Go',
  gin: 'Gin',
  celery: 'Celery',
  databases: 'Databases',
  systems_design: 'Systems Design',
  behaviour: 'Behavioral'
};

// Organize topics by category
const TOPIC_CATEGORIES = {
  'Frontend Technologies': ['javascript', 'typescript', 'react', 'nextjs'],
  'Backend Technologies': ['nodejs', 'expressjs', 'nestjs', 'python', 'django', 'flask', 'fastapi', 'golang', 'gin'],
  'Databases': ['postgresql', 'mongodb', 'databases'],
  'DevOps & Cloud': ['cicd', 'aws', 'serverless', 'docker'],
  'Other Technologies': ['graphql', 'apis', 'csharp', 'rust', 'celery'],
  'Interview Categories': ['systems_design', 'behaviour']
};

export function TopicSelection({ onTopicSelected }: TopicSelectionProps) {
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [error, setError] = useState('');

  const handleExistingTopicSelect = (topic: string) => {
    onTopicSelected(topic);
  };

  const handleCreateNewTopic = async () => {
    if (!newTopicName.trim()) {
      setError('Topic name is required');
      return;
    }

    // Validate topic name format
    const topicKey = newTopicName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (topicKey.length < 2) {
      setError('Topic name must contain at least 2 letters');
      return;
    }

    // Check if topic already exists
    if (Object.values(COLLECTIONS).includes(topicKey)) {
      setError('This topic already exists');
      return;
    }

    setIsCreatingTopic(true);
    setError('');

    try {
      // Create new topic via API
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: topicKey, displayName: newTopicName.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        onTopicSelected(topicKey);
      } else {
        setError(data.error || 'Failed to create topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  return (
    <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-8">
          Select a Topic
        </h2>
        <p className="text-lg lg:text-2xl text-gray-600 max-w-2xl lg:max-w-4xl mx-auto">
          Choose an existing topic to add questions to, or create a new topic category.
        </p>
      </div>

      {/* Existing Topics */}
      <div className="mb-12 lg:mb-20">
        {Object.entries(TOPIC_CATEGORIES).map(([category, topics]) => (
          <div key={category} className="mb-8">
            <h3 className="text-xl lg:text-3xl font-semibold text-gray-800 mb-4 lg:mb-8 border-b border-gray-200 pb-2 lg:pb-4">
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleExistingTopicSelect(topic)}
                  className="p-4 lg:p-8 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 text-base lg:text-xl">
                      {TOPIC_DISPLAY_NAMES[topic] || topic}
                    </h4>
                    <svg className="w-5 h-5 lg:w-8 lg:h-8 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create New Topic Section */}
      <div className="border-t border-gray-200 pt-8 lg:pt-16">
        <div className="text-center mb-6">
          <h3 className="text-xl lg:text-3xl font-semibold text-gray-800 mb-2 lg:mb-4">
            Create New Topic
          </h3>
          <p className="text-gray-600 lg:text-xl">
            Don't see the topic you need? Create a new category.
          </p>
        </div>

        {!showNewTopicForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowNewTopicForm(true)}
              className="px-8 py-3 lg:px-12 lg:py-6 bg-gray-200 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-base lg:text-xl font-medium"
            >
              + Create New Topic
            </button>
          </div>
        ) : (
          <div className="max-w-md lg:max-w-2xl mx-auto">
            <div className="bg-white p-6 lg:p-12 border border-gray-300 rounded-lg">
              <div className="mb-4">
                <label htmlFor="topicName" className="block text-sm lg:text-lg font-medium text-gray-700 mb-2 lg:mb-4">
                  Topic Name
                </label>
                <input
                  id="topicName"
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g., Vue.js, Kubernetes, Machine Learning"
                  className="w-full px-3 py-2 lg:px-6 lg:py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base lg:text-lg text-black bg-white"
                  disabled={isCreatingTopic}
                />
              </div>

              {error && (
                <div className="mb-4 lg:mb-8 p-3 lg:p-6 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm lg:text-base text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 lg:gap-6">
                <button
                  onClick={handleCreateNewTopic}
                  disabled={isCreatingTopic || !newTopicName.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 lg:px-8 lg:py-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-base lg:text-lg font-medium"
                >
                  {isCreatingTopic ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Topic'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowNewTopicForm(false);
                    setNewTopicName('');
                    setError('');
                  }}
                  disabled={isCreatingTopic}
                  className="bg-gray-200 text-gray-800 px-4 py-2 lg:px-8 lg:py-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base lg:text-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}