import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  initialFocus?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active, 
  initialFocus 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const getFocusableElements = () => {
    if (!containerRef.current) return [];
    
    return Array.from(
      containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      const el = element as HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement;
      return !el.disabled && !el.getAttribute('aria-hidden');
    });
  };

  useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus initial element or first focusable element
    const focusableElements = getFocusableElements();
    if (initialFocus) {
      const initialElement = document.getElementById(initialFocus);
      if (initialElement) {
        initialElement.focus();
      }
    } else if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, [active, initialFocus]);

  return (
    <div ref={containerRef} role={active ? 'dialog' : undefined}>
      {children}
    </div>
  );
};

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
      "
    >
      {children}
    </a>
  );
};

interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  children, 
  priority = 'polite',
  atomic = true 
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
};

interface ReducedMotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ReducedMotionWrapper: React.FC<ReducedMotionProps> = ({ 
  children, 
  fallback 
}) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return prefersReducedMotion && fallback ? <>{fallback}</> : <>{children}</>;
};

// High contrast mode detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Keyboard navigation helper
export const useKeyboardNavigation = (
  items: string[],
  onSelect: (index: number) => void,
  enabled: boolean = true
) => {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          if (activeIndex >= 0) {
            e.preventDefault();
            onSelect(activeIndex);
          }
          break;
        case 'Escape':
          setActiveIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, onSelect, activeIndex, enabled]);

  return { activeIndex, setActiveIndex };
};