import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/onboardingService';

/**
 * ProtectedRoute ensures that only authenticated users can access protected pages (like /onboarding).
 * Avoids aggressive state resets or full-screen flickering on route transitions.
 */
export function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState({
    isLoading: true,
    user: null,
  });

  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (isMounted) {
          setAuthState({
            isLoading: false,
            user,
          });
        }
      } catch (error) {
        console.error('Error during auth check:', error);
        if (isMounted) {
          setAuthState({ isLoading: false, user: null });
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Subtle inline loading state to avoid full-screen screen flash
  if (authState.isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#050507] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  // Not authenticated -> redirect to /login
  if (!authState.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
