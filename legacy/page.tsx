export default function AzureOptimizerHero() {
  return (
    <main className="min-h-screen bg-[#050814] text-white p-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#07111f] via-[#070a18] to-[#02040a] p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(0,212,255,0.18),transparent_35%),radial-gradient(circle_at_35%_70%,rgba(139,92,246,0.14),transparent_35%)]" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 font-mono">
              &gt;_ Multi-Agent Infrastructure Analysis
            </div>

            <h1 className="mt-6 text-6xl font-black tracking-tight">
              Azure <span className="text-cyan-400">Optimizer</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-300 leading-relaxed">
              AI-powered multi-agent system that reviews Terraform configurations
              and operational metrics to detect drift, waste, and optimization
              opportunities.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl">
              {[
                ["Terraform", "Config inspection"],
                ["Metrics", "Cost & usage analysis"],
                ["Supervisor Agent", "Coordinates workflow"],
                ["AI Report", "Actionable recommendations"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <h3 className="font-semibold text-cyan-300">{title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
              {["Python", "Anthropic API", "Streamlit", "Terraform", "SQLite"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-purple-200"
                  >
                    &gt;_ {tech}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-[#0b1220]/90 p-5 shadow-[0_0_60px_rgba(0,212,255,0.15)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-cyan-300">Azure Optimizer</h2>
              <span className="rounded-full bg-green-400/10 px-3 py-1 text-sm text-green-300">
                Active
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ["142", "Resources"],
                ["$3,240", "Potential Savings"],
                ["28", "Issues Found"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="mb-4 font-semibold">Agent Pipeline</h3>

              <div className="space-y-3 font-mono text-sm">
                {[
                  "Terraform configs → Configuration Agent",
                  "Operational metrics → Metrics Agent",
                  "Supervisor Agent → AI analysis",
                  "Anthropic API → Optimization report",
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-cyan-100"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="mb-3 font-semibold">Top Recommendations</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>Right-size VM instances — $1,420/mo</li>
                <li>Remove unused resources — $820/mo</li>
                <li>Optimize storage accounts — $540/mo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}