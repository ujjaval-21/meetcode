import { useEffect, useRef, useState } from "react";

import UserMenu from "./UserMenu";
import { ChevronDown } from "lucide-react";

import type { User } from "../../types/auth";

interface UserAvatarProps {
  user: User | null;
  onLogoutClick: () => void;
}

export default function UserAvatar({
  user,
  onLogoutClick,
}: UserAvatarProps) {


  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const initials =
    user?.username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  useEffect(() => {

      function handleClickOutside(event: MouseEvent) {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      }

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        }
      }

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

      document.addEventListener(
        "keydown",
        handleKeyDown
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleClickOutside
        );

        document.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };

    }, []);

  return (
    <div
      className="relative"
      ref={menuRef}
    >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="
            flex items-center gap-2
            rounded-xl
            px-1
            py-1
            hover:bg-slate-900
            transition-colors
          "
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-slate-700 hover:ring-violet-500/60 transition-all duration-200">
            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {initials}
              </span>
            </div>

            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>

          <ChevronDown
            size={18}
            className={`
              text-slate-400
              transition-transform
              duration-200
              ease-in-out
              ${isOpen ? "rotate-180" : ""}
              `}
          />
        </button>

      {isOpen && (
        <UserMenu
            username={user?.username ?? "User"}
            onLogout={() => {
                setIsOpen(false);
                onLogoutClick();
            }}
            onClose={() => setIsOpen(false)}
        />
      )}
    </div>
    
  );
}