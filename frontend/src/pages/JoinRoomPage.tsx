import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../services/room";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import {
  Code2,
  Hash,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  Info,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  roomId: string;
  password: string;
}

interface FormErrors {
  roomId?: string;
  password?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validate(fields: FormState): FormErrors {
  const errors: FormErrors = {};
  const trimmed = fields.roomId.trim();
  if (!trimmed) {
    errors.roomId = "Room ID is required.";
  } else if (!/^[a-z]+-[a-z]+-\d{4}$/.test(trimmed) && trimmed.length < 4) {
    errors.roomId = "Enter a valid room ID.";
  }
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  id,
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  rightSlot,
  autoComplete,
  optional,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  rightSlot?: React.ReactNode;
  autoComplete?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
          <span className="text-slate-500">{icon}</span>
          {label}
        </span>
        {optional && (
          <span className="text-xs text-slate-600 font-medium">Optional</span>
        )}
      </label>

      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={[
            "w-full rounded-xl bg-slate-800/80 border px-3.5 py-2.5 text-sm text-white placeholder-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/60 transition-all duration-200",
            rightSlot ? "pr-11" : "",
            error
              ? "border-red-500/70 bg-red-500/5"
              : "border-slate-700 hover:border-slate-600",
          ].join(" ")}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500 flex items-start gap-1.5">
          <Info className="w-3 h-3 mt-0.5 text-violet-400 shrink-0" />
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// ─── Recent rooms pill ────────────────────────────────────────────────────────

const RECENTS = ["swift-algo-4821", "bold-code-3310", "calm-loop-7782"];

function RecentPill({
  id,
  onClick,
}: {
  id: string;
  onClick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 hover:border-violet-500/40 hover:bg-slate-800 hover:text-violet-300 text-slate-400 text-xs font-mono transition-all duration-200"
    >
      {id}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JoinRoomPage() {
  const [form, setForm] = useState<FormState>({ roomId: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  function handleRecentPick(id: string) {
    setForm((prev) => ({ ...prev, roomId: id }));
    setErrors((prev) => ({ ...prev, roomId: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setServerError("");
    setIsSubmitting(true);

    try {
      await joinRoom({
        room_code: form.roomId.trim().toUpperCase(),
      });

      navigate(`/room/${form.roomId.trim().toUpperCase()}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        setServerError(
          error.response?.data?.detail ?? "Unable to join room."
        );
      } else {
        setServerError("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/3 right-1/4 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card border glow on hover */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-500/20 via-transparent to-violet-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl px-8 pt-10 pb-8 shadow-2xl shadow-black/60">

          {/* Header */}
          <header className="flex flex-col items-center gap-3 mb-9">
            <Link to="/dashboard" className="flex items-center gap-2 group mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold font-mono text-white text-base tracking-tight group-hover:text-violet-300 transition-colors">
                MeetCode
              </span>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Join a Room
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Enter the room ID shared by the host.
              </p>
            </div>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate aria-label="Join room form">
            <div className="flex flex-col gap-6">

              {/* Room ID */}
              <InputField
                id="roomId"
                label="Room ID"
                icon={<Hash className="w-3.5 h-3.5" />}
                placeholder="e.g. swift-algo-4821"
                value={form.roomId}
                onChange={handleChange("roomId")}
                error={errors.roomId}
                hint="Enter the room ID shared by the host."
                autoComplete="off"
              />

              {/* Recent rooms */}
              {RECENTS.length > 0 && (
                <div className="flex flex-col gap-2 -mt-2">
                  <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                    Recent
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {RECENTS.map((id) => (
                      <RecentPill key={id} id={id} onClick={handleRecentPick} />
                    ))}
                  </div>
                </div>
              )}

              {serverError && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {serverError}
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-slate-800" />

              {/* Password */}
              <InputField
                id="password"
                label="Room Password"
                icon={<Lock className="w-3.5 h-3.5" />}
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank if public room"
                value={form.password}
                onChange={handleChange("password")}
                error={errors.password}
                hint="Only required for private rooms."
                autoComplete="current-password"
                optional
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />

              {/* Divider */}
              <div className="h-px bg-slate-800" />

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <LogIn className="w-4 h-4" />
                  {isSubmitting ? "Joining…" : "Join Room"}
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
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 font-mono mt-6">
          © {new Date().getFullYear()} MeetCode
        </p>
      </div>
    </div>
  );
}