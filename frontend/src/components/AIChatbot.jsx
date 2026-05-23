import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const SUGGESTIONS = [
  'How many applications do I have?',
  'Which companies have I applied to?',
  'Do I have any interviews?',
  'What roles have I applied for?',
];

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your JobTrail AI assistant. Ask me anything about your job applications — interviews, companies, roles, or stats."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Fetch user's applications for context
      const appsRes = await api.get('/applications');
      const apps = appsRes.data;

      const statsRes = await api.get('/applications/stats');
      const stats = statsRes.data;

      // Build context for the AI
      const context = `
The user has ${stats.total} total job applications tracked.
Stats: ${stats.applied} Applied, ${stats.interview} Interviews, ${stats.offer} Offers, ${stats.rejected} Rejected.

Recent applications (up to 20):
${apps.slice(0, 20).map(a =>
  `- ${a.company} | ${a.role || 'Role not specified'} | Status: ${a.status} | Source: ${a.source === 'sent' ? 'Sent by user' : 'Received confirmation'} | Date: ${new Date(a.dateApplied).toLocaleDateString()}`
).join('\n')}
      `.trim();

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are JobTrail AI, a helpful assistant for tracking job applications. 
You have access to the user's application data below. Answer questions about their applications concisely and helpfully.
Keep responses short (2-4 sentences max unless listing items).
Use bullet points for lists. Be encouraging and positive.

USER'S APPLICATION DATA:
${context}`
            },
            ...messages.filter(m => m.role !== 'system').slice(-6),
            { role: 'user', content: userMsg }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Try again.";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, something went wrong. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--accent)', color: '#111008',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(232,197,71,0.3)',
          transition: 'all 0.2s', fontSize: 22,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        title="Ask AI about your applications"
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 199,
          width: 360, height: 500,
          background: 'var(--bg-1)', border: '1px solid var(--border-2)',
          borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
          className="fade-up"
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-2)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent)', color: '#111008',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, fontFamily: 'Plus Jakarta Sans'
            }}>
              ✦
            </div>
            <div>
              <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '14px' }}>
                JobTrail Assistant
              </div>
              <div style={{ fontSize: '11px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 13px', borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-2)',
                  color: msg.role === 'user' ? '#111008' : 'var(--text)',
                  fontSize: '13px', lineHeight: 1.55,
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  fontWeight: msg.role === 'user' ? 500 : 400,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '12px 12px 12px 3px',
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                  display: 'flex', gap: 4, alignItems: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--text-3)', display: 'inline-block',
                      animation: `bounce 1s ease ${i * 0.15}s infinite`,
                    }} />
                  ))}
                  <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                    color: 'var(--text-2)', padding: '5px 10px', borderRadius: 20,
                    fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about your applications..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              style={{
                flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                color: 'var(--text)', padding: '8px 12px', borderRadius: 8,
                fontSize: '13px', outline: 'none', fontFamily: 'Inter',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg-3)',
                color: input.trim() && !loading ? '#111008' : 'var(--text-3)',
                border: 'none', width: 36, height: 36, borderRadius: 8,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;