import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface MobileKeyboardAdapterProps {
  children: React.ReactNode;
}

export const MobileKeyboardAdapter: React.FC<MobileKeyboardAdapterProps> = ({ children }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Detect virtual keyboard on mobile
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.clientHeight;
      const heightDiff = documentHeight - windowHeight;

      if (heightDiff > 150) { // Threshold for keyboard detection
        setKeyboardHeight(heightDiff);
        setIsKeyboardVisible(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    };

    // Visual Viewport API for better keyboard detection
    if (window.visualViewport) {
      const viewport = window.visualViewport;
      const handleViewportChange = () => {
        const heightDiff = window.innerHeight - viewport.height;
        if (heightDiff > 150) {
          setKeyboardHeight(heightDiff);
          setIsKeyboardVisible(true);
        } else {
          setKeyboardHeight(0);
          setIsKeyboardVisible(false);
        }
      };

      viewport.addEventListener('resize', handleViewportChange);
      return () => viewport.removeEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div 
      className="h-full transition-all duration-300"
      style={{ 
        paddingBottom: isKeyboardVisible ? `${Math.max(keyboardHeight - 100, 0)}px` : '0px' 
      }}
    >
      {children}
    </div>
  );
};

interface SwipeGesturesProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  threshold?: number;
}

export const SwipeGestures: React.FC<SwipeGesturesProps> = ({
  onSwipeLeft,
  onSwipeRight,
  children,
  threshold = 50
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > threshold) {
      if (distanceX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      className="h-full w-full"
    >
      {children}
    </div>
  );
};

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    
    if (scrollTop === 0 && currentY > startY) {
      const distance = Math.min(currentY - startY, threshold * 1.5);
      setPullDistance(distance);
      
      if (distance > threshold) {
        e.preventDefault(); // Prevent default scroll behavior
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  const refreshProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm transition-all duration-200"
        style={{ 
          transform: `translateY(${Math.max(pullDistance - 60, -60)}px)`,
          height: '60px'
        }}
      >
        <div className="flex items-center justify-center h-full">
          {isRefreshing ? (
            <div className="flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Refreshing...</span>
            </div>
          ) : pullDistance > threshold ? (
            <div className="flex items-center gap-2 text-primary">
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-medium">Release to refresh</span>
            </div>
          ) : pullDistance > 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronDown 
                className="w-4 h-4 transition-transform"
                style={{ transform: `rotate(${refreshProgress * 180}deg)` }}
              />
              <span className="text-sm">Pull to refresh</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-full"
        style={{ 
          transform: `translateY(${pullDistance > 0 ? pullDistance : 0}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};