import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  FileCode2,
  FileJson,
  FileText,
  FileType,
  Braces,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { FileNode } from "../../context/FileContext";
import { useFiles } from "../../context/FileContext";


function getFileIcon(filename: string) {
  const extension =
    filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "py":
      return (
        <FileCode2
          size={16}
          className="text-yellow-400"
        />
      );

    case "js":
    case "jsx":
      return (
        <FileCode2
          size={16}
          className="text-yellow-300"
        />
      );

    case "ts":
    case "tsx":
      return (
        <FileCode2
          size={16}
          className="text-blue-400"
        />
      );

    case "cpp":
    case "cc":
    case "cxx":
    case "c":
      return (
        <FileCode2
          size={16}
          className="text-blue-500"
        />
      );

    case "java":
      return (
        <FileCode2
          size={16}
          className="text-orange-400"
        />
      );

    case "go":
      return (
        <FileCode2
          size={16}
          className="text-cyan-400"
        />
      );

    case "rs":
      return (
        <FileCode2
          size={16}
          className="text-orange-500"
        />
      );

    case "json":
      return (
        <FileJson
          size={16}
          className="text-yellow-400"
        />
      );

    case "html":
    case "htm":
      return (
        <Braces
          size={16}
          className="text-orange-400"
        />
      );

    case "css":
      return (
        <FileType
          size={16}
          className="text-blue-400"
        />
      );

    case "md":
    case "txt":
      return (
        <FileText
          size={16}
          className="text-slate-400"
        />
      );

    default:
      return (
        <File
          size={16}
          className="text-slate-400"
        />
      );
  }
}



interface Props {
  node: FileNode;
  level?: number;
}

export default function FileNode({
  node,
  level = 0,
}: Props) {
  const {
    activeFileId,
    openFile,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    editingNodeId,
    setEditingNodeId,
  } = useFiles();
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({x: 0, y: 0});
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isFolder = node.type === "folder";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    window.addEventListener(
      "click",
      handleClick
    );

    return () =>
      window.removeEventListener(
        "click",
        handleClick
      );
  }, []);

  useEffect(() => {
    if (editing || editingNodeId === node.id) {
      setEditing(true);

      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [editingNodeId]);


  return (
    <>
      <div
        onClick={() => {
          if (node.type === "file") {
            openFile(node);
          }
        }}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer select-none ${
          activeFileId === node.id
            ? "bg-slate-800"
            : "hover:bg-slate-800"
        }`}
        style={{
          paddingLeft: `${level * 16 + 8}px`,
        }}

        onContextMenu={(e) => {
          e.preventDefault();

          setMenuPos({
            x: e.clientX,
            y: e.clientY,
          });
        
          setMenuOpen(true);
        }}
      >
        {isFolder ? (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>

            <Folder
              size={16}
              className="text-yellow-400"
            />

            {editing ? (
              <input
                ref={inputRef}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                onBlur={() => {
                  renameNode(node.id, name.trim() || node.name);
                  setEditing(false);
                  setEditingNodeId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameNode(node.id, name.trim() || node.name);
                    setEditing(false);
                    setEditingNodeId(null);
                  }
                
                  if (e.key === "Escape") {
                    setName(node.name);
                    setEditing(false);
                    setEditingNodeId(null);
                  }
                }}
                className="bg-slate-800 rounded px-1 outline-none w-full"
            />
            ) : (
              <span>{node.name}</span>
            )}
          </>
        ) : (
          <>
            <div className="w-[14px]" />

            {getFileIcon(node.name)}

            {editing ? (
              <input
                ref={inputRef}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                onBlur={() => {
                  renameNode(node.id, name.trim() || node.name);
                  setEditing(false);
                  setEditingNodeId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameNode(node.id, name.trim() || node.name);
                    setEditing(false);
                    setEditingNodeId(null);
                  }
                
                  if (e.key === "Escape") {
                    setName(node.name);
                    setEditing(false);
                    setEditingNodeId(null);
                  }
                }}
                className="bg-slate-800 rounded px-1 outline-none w-full"
            />
            ) : (
              <span>{node.name}</span>
            )}
          </>
        )}
      </div>

      {expanded &&
        isFolder &&
        node.children?.map((child) => (
          <FileNode
            key={child.id}
            node={child}
            level={level + 1}
          />
        ))}
        
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 w-44 rounded bg-slate-900 border border-slate-700 shadow-lg"
          style={{
            top: menuPos.y,
            left: menuPos.x,
          }}
        >
          {isFolder && (
            <>
              <button
                onClick={() => {
                  createFile(node.id);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800"
              >
                New File
              </button>
              
              <button
                onClick={() => {
                  createFolder(node.id);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-800"
              >
                New Folder
              </button>
              
              <hr className="border-slate-700" />
            </>
          )}

          <button
            onClick={() => {
              setEditing(true);
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-slate-800"
          >
            Rename
          </button>
          
          <button
            onClick={() => {
              if (
                confirm(
                  `Delete ${node.name}?`
                )
              ) {
                deleteNode(node.id);
              }
            
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-red-400 hover:bg-slate-800"
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}