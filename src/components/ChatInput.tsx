import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  disabled 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasContent = value.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && hasContent) {
      onSend(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div 
        className={`
          flex items-center bg-input/50 rounded-xl border transition-all duration-200
          ${isFocused 
            ? 'border-primary glow-primary' 
            : 'border-border hover:border-muted-foreground'
          }
        `}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Send a message or paste content..."
          className="
            flex-1 bg-transparent px-4 py-3 text-sm 
            placeholder:text-muted-foreground 
            focus:outline-none 
            disabled:opacity-50 
            disabled:cursor-not-allowed
          "
        />
        
        <button
          type="submit"
          disabled={disabled || !hasContent}
          className={`
            m-2 p-2 rounded-full transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasContent 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 pulse-send' 
              : 'bg-muted text-muted-foreground'
            }
          `}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};