import { type RefObject } from "react";
import type { ChatMessage } from "../../types/chat";
import Avatar from "./Avatar";
import { MoreHorizontal, Send, SmilePlus } from "lucide-react";



interface ChatPanelProps {
  messages: ChatMessage[];
  typingUsers: string[];

  currentUserId?: string;

  chatInput: string;

  onChatInputChange: (
    value: string
  ) => void;

  onSend: () => void;

  messagesEndRef: RefObject<HTMLDivElement | null>;
}




function ChatMsg({
  msg,
  isOwn,
}: {
  msg: ChatMessage;
  isOwn: boolean;
}) {

  if (msg.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar
        initials={msg.authorInitials}
        color={msg.authorColor}
        size="sm"
      />

      <div
        className={`flex flex-col gap-1 max-w-[75%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-1.5">
          {!isOwn && (
            <span className="text-xs font-medium text-slate-400">
              {msg.authorName}
            </span>
          )}

          <span className="text-xs text-slate-600">
            {msg.time}
          </span>
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

function TypingIndicator({
    username,
}: {
    username: string;
}) {

    return (
        <div className="flex items-end gap-2 px-4 py-2">
            <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-slate-800 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">
                    {username} is typing...
                </div>
                <div className="flex gap-1">
                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    />
                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{
                            animationDelay: "0.15s",
                        }}
                    />
                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{
                            animationDelay: "0.3s",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ChatPanel({
  messages,
  typingUsers,
  currentUserId,
  chatInput,
  onChatInputChange,
  onSend,
  messagesEndRef,
}: ChatPanelProps) {
  return (
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
          <ChatMsg
            key={msg.id}
            msg={msg}
            isOwn={
                msg.type === "user" &&
                msg.authorId === currentUserId
            }
          />
        ))}
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator
            username={typingUsers[0]}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 focus-within:border-violet-500/50 transition-colors">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSend();
              }
            }}
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
            onClick={onSend}
            disabled={!chatInput.trim()}
            aria-label="Send message"
            className="text-violet-400 hover:text-violet-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}





