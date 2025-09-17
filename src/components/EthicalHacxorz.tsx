import React, { useState, useRef, useEffect } from 'react';
import { Settings, Info, Send, X, Trash2, LogOut, User, History, Menu } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { NudgeBanner } from './NudgeBanner';
import { PrivacyModal } from './PrivacyModal';
import { TypingIndicator } from './TypingIndicator';
import { QuickActionChips } from './QuickActionChips';
import { ChatHistory } from './ChatHistory';
import { LoadingSpinner, MessageSkeleton } from './LoadingStates';
import { ErrorBoundary } from './ErrorBoundary';
import { MobileKeyboardAdapter, SwipeGestures, PullToRefresh } from './MobileOptimizations';
import { FocusTrap, SkipLink, LiveRegion } from './AccessibilityEnhancements';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { supabase } from '@/integrations/supabase/client';

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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ display_name?: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  // Use pagination for better performance with large message lists
  const { 
    currentItems: paginatedMessages, 
    loadMoreItems, 
    canLoadMore 
  } = usePagination({ 
    items: messages, 
    itemsPerPage: 50 
  });

  const handleSwipeLeft = () => {
    if (!showHistory) {
      setShowHistory(true);
      setAnnouncement('Chat history sidebar opened');
    }
  };

  const handleSwipeRight = () => {
    if (showHistory) {
      setShowHistory(false);
      setAnnouncement('Chat history sidebar closed');
    }
  };

  const handleRefresh = async () => {
    if (currentSessionId) {
      await loadSessionMessages(currentSessionId);
      setAnnouncement('Chat messages refreshed');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize session and load user data
  useEffect(() => {
    const initSession = async () => {
      if (!user) return;

      try {
        // Load user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Load user preferences  
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('show_confidence, show_nudges')
          .eq('user_id', user.id)
          .single();

        if (preferences) {
          setShowConfidence(preferences.show_confidence ?? true);
          setShowNudges(preferences.show_nudges ?? true);
        }

        // Create a new session for this visit
        await createNewSession();
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initSession();
  }, [user]);

  const createNewSession = async () => {
    if (!user) return;

    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat Session'
        })
        .select()
        .single();

      if (session && !error) {
        setCurrentSessionId(session.id);
        setMessages([]); // Clear current messages
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data?.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender as 'user' | 'ai',
        timestamp: new Date(msg.created_at),
        confidence: msg.confidence || undefined
      })) || [];

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    await loadSessionMessages(sessionId);
    setShowHistory(false);
    
    // Update session title if it's still the default
    try {
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('title')
        .eq('id', sessionId)
        .single();

      if (session?.title === 'New Chat Session' && messages.length > 0) {
        const newTitle = messages[0]?.text.substring(0, 50) + (messages[0]?.text.length > 50 ? '...' : '');
        await supabase
          .from('chat_sessions')
          .update({ title: newTitle })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setShowHistory(false);
  };

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
    if (!text.trim() || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Generate AI response
    setTimeout(async () => {
      try {
        const aiResponse = await generateAIResponse(text);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.text,
          sender: 'ai',
          timestamp: new Date(),
          confidence: aiResponse.confidence,
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update session title if it's still default and this is the first message
        if (messages.length === 0) {
          const sessionTitle = text.length > 50 ? text.substring(0, 50) + '...' : text;
          await supabase
            .from('chat_sessions')
            .update({ 
              title: sessionTitle,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentSessionId);
        }

        // Show low confidence warning
        if (aiResponse.confidence < 60) {
          setCurrentNudge(`⚠️ AI confidence is ~${Math.round(aiResponse.confidence)}% on this answer. Use your judgement.`);
          setTimeout(() => setCurrentNudge(null), 10000);
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: "I'm having trouble connecting right now. Please try again.",
          sender: 'ai',
          timestamp: new Date(),
          confidence: 20
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 1000); // 1 second delay
  };

  const generateAIResponse = async (userMessage: string): Promise<{ text: string; confidence: number }> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: userMessage,
          sessionId: currentSessionId
        }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        throw error;
      }

      return {
        text: data.response,
        confidence: data.confidence
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback response
      return {
        text: "I'm having trouble processing your request right now. Please try again in a moment.",
        confidence: 30
      };
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowClearModal(false);
    toast({
      title: "Chat cleared",
      description: "All messages have been deleted from this session.",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    }
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
    <div className="flex h-screen bg-background text-foreground">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="w-80 border-r border-border bg-card">
          <ChatHistory
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-150"
            >
              {showHistory ? <X className="w-5 h-5" /> : <History className="w-5 h-5" />}
            </button>
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-wider uppercase">
                ETHICAL HacXorZ
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Trustworthy AI, Your Control.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* User Profile */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{userProfile?.display_name || user?.email?.split('@')[0] || 'User'}</span>
            </div>
            
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-150"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-150"
            >
              <LogOut className="w-5 h-5" />
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
                    <h3 className="text-lg font-semibold mb-2">Welcome back!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {showHistory 
                        ? "Select a conversation from the sidebar or start a new one." 
                        : "I'm here to help you with information and analysis while maintaining transparency about my confidence levels and limitations."
                      }
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