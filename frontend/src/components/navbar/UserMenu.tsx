import {
  User,
  Palette,
  Settings,
  LogOut,
} from "lucide-react";

interface UserMenuProps {
  username: string;
  onLogout: () => void;
  onClose: () => void;
}

function ComingSoonBadge() {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
      Soon
    </span>
  );
}

export default function UserMenu({
  username,
  onLogout,
  onClose,
}: UserMenuProps) {
  return (
    <div
      className="
        absolute
        right-0
        top-14
        w-72

        origin-top-right

        animate-in
          fade-in
          zoom-in-95

          duration-150

        rounded-2xl
        border
        border-slate-800
        bg-slate-900

        shadow-2xl
        shadow-black/40

        overflow-hidden
        z-50
      "
    >

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center font-bold text-white">
            {username
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <p className="font-semibold text-white">
              {username}
            </p>

            <p className="text-xs text-emerald-400">
              ● Online
            </p>
          </div>

        </div>
      </div>

      {/* Menu */}
      <div className="py-2">

        <button
          onClick={onClose}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <User size={18} />
            <span>Profile</span>
          </div>

          <ComingSoonBadge />
        </button>

        <button
          onClick={onClose}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Palette size={18} />
            <span>Appearance</span>
          </div>

          <ComingSoonBadge />
        </button>

        <button
          onClick={onClose}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} />
            <span>Settings</span>
          </div>

          <ComingSoonBadge />
        </button>

        <div className="border-t border-slate-800 my-2" />

        <button
          onClick={onLogout}
          className="w-full px-5 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />

          Logout
        </button>

      </div>
    </div>
  );
}