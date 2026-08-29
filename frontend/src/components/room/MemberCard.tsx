import { Crown } from "lucide-react";

import type { RoomParticipant } from "../../services/room";
import Avatar from "./Avatar";

interface MemberCardProps {
  participant: RoomParticipant;
}

export default function MemberCard({
  participant,
}: MemberCardProps) {
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
            {participant.is_host
              ? "Host"
              : "Participant"}
          </span>
        </div>
      </div>
    </div>
  );
}