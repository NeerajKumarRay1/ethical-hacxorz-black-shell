import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start message-slide-in">
      <div className="max-w-[80%] mr-4">
        <div className="bg-card text-card-foreground rounded-xl px-4 py-3 shadow-subtle">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">AI is thinking</span>
            <div className="flex space-x-1 ml-2">
              <div 
                className="w-2 h-2 bg-primary rounded-full typing-indicator"
                style={{ animationDelay: '0ms' }}
              />
              <div 
                className="w-2 h-2 bg-primary rounded-full typing-indicator"
                style={{ animationDelay: '200ms' }}
              />
              <div 
                className="w-2 h-2 bg-primary rounded-full typing-indicator"
                style={{ animationDelay: '400ms' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};