import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Message } from './EthicalHacxorz';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchSkeleton } from './LoadingStates';

interface SearchMessagesProps {
  messages: Message[];
  onSearchResults: (results: Message[]) => void;
  onClearSearch: () => void;
}

export const SearchMessages: React.FC<SearchMessagesProps> = ({
  messages,
  onSearchResults,
  onClearSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        onClearSearch();
        setIsSearching(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsSearching(true);
      
      // Simulate async search with highlighting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = messages.filter(message => 
        message.text.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      
      onSearchResults(results);
      setIsLoading(false);
    };

    performSearch();
  }, [debouncedSearchQuery, messages, onSearchResults, onClearSearch]);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setIsLoading(false);
    onClearSearch();
  };

  return (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className="w-full bg-input/50 border border-border rounded-xl px-4 py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        
        {isLoading ? (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-muted rounded-full p-1 transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      
      {isSearching && !isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          Found results in {messages.length} messages
        </p>
      )}
      
      {isLoading && (
        <div className="mt-4">
          <SearchSkeleton />
        </div>
      )}
    </div>
  );
};