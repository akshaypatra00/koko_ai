import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import SignInModal from '../components/SignInModal';

export function Landing() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const navigate = useNavigate();

  // Open modal if URL has hash, or allow clicking Get Started
  useEffect(() => {
    const handleHashChange = () => {
      if (
        window.location.hash === '#signin' ||
        window.location.hash === '#login' ||
        window.location.hash === '#get-started'
      ) {
        setIsSignInOpen(true);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      {/* Fixed Transparent Navbar */}
      <Navbar onOpenSignIn={() => setIsSignInOpen(true)} />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Dark Mode Hero Section */}
        <Hero onOpenSignIn={() => setIsSignInOpen(true)} />

        {/* Unified 8-Feature Capability Showcase */}
        <Features />
      </main>

      {/* Themed Koko AI Footer */}
      <Footer />

      {/* Sign In & Sign Up Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => {
          setIsSignInOpen(false);
          if (
            window.location.hash === '#signin' ||
            window.location.hash === '#login' ||
            window.location.hash === '#get-started'
          ) {
            history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }}
      />
    </div>
  );
}

export default Landing;
