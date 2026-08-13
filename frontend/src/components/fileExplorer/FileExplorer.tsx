import { useFiles } from "../../context/FileContext";
import FileNode from "./FileNode";

export default function FileExplorer() {

  const { files } = useFiles();

  return (
    <div className="h-full bg-slate-900 border-r border-slate-800">

      <div className="px-3 py-2 font-semibold border-b border-slate-800">
        Explorer
      </div>

      {files.map((node) => (
        <FileNode
          key={node.id}
          node={node}
        />
      ))}
    </div>
  );
}