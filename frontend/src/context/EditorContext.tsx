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
import type { Language } from "../types/editor";

interface EditorContextType {
  language: Language;
  theme: string;
  fontSize: number;
  stdin: string;

  setLanguage: Dispatch<SetStateAction<Language>>;
  setTheme: Dispatch<SetStateAction<string>>;
  setFontSize: Dispatch<SetStateAction<number>>;
  setStdin: Dispatch<SetStateAction<string>>;
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

  const [language, setLanguage] = useState<Language>("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(15);
  const [stdin, setStdin] = useState("");

  return (
    <EditorContext.Provider
      value={{
        language,
        theme,
        fontSize,
        stdin,
        
        setLanguage,
        setTheme,
        setFontSize,
        setStdin,
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