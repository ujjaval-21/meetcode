import type { Language } from "../types/editor";

export type MonacoLanguage = string;

const MONACO_LANGUAGE_MAP: Record<string, MonacoLanguage> = {
  js: "javascript",
  jsx: "javascript",

  ts: "typescript",
  tsx: "typescript",

  py: "python",

  java: "java",

  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",

  c: "c",

  go: "go",

  rs: "rust",

  html: "html",
  htm: "html",

  css: "css",

  json: "json",

  md: "markdown",

  sql: "sql",

  xml: "xml",

  yaml: "yaml",
  yml: "yaml",

  sh: "shell",
  bash: "shell",

  txt: "plaintext",
};

const EXECUTION_LANGUAGE_MAP: Record<
  string,
  Language
> = {
  js: "javascript",
  jsx: "javascript",

  ts: "typescript",
  tsx: "typescript",

  py: "python",

  java: "java",

  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",

  go: "go",

  rs: "rust",
};

function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1];
}

export function getMonacoLanguage(
  filename: string
): MonacoLanguage {
  const extension = getExtension(filename);

  return (
    MONACO_LANGUAGE_MAP[extension] ??
    "plaintext"
  );
}

export function getExecutionLanguage(
  filename: string
): Language | null {
  const extension = getExtension(filename);

  return (
    EXECUTION_LANGUAGE_MAP[extension] ??
    null
  );
}

export function isExecutableFile(
  filename: string
): boolean {
  return getExecutionLanguage(filename) !== null;
}