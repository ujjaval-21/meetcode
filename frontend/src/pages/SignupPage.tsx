import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/auth";
import { AxiosError } from "axios";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAuth } from "../hooks/useAuth";


type FormField =
  | "username"
  | "email"
  | "password"
  | "confirmPassword";

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
  } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
  ) {
      errors.email = "Enter a valid email address.";
  }

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";

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

const features = [
  {
    title: "Real-time coding",
    description: "Code together in real-time with instant sync.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    title: "Pair Programming",
    description: "Seamless collaboration with your teammates.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Multi-language",
    description: "Support for 20+ programming languages.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Live Chat",
    description: "Built-in chat to discuss and solve problems together.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
];

interface SignupPageProps {
  onClose?: () => void;
}

export default function SignupPage({ onClose }: SignupPageProps) {
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
  const navigate = useNavigate();
  const auth = useAuth();
  const [serverError, setServerError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const googleLogin = useGoogleAuth({
    onSuccess: async () => {
      await auth.login();
      navigate("/dashboard");
    },
    onError: (message) => setServerError(message),
  });


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
    setServerError("");

    try {
      await signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      navigate("/login", {
        state: {
          success: "Account created successfully!"
        }
      });

    } catch (error) {

      if (error instanceof AxiosError) {
        setServerError(
          error.response?.data?.detail ??
          "Unable to create account."
        );
      } else {
          setServerError("Something went wrong.");
      }

    } finally {
      setIsSubmitting(false);
    }
  }



  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#a3e635 1px, transparent 1px), linear-gradient(90deg, #a3e635 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] rounded-2xl overflow-hidden border border-lime-500/20 bg-zinc-950 shadow-[0_0_80px_-20px_rgba(163,230,53,0.15)]">
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

        {/* Left panel */}
        <div className="relative hidden md:flex flex-col p-10 border-r border-zinc-800 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.08),transparent_60%)]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-500 shadow-lg shadow-lime-500/30 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 text-zinc-900"
                aria-hidden="true"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white font-mono mb-1">
              Meet<span className="text-lime-400">Code</span>
            </h1>
            <p className="text-zinc-500 mb-6">Collaborate. Code. Create.</p>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-lime-500/40 via-zinc-700 to-transparent mb-6" />

          <ul className="space-y-5">
            {features.map(({ icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime-500/10 text-lime-400">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-sm text-zinc-400 leading-snug">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Decorative illustration */}
          <div className="relative mt-auto pt-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
              <div className="flex gap-1.5 mb-2">
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-1/3 rounded bg-purple-400/70" />
                <div className="h-1.5 w-2/3 rounded bg-zinc-700" />
                <div className="h-1.5 w-1/4 rounded bg-lime-400/70" />
                <div className="h-1.5 w-1/2 rounded bg-pink-400/60" />
                <div className="h-1.5 w-2/5 rounded bg-zinc-700" />
                <div className="h-1.5 w-1/3 rounded bg-purple-400/50" />
              </div>
            </div>
            <div className="absolute -left-3 -bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/90 ring-4 ring-zinc-950">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="absolute -right-3 -bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 ring-4 ring-zinc-950">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-900" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-zinc-950">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              Create your account
            </h2>
            <p className="text-zinc-400 text-sm">
              Join MeetCode and start collaborating
            </p>
          </div>

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

          <form onSubmit={handleSubmit} noValidate aria-label="Sign up form">
            <div className="flex flex-col gap-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="text-sm font-medium text-zinc-300">
                    Username
                  </label>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Enter your username"
                      value={form.username}
                      onChange={handleChange}
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? "username-error" : undefined}
                      className={[
                        "w-full rounded-lg bg-zinc-900 border pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500",
                        "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                        errors.username
                          ? "border-red-500"
                          : "border-zinc-700 hover:border-zinc-600",
                      ].join(" ")}
                    />
                  </div>
                  {errors.username && (
                    <p id="username-error" role="alert" className="text-xs text-red-400 mt-0.5">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                    Email
                  </label>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" aria-hidden="true">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.28" />
                    </svg>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={[
                        "w-full rounded-lg bg-zinc-900 border pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500",
                        "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:border-lime-500 transition-colors",
                        errors.email
                          ? "border-red-500"
                          : "border-zinc-700 hover:border-zinc-600",
                      ].join(" ")}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" role="alert" className="text-xs text-red-400 mt-0.5">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    className={[
                      "w-full rounded-lg bg-zinc-900 border pl-9 pr-11 py-2.5 text-sm text-white placeholder-zinc-500",
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
                    className="mt-0.5 w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-lime-500 focus:ring-lime-500/60 focus:ring-2 accent-lime-500 cursor-pointer"
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
                  "w-full mt-1 rounded-lg bg-lime-400 hover:bg-lime-300 text-zinc-900 font-semibold text-sm py-3 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-lime-500/60 focus:ring-offset-2 focus:ring-offset-zinc-950",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-zinc-400 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-lime-400 font-medium hover:text-lime-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
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