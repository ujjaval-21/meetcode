import { useState } from "react";
import { Link } from "react-router-dom";
import ToggleSwitch from "../components/ui/ToggleSwitch";
import { createRoom } from "../services/room";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Lock,
  Unlock,
  ArrowLeft,
  LogIn,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";


// ─── Main component ───────────────────────────────────────────────────────────

export default function CreateRoomPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [maxParticipants,setMaxParticipants]=useState(10);
  const navigate = useNavigate();


  function handleTogglePrivate() {
    setIsPrivate((v) => {
      if (v) {
        setPassword("");
        setPasswordError("");
      }
      return !v;
    });
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError && e.target.value.length >= 6) {
      setPasswordError("");
    }
  };

const handleEnterRoom = async () => {

  if (!title.trim()) {
    alert("Room name is required.");
    return;
  }

  if (isPrivate && password.length < 6) {
    setPasswordError("Password must be at least 6 characters.");
    return;
  }

  try {

    const room = await createRoom({
      title,
      description,
      is_private: isPrivate,
      max_participants: maxParticipants,
    });

    navigate(`/room/${room.room_code}`);

  } catch (error) {

    console.error(error);
    alert("Unable to create room.");

  }
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

            {/* Room Name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-slate-300"
              >
                Room Name
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="DSA Practice"
                className="
                  w-full
                  rounded-xl
                  bg-slate-800/80
                  border
                  border-slate-700
                  px-3.5
                  py-2.5
                  text-white
                  placeholder-slate-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-violet-500/50
                "
              />
            </div>
          
            {/* Room Description */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-300"
              >
                Description
                <span className="text-slate-500 text-xs ml-2">
                  (Optional)
                </span>
              </label>

              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this room..."
                className="
                  w-full
                  rounded-xl
                  bg-slate-800/80
                  border
                  border-slate-700
                  px-3.5
                  py-2.5
                  text-white
                  placeholder-slate-500
                  resize-none
                  focus:outline-none
                  focus:ring-2
                  focus:ring-violet-500/50
                "
              />
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


            {/* MAX Participants */}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="participants"
                className="text-sm font-medium text-slate-300"
              >
                Maximum Participants
              </label>

              <select
                id="participants"
                value={maxParticipants}
                onChange={(e) =>
                  setMaxParticipants(Number(e.target.value))
                }
                className="
                  w-full
                  rounded-xl
                  bg-slate-800
                  border
                  border-slate-700
                  px-3.5
                  py-2.5
                  text-white
                  focus:outline-none
                  focus:ring-2
                  focus:ring-violet-500/50
                "
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
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
                Create & Enter Room
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