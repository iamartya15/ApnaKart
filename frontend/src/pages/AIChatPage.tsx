import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  useChatHistoryQuery,
  useGiftMutation,
  useBudgetComboMutation,
  useOutfitMutation,
} from '../hooks/useAIQueries';
import { Send, Sparkles, Loader2, Gift, Wallet, Shirt, User, Bot, HelpCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export const AIChatPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Set a fixed unique conversationId for session consistency (creates a new session ID if missing)
  const [conversationId] = useState(() => {
    const saved = sessionStorage.getItem('conversationId');
    if (saved) return saved;
    const newId = `conv-${Math.floor(100000 + Math.random() * 900000)}`;
    sessionStorage.setItem('conversationId', newId);
    return newId;
  });

  const { data: dbHistory = [] } = useChatHistoryQuery(conversationId, !!conversationId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Widget States
  const [activeWidget, setActiveWidget] = useState<'chat' | 'gift' | 'budget' | 'outfit'>('chat');
  const [giftDesc, setGiftDesc] = useState('');
  const [budgetVal, setBudgetVal] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Mutation hooks
  const giftMutation = useGiftMutation();
  const budgetMutation = useBudgetComboMutation();
  const outfitMutation = useOutfitMutation();

  // Load history from DB on load
  useEffect(() => {
    if (dbHistory.length > 0) {
      setMessages(
        dbHistory.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      );
    }
  }, [dbHistory]);

  // Connect WebSockets for streaming
  useEffect(() => {
    // Establish connection matching host origin or local backend port 5000
    const socketUrl = (import.meta as any).env.VITE_API_URL || (window.location.origin.includes('5173')
      ? 'http://localhost:5000'
      : window.location.origin);

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Chat client] WebSocket connected for streaming.');
    });

    // Chunk receipt callback
    socket.on('chat_stream_chunk', (data: { conversationId: string; chunk: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.isStreaming) {
            return [...prev.slice(0, -1), { ...last, content: last.content + data.chunk }];
          } else {
            return [...prev, { role: 'assistant', content: data.chunk, isStreaming: true }];
          }
        });
      }
    });

    // Done callback
    socket.on('chat_stream_done', (data: { conversationId: string; fullReply: string }) => {
      if (data.conversationId === conversationId) {
        setIsStreaming(false);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { role: 'assistant', content: data.fullReply, isStreaming: false },
            ];
          }
          return prev;
        });
      }
    });

    socket.on('chat_stream_error', () => {
      setIsStreaming(false);
      alert('AI stream encountered an issue. Reconnecting...');
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId]);

  // Scroll to bottom on updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isStreaming) return;

    const userMessage = inputVal.trim();
    setInputVal('');
    setIsStreaming(true);

    // Append user message to log list
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Emit chat event
    socketRef.current?.emit('chat_stream_send', {
      userId: user?.id,
      conversationId,
      message: userMessage,
    });
  };

  // Submit trigger for Gift Finder
  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (giftDesc.trim()) {
      giftMutation.mutate({ description: giftDesc });
    }
  };

  // Submit trigger for Budget Combinations
  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (budgetVal.trim()) {
      budgetMutation.mutate({ budget: Number(budgetVal) });
    }
  };

  // Submit trigger for Outfit recommendations
  const handleOutfitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outfitOccasion.trim()) {
      outfitMutation.mutate({ occasion: outfitOccasion });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
            AI Assistant Center
          </h2>
          <p className="text-muted-foreground font-semibold">
            Stream recommendations, optimize budgets, and coordinate outfits.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex bg-secondary/50 p-1 rounded-2xl border items-center self-start md:self-center gap-1">
          <button
            onClick={() => setActiveWidget('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeWidget === 'chat' ? 'bg-card shadow-sm text-indigo-600' : 'text-muted-foreground'}`}
          >
            <Bot className="w-3.5 h-3.5 inline mr-1" /> Chat
          </button>
          <button
            onClick={() => setActiveWidget('gift')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeWidget === 'gift' ? 'bg-card shadow-sm text-indigo-600' : 'text-muted-foreground'}`}
          >
            <Gift className="w-3.5 h-3.5 inline mr-1" /> Gift
          </button>
          <button
            onClick={() => setActiveWidget('budget')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeWidget === 'budget' ? 'bg-card shadow-sm text-indigo-600' : 'text-muted-foreground'}`}
          >
            <Wallet className="w-3.5 h-3.5 inline mr-1" /> Budget
          </button>
          <button
            onClick={() => setActiveWidget('outfit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeWidget === 'outfit' ? 'bg-card shadow-sm text-indigo-600' : 'text-muted-foreground'}`}
          >
            <Shirt className="w-3.5 h-3.5 inline mr-1" /> Outfit
          </button>
        </div>
      </div>

      {/* 1. Chat Stream interface */}
      {activeWidget === 'chat' && (
        <div className="bg-card border rounded-3xl shadow-xl flex flex-col h-[60vh] overflow-hidden">
          {/* Chat log messages list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-2">
                <HelpCircle className="w-10 h-10 text-muted-foreground/50" />
                <h4 className="font-bold text-muted-foreground">Start Shopping Chat</h4>
                <p className="text-xs text-muted-foreground font-semibold">
                  Ask details: "Compare iPhone 15 and Galaxy S24", or "Suggest running shoes under
                  9000".
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-indigo-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-4 rounded-3xl text-sm font-medium ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-secondary/40 border rounded-tl-none text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-1 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Form input bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/20 flex gap-3">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask for comparisons, suggestions, or specs..."
              disabled={isStreaming}
              className="flex-grow px-4 py-3 rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary outline-none transition text-sm disabled:opacity-50 font-semibold"
            />
            <button
              type="submit"
              disabled={isStreaming || !inputVal.trim()}
              className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* 2. Gift Recommendation Widget */}
      {activeWidget === 'gift' && (
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleGiftSubmit} className="space-y-4">
            <h3 className="text-lg font-bold">AI Gift Suggester</h3>
            <p className="text-sm text-muted-foreground font-semibold">
              Describe the recipient's preferences to explore curated lists.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={giftDesc}
                onChange={(e) => setGiftDesc(e.target.value)}
                placeholder="e.g. My father likes reading books and cricket"
                className="flex-grow px-4 py-3 rounded-2xl bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
              />
              <button
                type="submit"
                disabled={giftMutation.isPending}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
              >
                {giftMutation.isPending ? 'Finding...' : 'Find Gifts'}
              </button>
            </div>
          </form>

          {giftMutation.data && (
            <div className="grid gap-4 sm:grid-cols-3">
              {giftMutation.data.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 border rounded-2xl bg-secondary/20 shadow-sm flex flex-col justify-between"
                >
                  <h4 className="font-bold text-sm text-primary mb-2">{item.item}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Budget Shopping Combination Widget */}
      {activeWidget === 'budget' && (
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleBudgetSubmit} className="space-y-4">
            <h3 className="text-lg font-bold">AI Budget Shopping Combiner</h3>
            <p className="text-sm text-muted-foreground font-semibold">
              Optimize purchase matches under an absolute budget limit.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                required
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                placeholder="Enter budget limit (e.g. 10000)"
                className="flex-grow px-4 py-3 rounded-2xl bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
              />
              <button
                type="submit"
                disabled={budgetMutation.isPending}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
              >
                {budgetMutation.isPending ? 'Calculating...' : 'Optimize Bundle'}
              </button>
            </div>
          </form>

          {budgetMutation.data && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 rounded-2xl flex justify-between text-sm font-bold">
                <span className="text-indigo-800 dark:text-indigo-300">
                  Total Bundle Cost: ₹{budgetMutation.data.totalPrice}
                </span>
                <span className="text-muted-foreground">
                  Remaining Balance: ₹{budgetMutation.data.remainingBalance}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {budgetMutation.data.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 border rounded-2xl bg-secondary/20 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-primary mt-3 block">
                      ₹{item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Fashion Outfit Recommender Widget */}
      {activeWidget === 'outfit' && (
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
          <form onSubmit={handleOutfitSubmit} className="space-y-4">
            <h3 className="text-lg font-bold">AI Outfit Recommender</h3>
            <p className="text-sm text-muted-foreground font-semibold">
              Coordinate styling selections for seasons or formal occasions.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={outfitOccasion}
                onChange={(e) => setOutfitOccasion(e.target.value)}
                placeholder="Occasion (e.g. Wedding, Summer Beach party)"
                className="flex-grow px-4 py-3 rounded-2xl bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
              />
              <button
                type="submit"
                disabled={outfitMutation.isPending}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
              >
                {outfitMutation.isPending ? 'Styling...' : 'Coordinate Look'}
              </button>
            </div>
          </form>

          {outfitMutation.data && (
            <div className="space-y-4">
              <h4 className="font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">
                {outfitMutation.data.combinationName}
              </h4>
              <div className="grid gap-4 sm:grid-cols-3">
                {outfitMutation.data.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-5 border rounded-2xl bg-secondary/20 shadow-sm">
                    <h5 className="font-bold text-sm mb-1">{item.item}</h5>
                    <div className="text-xs text-muted-foreground font-semibold space-y-0.5">
                      <p>
                        Color Tone: <span className="text-foreground">{item.color}</span>
                      </p>
                      <p>
                        Marketplace: <span className="text-indigo-600">{item.marketplace}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AIChatPage;
