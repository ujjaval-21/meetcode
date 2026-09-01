import { useGoogleLogin } from "@react-oauth/google";
import { AxiosError } from "axios";
import { googleLogin } from "../services/auth";

interface UseGoogleAuthOptions {
  onSuccess: () => void | Promise<void>;
  onError?: (message: string) => void;
}

export function useGoogleAuth({ onSuccess, onError }: UseGoogleAuthOptions) {
  return useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (codeResponse) => {
      try {
        await googleLogin(codeResponse.code);
        await onSuccess();
      } catch (error) {
        const message =
          error instanceof AxiosError
            ? error.response?.data?.detail ?? "Google sign-in failed."
            : "Something went wrong.";
        onError?.(message);
      }
    },

    onError: () => {
      onError?.("Google sign-in failed.");
    },
  });
}