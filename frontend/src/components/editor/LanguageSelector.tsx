import { ChevronDown } from "lucide-react";
import type { Language } from "../../types/editor";

interface LanguageSelectorProps {
  languages: ReadonlyArray<{
    label: string;
    value: Language;
  }>;
  language: Language;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (language: Language) => void;
}

export default function LanguageSelector({
  languages,
  language,
  isOpen,
  onToggle,
  onSelect,
}: LanguageSelectorProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-mono font-medium transition-all duration-200"
      >
        {languages.find((l) => l.value === language)?.label}

        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl shadow-black/40 z-30 overflow-hidden py-1">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onSelect(lang.value)}
              className={[
                "w-full text-left px-3 py-2 text-xs font-mono transition-colors",
                lang.value === language
                  ? "text-violet-400 bg-violet-500/10"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              ].join(" ")}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
