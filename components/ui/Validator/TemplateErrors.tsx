// components/ErrorDisplay.jsx

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'; // Heroicons for error icons

// Define the props structure
interface ErrorDisplayProps {
  errors: {
    limitedSupportErrorMessages: { [category: string]: string[] };
    noSupportErrorMessages: { [category: string]: string[] };
  };
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  // Helper function to check if an object has any messages
  const hasMessages = (errorCategory: { [category: string]: string[] }) => {
    return Object.values(errorCategory).some((msgs) => msgs.length > 0);
  };

  // Render a single category of errors
  const renderCategory = (title: string, messages: string[]) => (
    <div key={title} className="mb-4">
      <h4 className="text-md font-semibold text-red-700">{title}</h4>
      <ul className="ml-6 list-disc text-red-600">
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );

  // Render all categories under a specific error type
  const renderErrorType = (
    typeTitle: string,
    errorCategory: { [category: string]: string[] }
  ) => (
    <div key={typeTitle} className="mb-6">
      <div className="mb-2 flex items-center">
        <ExclamationTriangleIcon
          className="mr-2 h-5 w-5 text-red-500"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold text-red-800">{typeTitle}</h3>
      </div>
      {Object.entries(errorCategory).map(([category, messages]) => (
        <div key={category}>{renderCategory(category, messages)}</div>
      ))}
    </div>
  );

  const { limitedSupportErrorMessages, noSupportErrorMessages } = errors;

  return (
    <div className="mt-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
      {hasMessages(limitedSupportErrorMessages)
        ? renderErrorType('Limited Support Errors', limitedSupportErrorMessages)
        : null}

      {hasMessages(noSupportErrorMessages)
        ? renderErrorType('No Support Errors', noSupportErrorMessages)
        : null}

      {!hasMessages(limitedSupportErrorMessages) &&
        !hasMessages(noSupportErrorMessages) && (
          <p className="text-green-600">No warnings or errors found.</p>
        )}
    </div>
  );
};

export default ErrorDisplay;
