import type { Language } from "../types/editor";

const API_BASE_URL = "http://localhost:8000";

const LANGUAGE_MAP: Record<Language, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  go: 60,
  rust: 73,
};

export interface ExecuteRequest {
  code: string;
  language: Language;
  stdin?: string;
}

export interface ExecuteResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: string;
  time: string | null;
  memory: number | null;
}

export async function executeCode(
  payload: ExecuteRequest
): Promise<ExecuteResponse> {
  const response = await fetch(
    `${API_BASE_URL}/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: payload.code,
        language_id: LANGUAGE_MAP[payload.language],
        stdin: payload.stdin ?? "",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to execute code.");
  }

  return response.json();
}