import React from 'react';

interface ConfidenceIndicatorProps {
  confidence: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence }) => {
  const isLowConfidence = confidence < 60;
  const widthPercentage = Math.min(Math.max(confidence, 10), 100);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Confidence</span>
        <span>{Math.round(confidence)}%</span>
      </div>
      
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`
            h-full transition-all duration-500 rounded-full
            ${isLowConfidence 
              ? 'bg-destructive confidence-pulse' 
              : 'gradient-teal'
            }
          `}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
      
      {isLowConfidence && (
        <p className="text-xs text-destructive mt-1">
          Lower confidence - verify information independently
        </p>
      )}
    </div>
  );
};