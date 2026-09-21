import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowUp,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  Cpu,
  Brain,
  Globe,
  Copy,
  Check,
  RotateCcw,
  LogOut,
  ChevronDown,
  User,
  Sliders,
  Code2,
  Zap,
  Layers,
  HelpCircle,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Wand2,
  Maximize2,
  X,
  FileText,
  Download,
} from 'lucide-react';
import SunburstIcon from '../components/SunburstIcon';
import { getCurrentUser, getUserProfile, getUserPreferences } from '../services/onboardingService';
import { signOutUser } from '../lib/supabaseClient';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { apiClient } from '../services/apiClient';
import { MessageContent } from '../components/chat/MessageContent';

const MODELS = [
  { id: 'auto', name: 'Koko Auto-Router', tag: 'Smart', desc: 'Auto-dispatches to the highest performing LLM for your task' },
  { id: 'gemini-2-5', name: 'Gemini 2.5 Flash', tag: '1M Context', desc: 'Default frontier engine for high-precision reasoning, code & text' },
  { id: 'groq', name: 'Groq Llama 3.3', tag: 'Ultra-Fast', desc: 'Sub-second real-time inference for rapid coding and queries' },
  { id: 'claude-3-7', name: 'Claude 3.7 Sonnet', tag: 'Architecture', desc: 'Frontend synthesis, code generation & structural reasoning' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', tag: 'Reasoning', desc: 'Mathematical logic, algorithm optimization & deep proofs' },
  { id: 'gpt-4o', name: 'GPT-4o Omnimodal', tag: 'Omnimodal', desc: 'Rapid conversational throughput, multimodal vision & tools' },
];

const STARTER_PROMPTS = [
  {
    title: 'System Architecture',
    subtitle: 'Design an ultra-low latency real-time WebSocket state feed',
    prompt: 'Design an ultra-low latency real-time WebSocket state feed architecture for a financial trading dashboard in React and Tailwind v4.',
    icon: Layers,
  },
  {
    title: 'Code Synthesis',
    subtitle: 'Write a TypeScript multi-engine router fallback wrapper',
    prompt: 'Write a clean TypeScript router function that dispatches user queries to Claude 3.7 and falls back to DeepSeek R1 upon timeout or rate-limit.',
    icon: Code2,
  },
  {
    title: 'Model Consensus',
    subtitle: 'Benchmark trade-offs between Claude 3.7 and DeepSeek R1',
    prompt: 'Benchmark the architectural and reasoning trade-offs between Claude 3.7 Sonnet and DeepSeek R1 for complex autonomous coding agents.',
    icon: Zap,
  },
  {
    title: 'Image Synthesis',
    subtitle: 'Generate futuristic neural server architecture artwork',
    prompt: 'Generate an image of a futuristic neural server architecture glowing with blue and violet optical fibers.',
    icon: Sparkles,
  },
];

export function Chat() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);

  // Layout & Navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);

  // Chat conversation state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Mode and Promptimization state
  const [activeMode, setActiveMode] = useState('auto'); // 'auto' | 'code' | 'document' | 'image' | 'video'
  const [isPromptimizing, setIsPromptimizing] = useState(false);
  const [promptimizedToast, setPromptimizedToast] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Telemetry modal & feedback states
  const [expandedTelemetryId, setExpandedTelemetryId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [savedMemories, setSavedMemories] = useState(new Set());

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Load user data and existing conversations
  useEffect(() => {
    async function initUser() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(currentUser);

      const userProfile = await getUserProfile(currentUser.id);
      setProfile(userProfile);

      const userPrefs = await getUserPreferences(currentUser.id);
      setPreferences(userPrefs);

      // Load conversations from backend API with fallback
      try {
        const res = await apiClient.getConversations();
        if (res?.data && res.data.length > 0) {
          setConversations(res.data);
          setActiveConversationId(res.data[0].id);
          loadMessages(res.data[0].id);
          return;
        }
      } catch (err) {
        console.warn('[Chat] Could not load conversations from backend API, checking database:', err.message);
      }

      // Fallback: load directly via Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const { data: dbConvs } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (dbConvs && dbConvs.length > 0) {
            setConversations(dbConvs);
            setActiveConversationId(dbConvs[0].id);
            loadMessages(dbConvs[0].id);
          } else {
            handleCreateNewChat();
          }
        } catch (e) {
          console.warn('Database fallback conversation load error:', e);
          handleCreateNewChat();
        }
      } else {
        handleCreateNewChat();
      }
    }

    initUser();
  }, [navigate]);

  const loadMessages = async (convId) => {
    try {
      const res = await apiClient.getConversationMessages(convId);
      if (res?.data) {
        setMessages(res.data);
        return;
      }
    } catch (err) {
      // Fallback
      if (isSupabaseConfigured) {
        const { data: dbMessages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (dbMessages) setMessages(dbMessages);
      }
    }
  };

  // Auto-resize composer textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [inputPrompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating]);

  // 1-Click Promptimization Engine
  const handlePromptimize = async () => {
    const text = inputPrompt.trim();
    if (!text || isPromptimizing) return;

    setIsPromptimizing(true);
    try {
      const res = await apiClient.optimizePrompt({
        message: text,
        targetMode: activeMode,
      });

      if (res?.data?.optimizedPrompt) {
        setInputPrompt(res.data.optimizedPrompt);
        setPromptimizedToast(true);
        setTimeout(() => setPromptimizedToast(false), 3500);
      }
    } catch (err) {
      console.warn('[Promptimize note]:', err.message);
    } finally {
      setIsPromptimizing(false);
    }
  };

  // Send message & generate response through backend multi-model orchestrator
  const handleSendMessage = async (customPrompt) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isGenerating) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      response_type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsGenerating(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const isTemporaryConv = !activeConversationId || activeConversationId.startsWith('conv-temp-');
      const payloadConvId = isTemporaryConv ? undefined : activeConversationId;
      const effectiveMode = activeMode === 'auto' ? 'normal' : activeMode;

      const res = await apiClient.sendMessage({
        conversationId: payloadConvId,
        message: textToSend,
        preferredProvider: selectedModel.id,
        responseMode: effectiveMode,
      });

      if (res?.data) {
        const d = res.data;

        // If a new conversation was created on the backend, update state
        if (d.conversationId && d.conversationId !== activeConversationId) {
          setActiveConversationId(d.conversationId);
          // Refresh conversations
          apiClient.getConversations().then((cRes) => {
            if (cRes?.data) setConversations(cRes.data);
          }).catch(() => {});
        }

        const assistantMsg = {
          id: d.messageId || `asst-${Date.now()}`,
          role: 'assistant',
          content: d.response?.content || d.response?.url || '',
          response_type: d.response?.type || 'text',
          language: d.response?.language,
          url: d.response?.url,
          alt: d.response?.alt,
          thumbnailUrl: d.response?.thumbnailUrl,
          model_used: `${d.provider} / ${d.model}`,
          token_count: d.usage?.totalTokens || 0,
          latency: d.telemetry?.evaluatedModels?.find((m) => m.isWinner)?.latencyMs
            ? `${d.telemetry.evaluatedModels.find((m) => m.isWinner).latencyMs}ms`
            : '220ms',
          telemetry: d.telemetry,
          memorySuggestion: d.memorySuggestion,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsGenerating(false);
        return;
      }
    } catch (err) {
      console.warn('[Chat] Backend API error:', err.message);

      const assistantMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Note**: Could not connect to Koko AI backend (\`http://localhost:5000\`).\n\n*Error details:* ${err.message}\n\nPlease verify that the backend server is running with \`npm run dev\` in the \`server\` directory, then retry your request.`,
        response_type: 'text',
        model_used: selectedModel.name,
        token_count: 0,
        latency: '0ms',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);
    }
  };

  const handleCreateNewChat = () => {
    const tempId = `conv-temp-${Date.now()}`;
    const newConv = {
      id: tempId,
      title: 'New conversation',
      created_at: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev.filter((c) => !c.id.startsWith('conv-temp-'))]);
    setActiveConversationId(tempId);
    setMessages([]);
    setInputPrompt('');
  };

  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
    loadMessages(convId);
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await apiClient.deleteConversation(convId);
    } catch (err) {
      if (isSupabaseConfigured) {
        await supabase.from('conversations').delete().eq('id', convId);
      }
    }
    const updated = conversations.filter((c) => c.id !== convId);
    setConversations(updated);
    if (activeConversationId === convId) {
      if (updated.length > 0) {
        handleSelectConversation(updated[0].id);
      } else {
        handleCreateNewChat();
      }
    }
  };

  const handleFeedback = async (messageId, rating) => {
    setFeedbackState((prev) => ({ ...prev, [messageId]: rating }));
    try {
      await apiClient.submitFeedback({ messageId, rating });
    } catch (err) {
      console.warn('Feedback submission failed:', err);
    }
  };

  const handleSaveMemorySuggestion = async (mem) => {
    try {
      await apiClient.createMemory(mem);
      setSavedMemories((prev) => new Set([...prev, mem.memory_text]));
    } catch (err) {
      console.warn('Could not save suggested memory:', err);
    }
  };

  const handleRegenerate = async () => {
    if (isGenerating || !activeConversationId) return;
    setIsGenerating(true);

    try {
      const res = await apiClient.regenerateMessage({
        conversationId: activeConversationId,
        preferredProvider: selectedModel.id,
      });

      if (res?.data) {
        const d = res.data;
        const regeneratedMsg = {
          id: d.messageId || `asst-${Date.now()}`,
          role: 'assistant',
          content: d.response?.content || d.response?.url || '',
          response_type: d.response?.type || 'text',
          language: d.response?.language,
          url: d.response?.url,
          alt: d.response?.alt,
          model_used: `${d.provider} / ${d.model}`,
          token_count: d.usage?.totalTokens || 0,
          latency: '190ms',
          telemetry: d.telemetry,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, regeneratedMsg]);
      }
    } catch (err) {
      console.warn('Regeneration failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await signOutUser();
    navigate('/login', { replace: true });
  };

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'there';

  return (
    <div className="h-screen w-full bg-[#000000] text-white flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Ambient background glows matching Hero */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-900/15 blur-[160px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/15 blur-[160px] rounded-full mix-blend-screen pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR                                                           */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 md:static flex flex-col justify-between bg-[#04060d]/95 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="p-3.5 space-y-4 flex flex-col h-full overflow-hidden">
          {/* Sidebar Top: Brand & Collapse */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <SunburstIcon className="w-4 h-4 text-white" size={18} />
              </div>
              <span className="font-instrument-sans font-bold text-lg tracking-tight text-white flex items-center gap-1">
                koko
                <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded border border-white/20 text-white/50 bg-white/5">
                  ai
                </span>
              </span>
            </Link>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform duration-200" />
              <span>Start new chat</span>
            </div>
            <span className="text-[10px] font-mono text-white/30 border border-white/10 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </button>

          {/* Recent Conversations List */}
          <div className="flex-grow overflow-y-auto space-y-1 pr-1 custom-scroll">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 px-2 py-1">
              Recent Threads
            </div>

            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between gap-2 truncate cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 border border-blue-500/40 text-white font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-white/40'}`} />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Persistent Onboarding Preferences Preview */}
          {preferences && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-left space-y-2 shrink-0">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Brain className="w-3 h-3" />
                  <span>Configured Persona</span>
                </span>
                <Link to="/onboarding" className="hover:text-white underline">
                  Edit
                </Link>
              </div>

              <div className="text-xs text-white/80 font-medium truncate">
                {preferences.response_style || 'Concise and direct'}
              </div>

              {preferences.current_project && (
                <div className="text-[11px] text-white/45 line-clamp-2 leading-relaxed">
                  Project: {preferences.current_project}
                </div>
              )}
            </div>
          )}

          {/* Bottom Profile / User Menu */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1 shrink-0">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-white truncate">{displayName}</div>
                <div className="text-[10px] font-mono text-white/40 capitalize truncate">
                  {preferences?.experience_level || 'Member'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA                                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Floating App Bar */}
        <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Model Selector Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{selectedModel.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Flyout Dropdown */}
              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-2xl bg-[#090d1a] border border-white/15 backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 px-2 py-1 mb-1">
                    Frontier Consensus Routing
                  </div>
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                        selectedModel.id === m.id
                          ? 'bg-blue-600/20 text-white'
                          : 'hover:bg-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>{m.name}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-blue-300">
                            {m.tag}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5 leading-tight">{m.desc}</div>
                      </div>
                      {selectedModel.id === m.id && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {preferences?.memory_preference && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-white/50">
                <Brain className="w-3 h-3 text-purple-400" />
                <span className="capitalize">
                  {preferences.memory_preference.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            <Link
              to="/"
              className="text-white/40 hover:text-white transition-colors p-1.5"
              title="Return to Landing Page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 3. CONVERSATION VIEW / HOME VIEW                                     */}
        {/* ===================================================================== */}
        <div className="flex-1 overflow-y-auto custom-scroll relative flex flex-col">
          {messages.length === 0 ? (
            /* Centered Home View */
            <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 max-w-3xl mx-auto w-full text-center my-auto space-y-8">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white shadow-[0_0_25px_rgba(48,84,255,0.25)]">
                  <SunburstIcon className="w-7 h-7 text-white" size={28} />
                </div>
                <h1 className="font-instrument-serif text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight font-normal">
                  {getGreeting()}, {displayName}
                </h1>
                <p className="font-instrument-sans text-sm sm:text-base text-white/50 max-w-md mx-auto leading-relaxed">
                  How can Koko orchestrate your frontier models today?
                </p>
              </div>

              {/* Expansive Composer Card */}
              <div className="w-full rounded-3xl bg-[#0a0d18]/90 border border-white/15 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all text-left space-y-3">
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scroll">
                  {[
                    { id: 'auto', label: 'Auto Frontier', icon: Sparkles },
                    { id: 'code', label: 'Code Mode', icon: Code2 },
                    { id: 'document', label: 'Document Mode', icon: FileText },
                    { id: 'image', label: 'Generate Image', icon: ImageIcon },
                    { id: 'video', label: 'Generate Video', icon: VideoIcon },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setActiveMode(mode.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm font-semibold'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {promptimizedToast && (
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-in fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Prompt upgraded with engineering constraints & technical depth!</span>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    activeMode === 'code'
                      ? "Describe the function, component, or algorithm to code (e.g. 'Write a React debounce hook in TypeScript')..."
                      : activeMode === 'document'
                      ? "Describe the document or report to generate (e.g. 'System architecture guide for real-time messaging')..."
                      : activeMode === 'image'
                      ? "Describe the visual asset or illustration to generate (e.g. 'Futuristic cyber city at night, 8k photorealistic')..."
                      : activeMode === 'video'
                      ? "Describe the motion video to create (e.g. 'Cinematic footage of ocean waves crashing on bioluminescent beach')..."
                      : "Ask Koko anything, route across frontier models, generate images or draft code..."
                  }
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/30 focus:outline-none resize-none font-sans leading-relaxed"
                />

                {/* Inner Action Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWebSearchActive(!isWebSearchActive)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border ${
                        isWebSearchActive
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Search Web</span>
                    </button>

                    <span className="text-[11px] font-mono text-white/30 hidden sm:inline">
                      {selectedModel.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePromptimize}
                      disabled={!inputPrompt.trim() || isPromptimizing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                      title="Automatically optimize prompt with enterprise constraints and semantic vectors"
                    >
                      <Wand2 className={`w-3.5 h-3.5 ${isPromptimizing ? 'animate-spin' : ''}`} />
                      <span>{isPromptimizing ? 'Optimizing...' : 'Promptimize'}</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputPrompt.trim() || isGenerating}
                      className="w-9 h-9 rounded-full bg-[#2850ff] hover:bg-[#1a40ee] text-white flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:hover:bg-[#2850ff] cursor-pointer"
                      title="Send query"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Starter Action Suggestions */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {STARTER_PROMPTS.map((starter, idx) => {
                  const Icon = starter.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(starter.prompt)}
                      className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all text-left flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 truncate">
                        <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {starter.title}
                        </div>
                        <div className="text-[11px] text-white/40 truncate">{starter.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Active Messages Stream */
            <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                      <SunburstIcon className="w-4 h-4" size={16} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-2xl space-y-2 text-left ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Model Telemetry & Consensus Pill */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-white/50">
                        <button
                          onClick={() => setExpandedTelemetryId(expandedTelemetryId === msg.id ? null : msg.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-blue-400 font-medium transition-all cursor-pointer shadow-sm"
                          title="Click to view full frontier model consensus & telemetry"
                        >
                          <Zap className="w-3 h-3 text-blue-400" />
                          <span>{msg.model_used || 'Frontier Orchestrator'}</span>
                          <span>&bull;</span>
                          <span>{msg.latency || '210ms'}</span>
                          {msg.telemetry?.evaluatedModels?.length > 1 && (
                            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300">
                              {msg.telemetry.evaluatedModels.length} models evaluated
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* EXPANDED MODEL TELEMETRY DRAWER: Shows which worked, won, or failed       */}
                    {/* ========================================================================= */}
                    {msg.role === 'assistant' && expandedTelemetryId === msg.id && msg.telemetry && (
                      <div className="p-3.5 rounded-2xl bg-[#070b16] border border-blue-500/30 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            Frontier Consensus Arbitration Breakdown
                          </span>
                          <span className="text-[10px] font-mono text-white/40">
                            Judge: {msg.telemetry.judgeDecision?.winner || 'Auto'}
                          </span>
                        </div>

                        {msg.telemetry.routingReason && (
                          <div className="text-[11px] text-white/60">
                            <strong className="text-white/80">Routing Logic:</strong> {msg.telemetry.routingReason}
                          </div>
                        )}

                        {/* Model-by-model success/failure scorecard */}
                        <div className="space-y-2 pt-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                            Model Execution Status:
                          </div>

                          {msg.telemetry.evaluatedModels?.map((m, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                                m.status === 'success'
                                  ? m.isWinner
                                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                    : 'bg-blue-950/20 border-blue-500/20 text-blue-200'
                                  : 'bg-red-950/30 border-red-500/30 text-red-200'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {m.status === 'success' ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                  )}
                                  <span className="font-semibold font-mono text-white">
                                    {m.provider} / {m.model}
                                  </span>
                                  {m.isWinner && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                                      Winning Model
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-white/70">
                                  {m.assessment || (m.status === 'success' ? 'Perfect response generated' : `Failed: ${m.error}`)}
                                </div>
                              </div>

                              <div className="text-right shrink-0 font-mono text-[10px] space-y-0.5">
                                <div className="text-white/60">{m.latencyMs}ms</div>
                                {m.score > 0 && (
                                  <div className="text-emerald-400 font-semibold">{Math.round(m.score * 100)}% Score</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Rendering by Response Type */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-white/[0.08] border border-white/15 text-white shadow-sm whitespace-pre-wrap'
                          : msg.isError
                          ? 'bg-red-950/30 border border-red-500/40 text-red-200'
                          : 'bg-[#0a0d18]/80 border border-white/10 text-white/90 backdrop-blur-md shadow-md'
                      }`}
                    >
                      {/* Image Response */}
                      {msg.response_type === 'image' && msg.url ? (
                        <div className="space-y-3">
                          <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-black/40">
                            <img
                              src={msg.url}
                              alt={msg.alt || 'Generated visual'}
                              data-koko-media="true"
                              className="koko-generated-image w-full max-h-[500px] object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01] cursor-pointer"
                              onClick={() => setPreviewImage(msg.url)}
                            />
                            <button
                              onClick={() => setPreviewImage(msg.url)}
                              className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md cursor-pointer"
                              title="Full Resolution Preview"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-[11px] font-mono text-white/50 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Flux & Gemini Visual Synthesis (1024x1024)</span>
                            </span>
                            <a
                              href={msg.url}
                              download="koko-generated-asset.png"
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline text-xs"
                            >
                              <Download className="w-3 h-3" />
                              Download Original
                            </a>
                          </div>
                        </div>
                      ) : msg.response_type === 'video' && msg.url ? (
                        /* Video Response */
                        <div className="space-y-3">
                          <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black">
                            <video
                              controls
                              playsInline
                              src={msg.url}
                              poster={msg.thumbnailUrl}
                              className="w-full max-h-[480px] rounded-2xl"
                            />
                          </div>
                          <div className="text-[11px] font-mono text-white/50 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                              <VideoIcon className="w-3.5 h-3.5" />
                              <span>Veo High-Definition Cinematic Synthesis</span>
                            </span>
                            <a
                              href={msg.url}
                              download="koko-generated-video.mp4"
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline text-xs"
                            >
                              <Download className="w-3 h-3" />
                              Download MP4
                            </a>
                          </div>
                        </div>
                      ) : msg.role === 'assistant' ? (
                        /* Assistant Rich Formatted Document & Code Blocks */
                        <MessageContent
                          message={msg}
                          role={msg.role}
                          onSaveMemory={handleSaveMemorySuggestion}
                        />
                      ) : (
                        /* Standard User Message */
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}

                      {/* Memory Suggestion Banner */}
                      {msg.memorySuggestion && !savedMemories.has(msg.memorySuggestion.memory_text) && (
                        <div className="mt-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-purple-200">
                            <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>Suggested Memory: <em>"{msg.memorySuggestion.memory_text}"</em></span>
                          </div>
                          <button
                            onClick={() => handleSaveMemorySuggestion(msg.memorySuggestion)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] transition-colors cursor-pointer shrink-0"
                          >
                            Save to Memory
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Assistant Action Bar: Copy, Feedback, Regenerate */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-3 text-[11px] font-mono text-white/40 pl-1 pt-1">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <span>&bull;</span>

                        {/* Thumbs Up Feedback */}
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer ${
                            feedbackState[msg.id] === 'up' ? 'text-emerald-400' : ''
                          }`}
                          title="Good response"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>

                        {/* Thumbs Down Feedback */}
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer ${
                            feedbackState[msg.id] === 'down' ? 'text-red-400' : ''
                          }`}
                          title="Poor response"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>

                        <span>&bull;</span>

                        {/* Regenerate Button */}
                        <button
                          onClick={handleRegenerate}
                          className="hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Regenerate with frontier routing"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>

                        <span>&bull;</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-200 text-xs font-semibold flex items-center justify-center shrink-0 mt-1">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-4 items-center pl-12 text-xs font-mono text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Evaluating frontier consensus streams across Gemini, Groq & OpenRouter...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Sticky Bottom Composer */}
          {messages.length > 0 && (
            <div className="p-4 sm:p-6 bg-gradient-to-t from-black via-black/95 to-transparent shrink-0">
              <div className="max-w-3xl mx-auto rounded-3xl bg-[#0a0d18]/90 border border-white/15 backdrop-blur-2xl p-3 sm:p-4 shadow-2xl focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all space-y-2.5">
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scroll">
                  {[
                    { id: 'auto', label: 'Auto Frontier', icon: Sparkles },
                    { id: 'code', label: 'Code Mode', icon: Code2 },
                    { id: 'document', label: 'Document Mode', icon: FileText },
                    { id: 'image', label: 'Generate Image', icon: ImageIcon },
                    { id: 'video', label: 'Generate Video', icon: VideoIcon },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setActiveMode(mode.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all cursor-pointer border shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white shadow-sm font-semibold'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {promptimizedToast && (
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-xl animate-in fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Prompt upgraded with engineering constraints & technical depth!</span>
                  </div>
                )}

                <textarea
                  rows={2}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    activeMode === 'code'
                      ? "Describe the function, component, or algorithm to code (e.g. 'Write a React debounce hook in TypeScript')..."
                      : activeMode === 'document'
                      ? "Describe the document or report to generate (e.g. 'System architecture guide for real-time messaging')..."
                      : activeMode === 'image'
                      ? "Describe the visual asset or illustration to generate (e.g. 'Futuristic cyber city at night, 8k photorealistic')..."
                      : activeMode === 'video'
                      ? "Describe the motion video to create (e.g. 'Cinematic footage of ocean waves crashing on bioluminescent beach')..."
                      : "Reply to Koko, request code synthesis, or generate media..."
                  }
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none resize-none font-sans px-2"
                />

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="text-[11px] font-mono text-white/40 flex items-center gap-2 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{selectedModel.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePromptimize}
                      disabled={!inputPrompt.trim() || isPromptimizing}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                      title="Automatically optimize prompt with enterprise constraints and semantic vectors"
                    >
                      <Wand2 className={`w-3.5 h-3.5 ${isPromptimizing ? 'animate-spin' : ''}`} />
                      <span>{isPromptimizing ? 'Optimizing...' : 'Promptimize'}</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputPrompt.trim() || isGenerating}
                      className="w-8 h-8 rounded-full bg-[#2850ff] hover:bg-[#1a40ee] text-white flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-30 cursor-pointer"
                      title="Send query"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <img src={previewImage} alt="Expanded preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <a
              href={previewImage}
              download="koko-generated-visual.png"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
