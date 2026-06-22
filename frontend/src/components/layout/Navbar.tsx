import { Code2 } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Code2 className="text-purple-500" size={30} />

          <h1 className="text-2xl font-bold text-white">
            MeetCode
          </h1>
        </div>

        <button className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700">
          GitHub
        </button>
      </div>
    </nav>
  );
}
