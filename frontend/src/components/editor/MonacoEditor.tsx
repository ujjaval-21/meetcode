import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";


interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onMount?: OnMount;
}

export default function MonacoEditor({
  code,
  language,
  onChange,
  onMount,
}: MonacoEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      defaultValue={code}
      theme="vs-dark"
      onMount={onMount}
      onChange={(value) => {
        onChange(value ?? "");
      }}
      options={{
        minimap: {
          enabled: false,
        },
        fontSize: 15,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        tabSize: 4,
        wordWrap: "on",
        smoothScrolling: true,
        fontLigatures: true,
      }}
    />
  );
}