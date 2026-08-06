import RunButton from "./RunButton";
import LanguageSelector from "./LanguageSelector";
import type { Language } from "../../types/editor";

interface EditorToolbarProps {
  languages: ReadonlyArray<{
    label: string;
    value: Language;
  }>;
  language: Language;
  langOpen: boolean;
  setLangOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLanguage: (language: Language) => void;
  onRun: () => void;
  isRunning: boolean;
}

export default function EditorToolbar({
  languages,
  language,
  langOpen,
  setLangOpen,
  setLanguage,
  onRun,
  isRunning,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <LanguageSelector
        languages={languages}
        language={language}
        isOpen={langOpen}
        onToggle={() => setLangOpen((v) => !v)}
        onSelect={(selectedLanguage) => {
          setLanguage(selectedLanguage);
          setLangOpen(false);
        }}
      />

      <RunButton
        onRun={onRun}
        isRunning={isRunning}
      />
    </div>
  );
}
