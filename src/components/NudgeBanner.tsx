import React from 'react';
import { X } from 'lucide-react';

interface NudgeBannerProps {
  message: string;
  onDismiss: () => void;
}

export const NudgeBanner: React.FC<NudgeBannerProps> = ({ message, onDismiss }) => {
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 slide-up-banner">
      <div className="bg-background border border-primary rounded-xl px-4 py-3 mx-4 shadow-subtle max-w-md">
        <div className="flex items-start space-x-3">
          <p className="text-sm text-foreground flex-1 leading-relaxed">
            {message}
          </p>
          
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors duration-150"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};