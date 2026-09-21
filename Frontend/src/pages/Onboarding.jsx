import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Loader2, Check, Sparkles, RefreshCw, Home } from 'lucide-react';
import SunburstIcon from '../components/SunburstIcon';
import OnboardingProgress from '../components/OnboardingProgress';

// Step Components
import DisplayNameStep from '../components/onboarding/DisplayNameStep';
import UseCasesStep from '../components/onboarding/UseCasesStep';
import ExperienceStep from '../components/onboarding/ExperienceStep';
import ResponseStyleStep from '../components/onboarding/ResponseStyleStep';
import LanguageStep from '../components/onboarding/LanguageStep';
import ProjectStep from '../components/onboarding/ProjectStep';
import MemoryPreferenceStep from '../components/onboarding/MemoryPreferenceStep';

import {
  getCurrentUser,
  getUserProfile,
  hasCompletedOnboarding,
  saveOnboardingData,
  ONBOARDING_DRAFT_KEY,
} from '../services/onboardingService';

const STEP_TITLES = [
  'Display Name',
  'Primary Workflows',
  'Technical Depth',
  'Tone & Delivery',
  'Language',
  'Context',
  'Memory',
];

export function Onboarding() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Initial Form State
  const [formData, setFormData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Could not read cached onboarding draft:', e);
    }
    return {
      display_name: '',
      primary_use_cases: [],
      experience_level: 'intermediate',
      response_style: 'Concise and direct',
      preferred_language: 'auto',
      current_project: '',
      memory_preference: 'remember_useful_details',
    };
  });

  // Verify auth session and guard against re-onboarding
  useEffect(() => {
    async function verifyUser() {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      setUserId(user.id);

      // Guard: If this account has already completed onboarding, go straight to chat
      const alreadyDone = await hasCompletedOnboarding(user.id, user);
      if (alreadyDone) {
        navigate('/chat', { replace: true });
        return;
      }

      const profile = await getUserProfile(user.id);
      if (!formData.display_name && (profile?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name)) {
        setFormData((prev) => ({
          ...prev,
          display_name: profile?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
        }));
      }

      setIsCheckingStatus(false);
    }

    verifyUser();
  }, [navigate]);

  // Persist draft on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not cache onboarding draft:', e);
    }
  }, [formData]);

  const updateField = (field, value) => {
    setValidationError('');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step-by-step validation
  const validateCurrentStep = () => {
    setValidationError('');

    switch (currentStep) {
      case 1: {
        const name = (formData.display_name || '').trim();
        if (!name) {
          setValidationError('Please enter a display name.');
          return false;
        }
        if (name.length < 2) {
          setValidationError('Display name must be at least 2 characters.');
          return false;
        }
        if (name.length > 80) {
          setValidationError('Display name must not exceed 80 characters.');
          return false;
        }
        return true;
      }

      case 2: {
        if (!formData.primary_use_cases || formData.primary_use_cases.length === 0) {
          setValidationError('Please select at least one primary workflow.');
          return false;
        }
        return true;
      }

      case 3: {
        if (!formData.experience_level) {
          setValidationError('Please select your experience level.');
          return false;
        }
        return true;
      }

      case 4: {
        if (!formData.response_style) {
          setValidationError('Please select a response delivery style.');
          return false;
        }
        return true;
      }

      case 5:
      case 6:
      case 7:
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await submitOnboarding();
    }
  };

  const handleBack = () => {
    setValidationError('');
    setSaveError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setValidationError('');
    if (currentStep === 6) {
      updateField('current_project', '');
      setCurrentStep(7);
    }
  };

  const submitOnboarding = async () => {
    let activeId = userId;
    if (!activeId) {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      activeId = user.id;
      setUserId(user.id);
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveOnboardingData(activeId, formData);
      setIsCompleted(true);
      setTimeout(() => {
        navigate('/chat', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      setSaveError(err.message || 'Could not save your preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen w-full bg-[#050507] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050507] text-white flex flex-col justify-between font-sans selection:bg-white selection:text-black">
      {/* Subtle Top Navigation */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="text-white transform group-hover:rotate-45 transition-transform duration-500">
            <SunburstIcon className="w-5 h-5 text-white" size={20} />
          </div>
          <span className="font-instrument-sans font-semibold text-lg text-white tracking-tight">
            koko
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs font-mono text-white/40 hover:text-white transition-colors"
        >
          Exit setup
        </Link>
      </header>

      {/* Main Centered Content */}
      <main className="w-full max-w-2xl mx-auto px-6 py-10 my-auto">
        {/* Setup Complete Card */}
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-left space-y-8"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mb-4">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2 className="font-instrument-sans font-semibold text-3xl sm:text-4xl text-white tracking-tight">
                Preferences saved, {formData.display_name}.
              </h2>
              <p className="text-sm text-white/50 leading-relaxed max-w-md">
                Your profile, model dispatch weights, and personalization settings are now configured in your database.
              </p>
            </div>

            {/* Profile Overview Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Technical Tier</span>
                <div className="text-white capitalize font-sans text-sm font-medium">{formData.experience_level}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Response Style</span>
                <div className="text-white font-sans text-sm font-medium">{formData.response_style}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Language</span>
                <div className="text-white font-sans text-sm font-medium">
                  {formData.preferred_language === 'auto' ? 'Auto-detect' : formData.preferred_language}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Memory Mode</span>
                <div className="text-white font-sans text-sm font-medium capitalize">
                  {formData.memory_preference.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/chat"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <span>Launch Koko Chat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-mono inline-flex items-center justify-center gap-2 transition-all border border-white/10"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Step Sequence Card */
          <div className="space-y-8">
            {/* Minimalist Progress Track */}
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={7}
              stepTitles={STEP_TITLES}
            />

            {/* Save Error Alert */}
            {saveError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 text-left flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold mb-0.5">Unable to save preferences</div>
                  <div className="text-red-300/80">{saveError}</div>
                </div>
                <button
                  onClick={submitOnboarding}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-[11px] font-mono text-white cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Animated Step Container */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {currentStep === 1 && (
                    <DisplayNameStep
                      value={formData.display_name}
                      onChange={(val) => updateField('display_name', val)}
                      error={validationError}
                    />
                  )}

                  {currentStep === 2 && (
                    <UseCasesStep
                      value={formData.primary_use_cases}
                      onChange={(val) => updateField('primary_use_cases', val)}
                      error={validationError}
                    />
                  )}

                  {currentStep === 3 && (
                    <ExperienceStep
                      value={formData.experience_level}
                      onChange={(val) => updateField('experience_level', val)}
                      error={validationError}
                    />
                  )}

                  {currentStep === 4 && (
                    <ResponseStyleStep
                      value={formData.response_style}
                      onChange={(val) => updateField('response_style', val)}
                      error={validationError}
                    />
                  )}

                  {currentStep === 5 && (
                    <LanguageStep
                      value={formData.preferred_language}
                      onChange={(val) => updateField('preferred_language', val)}
                    />
                  )}

                  {currentStep === 6 && (
                    <ProjectStep
                      value={formData.current_project}
                      onChange={(val) => updateField('current_project', val)}
                    />
                  )}

                  {currentStep === 7 && (
                    <MemoryPreferenceStep
                      value={formData.memory_preference}
                      onChange={(val) => updateField('memory_preference', val)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
              {/* Back Button */}
              <button
                type="button"
                disabled={currentStep === 1 || isSaving}
                onClick={handleBack}
                className={`text-xs font-mono text-white/50 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentStep === 1 || isSaving ? 'opacity-0 pointer-events-none' : ''
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {/* Forward / Skip Actions */}
              <div className="flex items-center gap-4">
                {currentStep === 6 && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSkip}
                    className="text-xs font-mono text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                )}

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleNext}
                  className="px-7 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-40"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : currentStep === 7 ? (
                    <>
                      <span>Finish setup</span>
                      <Check className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 border-t border-white/[0.06] text-center text-xs text-white/30 font-mono">
        Preferences can be customized anytime from your settings.
      </footer>
    </div>
  );
}

export default Onboarding;
