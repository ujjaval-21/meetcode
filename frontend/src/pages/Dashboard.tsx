import { useState } from "react";
import {
  Code2,
  Bell,
  Settings,
  Plus,
  LogIn,
  Zap,
  Video,
  MessageSquare,
  Users,
  ChevronRight,
  Hash,
  Wifi,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeaturePill {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accent: string;
  glow: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURE_PILLS: FeaturePill[] = [
  {
    icon: <Zap className="w-4 h-4" />,
    label: "Live Editor",
    sublabel: "Real-time sync",
    accent: "text-violet-400",
    glow: "group-hover:shadow-violet-500/20",
  },
  {
    icon: <Video className="w-4 h-4" />,
    label: "Voice & Video",
    sublabel: "Crystal clear",
    accent: "text-blue-400",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "Team Chat",
    sublabel: "Persistent threads",
    accent: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/20",
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: "Up to 8 Members",
    sublabel: "Per room",
    accent: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/20",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavIconButton({
  icon,
  badge,
  label,
}: {
  icon: React.ReactNode;
  badge?: boolean;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
    >
      {icon}
      {badge && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-slate-950" />
      )}
    </button>
  );
}

function UserAvatar() {
  return (
    <button
      aria-label="User menu"
      className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-slate-700 hover:ring-violet-500/60 transition-all duration-200"
    >
      <div className="w-full h-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
        <span className="text-xs font-bold text-white">AK</span>
      </div>
      <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
    </button>
  );
}

function ActiveDot() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      Online
    </span>
  );
}

interface RoomCardProps {
  variant: "create" | "join";
  onAction: () => void;
}

function RoomCard({ variant, onAction }: RoomCardProps) {
  const isCreate = variant === "create";

  return (
    <div
      className={[
        "group relative flex flex-col rounded-3xl p-8 border transition-all duration-300 cursor-pointer overflow-hidden",
        isCreate
          ? "bg-gradient-to-br from-slate-900 to-slate-900/80 border-slate-700/60 hover:border-violet-500/50"
          : "bg-gradient-to-br from-slate-900 to-slate-900/80 border-slate-700/60 hover:border-blue-500/50",
      ].join(" ")}
      onClick={onAction}
    >
      {/* Glow layer */}
      <div
        className={[
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none",
          isCreate
            ? "bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.08)_0%,_transparent_60%)]"
            : "bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08)_0%,_transparent_60%)]",
        ].join(" ")}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-8">
        {/* Icon */}
        <div
          className={[
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
            isCreate
              ? "bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 group-hover:shadow-lg group-hover:shadow-violet-500/20"
              : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 group-hover:shadow-lg group-hover:shadow-blue-500/20",
          ].join(" ")}
        >
          {isCreate ? <Plus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
        </div>

        {/* Badge */}
        <span
          className={[
            "px-2.5 py-1 rounded-full text-xs font-semibold border",
            isCreate
              ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
              : "bg-blue-500/10 text-blue-300 border-blue-500/20",
          ].join(" ")}
        >
          {isCreate ? "New" : "Quick Join"}
        </span>
      </div>

      {/* Text */}
      <div className="mb-8 flex-1">
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
          {isCreate ? "Create a Room" : "Join a Room"}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          {isCreate
            ? "Start a new collaborative session. Choose your language, invite teammates, and write code together in real-time."
            : "Have a room code? Jump straight into an active session and start collaborating with your team instantly."}
        </p>
      </div>

      {/* Input for join */}
      {!isCreate && (
        <div className="mb-5">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/60 focus-within:border-blue-500/50 transition-colors">
            <Hash className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Enter room code…"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-mono"
            />
          </div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        className={[
          "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 group/btn",
          isCreate
            ? "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35"
            : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35",
        ].join(" ")}
      >
        {isCreate ? "Create Room" : "Join Room"}
        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-150" />
      </button>
    </div>
  );
}

function FeaturePillItem({ icon, label, sublabel, accent, glow }: FeaturePill) {
  return (
    <div
      className={[
        "group flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-lg",
        glow,
      ].join(" ")}
    >
      <div
        className={[
          "w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 group-hover:bg-slate-700/80 transition-colors duration-200",
          accent,
        ].join(" ")}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-none mb-1">{label}</p>
        <p className="text-xs text-slate-500">{sublabel}</p>
      </div>
    </div>
  );
}

// ─── Recent Rooms strip ───────────────────────────────────────────────────────

const RECENT_ROOMS = [
  { name: "algo-sprint", lang: "TypeScript", members: 3, active: true },
  { name: "backend-api", lang: "Go", members: 1, active: false },
  { name: "interview-prep", lang: "Python", members: 2, active: false },
];

function RecentRooms() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Recent Rooms
        </h3>
        <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          View all
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {RECENT_ROOMS.map((room) => (
          <button
            key={room.name}
            className="group flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Code2 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-mono font-medium text-white leading-none mb-1">
                  #{room.name}
                </p>
                <p className="text-xs text-slate-500">{room.lang}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {room.active && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Wifi className="w-3 h-3" />
                  Live
                </span>
              )}
              <span className="text-xs text-slate-500">{room.members} online</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [, setModalOpen] = useState<"create" | "join" | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/8 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/3 left-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-mono text-white text-lg tracking-tight">MeetCode</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            <NavIconButton icon={<Bell className="w-4.5 h-4.5" />} badge label="Notifications" />
            <NavIconButton icon={<Settings className="w-4.5 h-4.5" />} label="Settings" />
            <div className="w-px h-6 bg-slate-800 mx-1.5" />
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 gap-10">

        {/* Welcome header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ActiveDot />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Alex</span>
          </h1>
          <p className="text-slate-400 text-sm">What are you building today?</p>
        </div>

        {/* ── Two main cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          <RoomCard variant="create" onAction={() => setModalOpen("create")} />
          <RoomCard variant="join" onAction={() => setModalOpen("join")} />
        </div>

        {/* ── Feature pills ── */}
        <div className="w-full max-w-2xl">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold text-center mb-4">
            Every room includes
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURE_PILLS.map((pill) => (
              <FeaturePillItem key={pill.label} {...pill} />
            ))}
          </div>
        </div>

        {/* ── Recent rooms ── */}
        <RecentRooms />
      </main>

      {/* ── Footer ── */}
      <footer className="shrink-0 border-t border-slate-800/60 py-4">
        <p className="text-center text-xs text-slate-700 font-mono">
          © {new Date().getFullYear()} MeetCode
        </p>
      </footer>
    </div>
  );
}