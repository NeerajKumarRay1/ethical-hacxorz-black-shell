import React from 'react';
import { Shield, HelpCircle, Trash2 } from 'lucide-react';

interface QuickActionChipsProps {
  onAction: (action: string) => void;
}

export const QuickActionChips: React.FC<QuickActionChipsProps> = ({ onAction }) => {
  const actions = [
    {
      label: 'Check for fake news',
      icon: Shield,
      color: 'text-primary',
    },
    {
      label: 'Explain confidence',
      icon: HelpCircle,
      color: 'text-muted-foreground',
    },
    {
      label: 'Delete chat',
      icon: Trash2,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => onAction(action.label)}
            className="
              flex items-center space-x-2 px-3 py-2 text-xs 
              bg-card/50 border border-border rounded-full 
              hover:bg-card hover:border-muted-foreground 
              transition-all duration-200 
              hover:scale-105
            "
          >
            <Icon className={`w-3 h-3 ${action.color}`} />
            <span className="text-muted-foreground">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};