'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/lib/api';
import { ChatMessage } from '@/lib/types';
import Link from 'next/link';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    '👋 **Hello! I am Coach AI, your match prediction and football supporter.**\n\n' +
    'Ask me about today’s top value picks, live match scores, team statistics, or how to earn points on the leaderboard!',
};

const DEFAULT_SUGGESTIONS = [
  '🎯 Top picks today',
  '🔴 What matches are live?',
  '🏆 How does scoring work?',
  '📊 Search Hull vs Man United',
];

// Helper to format basic Markdown (bold, lists, links, headers) safely in UI
function renderFormattedContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    let text = line;

    // Headers
    if (text.startsWith('### ')) {
      return (
        <h4 key={idx} style={{ margin: '0.4rem 0', color: 'var(--accent-blue, #60a5fa)', fontSize: '0.95rem', fontWeight: 800 }}>
          {text.replace('### ', '')}
        </h4>
      );
    }

    // Bullet points
    if (text.startsWith('• ') || text.startsWith('- ')) {
      const bulletText = text.replace(/^[•\-]\s*/, '');
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--accent-green, #10b981)' }}>•</span>
          <div>{parseInlineMarkdown(bulletText)}</div>
        </div>
      );
    }

    // Empty lines
    if (!text.trim()) {
      return <div key={idx} style={{ height: '0.4rem' }} />;
    }

    return (
      <p key={idx} style={{ margin: '0.25rem 0', fontSize: '0.85rem', lineHeight: 1.45 }}>
        {parseInlineMarkdown(text)}
      </p>
    );
  });
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to split by bold (**bold**), italics (*italic*), or markdown links [text](url)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];

    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const labelMatch = token.match(/\[(.*?)\]/);
      const urlMatch = token.match(/\((.*?)\)/);
      if (labelMatch && urlMatch) {
        parts.push(
          <Link
            key={match.index}
            href={urlMatch[1]}
            style={{ color: 'var(--accent-blue, #60a5fa)', textDecoration: 'underline', fontWeight: 600 }}
          >
            {labelMatch[1]}
          </Link>
        );
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(textToSend, messages);
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: '⚠️ I encountered a temporary connection issue. Please verify your connection or try again!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('open-coach-ai', handleOpenEvent);
      return () => window.removeEventListener('open-coach-ai', handleOpenEvent);
    }
  }, []);

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setSuggestions(DEFAULT_SUGGESTIONS);
  };

  return (
    <>
      {/* Floating Launcher Button (when closed) */}
      {!isOpen && (
        <div
          className="chatbot-floating-container"
          style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            right: '16px',
            zIndex: 99999,
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Coach AI"
            className="chatbot-launcher-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.88rem',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.5), 0 0 15px rgba(124, 58, 237, 0.35)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            <span>Coach AI</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block',
              }}
            />
          </button>
        </div>
      )}

      {/* Chat Window Modal (when open) */}
      {isOpen && (
        <div className="chatbot-modal-overlay">
          <div
            className="chatbot-window-card"
            style={{
              background: 'var(--bg-card, #131b2e)',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '0.9rem 1.1rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(139, 92, 246, 0.18) 100%)',
                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  🤖
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary, #fff)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Coach AI Supporter
                    <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 700 }}>
                      Live
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Tactical match insights &amp; tips
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  aria-label="Clear chat"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                    color: 'var(--text-secondary, #94a3b8)',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  🧹
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background:
                        m.role === 'user'
                          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          : 'var(--bg-card-hover, rgba(255, 255, 255, 0.05))',
                      color: m.role === 'user' ? '#ffffff' : 'var(--text-primary, #e2e8f0)',
                      border: m.role === 'user' ? 'none' : '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                      boxShadow: m.role === 'user' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                    }}
                  >
                    {renderFormattedContent(m.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.9rem', borderRadius: '16px', background: 'var(--bg-card-hover, rgba(255, 255, 255, 0.05))', width: 'fit-content' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>Coach AI is typing</span>
                  <span style={{ display: 'inline-flex', gap: '3px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s infinite' }} />
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6', animation: 'pulse 1s infinite 0.2s' }} />
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1s infinite 0.4s' }} />
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {suggestions.length > 0 && !loading && (
              <div
                style={{
                  padding: '0.4rem 0.8rem',
                  display: 'flex',
                  gap: '0.4rem',
                  overflowX: 'auto',
                  borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))',
                  scrollbarWidth: 'none',
                  flexShrink: 0,
                }}
              >
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      background: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.28)',
                      color: 'var(--accent-blue, #60a5fa)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.22)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{
                padding: '0.75rem',
                borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                gap: '0.5rem',
                background: 'var(--bg-card, #131b2e)',
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about matches, picks, rules..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.7rem 0.95rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-primary, #fff)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  padding: '0.7rem 1.15rem',
                  borderRadius: '12px',
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  transition: 'opacity 0.2s ease',
                  flexShrink: 0,
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
