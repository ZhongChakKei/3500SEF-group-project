import React from 'react';

const CallbackPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
        <p className="text-sm text-gray-500">Completing login...</p>
      </div>
    </div>
  );
};
export default CallbackPage;
