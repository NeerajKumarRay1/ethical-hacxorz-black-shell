import React, { useState, useRef, useEffect } from 'react';
import { Settings, Info, Send, X, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { NudgeBanner } from './NudgeBanner';
import { PrivacyModal } from './PrivacyModal';
import { TypingIndicator } from './TypingIndicator';
import { QuickActionChips } from './QuickActionChips';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  confidence?: number;
}

export const EthicalHacxorz: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showNudges, setShowNudges] = useState(true);
  const [currentNudge, setCurrentNudge] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show random nudges
  useEffect(() => {
    if (!showNudges) return;
    
    const nudges = [
      "💡 Remember: You control your data — clear anytime.",
      "⏰ Take a break every 15 minutes for mental wellbeing.",
      "🔒 Your privacy matters - check settings for controls.",
      "✨ AI works best with clear, specific questions."
    ];

    const showRandomNudge = () => {
      const randomNudge = nudges[Math.floor(Math.random() * nudges.length)];
      setCurrentNudge(randomNudge);
      
      setTimeout(() => {
        setCurrentNudge(null);
      }, 8000);
    };

    const interval = setInterval(showRandomNudge, 30000);
    return () => clearInterval(interval);
  }, [showNudges]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const confidence = Math.random() * 100;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(text),
        sender: 'ai',
        timestamp: new Date(),
        confidence,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Show low confidence warning
      if (confidence < 60) {
        setCurrentNudge(`⚠️ AI confidence is ~${Math.round(confidence)}% on this answer. Use your judgement.`);
        setTimeout(() => setCurrentNudge(null), 10000);
      }
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (input: string): string => {
    const responses = [
      "I understand your query. Based on my analysis, here's what I can tell you...",
      "That's an interesting question. Let me provide you with some insights...",
      "I've processed your request. Here's my response with ethical considerations in mind...",
      "Thank you for that question. I'll do my best to provide a helpful and responsible answer..."
    ];
    return responses[Math.floor(Math.random() * responses.length)] + " " + 
           "Remember, I aim to be helpful while maintaining ethical standards and transparency about my limitations.";
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowClearModal(false);
    toast({
      title: "Chat cleared",
      description: "All messages have been deleted from this session.",
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Check for fake news':
        handleSendMessage('Please help me verify if this information is accurate and check for misinformation.');
        break;
      case 'Explain confidence':
        handleSendMessage('Can you explain your confidence level in your previous response?');
        break;
      case 'Delete chat':
        setShowClearModal(true);
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-wider uppercase">
            ETHICAL HacXorZ
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Trustworthy AI, Your Control.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-150"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-150">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to ETHICAL HacXorZ</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    I'm here to help you with information and analysis while maintaining transparency about my confidence levels and limitations.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              showConfidence={showConfidence}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length > 0 && (
          <div className="px-4">
            <QuickActionChips onAction={handleQuickAction} />
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isTyping}
          />
          
          {/* Clear Chat Button */}
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={() => setShowClearModal(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
            >
              Clear Chat
            </button>
            <span className="text-xs text-muted-foreground">
              Press Enter to send • Your data stays private
            </span>
          </div>
        </div>
      </div>

      {/* Nudge Banner */}
      {currentNudge && (
        <NudgeBanner
          message={currentNudge}
          onDismiss={() => setCurrentNudge(null)}
        />
      )}

      {/* Privacy Settings Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        showConfidence={showConfidence}
        onToggleConfidence={setShowConfidence}
        showNudges={showNudges}
        onToggleNudges={setShowNudges}
      />

      {/* Clear Chat Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-sm mx-4 shadow-subtle">
            <h3 className="text-lg font-semibold mb-3">Clear all chat history?</h3>
            <p className="text-muted-foreground mb-6">
              This cannot be undone. All messages in this session will be permanently deleted.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClearChat}
                className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:bg-primary/90 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-4 py-2 font-medium hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};