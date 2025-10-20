import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const TawkWidget = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Wait a moment for Tawk.to to initialize
    const timer = setTimeout(() => {
      if (window.Tawk_API) {
        if (isAdminPage) {
          // Hide widget on admin pages
          window.Tawk_API.hideWidget();
        } else {
          // Show widget on customer pages
          window.Tawk_API.showWidget();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAdminPage]);

  return null;
};