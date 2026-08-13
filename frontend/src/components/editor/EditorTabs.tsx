import { X } from "lucide-react";
import { useFiles } from "../../context/FileContext";

export default function EditorTabs() {
  const {
    openedFiles,
    activeFileId,
    setActiveFileId,
    closeFile,
  } = useFiles();

  return (
    <div className="flex items-center bg-slate-900 border-b border-slate-800 overflow-x-auto">

      {openedFiles.map((file) => {

        const active =
          file.id === activeFileId;

        return (

          <div
            key={file.id}
            onClick={() =>
              setActiveFileId(file.id)
            }
            className={`flex items-center gap-2 px-4 h-10 cursor-pointer border-r border-slate-800 whitespace-nowrap transition-colors
            ${
              active
                ? "bg-slate-950 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >

            <span className="text-sm">
              {file.name}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className="rounded hover:bg-slate-700 p-0.5"
            >
              <X size={14} />
            </button>

          </div>

        );
      })}
    </div>
  );
}