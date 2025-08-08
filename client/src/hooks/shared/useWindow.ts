import { useState, useEffect } from 'react';

const useWindowWidth = (breakpoint: number): boolean => {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState<boolean>(false);

  useEffect(() => {
    const checkWindowWidth = () => {
      setIsAboveBreakpoint(window.innerWidth >= breakpoint);
    };

    // Check on mount
    checkWindowWidth();

    // Add event listener
    window.addEventListener('resize', checkWindowWidth);

    // Cleanup
    return () => window.removeEventListener('resize', checkWindowWidth);
  }, [breakpoint]);

  return isAboveBreakpoint;
};

export default useWindowWidth;