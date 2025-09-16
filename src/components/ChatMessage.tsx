import React from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Message } from './EthicalHacxorz';

interface ChatMessageProps {
  message: Message;
  showConfidence: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, showConfidence }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-slide-in`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            rounded-xl px-4 py-3 shadow-subtle
            ${isUser 
              ? 'gradient-message text-foreground ml-4' 
              : 'bg-card text-card-foreground mr-4'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
        
        {/* Confidence Indicator for AI messages */}
        {!isUser && message.confidence !== undefined && showConfidence && (
          <div className="mt-2 mr-4">
            <ConfidenceIndicator confidence={message.confidence} />
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`mt-1 text-xs text-muted-foreground italic ${isUser ? 'text-right mr-4' : 'ml-4'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};