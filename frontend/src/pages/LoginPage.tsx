import { useState } from "react";
import { Link } from "react-router-dom";

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
  } else if (fields.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
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
    // Connect your auth logic here
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
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

        <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl px-8 pt-10 pb-8 shadow-2xl shadow-black/60">

          {/* Logo & Title */}
          <header className="flex flex-col items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-lime-500 shadow-lg shadow-lime-500/30">
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
                MeetCode
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Collaborative coding, together.
              </p>
            </div>
          </header>

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
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={form.identifier}
                  onChange={handleChange}
                  aria-invalid={!!errors.identifier}
                  aria-describedby={
                    errors.identifier ? "identifier-error" : undefined
                  }
                  className={[
                    "w-full rounded-lg bg-zinc-800 border px-3.5 py-2.5 text-sm text-white placeholder-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                    errors.identifier
                      ? "border-red-500"
                      : "border-zinc-700 hover:border-zinc-600",
                  ].join(" ")}
                />
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
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={[
                      "w-full rounded-lg bg-zinc-800 border px-3.5 py-2.5 pr-11 text-sm text-white placeholder-zinc-500",
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  "w-full mt-1 rounded-lg bg-lime-500 hover:bg-lime-400 text-zinc-900 font-semibold text-sm py-2.5 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:ring-offset-2 focus:ring-offset-zinc-900",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 font-mono">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-zinc-500">
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