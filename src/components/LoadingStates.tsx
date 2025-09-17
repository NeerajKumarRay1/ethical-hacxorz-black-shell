import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

interface MessageSkeletonProps {
  isUser?: boolean;
  count?: number;
}

export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({ 
  isUser = false, 
  count = 1 
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-pulse`}
        >
          <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
            <div
              className={`
                rounded-xl px-4 py-3 shadow-subtle
                ${isUser 
                  ? 'bg-muted ml-4' 
                  : 'bg-card mr-4'
                }
              `}
            >
              <div className="space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse" />
              </div>
            </div>
            <div className={`mt-1 ${isUser ? 'text-right mr-4' : 'ml-4'}`}>
              <div className="h-3 bg-muted-foreground/20 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

interface HistorySkeletonProps {
  count?: number;
}

export const HistorySkeleton: React.FC<HistorySkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-3 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
              <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
            </div>
            <div className="ml-2">
              <div className="h-6 w-6 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SearchSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border-l-2 border-primary/20 pl-4">
          <div className="h-4 bg-muted-foreground/20 rounded w-1/4 mb-2" />
          <div className="h-4 bg-muted-foreground/20 rounded w-full mb-1" />
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};