import { useState } from "react";
import { useNavigate } from "react-router-dom";

function generateRoomIdentifier() {
  return crypto.randomUUID().slice(0, 8);
}

export default function JoinRoomForm() {
  const [roomIdentifier, setRoomIdentifier] = useState("");

  const navigate = useNavigate();

  function handleJoinRoom() {
    if (!roomIdentifier.trim()) {
      return;
    }

    navigate(`/room/${roomIdentifier}`);
  }

  function handleCreateRoom() {
    const newRoomIdentifier = generateRoomIdentifier();

    navigate(`/room/${newRoomIdentifier}`);
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <input
        type="text"
        placeholder="Enter room ID"
        value={roomIdentifier}
        onChange={(event) => {
          setRoomIdentifier(event.target.value);
        }}
        className="w-80 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-purple-500"
      />

      <button
        onClick={handleJoinRoom}
        className="w-80 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700"
      >
        Join Existing Room
      </button>

      <button
        onClick={handleCreateRoom}
        className="w-80 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 font-semibold text-white transition hover:bg-zinc-800"
      >
        Create New Room
      </button>
    </div>
  );
}
