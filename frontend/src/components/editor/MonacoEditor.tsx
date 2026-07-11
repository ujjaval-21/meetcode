import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
}

export default function MonacoEditor({
  code,
  language,
  onChange,
}: MonacoEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={(value) => {
        const newCode = value ?? "";
        onChange(newCode);
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