'use client';


interface SuccessPageProps {
  result: {
    success: boolean;
    insertedCount: number;
    topic: string;
    errors?: string[];
  };
  onAddMore: () => void;
  onGoHome: () => void;
}

export function SuccessPage({ result, onAddMore, onGoHome }: SuccessPageProps) {
  const topicDisplayName = result.topic.charAt(0).toUpperCase() + result.topic.slice(1).replace(/[_-]/g, ' ');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md lg:max-w-4xl w-full">
        {result.success ? (
          // Success State
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 lg:h-40 lg:w-40 rounded-full bg-green-100 mb-6 lg:mb-12">
              <svg className="h-12 w-12 lg:h-20 lg:w-20 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-8">
              Questions Added Successfully!
            </h2>
            
            <div className="mb-8 lg:mb-16 p-6 lg:p-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg lg:text-2xl font-semibold text-gray-800 mb-3 lg:mb-6">Summary</h3>
              <div className="space-y-2 lg:space-y-4 text-sm lg:text-lg text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Topic:</span>
                  <span className="font-medium text-gray-900 lg:text-xl">{topicDisplayName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Questions Added:</span>
                  <span className="font-medium text-green-600 lg:text-xl">{result.insertedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Complete
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-8 lg:mb-16 text-base lg:text-xl">
              Your questions have been successfully added to the database and are now available in the practice section.
            </p>
          </div>
        ) : (
          // Error State
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 lg:h-40 lg:w-40 rounded-full bg-red-100 mb-6 lg:mb-12">
              <svg className="h-12 w-12 lg:h-20 lg:w-20 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-8">
              Submission Failed
            </h2>
            
            <div className="mb-8 lg:mb-16 p-6 lg:p-12 bg-white rounded-lg shadow-sm border border-red-200">
              <h3 className="text-lg lg:text-2xl font-semibold text-red-800 mb-3 lg:mb-6">Errors</h3>
              <div className="text-left">
                {result.errors && result.errors.length > 0 ? (
                  <ul className="space-y-2">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-sm lg:text-base text-red-700 bg-red-50 p-2 lg:p-4 rounded border-l-4 border-red-400">
                        {error}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm lg:text-base text-red-700">
                    An unexpected error occurred while submitting your questions.
                  </p>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-8 lg:mb-16 text-base lg:text-xl">
              Please review the errors above and try again. You can go back to fix the issues or return to the home page.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
          <button
            onClick={onGoHome}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-3 lg:px-8 lg:py-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base lg:text-xl font-medium"
          >
            <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Home
          </button>
          
          <button
            onClick={onAddMore}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 lg:px-8 lg:py-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base lg:text-xl font-medium"
          >
            <svg className="w-4 h-4 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {result.success ? 'Add More Questions' : 'Try Again'}
          </button>
        </div>

        {/* Additional Info */}
        {result.success && (
          <div className="mt-8 lg:mt-16 text-center">
            <p className="text-xs lg:text-base text-gray-500">
              Questions are immediately available in the practice section. 
              It may take a few moments for search indexes to update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}