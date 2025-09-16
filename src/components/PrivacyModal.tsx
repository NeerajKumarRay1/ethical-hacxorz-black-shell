import React from 'react';
import { X, Shield, Eye, Bell } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  showConfidence: boolean;
  onToggleConfidence: (value: boolean) => void;
  showNudges: boolean;
  onToggleNudges: (value: boolean) => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  showConfidence,
  onToggleConfidence,
  showNudges,
  onToggleNudges,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-subtle">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Privacy & Settings</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Data Control */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Data Control</h3>
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Instant Data Deletion</p>
                  <p className="text-xs text-muted-foreground">
                    Your conversations are stored locally and can be cleared anytime
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Display Preferences</h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-sm font-medium">Show Confidence Levels</p>
                    <p className="text-xs text-muted-foreground">Display AI confidence indicators</p>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showConfidence}
                    onChange={(e) => onToggleConfidence(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`
                    w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer
                    ${showConfidence ? 'bg-primary' : 'bg-muted'}
                  `}>
                    <div className={`
                      w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200
                      ${showConfidence ? 'translate-x-5' : 'translate-x-0.5'}
                      mt-0.5
                    `} />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-sm font-medium">Helpful Nudges</p>
                    <p className="text-xs text-muted-foreground">Show periodic reminders and tips</p>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showNudges}
                    onChange={(e) => onToggleNudges(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`
                    w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer
                    ${showNudges ? 'bg-primary' : 'bg-muted'}
                  `}>
                    <div className={`
                      w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200
                      ${showNudges ? 'translate-x-5' : 'translate-x-0.5'}
                      mt-0.5
                    `} />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};