import { useState, useEffect } from 'react';

export function useIsMobile(query = '(max-width: 768px)') {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setIsMobile(mediaQuery.matches);

    const handler = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
}