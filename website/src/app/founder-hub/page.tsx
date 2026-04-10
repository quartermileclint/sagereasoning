'use client';

import React, { useState, useEffect, useRef } from 'react';

// =============================================================================
// Types
// =============================================================================

type AgentType = 'ops' | 'tech' | 'growth' | 'support' | 'mentor';

interface Message {
  id: string;
  role: 'founder' | 'agent' | 'observer';
  agent_type: AgentType | null;
  content: string;
  relevance_score?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pipeline_meta?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decision_gate?: any;
  created_at: string;
}

interface Conversation {
  id: string;
  primary_agent: AgentType;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ObserverContribution {
  agent: AgentType;
  content: string;
  relevance_score?: number;
}

// =============================================================================
// Constants
// =============================================================================

const AGENTS: { type: AgentType; label: string; icon: string; color: string; desc: string }[] = [
  { type: 'ops', label: 'Ops', icon: '\u2699\uFE0F', color: '#3B82F6', desc: 'Process, financial, compliance' },
  { type: 'tech', label: 'Tech', icon: '\uD83D\uDD27', color: '#8B5CF6', desc: 'Architecture, security, devops' },
  { type: 'growth', label: 'Growth', icon: '\uD83D\uDCC8', color: '#10B981', desc: 'Positioning, content, community' },
  { type: 'support', label: 'Support', icon: '\uD83D\uDEE1\uFE0F', color: '#F59E0B', desc: 'Triage, users, escalation' },
  { type: 'mentor', label: 'Mentor', icon: '\uD83E\uDDD8', color: '#C4A265', desc: 'Stoic guidance, virtue development' },
];

function getAgentColor(type: AgentType | null): string {
  return AGENTS.find(a => a.type === type)?.color || '#6B7280';
}

function getAgentIcon(type: AgentType | null): string {
  return AGENTS.find(a => a.type === type)?.icon || '\uD83E\uDD16';
}

function getAgentLabel(type: AgentType | null): string {
  return AGENTS.find(a => a.type === type)?.label || 'Agent';
}

// =============================================================================
// Component
// =============================================================================

export default function FounderHubPage() {
  const [activeAgent, setActiveAgent] = useState<AgentType>('mentor');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load auth token from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sb-jdbefwkonfbhjquozgxr-auth-token');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthToken(parsed.access_token || null);
      }
    } catch {
      setError('Could not load authentication. Please sign in.');
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (authToken) loadConversations();
  }, [authToken]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  });

  // ── API Calls ────────────────────────────────────────────────────────

  async function loadConversations() {
    try {
      const res = await fetch('/api/founder/hub?list=true', { headers: headers() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }

  async function loadConversation(id: string) {
    try {
      const res = await fetch(`/api/founder/hub?conversation_id=${id}`, { headers: headers() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setActiveConversation(id);
      setActiveAgent(data.conversation.primary_agent);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    // Optimistically add founder message
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'founder',
      agent_type: null,
      content: userMessage,
      created_at: new Date().toISOString(),
    }]);

    try {
      const res = await fetch('/api/founder/hub', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          agent: activeAgent,
          message: userMessage,
          conversation_id: activeConversation,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const data = await res.json();

      // Update conversation ID if new
      if (!activeConversation) {
        setActiveConversation(data.conversation_id);
        loadConversations(); // Refresh sidebar
      }

      // Add primary agent response
      setMessages(prev => [...prev, {
        id: `agent-${Date.now()}`,
        role: 'agent',
        agent_type: activeAgent,
        content: data.primary.content,
        pipeline_meta: data.primary.pipeline_meta,
        decision_gate: data.primary.decision_gate,
        created_at: new Date().toISOString(),
      }]);

      // Add observer contributions
      if (data.observers && data.observers.length > 0) {
        for (const obs of data.observers as ObserverContribution[]) {
          setMessages(prev => [...prev, {
            id: `obs-${obs.agent}-${Date.now()}`,
            role: 'observer',
            agent_type: obs.agent,
            content: obs.content,
            relevance_score: obs.relevance_score,
            created_at: new Date().toISOString(),
          }]);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function startNewConversation() {
    setActiveConversation(null);
    setMessages([]);
    inputRef.current?.focus();
  }

  // ── Render ───────────────────────────────────────────────────────────

  if (!authToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0A0A0A', color: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 24, marginBottom: 12, color: '#C4A265' }}>Founder Hub</h1>
          <p style={{ color: '#888' }}>Please sign in to sagereasoning.com first.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0A', color: '#E5E5E5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      {showSidebar && (
        <div style={{ width: 280, borderRight: '1px solid #1F1F1F', display: 'flex', flexDirection: 'column', background: '#0F0F0F' }}>
          {/* Header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1F1F1F' }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#C4A265', margin: 0 }}>Founder Hub</h1>
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>Multi-agent communication</p>
          </div>

          {/* Agent selector */}
          <div style={{ padding: '12px 12px 8px' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Primary Agent</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {AGENTS.map(agent => (
                <button
                  key={agent.type}
                  onClick={() => setActiveAgent(agent.type)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: activeAgent === agent.type ? `1px solid ${agent.color}` : '1px solid #2A2A2A',
                    background: activeAgent === agent.type ? `${agent.color}15` : 'transparent',
                    color: activeAgent === agent.type ? agent.color : '#888',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {agent.icon} {agent.label}
                </button>
              ))}
            </div>
          </div>

          {/* New conversation button */}
          <div style={{ padding: '8px 12px' }}>
            <button
              onClick={startNewConversation}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 6,
                border: '1px solid #2A2A2A', background: '#1A1A1A',
                color: '#C4A265', fontSize: 13, cursor: 'pointer',
              }}
            >
              + New Conversation
            </button>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  borderRadius: 6, border: 'none', marginBottom: 2,
                  background: activeConversation === conv.id ? '#1A1A1A' : 'transparent',
                  color: activeConversation === conv.id ? '#E5E5E5' : '#888',
                  cursor: 'pointer', fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span>{getAgentIcon(conv.primary_agent)}</span>
                  <span style={{ fontSize: 11, color: getAgentColor(conv.primary_agent) }}>
                    {getAgentLabel(conv.primary_agent)}
                  </span>
                </div>
                <div style={{
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontSize: 12,
                }}>
                  {conv.title}
                </div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
                  {new Date(conv.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Chat Area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #1F1F1F',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}
          >
            {showSidebar ? '\u2630' : '\u2630'}
          </button>
          <span style={{ fontSize: 16, color: getAgentColor(activeAgent) }}>
            {getAgentIcon(activeAgent)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            Talking to <span style={{ color: getAgentColor(activeAgent) }}>{getAgentLabel(activeAgent)}</span>
          </span>
          <span style={{ fontSize: 12, color: '#555' }}>
            {AGENTS.find(a => a.type === activeAgent)?.desc}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#444' }}>
            All other agents observing
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 80, color: '#444' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{getAgentIcon(activeAgent)}</div>
              <div style={{ fontSize: 16, marginBottom: 8 }}>
                Start a conversation with <span style={{ color: getAgentColor(activeAgent) }}>{getAgentLabel(activeAgent)}</span>
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Other agents will observe and contribute when relevant.
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: 16 }}>
              {/* Message header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {msg.role === 'founder' && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#C4A265' }}>You</span>
                )}
                {msg.role === 'agent' && (
                  <>
                    <span>{getAgentIcon(msg.agent_type)}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: getAgentColor(msg.agent_type) }}>
                      {getAgentLabel(msg.agent_type)}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 4,
                      background: `${getAgentColor(msg.agent_type)}20`,
                      color: getAgentColor(msg.agent_type),
                    }}>
                      primary
                    </span>
                  </>
                )}
                {msg.role === 'observer' && (
                  <>
                    <span>{getAgentIcon(msg.agent_type)}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: getAgentColor(msg.agent_type) }}>
                      {getAgentLabel(msg.agent_type)}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 4,
                      background: '#2A2A2A', color: '#888',
                    }}>
                      observer
                    </span>
                  </>
                )}
                <span style={{ fontSize: 10, color: '#444' }}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>

              {/* Message content */}
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: msg.role === 'founder' ? '#1A1A2E' :
                            msg.role === 'observer' ? '#1A1A1A' : '#141414',
                borderLeft: msg.role === 'observer'
                  ? `2px solid ${getAgentColor(msg.agent_type)}40`
                  : msg.role === 'agent'
                    ? `2px solid ${getAgentColor(msg.agent_type)}`
                    : 'none',
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                color: msg.role === 'observer' ? '#AAA' : '#E5E5E5',
              }}>
                {String(msg.content)}
              </div>

              {/* Pipeline meta for agent messages */}
              {msg.pipeline_meta && (
                <div style={{ fontSize: 10, color: '#444', marginTop: 4, padding: '0 14px' }}>
                  {String((msg.pipeline_meta).model || '')} | {String((msg.pipeline_meta).durationMs || 0)}ms |{' '}
                  {String((msg.pipeline_meta).inputTokens || 0)}+{String((msg.pipeline_meta).outputTokens || 0)} tokens
                </div>
              )}

              {/* Decision gate warning */}
              {msg.decision_gate && (msg.decision_gate).requiresApproval && (
                <div style={{
                  marginTop: 6, padding: '6px 12px', borderRadius: 6,
                  background: '#3B1A1A', border: '1px solid #6B2A2A',
                  fontSize: 12, color: '#F87171',
                }}>
                  {'Decision gate triggered: ' + String((msg.decision_gate).reasoning || '')}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#666' }}>
              <span>{getAgentIcon(activeAgent)}</span>
              <span style={{ fontSize: 13 }}>
                {getAgentLabel(activeAgent)} is thinking...
              </span>
              <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>|</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error display */}
        {error && (
          <div style={{
            margin: '0 24px 8px', padding: '8px 12px', borderRadius: 6,
            background: '#3B1A1A', border: '1px solid #6B2A2A',
            fontSize: 13, color: '#F87171',
          }}>
            {error}
            <button onClick={() => setError(null)} style={{
              float: 'right', background: 'none', border: 'none',
              color: '#F87171', cursor: 'pointer',
            }}>
              x
            </button>
          </div>
        )}

        {/* Input area */}
        <div style={{ padding: '12px 24px 16px', borderTop: '1px solid #1F1F1F' }}>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-end',
            background: '#141414', borderRadius: 10, padding: '8px 12px',
            border: '1px solid #2A2A2A',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${getAgentLabel(activeAgent)}...`}
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: '#E5E5E5', fontSize: 14, lineHeight: 1.5,
                resize: 'none', outline: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={{
                padding: '6px 16px', borderRadius: 6,
                background: input.trim() ? '#C4A265' : '#2A2A2A',
                color: input.trim() ? '#0A0A0A' : '#555',
                border: 'none', fontSize: 13, fontWeight: 600,
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              Send
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 4, textAlign: 'center' }}>
            Enter to send, Shift+Enter for new line. All 5 agents active.
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
