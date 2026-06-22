import { useState } from "react";
import { Link } from "react-router-dom";

type FormField = "username" | "email" | "password" | "confirmPassword";

interface SignupFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldError {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(fields: SignupFormState): FieldError {
  const errors: FieldError = {};

  if (!fields.username.trim()) {
    errors.username = "Username is required.";
  } else if (fields.username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (!/^[a-zA-Z0-9_]+$/.test(fields.username)) {
    errors.username = "Only letters, numbers, and underscores allowed.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (fields.confirmPassword !== fields.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (score === 3) return { level: 3, label: "Good", color: "bg-lime-400" };
    return { level: 4, label: "Strong", color: "bg-lime-500" };
  };

  const { level, label, color } = getStrength();

  if (!password) return null;

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= level ? color : "bg-zinc-700",
            ].join(" ")}
          />
        ))}
      </div>
      <p className={`text-xs ${color.replace("bg-", "text-")}`}>{label}</p>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState<SignupFormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

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
    if (!agreedToTerms) {
      setTermsError("You must agree to the Terms of Service.");
    } else {
      setTermsError("");
    }
    if (Object.keys(validationErrors).length > 0 || !agreedToTerms) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    // Connect your auth/registration logic here
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
                Create your account to get started.
              </p>
            </div>
          </header>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} noValidate aria-label="Sign up form">
            <div className="flex flex-col gap-5">

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-medium text-zinc-300">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="cool_coder_42"
                  value={form.username}
                  onChange={handleChange}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                  className={[
                    "w-full rounded-lg bg-zinc-800 border px-3.5 py-2.5 text-sm text-white placeholder-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                    errors.username
                      ? "border-red-500"
                      : "border-zinc-700 hover:border-zinc-600",
                  ].join(" ")}
                />
                {errors.username && (
                  <p id="username-error" role="alert" className="text-xs text-red-400 mt-0.5">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={[
                    "w-full rounded-lg bg-zinc-800 border px-3.5 py-2.5 text-sm text-white placeholder-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                    errors.email
                      ? "border-red-500"
                      : "border-zinc-700 hover:border-zinc-600",
                  ].join(" ")}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-red-400 mt-0.5">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                <PasswordStrengthBar password={form.password} />
                {errors.password && (
                  <p id="password-error" role="alert" className="text-xs text-red-400 mt-0.5">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    className={[
                      "w-full rounded-lg bg-zinc-800 border px-3.5 py-2.5 pr-11 text-sm text-white placeholder-zinc-500",
                      "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                      errors.confirmPassword
                        ? "border-red-500"
                        : form.confirmPassword && form.confirmPassword === form.password
                        ? "border-lime-500"
                        : "border-zinc-700 hover:border-zinc-600",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? (
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
                  {/* Match checkmark */}
                  {form.confirmPassword && form.confirmPassword === form.password && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-lime-500 absolute right-9 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" role="alert" className="text-xs text-red-400 mt-0.5">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (e.target.checked) setTermsError("");
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-lime-500 focus:ring-lime-500/60 focus:ring-2 accent-lime-500 cursor-pointer"
                  />
                  <span className="text-sm text-zinc-400 leading-snug">
                    I agree to the{" "}
                    <Link to="/terms" className="text-lime-400 hover:text-lime-300 transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-lime-400 hover:text-lime-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {termsError && (
                  <p role="alert" className="text-xs text-red-400 ml-6">
                    {termsError}
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
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 font-mono">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-lime-400 font-medium hover:text-lime-300 transition-colors"
            >
              Sign In
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