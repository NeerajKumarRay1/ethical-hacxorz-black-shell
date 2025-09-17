import { useState, useEffect } from 'react';

interface UsePaginationOptions<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentItems: T[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  loadMoreItems: () => void;
  canLoadMore: boolean;
  isLastPage: boolean;
}

export function usePagination<T>({
  items,
  itemsPerPage = 20,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [displayedItemsCount, setDisplayedItemsCount] = useState(itemsPerPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + displayedItemsCount, items.length);
  
  // For infinite scroll, show items from start up to current displayed count
  const currentItems = items.slice(0, displayedItemsCount);
  
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const canLoadMore = displayedItemsCount < items.length;
  const isLastPage = currentPage === totalPages;

  useEffect(() => {
    // Reset displayed count when items change
    setDisplayedItemsCount(itemsPerPage);
    setCurrentPage(1);
  }, [items.length, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const loadMoreItems = () => {
    if (canLoadMore) {
      setDisplayedItemsCount(prev => Math.min(prev + itemsPerPage, items.length));
    }
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    loadMoreItems,
    canLoadMore,
    isLastPage,
  };
}