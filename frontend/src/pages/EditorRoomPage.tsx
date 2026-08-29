import {useState, useRef, useCallback, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileExplorer from "../components/fileExplorer/FileExplorer";
import { useFiles } from "../context/FileContext";
import MonacoEditor from "../components/editor/MonacoEditor";
import EditorTabs from "../components/editor/EditorTabs";
import EditorToolbar from "../components/editor/EditorToolbar";
import type { ExecutionResult } from "../types/execution";
import OutputPanel from "../components/editor/OutputPanel";
import { executeCode } from "../services/execution";
import { useRoom } from "../hooks/useRoom";
import { useEditor } from "../hooks/useEditor";
import { roomSocket } from "../services/websocket";
import type * as Monaco from "monaco-editor";
import { useAuth } from "../hooks/useAuth";
import {
  getMonacoLanguage,
  getExecutionLanguage,
} from "../utils/fileLanguage";
import {
  getRoom,
  leaveRoom,
} from "../services/room";
import { getToken } from "../services/storage";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import Avatar from "../components/room/Avatar";
import LiveBadge from "../components/room/LiveBadge";
import MemberCard from "../components/room/MemberCard";
import ActionButton from "../components/room/ActionButton";

import type { ChatMessage } from "../types/chat";
import ChatPanel from "../components/room/ChatPanel";

import {
  Code2,
  LogOut,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Hash,
} from "lucide-react";




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
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sharing, setSharing] = useState(false);
  const explorerDragging = useRef(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const navigate = useNavigate();
  const [explorerWidth, setExplorerWidth] = useState(() => {
    const saved = localStorage.getItem(
      "explorer-width"
    );

    return saved
      ? Number(saved)
      : 280;
  });

  const [explorerOpen, setExplorerOpen] =
  useState(() => {
  
    return (
      localStorage.getItem(
        "explorer-open"
      ) !== "false"
    );
  
  });

  const [execution, setExecution] = useState<ExecutionResult>({
    isRunning: false,
    output: "",
    error: "",
    executionTime: null,
    memory: null,
  });
  const {
    stdin,
  } = useEditor();

  const {
    activeFile,
    setActiveFileContent,
  } = useFiles();

  const { user } = useAuth();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const activeFileRef = useRef(activeFile);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
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

  const monacoLanguage = getMonacoLanguage(
    activeFile?.name ?? ""
  );

  const executionLanguage = activeFile
    ? getExecutionLanguage(activeFile.name)
    : null;


  function handleExplorerDragStart() {
    explorerDragging.current = true;
  }


  useEffect(() => {
      activeFileRef.current = activeFile;
  }, [activeFile]);



  useEffect(() => {

    function handleMouseMove(
      e: MouseEvent
    ) {

      if (!explorerDragging.current) {
        return;
      }

      const width = Math.max(
        180,
        Math.min(500, e.clientX)
      );

      setExplorerWidth(width);
    }

    function handleMouseUp() {
      explorerDragging.current = false;
    }

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );

    };

  }, []);


  useEffect(() => {
    localStorage.setItem(
      "explorer-width",
      explorerWidth.toString()
    );

  }, [explorerWidth]);

  useEffect(() => {

    localStorage.setItem(
      "explorer-open",
      explorerOpen.toString()
    );

  }, [explorerOpen]);



  function handleSend() {
    const text = chatInput.trim();

    if (!text) return;

    roomSocket.send({
      type: "chat_message",
      message: text,
    });

    setChatInput("");

    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
    
        roomSocket.send({
            type: "stop_typing",
        });
      
        isTypingRef.current = false;
    }
  }



  async function handleRun() {
    setExecution({
      isRunning: true,
      output: "",
      error: "",
      executionTime: null,
      memory: null,
    });

    try {
      if (!activeFile) {
        throw new Error("No file is currently open.");
      }

      if (!executionLanguage) {
        throw new Error(
          `Cannot execute "${activeFile.name}". This file type is not supported for code execution.`
        );
      }

      const result = await executeCode({
        language: executionLanguage,
        code: activeFile.content ?? "",
        stdin,
      });

      let output = "";
      let error = "";

      if (result.stdout) {
        output = result.stdout;
      }

      if (result.compile_output) {
        error = result.compile_output;
      }

      if (result.stderr) {
        error = result.stderr;
      }

      if (result.message) {
        error = result.message;
      }

      setExecution({
        isRunning: false,
        output,
        error,
        executionTime: result.time
          ? Number(result.time)
          : null,
        memory: result.memory,
      });

    } catch (err: any) {

      console.error(err);

      let message = "Failed to execute code.";

      if (err instanceof Error) {
        message = err.message;
      }

      setExecution({
        isRunning: false,
        output: "",
        error: message,
        executionTime: null,
        memory: null,
      });
    }
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

      const changes = event.changes.map((change) => ({
          range: {
              startLineNumber: change.range.startLineNumber,
              startColumn: change.range.startColumn,
              endLineNumber: change.range.endLineNumber,
              endColumn: change.range.endColumn,
          },
          text: change.text,
      }));

      roomSocket.send({
          type: "code_change",
          changes,
      });

      const file = activeFileRef.current;
          
      if (file) {
          roomSocket.send({
              type: "file_content_update",
              fileId: file.id,
              content: editor.getValue(),
          });
      }

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



  useEffect(() => {
    if (!roomCode) return;

    const handleEditorMessage = (message: any) => {
      switch (message.type) {
        case "code_change":
          handleCodeChange(message);
          break;
        
        case "file_content_update":
          if (
              activeFile &&
              message.fileId === activeFile.id
          ) {
              setActiveFileContent(message.content);
          }
          break;
      
        case "cursor_move":
          handleCursorMove(message);
          break;

        case "chat_message":
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: "user",
            
              authorId: message.user_id,
            
              authorName: message.username,
            
              authorInitials: message.username
                .split(" ")
                .map((part: string) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            
              authorColor: message.color,
            
              text: message.message,
            
              time: new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          break;
        
        case "system_message":
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: "system",
            
              text: message.message,
            
              time: new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          break;

        case "typing":
          setTypingUsers((prev) => {
            if (prev.includes(message.username)) {
              return prev;
            }
          
            return [...prev, message.username];
          });
          break;
        
        case "stop_typing":
          setTypingUsers((prev) =>
            prev.filter((name) => name !== message.username)
          );
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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);


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
          <button
            onClick={() =>
              setExplorerOpen(!explorerOpen)
            }
            className="p-2 rounded hover:bg-slate-800">
            {explorerOpen ? (
              <PanelLeftClose
                className="w-4 h-4"
              />
            ) : (
              <PanelLeftOpen
                className="w-4 h-4"
              />
            )}
          
          </button>
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

        {/* editor toolbar */}
        <EditorToolbar
          onRun={handleRun}
          isRunning={execution.isRunning}
          canRun={executionLanguage !== null}
        />


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

        <>
          {explorerOpen && (
            <>
              <div
                style={{
                  width: explorerWidth,
                  transition: explorerDragging.current
                    ? "none"
                    : "width 200ms ease",
                }}
                className="shrink-0 overflow-hidden"
              >
                <FileExplorer />
              </div>
              
              <div
                onMouseDown={handleExplorerDragStart}
                onDoubleClick={() => setExplorerWidth(280)}
                className="w-1 shrink-0 cursor-col-resize bg-slate-800 hover:bg-violet-500 transition-colors"
              />
            </>
          )}
        </>

        {/* ── Editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorTabs />

          <div className="flex-1 overflow-hidden">

              <MonacoEditor
                fileId={activeFile?.id ?? "empty"}
                code={activeFile?.content ?? ""}
                language={monacoLanguage}
                onMount={handleEditorMount}
                onChange={(newCode) => {
                    setActiveFileContent(newCode);
                }}
              />

          </div>
              
          <OutputPanel
            execution={execution}
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
          <div className="flex-1 flex flex-col px-4 py-3 min-h-0">
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
          <ChatPanel
              messages={messages}
              typingUsers={typingUsers}
              currentUserId={user?.id}
              chatInput={chatInput}
              onChatInputChange={(value: string) => {
                  setChatInput(value);
              
                  if (!isTypingRef.current) {
                      roomSocket.send({
                          type: "typing",
                      });
                    
                      isTypingRef.current = true;
                  }
                
                  if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                  }
                
                  typingTimeoutRef.current = window.setTimeout(() => {
                      roomSocket.send({
                          type: "stop_typing",
                      });
                    
                      isTypingRef.current = false;
                  }, 2000);
              }}
              onSend={handleSend}
              messagesEndRef={messagesEndRef}
          />
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
