import { useState } from "react";
import { executeCode } from "../services/execution";
import {
  getExecutionLanguage,
} from "../utils/fileLanguage";
import type { ExecutionResult } from "../types/execution";
import type { FileNode } from "../lib/fileTree";


export function useCodeExecution() {

  const [execution, setExecution] =
    useState<ExecutionResult>({
      isRunning: false,
      output: "",
      error: "",
      executionTime: null,
      memory: null,
    });

  async function run(
    activeFile: FileNode | null,
    stdin: string
  ) {

    setExecution({
      isRunning: true,
      output: "",
      error: "",
      executionTime: null,
      memory: null,
    });

    try {

      if (!activeFile) {
        throw new Error(
          "No file is currently open."
        );
      }

      const language =
        getExecutionLanguage(
          activeFile.name
        );

      if (!language) {
        throw new Error(
          `Cannot execute "${activeFile.name}".`
        );
      }

      const result =
        await executeCode({
          language,
          code: activeFile.content ?? "",
          stdin,
        });

      setExecution({
        isRunning: false,
        output: result.stdout ?? "",
        error:
          result.stderr ??
          result.compile_output ??
          result.message ??
          "",
        executionTime: result.time
          ? Number(result.time)
          : null,
        memory: result.memory,
      });

    } catch (err) {

      setExecution({
        isRunning: false,
        output: "",
        error:
          err instanceof Error
            ? err.message
            : "Execution failed",
        executionTime: null,
        memory: null,
      });

    }

  }

  return {
    execution,
    run,
  };

}