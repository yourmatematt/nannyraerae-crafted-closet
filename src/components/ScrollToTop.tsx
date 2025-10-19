import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if navigation should preserve scroll position
    const preserveScroll = location.state?.preserveScroll;

    // Scroll to top if not preserving scroll
    if (!preserveScroll) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
};

export default ScrollToTop;