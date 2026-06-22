import { useState, useRef, useCallback } from "react";
import {
  Code2,
  Wifi,
  Play,
  LogOut,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Send,
  ChevronDown,
  Hash,
  Crown,
  Terminal,
  Maximize2,
  MoreHorizontal,
  SmilePlus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  initials: string;
  name: string;
  role: "host" | "member";
  color: string;
  muted: boolean;
  cameraOff: boolean;
  isTyping?: boolean;
}

interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  text: string;
  time: string;
}

type Language = "TypeScript" | "Python" | "Go" | "Rust" | "Java" | "C++" | "JavaScript";

// ─── Static data ──────────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: "1", initials: "AK", name: "Alex Kim", role: "host", color: "from-violet-500 to-purple-600", muted: false, cameraOff: false },
  { id: "2", initials: "SR", name: "Sara Ryo", role: "member", color: "from-blue-500 to-cyan-500", muted: true, cameraOff: false, isTyping: true },
  { id: "3", initials: "MJ", name: "Marco J", role: "member", color: "from-emerald-500 to-teal-500", muted: false, cameraOff: true },
  { id: "4", initials: "PL", name: "Priya L", role: "member", color: "from-rose-500 to-pink-500", muted: true, cameraOff: true },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", authorId: "1", authorName: "Alex Kim", authorInitials: "AK", authorColor: "from-violet-500 to-purple-600", text: "Hey everyone! Let's tackle the two-sum problem first.", time: "10:41 AM" },
  { id: "2", authorId: "2", authorName: "Sara Ryo", authorInitials: "SR", authorColor: "from-blue-500 to-cyan-500", text: "Sounds good. I'll start with a brute force then we can optimise.", time: "10:42 AM" },
  { id: "3", authorId: "3", authorName: "Marco J", authorInitials: "MJ", authorColor: "from-emerald-500 to-teal-500", text: "Hash map should give us O(n). Want me to sketch that out?", time: "10:43 AM" },
  { id: "4", authorId: "1", authorName: "Alex Kim", authorInitials: "AK", authorColor: "from-violet-500 to-purple-600", text: "Yes, go for it Marco 👍", time: "10:43 AM" },
  { id: "5", authorId: "4", authorName: "Priya L", authorInitials: "PL", authorColor: "from-rose-500 to-pink-500", text: "Don't forget edge cases — empty array and duplicates.", time: "10:44 AM" },
];

const LANGUAGES: Language[] = ["TypeScript", "Python", "Go", "Rust", "Java", "C++", "JavaScript"];

const PLACEHOLDER_CODE = `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  return [];
}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  initials,
  color,
  size = "md",
  ring,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  ring?: string;
}) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };
  return (
    <div
      className={[
        `bg-gradient-to-br ${color} flex items-center justify-center rounded-xl font-bold text-white shrink-0`,
        sizes[size],
        ring ?? "",
      ].join(" ")}
    >
      {initials}
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="text-xs font-semibold text-emerald-400">Live</span>
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600/60 transition-colors group">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Avatar initials={member.initials} color={member.color} size="md" />
          {!member.muted && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
              <Mic className="w-1.5 h-1.5 text-slate-900" />
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white leading-none">{member.name}</span>
            {member.role === "host" && (
              <Crown className="w-3 h-3 text-yellow-400" />
            )}
          </div>
          {member.isTyping ? (
            <span className="text-xs text-violet-400 flex items-center gap-1">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              editing…
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              {member.muted ? "Muted" : "Speaking"}
              {member.cameraOff ? " · Cam off" : ""}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {member.muted && <MicOff className="w-3.5 h-3.5 text-slate-500" />}
        {member.cameraOff && <VideoOff className="w-3.5 h-3.5 text-slate-500" />}
      </div>
    </div>
  );
}

function ChatMsg({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar initials={msg.authorInitials} color={msg.authorColor} size="sm" />
      <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-1.5">
          {!isOwn && <span className="text-xs font-medium text-slate-400">{msg.authorName}</span>}
          <span className="text-xs text-slate-600">{msg.time}</span>
        </div>
        <div
          className={[
            "px-3 py-2 rounded-2xl text-sm leading-relaxed",
            isOwn
              ? "bg-gradient-to-br from-violet-600/80 to-blue-600/80 text-white rounded-tr-sm"
              : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60",
          ].join(" ")}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  activeIcon,
  label,
  active,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200 group",
        active
          ? variant === "danger"
            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "bg-slate-700/80 border-slate-600 text-white"
          : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800",
      ].join(" ")}
    >
      <span className="w-5 h-5">{active && activeIcon ? activeIcon : icon}</span>
      <span className="text-xs font-medium leading-none">{label}</span>
    </button>
  );
}

// ─── Code area placeholder ────────────────────────────────────────────────────

function CodeArea() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
      {/* Editor top bar */}
      <div className="flex items-center gap-0 border-b border-slate-800 bg-slate-950/80 shrink-0">
        {["solution.ts", "utils.ts", "tests.ts"].map((tab, i) => (
          <button
            key={tab}
            className={[
              "px-4 py-2.5 text-xs font-mono border-r border-slate-800 transition-colors",
              i === 0
                ? "text-white bg-slate-900 border-b-2 border-b-violet-500"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        <button className="px-3 py-2 text-slate-500 hover:text-slate-300 transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fake Monaco editor */}
      <div className="flex-1 overflow-auto p-5 font-mono text-sm leading-7">
        <div className="flex gap-5">
          {/* Gutter */}
          <div className="flex flex-col text-slate-700 select-none text-right text-xs leading-7 min-w-[2ch]">
            {PLACEHOLDER_CODE.split("\n").map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          {/* Code */}
          <pre className="flex-1 text-left overflow-x-auto">
            <code>
              {PLACEHOLDER_CODE.split("\n").map((line, i) => (
                <div
                  key={i}
                  className={i === 7 ? "bg-violet-500/8 -mx-2 px-2 rounded" : ""}
                >
                  {renderLine(line)}
                </div>
              ))}
            </code>
          </pre>
        </div>
        {/* Remote cursor indicator */}
        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
            <div className="w-0.5 h-4 bg-blue-400 animate-pulse rounded-full" />
            <span className="text-xs text-blue-400 font-medium">Sara</span>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-violet-600/90 text-white/80 text-xs font-mono shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Connected</span>
          <span>Ln 8, Col 22</span>
        </div>
        <div className="flex items-center gap-4">
          <span>TypeScript</span>
          <span>UTF-8</span>
          <span>2 cursors</span>
        </div>
      </div>
    </div>
  );
}

// Syntax highlight helper (presentational only)
function renderLine(line: string) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(
            /\b(function|const|let|var|return|for|if|new|of|number)\b/g,
            '<span class="text-violet-400">$1</span>'
          )
          .replace(
            /\b(Map|number|string|boolean|void)\b/g,
            '<span class="text-blue-300">$1</span>'
          )
          .replace(
            /(["'`][^"'`]*["'`])/g,
            '<span class="text-green-300">$1</span>'
          )
          .replace(
            /\b(\d+)\b/g,
            '<span class="text-orange-300">$1</span>'
          )
          .replace(
            /(\/\/.*$)/gm,
            '<span class="text-slate-500 italic">$1</span>'
          )
          .replace(
            /\b(nums|target|complement|map|i)\b/g,
            '<span class="text-orange-200">$1</span>'
          )
          .replace(
            /\b(twoSum|has|get|set|push)\b/g,
            '<span class="text-yellow-300">$1</span>'
          ),
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ROOM_ID = "swift-algo-4821";
const MIN_SIDEBAR = 280;
const MAX_SIDEBAR = 480;

export default function CodingRoom() {
  const [language, setLanguage] = useState<Language>("TypeScript");
  const [langOpen, setLangOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - ev.clientX;
      const newWidth = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, dragStartWidth.current + delta));
      setSidebarWidth(newWidth);
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarWidth]);

  function handleSend() {
    const text = chatInput.trim();
    if (!text) return;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      authorId: "1",
      authorName: "Alex Kim",
      authorInitials: "AK",
      authorColor: "from-violet-500 to-purple-600",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  }

  function handleRun() {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 1800);
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* ── Navbar ── */}
      <header className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl z-20">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow shadow-violet-500/30">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold font-mono text-white text-sm tracking-tight hidden sm:block">MeetCode</span>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Hash className="w-3 h-3 text-slate-500" />
            <span className="text-xs font-mono text-slate-300">{ROOM_ID}</span>
          </div>
          <LiveBadge />
        </div>

        {/* Center */}
        <div className="flex items-center gap-2">
          {/* Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-mono font-medium transition-all duration-200"
            >
              {language}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl shadow-black/40 z-30 overflow-hidden py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false); }}
                    className={[
                      "w-full text-left px-3 py-2 text-xs font-mono transition-colors",
                      lang === language
                        ? "text-violet-400 bg-violet-500/10"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    ].join(" ")}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold transition-all duration-200 shadow shadow-emerald-500/20"
          >
            {isRunning ? (
              <>
                <Terminal className="w-3.5 h-3.5 animate-pulse" /> Running…
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" /> Run
              </>
            )}
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Member avatars */}
          <div className="hidden sm:flex -space-x-2">
            {MEMBERS.map((m) => (
              <div key={m.id} title={m.name} className="ring-2 ring-slate-950 rounded-xl">
                <Avatar initials={m.initials} color={m.color} size="sm" />
              </div>
            ))}
          </div>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          {/* Leave */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold transition-all duration-200">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Leave</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <CodeArea />
        </div>

        {/* ── Resize handle ── */}
        <div
          onMouseDown={handleDragStart}
          className="w-1 shrink-0 bg-slate-800 hover:bg-violet-600/60 active:bg-violet-500 cursor-col-resize transition-colors duration-150 z-10"
          title="Drag to resize"
        />

        {/* ── Right sidebar ── */}
        <aside
          style={{ width: sidebarWidth }}
          className="shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/50 overflow-hidden"
        >
          {/* ── Members ── */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Members
              </h2>
              <span className="text-xs text-slate-600">{MEMBERS.length}/8</span>
            </div>
            <div className="flex flex-col gap-2">
              {MEMBERS.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="shrink-0 px-4 py-3 border-b border-slate-800/80">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Controls</p>
            <div className="flex gap-2">
              <ActionButton
                icon={<Mic className="w-4 h-4" />}
                activeIcon={<MicOff className="w-4 h-4" />}
                label={muted ? "Unmute" : "Mute"}
                active={muted}
                onClick={() => setMuted((v) => !v)}
                variant="danger"
              />
              <ActionButton
                icon={<Video className="w-4 h-4" />}
                activeIcon={<VideoOff className="w-4 h-4" />}
                label={cameraOff ? "Cam On" : "Cam Off"}
                active={cameraOff}
                onClick={() => setCameraOff((v) => !v)}
                variant="danger"
              />
              <ActionButton
                icon={<Monitor className="w-4 h-4" />}
                label={sharing ? "Stop" : "Share"}
                active={sharing}
                onClick={() => setSharing((v) => !v)}
              />
            </div>
          </div>

          {/* ── Chat ── */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Chat</h2>
              <button className="text-slate-600 hover:text-slate-400 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pb-2 flex flex-col gap-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg) => (
                <ChatMsg key={msg.id} msg={msg} isOwn={msg.authorId === "1"} />
              ))}
              {/* Typing indicator */}
              <div className="flex items-center gap-2">
                <Avatar initials="SR" color="from-blue-500 to-cyan-500" size="sm" />
                <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700/60 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 px-4 pb-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 focus-within:border-violet-500/50 transition-colors">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Message the room…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none min-w-0"
                />
                <button
                  type="button"
                  aria-label="Emoji"
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                >
                  <SmilePlus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!chatInput.trim()}
                  aria-label="Send message"
                  className="text-violet-400 hover:text-violet-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}