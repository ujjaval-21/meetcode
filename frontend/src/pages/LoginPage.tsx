import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { AxiosError } from "axios";
import { useGoogleAuth } from "../hooks/useGoogleAuth";


type FormField = "identifier" | "password";

interface LoginFormState {
  identifier: string;
  password: string;
}

interface FieldError {
  identifier?: string;
  password?: string;
}

function validate(fields: LoginFormState): FieldError {
  const errors: FieldError = {};
  if (!fields.identifier.trim()) {
    errors.identifier = "Email or username is required.";
  }
  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  return errors;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormState>({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const [serverError, setServerError] = useState("");
  const googleLogin = useGoogleAuth();
  
  
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as FormField]: value }));
    if (errors[name as FormField]) {
      setErrors((prev) => ({ ...prev, [name as FormField]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await login({
        identifier: form.identifier,
        password: form.password,
      });

      await auth.login();

      navigate("/dashboard");

    } catch (error) {

      if (error instanceof AxiosError) {
        setServerError(
            error.response?.data?.detail ||
            "Invalid username or password."
        );
      } else {
        setServerError("Something went wrong.");
      }

    } finally {
    setIsSubmitting(false);
  }
  }
  

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#a3e635 1px, transparent 1px), linear-gradient(90deg, #a3e635 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Glow accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative bg-zinc-950 border border-lime-500/20 rounded-2xl px-8 pt-10 pb-8 shadow-[0_0_80px_-20px_rgba(163,230,53,0.15)]">
          {/* Close button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Close"
            className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Logo & Title */}
          <header className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-lime-500 shadow-lg shadow-lime-500/30">
              {/* Code brackets icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-zinc-900"
                aria-hidden="true"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                Meet<span className="text-lime-400">Code</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Collaborative coding, together.
              </p>
            </div>
          </header>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={() => googleLogin()}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500">OR</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate aria-label="Login form">
            <div className="flex flex-col gap-5">

              {/* Email / Username */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="identifier"
                  className="text-sm font-medium text-zinc-300"
                >
                  Email or Username
                </label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your email or username"
                    value={form.identifier}
                    onChange={handleChange}
                    aria-invalid={!!errors.identifier}
                    aria-describedby={
                      errors.identifier ? "identifier-error" : undefined
                    }
                    className={[
                      "w-full rounded-lg bg-zinc-900 border pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500",
                      "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                      errors.identifier
                        ? "border-red-500"
                        : "border-zinc-700 hover:border-zinc-600",
                    ].join(" ")}
                  />
                </div>
                {errors.identifier && (
                  <p
                    id="identifier-error"
                    role="alert"
                    className="text-xs text-red-400 mt-0.5"
                  >
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-zinc-500 hover:text-lime-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={[
                      "w-full rounded-lg bg-zinc-900 border pl-9 pr-11 py-2.5 text-sm text-white placeholder-zinc-500",
                      "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                      errors.password
                        ? "border-red-500"
                        : "border-zinc-700 hover:border-zinc-600",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-xs text-red-400 mt-0.5"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {serverError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  "w-full mt-1 rounded-lg bg-lime-400 hover:bg-lime-300 text-zinc-900 font-semibold text-sm py-2.5 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:ring-offset-2 focus:ring-offset-zinc-950",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-zinc-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-lime-400 font-medium hover:text-lime-300 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-700 mt-6 font-mono">
          © {new Date().getFullYear()} MeetCode. All rights reserved.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}