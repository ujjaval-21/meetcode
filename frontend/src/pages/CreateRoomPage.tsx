import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Unlock,
  ArrowLeft,
  LogIn,
  Eye,
  EyeOff,
  Hash,
  Info,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ADJECTIVES = [
  "swift", "bold", "calm", "dark", "epic", "fast", "glad", "huge",
  "keen", "lazy", "mild", "neat", "odd", "pure", "rich", "safe",
  "tiny", "vast", "warm", "zany",
];

const NOUNS = [
  "algo", "byte", "code", "data", "exec", "fork", "grep", "hook",
  "iter", "java", "kern", "loop", "main", "node", "pipe", "quit",
  "root", "sudo", "type", "unit",
];

function generateRoomId(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${noun}-${num}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-slate-900",
        enabled
          ? "bg-gradient-to-r from-violet-600 to-blue-600 border-transparent"
          : "bg-slate-700 border-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300",
          enabled ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreateRoomPage() {
  const [roomId, setRoomId] = useState<string>(() => generateRoomId());
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleGenerate = useCallback(() => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 400);
    setRoomId(generateRoomId());
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: no-op
    }
  }, [roomId]);

  const handleTogglePrivate = useCallback(() => {
    setIsPrivate((v) => {
      if (v) {
        setPassword("");
        setPasswordError("");
      }
      return !v;
    });
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError && e.target.value.length >= 4) {
      setPasswordError("");
    }
  };

  const handleEnterRoom = () => {
    if (isPrivate && password.length < 4) {
      setPasswordError("Password must be at least 4 characters.");
      return;
    }
    // Connect room creation logic here
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/8 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card glow */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl px-8 pt-10 pb-8 shadow-2xl shadow-black/60">

          {/* Header */}
          <header className="flex flex-col items-center gap-3 mb-9">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 mb-1 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Code2 className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold font-mono text-white text-base tracking-tight group-hover:text-violet-300 transition-colors">
                MeetCode
              </span>
            </Link>

            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Create a Room
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Configure your session and invite collaborators.
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-6">

            {/* Room ID */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                Room ID
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-sm text-white overflow-hidden">
                  <span className="truncate tracking-wide">{roomId}</span>
                </div>

                {/* Regenerate */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  aria-label="Generate new room ID"
                  title="Generate new ID"
                  className="w-10 h-10 shrink-0 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center"
                >
                  <RefreshCw
                    className={[
                      "w-4 h-4 transition-transform duration-400",
                      spinning ? "animate-spin" : "",
                    ].join(" ")}
                  />
                </button>

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy room ID"
                  title={copied ? "Copied!" : "Copy ID"}
                  className={[
                    "w-10 h-10 shrink-0 rounded-xl border transition-all duration-200 flex items-center justify-center",
                    copied
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700 text-slate-400 hover:text-white",
                  ].join(" ")}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Copied to clipboard
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800" />

            {/* Private room toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                    isPrivate
                      ? "bg-violet-500/15 text-violet-400"
                      : "bg-slate-800 text-slate-500",
                  ].join(" ")}
                >
                  {isPrivate ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Private Room</p>
                  <p className="text-xs text-slate-500">
                    {isPrivate ? "Password protected" : "Anyone with the link can join"}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={isPrivate}
                onToggle={handleTogglePrivate}
                label="Toggle private room"
              />
            </div>

            {/* Password field — animated reveal */}
            <div
              className={[
                "overflow-hidden transition-all duration-300",
                isPrivate ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="flex flex-col gap-2 pt-1">
                <label
                  htmlFor="room-password"
                  className="text-sm font-medium text-slate-300 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Room Password
                </label>
                <div className="relative">
                  <input
                    id="room-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Set a password…"
                    autoComplete="new-password"
                    aria-describedby="password-hint password-error"
                    className={[
                      "w-full rounded-xl bg-slate-800/80 border px-3.5 py-2.5 pr-11 text-sm text-white placeholder-slate-500",
                      "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/60 transition-colors",
                      passwordError
                        ? "border-red-500"
                        : "border-slate-700 hover:border-slate-600",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordError ? (
                  <p id="password-error" role="alert" className="text-xs text-red-400">
                    {passwordError}
                  </p>
                ) : (
                  <p id="password-hint" className="text-xs text-slate-500 flex items-start gap-1.5">
                    <Info className="w-3 h-3 mt-0.5 text-violet-400 shrink-0" />
                    Private rooms require password access.
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800" />

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleEnterRoom}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all duration-200 group"
              >
                <LogIn className="w-4 h-4" />
                Enter Room
              </button>

              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white text-sm font-medium hover:bg-slate-800/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 font-mono mt-6">
          © {new Date().getFullYear()} MeetCode
        </p>
      </div>
    </div>
  );
}