export interface ExecutionResult {
  isRunning: boolean;
  output: string;
  error: string;
  executionTime: number | null;
  memory: number | null;
}
