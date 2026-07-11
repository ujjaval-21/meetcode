import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface EditorContextType {
  code: string;
  language: string;
  theme: string;
  fontSize: number;

  setCode: Dispatch<SetStateAction<string>>;
  setLanguage: Dispatch<SetStateAction<string>>;
  setTheme: Dispatch<SetStateAction<string>>;
  setFontSize: Dispatch<SetStateAction<number>>;
}

const EditorContext = createContext<
  EditorContextType | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

export function EditorProvider({
  children,
}: Props) {
  const [code, setCode] = useState(
`function hello() {
  console.log("MeetCode 🚀");
}`
  );

  const [language, setLanguage] =
    useState("javascript");

  const [theme, setTheme] =
    useState("vs-dark");

  const [fontSize, setFontSize] =
    useState(15);

  return (
    <EditorContext.Provider
      value={{
        code,
        language,
        theme,
        fontSize,
        setCode,
        setLanguage,
        setTheme,
        setFontSize,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error(
      "useEditor must be used inside EditorProvider"
    );
  }

  return context;
}