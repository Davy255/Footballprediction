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
      {/* Floating Launcher Button (Permanently fixed in frame on all viewports) */}
      {!isOpen && (
        <div
          className="chatbot-floating-container"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '16px',
            zIndex: 999999,
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Coach AI Match Supporter"
            className="chatbot-launcher-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1rem',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.86rem',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.6), 0 0 16px rgba(124, 58, 237, 0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🤖</span>
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
        <div
          className="chatbot-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: '1rem',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="chatbot-window-card"
            style={{
              width: '100%',
              maxWidth: '390px',
              height: '580px',
              maxHeight: '88vh',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-card-hover)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '0.9rem 1.1rem',
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-color)',
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
                    color: '#ffffff',
                  }}
                >
                  🤖
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Coach AI Supporter
                    <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '10px', background: 'var(--accent-green-bg)', color: 'var(--accent-green)', fontWeight: 700 }}>
                      Live
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
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
                    background: 'var(--accent-red-bg)',
                    border: '1px solid var(--accent-red-border)',
                    color: 'var(--accent-red)',
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
                          : 'var(--bg-elevated)',
                      color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                      border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                      boxShadow: m.role === 'user' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                    }}
                  >
                    {renderFormattedContent(m.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.9rem', borderRadius: '16px', background: 'var(--bg-elevated)', width: 'fit-content' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Coach AI is typing</span>
                  <span style={{ display: 'inline-flex', gap: '3px' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6' }} />
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#8b5cf6' }} />
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }} />
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
                  borderTop: '1px solid var(--border-color)',
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
                      background: 'var(--accent-blue-bg)',
                      border: '1px solid var(--accent-blue-border)',
                      color: 'var(--accent-blue)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
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
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.5rem',
                background: 'var(--bg-card)',
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
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
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
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'var(--bg-elevated)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  fontSize: '0.88rem',
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
