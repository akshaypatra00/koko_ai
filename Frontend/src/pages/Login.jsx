import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Hls from 'hls.js';
import { ArrowRight, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import SunburstIcon from '../components/SunburstIcon';
import { signInWithEmail, signInWithOAuth } from '../lib/supabaseClient';
import { getCurrentUser, getUserProfile, hasCompletedOnboarding } from '../services/onboardingService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if already logged in
  useEffect(() => {
    async function checkExistingAuth() {
      const user = await getCurrentUser();
      if (user) {
        const isCompleted = await hasCompletedOnboarding(user.id, user);
        if (isCompleted) {
          navigate('/chat', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }
    }
    checkExistingAuth();
  }, [navigate]);

  // Exact Hero Background Video Integration
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoSrc = "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play()
          .then(() => setIsVideoLoaded(true))
          .catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play()
          .then(() => setIsVideoLoaded(true))
          .catch((e) => console.log("Auto-play prevented:", e));
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      const { data, error, isDemo } = await signInWithEmail(email, password);
      if (error) throw error;

      const user = data?.user || (await getCurrentUser());
      if (user?.id) {
        const isCompleted = await hasCompletedOnboarding(user.id, user);
        if (isCompleted) {
          navigate('/chat', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) setAuthError(error.message);
    } catch (err) {
      setAuthError(err.message || `Failed to authenticate with ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black overflow-y-auto flex flex-col">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Exact Hero Section Video Texture & Typography */}
        <div className="relative w-full min-h-[380px] lg:min-h-screen bg-[#000000] overflow-hidden flex flex-col justify-between p-8 sm:p-14 lg:p-20 text-white">
          <video
            ref={videoRef}
            poster="https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
            muted
            loop
            playsInline
            autoPlay
            onPlaying={() => setIsVideoLoaded(true)}
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ease-out bg-black ${
              isVideoLoaded ? 'opacity-60' : 'opacity-20'
            }`}
          />

          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none" />
          <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/25 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/25 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse-slow" />

          {/* Top Return Button */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to website</span>
            </Link>
          </div>

          {/* Left Main Typography */}
          <div className="relative z-10 space-y-4 max-w-lg my-auto pt-8 pb-12">
            <h1 className="font-instrument-sans font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.08] tracking-tight">
              Simplify The Process.<br />
              Supercharge The Results.
            </h1>
            <p className="font-instrument-sans text-base sm:text-lg text-white/70 font-normal leading-relaxed">
              Focus On The Big Picture While We Automate The Daily Details.
            </p>
          </div>

          <div className="relative z-10" />
        </div>

        {/* Right Side: Clean 100% Width White Auth Screen */}
        <div className="relative w-full min-h-screen bg-white flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 text-slate-900">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Brand Logo & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 justify-center">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <SunburstIcon className="w-5 h-5 text-white" size={20} />
                </div>
                <span className="font-instrument-sans font-bold text-2xl text-slate-950 tracking-tight">
                  Koko AI
                </span>
              </div>

              <h2 className="font-instrument-sans font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Log in to your account
              </h2>
              <p className="font-instrument-sans text-xs sm:text-sm text-slate-500">
                Welcome back Fill in your details to get you back in.
              </p>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Heymaxwell@gmail.com"
                  className="w-full px-5 py-3.5 rounded-full border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full px-5 py-3.5 pr-12 rounded-full border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between px-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link will be sent to your email.');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Forgot Password
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-[#0528e0] hover:bg-[#0420b5] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg shadow-blue-600/25 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 font-medium">
                Or continue with
              </span>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer border border-slate-200/80"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign In With Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('github')}
                className="w-full py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer border border-slate-200/80"
              >
                <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Sign In With GitHub</span>
              </button>
            </div>

            {/* Switch Mode to Signup */}
            <div className="pt-2 text-center text-xs text-slate-500">
              <span>Dont have an account? </span>
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-2 hover:underline ml-1"
              >
                Create One
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
