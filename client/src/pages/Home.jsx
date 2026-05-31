import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] translate-y-1/2 pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/25">
              F
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              FreelanceBid
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 transition duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-8 animate-pulse">
              🚀 Empowering the Next Gen of Tech Talent
            </div>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              Bridging{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent">
                Student Talent
              </span>{" "}
              with Real-World Projects
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
              An elite freelance bidding portal designed exclusively for student developers to build outstanding portfolios, and for visionary companies to hire verified tech talent.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 hover:scale-105 transition transform duration-200"
              >
                Join as Student Developer
              </Link>
              <Link
                to="/register"
                className="rounded-2xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 px-8 py-4 text-base font-bold text-slate-300 hover:text-white transition duration-200"
              >
                Hire Student Talent
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-20 border-t border-slate-900 bg-slate-950/50 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Why Choose FreelanceBid?
              </h2>
              <p className="mt-4 text-slate-400">
                A premium platform designed from the ground up to solve standard freelancing challenges.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/30 p-8 hover:border-indigo-500/30 hover:bg-slate-900/55 transition duration-300 group">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition duration-300">
                  ⚡
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Smart Bidding</h3>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                  Students propose custom milestones, durations, and rates. Clients accept and lock details automatically in one click.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/30 p-8 hover:border-fuchsia-500/30 hover:bg-slate-900/55 transition duration-300 group">
                <div className="h-12 w-12 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition duration-300">
                  💎
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Milestone Tracking</h3>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                  Complete peace of mind. Projects are segmented into trackable milestones. Approve and mark payments directly through the portal.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-3xl border border-slate-800/60 bg-slate-900/30 p-8 hover:border-indigo-500/30 hover:bg-slate-900/55 transition duration-300 group">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition duration-300">
                  🔥
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Verified Portfolios</h3>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                  Every student profile comes with aggregated ratings, completed projects metrics, and beautiful code portfolios to build trust.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} FreelanceBid Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
