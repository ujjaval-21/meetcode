import { useState } from "react";
import {
  Code2,
  Video,
  MessageSquare,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Menu,
  X,
  Users,
  Link,
  Terminal,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepCard {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ label }: { label: string }) {
  return (
    <a
      href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium tracking-wide"
    >
      {label}
    </a>
  );
}

function GradientBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300 mb-6">
      {children}
    </span>
  );
}

function FeatureCardItem({ icon, title, description }: FeatureCard) {
  return (
    <div className="group relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/40 hover:bg-slate-900/80 transition-all duration-300">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:border-violet-500/40 transition-colors duration-300">
          <div className="text-violet-400 group-hover:text-violet-300 transition-colors duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepCardItem({ step, icon, title, description }: StepCard) {
  return (
    <div className="relative flex flex-col items-center text-center group">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow duration-300">
          <div className="text-white">{icon}</div>
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
          <span className="text-xs font-bold text-violet-400">{step}</span>
        </div>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}

function LanguagePill({ name }: { name: string }) {
  return (
    <span className="px-4 py-2 rounded-full bg-slate-900 border border-slate-700 text-sm font-mono text-slate-300 hover:border-violet-500/50 hover:text-violet-300 hover:bg-slate-800 transition-all duration-200 cursor-default">
      {name}
    </span>
  );
}

// ─── Fake Code Editor ─────────────────────────────────────────────────────────

function CodeEditorPreview() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      {/* Glow behind editor */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-3xl blur-2xl" />

      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/60 border border-slate-700/50">
            <Terminal className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-mono text-slate-400">solution.ts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">2 online</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-slate-800 bg-slate-950/50">
          {["solution.ts", "utils.ts", "types.ts"].map((tab, i) => (
            <button
              key={tab}
              className={[
                "px-4 py-2 text-xs font-mono transition-colors",
                i === 0
                  ? "text-white border-b-2 border-violet-500 bg-slate-900/60"
                  : "text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Code area */}
        <div className="p-4 font-mono text-xs leading-6 overflow-hidden">
          <div className="flex gap-4">
            {/* Line numbers */}
            <div className="flex flex-col text-slate-600 select-none text-right min-w-[1.5rem]">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            {/* Code */}
            <div className="flex flex-col overflow-hidden">
              <span><span className="text-violet-400">function</span> <span className="text-blue-300">twoSum</span><span className="text-slate-300">(</span><span className="text-orange-300">nums</span><span className="text-slate-400">: number[], </span><span className="text-orange-300">target</span><span className="text-slate-400">: number</span><span className="text-slate-300">)</span> <span className="text-slate-300">{"{"}</span></span>
              <span><span className="text-slate-500">  {"// "}</span><span className="text-slate-500">Use a hash map for O(n)</span></span>
              <span><span className="text-violet-400">  const</span> <span className="text-blue-300">map</span> <span className="text-slate-300">= </span><span className="text-violet-400">new</span> <span className="text-green-300">Map</span><span className="text-slate-300">&lt;</span><span className="text-blue-300">number</span><span className="text-slate-300">, </span><span className="text-blue-300">number</span><span className="text-slate-300">&gt;();</span></span>
              <span>&nbsp;</span>
              <span><span className="text-violet-400">  for</span> <span className="text-slate-300">(</span><span className="text-violet-400">let</span> <span className="text-orange-300">i</span> <span className="text-slate-300">= </span><span className="text-green-300">0</span><span className="text-slate-300">; </span><span className="text-orange-300">i</span> <span className="text-slate-300">&lt; </span><span className="text-blue-300">nums</span><span className="text-slate-300">.</span><span className="text-blue-300">length</span><span className="text-slate-300">; </span><span className="text-orange-300">i</span><span className="text-slate-300">++) {"{"}</span></span>
              <span><span className="text-violet-400">    const</span> <span className="text-blue-300">complement</span> <span className="text-slate-300">= </span><span className="text-orange-300">target</span> <span className="text-slate-300">- </span><span className="text-blue-300">nums</span><span className="text-slate-300">[</span><span className="text-orange-300">i</span><span className="text-slate-300">];</span></span>
              <span><span className="text-violet-400">    if</span> <span className="text-slate-300">(</span><span className="text-blue-300">map</span><span className="text-slate-300">.</span><span className="text-green-300">has</span><span className="text-slate-300">(</span><span className="text-blue-300">complement</span><span className="text-slate-300">)) {"{"}</span></span>
              <span><span className="text-violet-400">      return</span> <span className="text-slate-300">[</span><span className="text-blue-300">map</span><span className="text-slate-300">.</span><span className="text-green-300">get</span><span className="text-slate-300">(</span><span className="text-blue-300">complement</span><span className="text-slate-300">)</span><span className="text-slate-300">, </span><span className="text-orange-300">i</span><span className="text-slate-300">];</span></span>
              <span><span className="text-slate-300">    {"}"}</span></span>
              <span><span className="text-blue-300">    map</span><span className="text-slate-300">.</span><span className="text-green-300">set</span><span className="text-slate-300">(</span><span className="text-blue-300">nums</span><span className="text-slate-300">[</span><span className="text-orange-300">i</span><span className="text-slate-300">], </span><span className="text-orange-300">i</span><span className="text-slate-300">);</span></span>
              <span><span className="text-slate-300">  {"}"}</span></span>
              <span><span className="text-slate-300">{"}"}</span></span>
              {/* Cursor blink line */}
              <span className="flex items-center gap-0">
                <span className="text-slate-300">&nbsp;&nbsp;</span>
                <span className="inline-block w-2 h-4 bg-violet-400 opacity-80 animate-pulse" />
              </span>
            </div>
          </div>
        </div>

        {/* Collaborator avatars + status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["A", "B"].map((letter, i) => (
                <div
                  key={i}
                  className={[
                    "w-6 h-6 rounded-full border-2 border-slate-950 flex items-center justify-center text-xs font-bold",
                    i === 0 ? "bg-violet-500 text-white" : "bg-blue-500 text-white",
                  ].join(" ")}
                >
                  {letter}
                </div>
              ))}
            </div>
            <span className="text-xs text-slate-500">alex is editing line 8</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>TypeScript</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section wrappers ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center mb-4">
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300 uppercase tracking-widest">
        {children}
      </span>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: FeatureCard[] = [
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "Live Code Editor",
    description: "Real-time collaborative editing with syntax highlighting, multi-cursor support, and zero lag.",
  },
  {
    icon: <Video className="w-5 h-5" />,
    title: "Voice & Video",
    description: "Built-in voice and video calls so you can talk through problems without leaving your editor.",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Persistent Chat",
    description: "Room-scoped chat that stays across sessions. Share snippets, links, and feedback instantly.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant Rooms",
    description: "Spin up a coding room in one click. No sign-up required for guests — just share the link.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Multi-language",
    description: "Full support for 20+ languages with intelligent autocomplete and real execution environments.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Private Rooms",
    description: "Password-protected rooms for interviews, team sprints, or any session you want to keep closed.",
  },
];

const STEPS: StepCard[] = [
  {
    step: 1,
    icon: <Terminal className="w-6 h-6" />,
    title: "Create a Room",
    description: "Open a new coding room in seconds. Choose your language and editor settings upfront.",
  },
  {
    step: 2,
    icon: <Link className="w-6 h-6" />,
    title: "Share the Link",
    description: "Copy the unique room URL and share it with anyone. They join instantly — no account needed.",
  },
  {
    step: 3,
    icon: <Users className="w-6 h-6" />,
    title: "Code Together",
    description: "Collaborate live with shared cursors, voice chat, and a persistent conversation thread.",
  },
];

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust"];

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg font-mono tracking-tight">MeetCode</span>
          </a>

          {/* Center nav — desktop */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink label="Features" />
            <NavLink label="How it Works" />
            <NavLink label="Languages" />
          </div>

          {/* Right buttons — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all duration-200"
            >
              Login
            </a>
            <a
              href="/signup"
              className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-200"
            >
              Sign Up
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-4">
            {["Features", "How it Works", "Languages"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-slate-400 hover:text-white transition-colors py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-slate-800">
              <a href="/login" className="flex-1 text-sm font-medium text-center text-slate-300 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-lg transition-colors">
                Login
              </a>
              <a href="/signup" className="flex-1 text-sm font-semibold text-center bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-2 rounded-lg">
                Sign Up
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <GradientBadge>
              <Zap className="w-3 h-3" />
              Real-time collaboration, reimagined
            </GradientBadge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Code together,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ship faster.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
              MeetCode is the collaborative IDE for teams and pairs. Spin up a shared coding room
              in seconds, write code together in real-time, and ship without the friction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold hover:bg-slate-800/50 transition-all duration-200"
              >
                Try without account
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {["V", "J", "K", "M", "R"].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `hsl(${240 + i * 25}, 70%, 55%)`,
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Loved by <span className="text-slate-300 font-medium">12,000+</span> engineers</p>
              </div>
            </div>
          </div>

          {/* Right — code editor */}
          <div className="lg:flex lg:justify-end">
            <CodeEditorPreview />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything your team needs
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A complete collaboration toolkit built into a single, fast interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <FeatureCardItem key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionLabel>How it Works</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Up and running in seconds
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              No setup. No configuration. Just open, share, and code.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-16 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-violet-500/30" />
            {STEPS.map((step) => (
              <StepCardItem key={step.step} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages ── */}
      <section id="languages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <SectionLabel>Languages</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Code in your language
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            First-class support for the languages you already use.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {LANGUAGES.map((lang) => (
            <LanguagePill key={lang} name={lang} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/60 to-blue-900/60 border border-violet-700/30 p-12 md:p-16 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/10 text-white/70 mb-6 uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              Free to start
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Start coding with your<br />team today
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-lg mx-auto">
              No credit card. No setup. Just you, your team, and the code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 shadow-lg shadow-black/20 transition-all duration-200 group"
              >
                Create free account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Try a live demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold font-mono text-white">MeetCode</span>
          </a>

          {/* Links */}
          <div className="flex items-center gap-6">
            {["Privacy", "Terms"].map((label) => (
              <a
                key={label}
                href={`/${label.toLowerCase()}`}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="GitHub"
            >
            </a>
          </div>

          <p className="text-xs text-slate-600 font-mono">
            © {new Date().getFullYear()} MeetCode
          </p>
        </div>
      </footer>
    </div>
  );
}