import { useState, useRef, useEffect } from "react";

const WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_URL || "";
const SESSION_ID = "session-" + Math.random().toString(36).slice(2, 9);
const QUICK_PROMPTS = ["My WiFi won't connect", "Computer is running slow", "Forgot my password", "Email not syncing"];

/* "Midnight" — dark AI-assistant theme. Semantic design tokens (skill §6 color-semantic). */
const STYLES = `
:root {
  --bg: #090c16;
  --surface: rgba(124,131,255,0.06);
  --surface-2: rgba(124,131,255,0.11);
  --border: rgba(140,150,255,0.13);
  --border-strong: rgba(165,175,255,0.24);
  --text: #f1f3fb;
  --text-muted: #a6afc9;
  --text-meta: #727b95;
  --accent: #a78bfa;
  --accent-2: #818cf8;
  --accent-3: #34d3ee;
  --grad: linear-gradient(135deg, #6366f1 0%, #8b5cf6 58%, #b44bf0 115%);
  --grad-bright: linear-gradient(135deg, #818cf8, #c084fc);
  --online: #34d399;
  --ticket-bg: rgba(251,191,36,0.13);
  --ticket-border: rgba(251,191,36,0.36);
  --ticket-text: #fcd34d;
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'Space Grotesk', 'Inter', -apple-system, sans-serif;
}
* { box-sizing: border-box; }
@keyframes hdBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
@keyframes hdMsgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes hdPulse { 0%{box-shadow:0 0 0 0 rgba(52,211,153,.5)} 70%{box-shadow:0 0 0 7px rgba(52,211,153,0)} 100%{box-shadow:0 0 0 0 rgba(52,211,153,0)} }
@keyframes hdGlow { 0%,100%{opacity:.55} 50%{opacity:.85} }

.hd-page {
  min-height: 100vh; min-height: 100dvh; display: flex; align-items: stretch; justify-content: center;
  background:
    radial-gradient(820px 480px at 8% -10%, rgba(124,92,255,.28), transparent 60%),
    radial-gradient(720px 440px at 94% -6%, rgba(34,211,238,.16), transparent 58%),
    radial-gradient(900px 620px at 50% 118%, rgba(139,92,246,.14), transparent 60%),
    var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
}
.hd-card {
  display: flex; flex-direction: column; width: 100%;
  height: 100vh; height: 100dvh; overflow: hidden; position: relative;
}
/* Centered reading column keeps line length comfortable on wide screens (skill §5) */
.hd-col { width: 100%; max-width: 760px; margin: 0 auto; }

.hd-header {
  background: rgba(11,15,26,.72);
  backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%);
  border-bottom: 1px solid var(--border);
  position: relative; z-index: 2;
}
.hd-brand-ic {
  width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; color: #fff;
  display: flex; align-items: center; justify-content: center;
  background: var(--grad); box-shadow: 0 8px 22px -8px rgba(139,92,246,.7), inset 0 1px 0 rgba(255,255,255,.25);
}
.hd-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.14) transparent; }
.hd-scroll::-webkit-scrollbar { width: 9px; }
.hd-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 9px; border: 2px solid transparent; background-clip: padding-box; }
.hd-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.22); background-clip: padding-box; }
.hd-msg { animation: hdMsgIn .3s cubic-bezier(.21,1.02,.73,1) both; }
.hd-dot { animation: hdPulse 2.2s ease-out infinite; }
.hd-time { font-variant-numeric: tabular-nums; }

.hd-bubble-bot {
  background: var(--surface); border: 1px solid var(--border); color: var(--text);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 10px 30px -22px rgba(0,0,0,.9);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.hd-bubble-user {
  background: var(--grad); color: #fff; border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 10px 26px -12px rgba(124,58,237,.7);
}
.hd-avatar-bot {
  width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; color: #fff;
  display: flex; align-items: center; justify-content: center;
  background: var(--grad); box-shadow: 0 6px 16px -8px rgba(139,92,246,.8), inset 0 1px 0 rgba(255,255,255,.25);
}
.hd-avatar-user {
  width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: var(--text-muted);
  background: var(--surface-2); border: 1px solid var(--border);
}

.hd-chip {
  font-size: 13px; padding: 10px 15px; min-height: 44px; border-radius: 13px; cursor: pointer; font-weight: 500;
  color: var(--text); background: var(--surface); border: 1px solid var(--border);
  transition: background .16s, border-color .16s, transform .12s, box-shadow .16s;
}
.hd-chip:hover { background: var(--surface-2); border-color: var(--border-strong); transform: translateY(-1px); box-shadow: 0 8px 20px -10px rgba(99,102,241,.55); color: #fff; }
.hd-chip:active { transform: translateY(0); }

.hd-inputbar {
  background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
  display: flex; align-items: flex-end; gap: 8px; padding: 7px 7px 7px 4px;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  transition: border-color .18s, box-shadow .18s;
}
.hd-inputbar:focus-within { border-color: rgba(139,92,246,.6); box-shadow: 0 0 0 4px rgba(139,92,246,.16); }
.hd-ta { font-family: inherit; color: var(--text); }
.hd-ta::placeholder { color: #707892; }
.hd-send {
  width: 44px; height: 44px; flex-shrink: 0; border-radius: 13px; border: none;
  display: flex; align-items: center; justify-content: center; color: #fff;
  transition: transform .14s, box-shadow .18s, filter .18s;
}
.hd-send-on { background: var(--grad); cursor: pointer; box-shadow: 0 8px 20px -6px rgba(139,92,246,.65); }
.hd-send-on:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 12px 26px -8px rgba(139,92,246,.8); }
.hd-send-on:active { transform: translateY(0) scale(.94); }
.hd-send-off { background: var(--surface-2); color: #59617a; cursor: default; }

*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (max-width: 520px) { .hd-col { max-width: 100%; } }
@media (prefers-reduced-motion: reduce) {
  .hd-msg, .hd-dot, .hd-chip, .hd-send { animation: none !important; transition: none !important; }
}
`;

/* Consistent SVG icon set (skill §4 no-emoji-icons), Lucide paths, 1.75 stroke */
function Icon({ name, size = 20, stroke = 1.75, style }) {
  const paths = {
    lifebuoy: (<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /></>),
    bot: (<><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></>),
    ticket: (<><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 11v2" /><path d="M13 17v2" /></>),
    arrowUp: (<><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></>),
    sparkles: (<><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      {paths[name]}
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (<div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", opacity: 0.8, animation: `hdBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  if (msg.role === "system") {
    return (<div className="hd-msg" style={{ textAlign: "center", margin: "10px 0" }}><span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 12px" }}>{msg.text}</span></div>);
  }
  return (
    <div className="hd-msg" style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14, gap: 9, alignItems: "flex-end" }}>
      {!isUser && (<div className="hd-avatar-bot"><Icon name="bot" size={18} /></div>)}
      <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", gap: 5 }}>
        <div className={isUser ? "hd-bubble-user" : "hd-bubble-bot"} style={{ borderRadius: isUser ? "16px 16px 5px 16px" : "16px 16px 16px 5px", padding: "11px 15px", fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</div>
        {msg.ticket && (<div style={{ background: "var(--ticket-bg)", border: "1px solid var(--ticket-border)", borderRadius: 11, padding: "8px 12px", fontSize: 12.5, color: "var(--ticket-text)", display: "flex", alignItems: "center", gap: 7, fontWeight: 500 }}><Icon name="ticket" size={15} stroke={2} />Ticket created: <strong>{msg.ticket}</strong></div>)}
        <span className="hd-time" style={{ fontSize: 11, color: "var(--text-meta)", alignSelf: isUser ? "flex-end" : "flex-start" }}>{msg.time}</span>
      </div>
      {isUser && (<div className="hd-avatar-user">U</div>)}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi! I'm your IT support assistant. I can help you resolve common tech issues instantly, or create a support ticket if needed.\n\nWhat's going on with your device?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const taRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  function autoGrow() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }
  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    setInput("");
    requestAnimationFrame(autoGrow);
    setMessages((p) => [...p, { role: "user", text: text.trim(), time: now() }]);
    setLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: SESSION_ID, message: text.trim(), userId: "user@company.com" }) });
      const data = await res.json();
      const bot = { role: "assistant", text: data.reply || "Sorry, I could not process that.", time: now(), ticket: data.ticketId || null };
      if (data.status === "escalated") setMessages((p) => [...p, { role: "system", text: "Escalated to human agent" }, bot]);
      else setMessages((p) => [...p, bot]);
    } catch { setMessages((p) => [...p, { role: "assistant", text: "Connection error. Please try again.", time: now() }]); }
    finally { setLoading(false); }
  }
  const canSend = !loading && input.trim();
  return (
    <div className="hd-page">
      <style>{STYLES}</style>
      <div className="hd-card">
        <header className="hd-header">
          <div className="hd-col" style={{ padding: "15px 24px", display: "flex", alignItems: "center", gap: 14 }}>
            <div className="hd-brand-ic"><Icon name="lifebuoy" size={24} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em" }}>IT Helpdesk</div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                <span className="hd-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--online)", display: "inline-block", flexShrink: 0 }} />
                AI-powered · Instant support
              </div>
            </div>
          </div>
        </header>
        <div className="hd-scroll" style={{ flex: 1, overflowY: "auto" }} role="log" aria-live="polite" aria-label="Conversation">
          <div className="hd-col" style={{ padding: "22px 24px 8px", display: "flex", flexDirection: "column" }}>
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            {loading && <div style={{ paddingLeft: 41 }}><TypingDots /></div>}
            <div ref={bottomRef} />
          </div>
        </div>
        {messages.length <= 1 && !loading && (
          <div><div className="hd-col" style={{ padding: "8px 24px 2px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map((p) => (<button key={p} className="hd-chip" onClick={() => sendMessage(p)}>{p}</button>))}
          </div></div>
        )}
        <div className="hd-col" style={{ padding: "12px 24px 10px" }}>
          <div className="hd-inputbar">
            <textarea
              ref={taRef}
              className="hd-ta"
              value={input}
              rows={1}
              onChange={(e) => { setInput(e.target.value); autoGrow(); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Describe your IT issue..."
              disabled={loading}
              aria-label="Message"
              style={{ flex: 1, border: "none", background: "transparent", resize: "none", padding: "9px 6px 9px 14px", fontSize: 16, lineHeight: 1.5, outline: "none", maxHeight: 120 }}
            />
            <button className={"hd-send " + (canSend ? "hd-send-on" : "hd-send-off")} onClick={() => sendMessage(input)} disabled={!canSend} aria-label="Send message" title="Send message">
              <Icon name="arrowUp" size={20} stroke={2.25} />
            </button>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-meta)", marginTop: 9 }}>AI assistant · responses may be inaccurate. A ticket is raised for complex issues.</div>
        </div>
      </div>
    </div>
  );
}
