import {useState, useRef, useCallback, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "../components/editor/MonacoEditor";
import { useRoom } from "../hooks/useRoom";
import { useEditor } from "../hooks/useEditor";
import { roomSocket } from "../services/websocket";
import type * as Monaco from "monaco-editor";
import {
  getRoom,
  leaveRoom,
} from "../services/room";
import { getToken } from "../services/storage";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import type {
  RoomParticipant,
} from "../services/room";
import type { Language } from "../types/editor";

import {
  Code2,
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
  MoreHorizontal,
  SmilePlus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────


interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  text: string;
  time: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────


const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", authorId: "1", authorName: "Alex Kim", authorInitials: "AK", authorColor: "from-violet-500 to-purple-600", text: "Hey everyone! Let's tackle the two-sum problem first.", time: "10:41 AM" },
  { id: "2", authorId: "2", authorName: "Sara Ryo", authorInitials: "SR", authorColor: "from-blue-500 to-cyan-500", text: "Sounds good. I'll start with a brute force then we can optimise.", time: "10:42 AM" },
  { id: "3", authorId: "3", authorName: "Marco J", authorInitials: "MJ", authorColor: "from-emerald-500 to-teal-500", text: "Hash map should give us O(n). Want me to sketch that out?", time: "10:43 AM" },
  { id: "4", authorId: "1", authorName: "Alex Kim", authorInitials: "AK", authorColor: "from-violet-500 to-purple-600", text: "Yes, go for it Marco 👍", time: "10:43 AM" },
  { id: "5", authorId: "4", authorName: "Priya L", authorInitials: "PL", authorColor: "from-rose-500 to-pink-500", text: "Don't forget edge cases — empty array and duplicates.", time: "10:44 AM" },
];

const LANGUAGES: ReadonlyArray<{
    label: string;
    value: Language;
}> = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
];


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
      style={{
        backgroundColor: color,
      }}
      className={[
        "flex items-center justify-center rounded-xl font-bold text-white shrink-0",
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

function MemberCard({participant,}: {participant: RoomParticipant;}) {
  const initials = participant.username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600/60 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar
          initials={initials}
          color={participant.color}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">
              {participant.username}
            </span>
            {participant.is_host && (
              <Crown className="w-3 h-3 text-yellow-400" />
            )}
          </div>
          <span className="text-xs text-slate-500">
            {participant.is_host ? "Host" : "Participant"}
          </span>
        </div>
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




// ─── Main component ───────────────────────────────────────────────────────────

const MIN_SIDEBAR = 280;
const MAX_SIDEBAR = 480;

export default function CodingRoom() {
  const { roomCode = "" } = useParams();
  const {
  room,
  setRoom,
  participants,
  refreshParticipants,
  connectSocket,
  disconnectSocket,
  } = useRoom();
  const [loading, setLoading] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();
  const isApplyingRemoteLanguage = useRef(false);
  const {
    code,
    setCode,
    language,
    setLanguage,
  } = useEditor();

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const remoteCursorDecorations = useRef<Map<string, Monaco.editor.IEditorDecorationsCollection>>(new Map());
  const remoteCursorWidgets = useRef<Map<string, Monaco.editor.IContentWidget>>(new Map());
  const isApplyingRemoteEdit = useRef(false);

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

  const handleEditorMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {

    editorRef.current = editor;
    monacoRef.current = monaco;

    console.log("✅ Monaco mounted");

    editor.onDidChangeCursorPosition((event) => {

      const position = {
        lineNumber: event.position.lineNumber,
        column: event.position.column,
      };

      roomSocket.send({
        type: "cursor_move",
        position,
      });

    });

    editor.onDidChangeModelContent((event) => {

      if (isApplyingRemoteEdit.current) {
        return;
      }

      roomSocket.send({

        type: "code_change",

        changes: event.changes.map((change) => ({

          range: {
            startLineNumber: change.range.startLineNumber,
            startColumn: change.range.startColumn,
            endLineNumber: change.range.endLineNumber,
            endColumn: change.range.endColumn,
          },

          text: change.text,

        })),

      });

    });

  };


  const handleCodeChange = (message: any) => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }
  
    const editor = editorRef.current;
    const monaco = monacoRef.current;
  
    if (!message.changes?.length) {
      return;
    }
  
    isApplyingRemoteEdit.current = true;
  
    try {
      editor.executeEdits(
        "remote",
        message.changes.map((change: any) => ({
          range: new monaco.Range(
            change.range.startLineNumber,
            change.range.startColumn,
            change.range.endLineNumber,
            change.range.endColumn
          ),
          text: change.text,
        }))
      );
    } finally {
      isApplyingRemoteEdit.current = false;
    }
  };


  const handleCursorMove = (message: any) => {
    console.log(message);
    if (!editorRef.current || !monacoRef.current) return;
    
    const { user_id, username, position, color } = message;
    
    let decorations =
      remoteCursorDecorations.current.get(user_id);
    
    if (!decorations) {
      decorations =
        editorRef.current.createDecorationsCollection();
    
      remoteCursorDecorations.current.set(
        user_id,
        decorations
      );
    }
  
    const safeUserId = user_id.replace(/[^a-zA-Z0-9]/g, "");
    const className = `remote-cursor-${safeUserId}`;
  
    if (!document.getElementById(className)) {
      const style = document.createElement("style");
    
      style.id = className;
    
      style.textContent = `
        .${className} {
          border-left: 2px solid ${color};
        }`;
    
      document.head.appendChild(style);
    }
  
    decorations.set([
      {
        range: new monacoRef.current.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          className,
        },
      },
    ]);
    let widget = remoteCursorWidgets.current.get(user_id);

    if (!widget) {
      const domNode = document.createElement("div");
    
      domNode.style.background = color;
      domNode.style.color = "#fff";
      domNode.style.padding = "2px 6px";
      domNode.style.borderRadius = "4px";
      domNode.style.fontSize = "11px";
      domNode.style.fontWeight = "600";
      domNode.style.whiteSpace = "nowrap";
      domNode.style.pointerEvents = "none";
    
      domNode.innerText = username;
    
      let currentPosition = position;
    
      widget = {
        getId: () => `cursor-widget-${user_id}`,
      
        getDomNode: () => domNode,
      
        getPosition: () => ({
          position: currentPosition,
          preference: [
            monacoRef.current!.editor.ContentWidgetPositionPreference.ABOVE,
          ],
        }),
      };
    
      remoteCursorWidgets.current.set(user_id, widget);
    
      editorRef.current.addContentWidget(widget);
    } else {
      const domNode = widget.getDomNode();
    
      domNode.innerText = username;
      domNode.style.background = color;
    
      let currentPosition = position;
    
      widget.getPosition = () => ({
        position: currentPosition,
        preference: [
          monacoRef.current!.editor.ContentWidgetPositionPreference.ABOVE,
        ],
      });
    
      editorRef.current.layoutContentWidget(widget);
    }
  };


  const handleLanguageChange = (message: any) => {
    if (!message.language) {
      return;
    }

    isApplyingRemoteLanguage.current = true;

    setLanguage(message.language);
  };



  useEffect(() => {
    if (!roomCode) return;

    const handleEditorMessage = (message: any) => {
      switch (message.type) {
        case "code_change":
          handleCodeChange(message);
          break;
      
        case "cursor_move":
          handleCursorMove(message);
          break;

        case "language_change":
          handleLanguageChange(message);
          break;
      
        default:
          break;
      }
    };

    async function loadRoom() {
      try {
        const roomData = await getRoom(roomCode);
        setRoom(roomData);

        await refreshParticipants(roomCode);

        const token = getToken();

        if (token) {
          connectSocket(roomCode, token);
        }

        roomSocket.addListener(handleEditorMessage);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRoom();

    return () => {
      roomSocket.removeListener(handleEditorMessage);
      disconnectSocket();
    };
  }, [roomCode]);


  useEffect(() => {
    if (!editorRef.current) return;
    
    const disposable = editorRef.current.onDidChangeCursorPosition(
      (event) => {
        console.log("Cursor:", {
          lineNumber: event.position.lineNumber,
          column: event.position.column,
        });
      }
    );
  
    return () => {
      disposable.dispose();
    };
  }, []);

  
  useEffect(() => {
    if (isApplyingRemoteLanguage.current) {
      isApplyingRemoteLanguage.current = false;
      return;
    }

    roomSocket.send({
      type: "language_change",
      language,
    });
  }, [language]);


  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }
  
    const model = editorRef.current.getModel();
  
    if (!model) {
      return;
    }
  
    monacoRef.current.editor.setModelLanguage(
      model,
      language
    );
  }, [language]);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-red-400">
        Room not found.
      </div>
    );
  }


  async function handleLeaveRoom() {
    if (!room) return;

    try {
      setLeaving(true);

      await leaveRoom(room.room_code);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to leave room.");
    } finally {
      setLeaving(false);
      setShowLeaveDialog(false);
    }
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
            <span className="text-xs font-mono text-slate-300">{room.room_code}</span>
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
              {LANGUAGES.find((l) => l.value === language)?.label}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl shadow-black/40 z-30 overflow-hidden py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      setLanguage(lang.value);
                      setLangOpen(false);
                    }}
                    className={[
                      "w-full text-left px-3 py-2 text-xs font-mono transition-colors",
                      lang.value === language
                        ? "text-violet-400 bg-violet-500/10"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    ].join(" ")}
                  >
                    {lang.label}
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
            {participants.map((participant) => {
              const initials = participant.username
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
                        
              return (
                <div
                  key={participant.user_id}
                  title={participant.username}
                  className="ring-2 ring-slate-950 rounded-xl"
                >
                  <Avatar
                    initials={initials}
                    color={participant.color}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          {/* Leave */}
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Leave</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MonacoEditor
            code={code}
            language={language}
            onMount={handleEditorMount}
            onChange={(newCode)=>{
                setCode(newCode);
            }}
          />
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
              <span className="text-xs text-slate-600">{participants.length}/{room.max_participants}</span>
            </div>
            <div className="flex flex-col gap-2">
              {participants.map((participant) => (
                <MemberCard
                  key={participant.user_id}
                  participant={participant}
                />
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
      <ConfirmDialog
        open={showLeaveDialog}
        title="Leave Room"
        message="Are you sure you want to leave this room?"
        confirmText={leaving ? "Leaving..." : "Leave"}
        cancelText="Cancel"
        onCancel={() => {
          if (!leaving) {
            setShowLeaveDialog(false);
          }
        }}
        onConfirm={handleLeaveRoom}
      />
    </div>
  );
}