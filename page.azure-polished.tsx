"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  Cpu,
  Database,
  Download,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  LineChart,
  Loader2,
  Lock,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low";
type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  impact: string;
  recommendation: string;
  owner?: string;
  savings?: number;
};
type RunState = "idle" | "running" | "complete" | "error";

type AuditResult = {
  score: number;
  resources: number;
  issues: number;
  savings: number;
  findings: Finding[];
  report: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const sampleFindings: Finding[] = [
  {
    id: "AZ-001",
    severity: "high",
    title: "Oversized compute instances",
    detail: "CPU and memory utilization stay below expected baselines for several workloads.",
    impact: "Estimated monthly waste: €1,420.",
    recommendation: "Right-size VM instances and add utilization review gates before provisioning.",
    owner: "platform",
    savings: 1420,
  },
  {
    id: "AZ-002",
    severity: "medium",
    title: "Unused storage resources",
    detail: "Detached or stale storage resources were detected in operational inventory.",
    impact: "Estimated monthly waste: €820.",
    recommendation: "Introduce lifecycle tagging and cleanup automation for stale volumes.",
    owner: "cloud-ops",
    savings: 820,
  },
  {
    id: "AZ-003",
    severity: "high",
    title: "Missing alert coverage",
    detail: "Terraform configuration does not define alerting for some critical infrastructure paths.",
    impact: "Operational risk: issues may remain invisible until user impact.",
    recommendation: "Add alert policies for availability, saturation, and failure-rate indicators.",
    owner: "sre",
    savings: 540,
  },
  {
    id: "AZ-004",
    severity: "low",
    title: "Tagging inconsistency",
    detail: "Some resources do not include owner, environment, and cost-center tags.",
    impact: "Reduced cost attribution and weaker governance.",
    recommendation: "Apply tag validation policy in CI and Terraform modules.",
    owner: "governance",
    savings: 460,
  },
];

const telemetry = {
  monthlyCost: 600,
  cpuUsed: 1,
  cpuTotal: 8,
  memoryUsed: 16,
  memoryTotal: 16,
  diskFree: 2250,
  diskTotal: 2500,
  bandwidth: 10,
};

const recentRuns = [
  { env: "Production", time: "May 10, 20:40", status: "Completed", score: 82 },
  { env: "Staging", time: "May 10, 09:15", status: "Completed", score: 74 },
  { env: "Development", time: "May 09, 16:45", status: "Completed", score: 69 },
];

const costTrend = [74, 68, 72, 61, 55, 63, 59, 70, 78];

const severityStyle: Record<Severity, string> = {
  critical: "border-red-400/35 bg-red-400/10 text-red-200",
  high: "border-orange-400/35 bg-orange-400/10 text-orange-200",
  medium: "border-yellow-400/35 bg-yellow-400/10 text-yellow-200",
  low: "border-green-400/35 bg-green-400/10 text-green-200",
};

function now() {
  return new Date().toISOString().substring(11, 19) + "Z";
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Pill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "purple" | "green" | "amber" }) {
  const tones = {
    blue: "border-cyan-400/35 bg-cyan-400/10 text-cyan-200",
    purple: "border-purple-400/35 bg-purple-400/10 text-purple-200",
    green: "border-green-400/30 bg-green-400/10 text-green-200",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  };
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs ${tones[tone]}`}>{children}</span>;
}

function MetricCard({ label, value, icon, tone, sub }: { label: string; value: string; icon: React.ReactNode; tone: string; sub?: string }) {
  return (
    <div className="min-h-[94px] rounded-2xl border border-white/10 bg-[#111827]/70 p-4 shadow-xl transition hover:border-cyan-400/25 hover:shadow-[0_0_28px_rgba(0,212,255,.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</span>
        <span className={tone}>{icon}</span>
      </div>
      <div className="mt-4 font-mono text-[28px] font-black leading-none tracking-tight text-white">{value}</div>
      {sub && <div className="mt-2 text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

function AgentNode({ icon, title, subtitle, active }: { icon: React.ReactNode; title: string; subtitle: string; active?: boolean }) {
  return (
    <div className={`relative rounded-2xl border p-4 text-center transition-all ${active ? "border-cyan-300/60 bg-cyan-400/15 shadow-[0_0_36px_rgba(0,212,255,.18)]" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">{icon}</div>
      <div className="font-mono text-sm font-bold uppercase tracking-[0.08em] text-slate-100">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400"><span>{label}</span><span>{value}%</span></div>
      <div className="h-2 rounded-full bg-slate-800"><div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function TrendChart({ data }: { data: number[] }) {
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - v}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-32 w-full overflow-visible">
      <defs>
        <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(148,163,184,.12)" strokeWidth="0.5" />)}
      <polyline fill="none" stroke="url(#line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <polyline fill="rgba(0,212,255,.10)" stroke="none" points={`0,100 ${points} 100,100`} />
    </svg>
  );
}

function Donut({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,.08)" strokeWidth="12" fill="none" />
        <circle cx="50" cy="50" r="36" stroke="#00D4FF" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-black text-white">{score}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Health</div>
      </div>
    </div>
  );
}

export default function AzureOptimizerDashboard() {
  const [state, setState] = useState<RunState>("idle");
  const [logs, setLogs] = useState<string[]>([
    `${now()} console ready · azure_optimizer_ui=2.1`,
    `${now()} demo telemetry loaded · source=terraform+metrics`,
  ]);
  const [result, setResult] = useState<AuditResult>({
    score: 78,
    resources: 142,
    issues: 28,
    savings: 3240,
    findings: sampleFindings,
    report:
      "Azure Optimizer identified oversized compute, stale storage, alerting gaps, and tagging inconsistency. Recommended actions include right-sizing workloads, lifecycle cleanup automation, observability guardrails, and CI-based Terraform policy checks.",
  });
  const [activeTab, setActiveTab] = useState<"overview" | "findings" | "report">("overview");

  const severityCounts = useMemo(() => {
    return result.findings.reduce<Record<Severity, number>>((acc, f) => {
      acc[f.severity] += 1;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });
  }, [result.findings]);

  async function runAudit() {
    if (state === "running") return;
    setState("running");
    setLogs([`${now()} run started · source=terraform+metrics`, `${now()} configuration_agent queued`]);

    const steps = [
      "configuration_agent parsing Terraform resources",
      "metric_agent loading operational telemetry",
      "supervisor_agent correlating config + metrics",
      "report_agent generating optimization summary",
    ];

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 550));
      setLogs((prev) => [...prev, `${now()} ${step}`]);
    }

    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/audit`, { method: "POST" });
        if (response.ok) setResult(await response.json());
      } catch {
        setLogs((prev) => [...prev, `${now()} backend unavailable · keeping demo output`]);
      }
    }

    setLogs((prev) => [...prev, `${now()} audit complete · findings=${result.findings.length}`, `${now()} report ready · downloadable_json=true`]);
    setState("complete");
  }

  const reportJson = JSON.stringify({ result, telemetry, recentRuns }, null, 2);

  return (
    <main className="min-h-screen overflow-hidden bg-az-bg-deep text-az-fg azure-grid">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_8%,rgba(0,212,255,0.20),transparent_30%),radial-gradient(circle_at_30%_55%,rgba(139,92,246,0.15),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0),#050814_92%)]" />

      <div className="relative mx-auto max-w-[1500px] px-6 py-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(0,212,255,.15)]"><Cloud size={24} /></div>
            <div>
              <div className="font-mono text-sm uppercase tracking-[0.2em] text-slate-500">Azure Optimizer</div>
              <div className="text-sm text-slate-400">Multi-agent infrastructure analysis</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Pill tone="green"><span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e]" /> UI Online</Pill>
            <Pill tone="purple"><Sparkles size={13} /> AI-assisted reporting</Pill>
          </div>
        </header>

        <section className="panel-glow relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-[#07111f]/95 via-[#070a18]/95 to-[#02040a]/98 p-6 lg:p-8">
          <div className="absolute right-[-120px] top-[-140px] h-[380px] w-[380px] rounded-full border border-cyan-400/20 bg-cyan-400/5 blur-sm" />
          <div className="absolute bottom-[-160px] left-[30%] h-[360px] w-[360px] rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[0.9fr_1.32fr]">
            <div className="space-y-6">
              <div>
                <Pill><Terminal size={13} /> &gt;_ Multi-Agent Infrastructure Analysis</Pill>
                <h1 className="glow-text mt-6 text-6xl font-black leading-[0.92] tracking-tight md:text-7xl">Azure<br /><span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">Optimizer</span></h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">AI-powered multi-agent system that reviews Terraform configurations and operational metrics to detect drift, waste, and optimization opportunities — delivering actionable infrastructure reports.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Bot className="mb-3 text-cyan-300" /><h3 className="font-bold text-white">Multi-Agent Analysis</h3><p className="mt-1 text-sm text-slate-400">Specialized agents coordinate infrastructure review.</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><Code2 className="mb-3 text-purple-300" /><h3 className="font-bold text-white">Terraform Inspection</h3><p className="mt-1 text-sm text-slate-400">Finds misconfiguration and missing guardrails.</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><LineChart className="mb-3 text-green-300" /><h3 className="font-bold text-white">Cost & Usage Metrics</h3><p className="mt-1 text-sm text-slate-400">Identifies waste and underutilized resources.</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><FileText className="mb-3 text-amber-300" /><h3 className="font-bold text-white">AI Reporting</h3><p className="mt-1 text-sm text-slate-400">Produces audit-style recommendations.</p></div>
              </div>

              <div className="flex flex-wrap gap-2">{["Python", "React", "Next.js", "Anthropic API", "Terraform", "SQLite", "Multi-Agent"].map((tech, index) => <Pill key={tech} tone={index % 2 ? "purple" : "blue"}>&gt;_ {tech}</Pill>)}</div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.42fr_1fr]">
              <div className="space-y-4 self-center">
                <AgentNode icon={<GitBranch size={20} />} title="Terraform Configs" subtitle="IaC source" />
                <AgentNode icon={<Activity size={20} />} title="Operational Metrics" subtitle="Cost + usage" />
                <AgentNode icon={<Bot size={20} />} title="Supervisor Agent" subtitle="Correlation" active={state === "running"} />
                <div className="grid grid-cols-2 gap-3"><AgentNode icon={<Cpu size={18} />} title="Config Agent" subtitle="Policy" /><AgentNode icon={<Gauge size={18} />} title="Metrics Agent" subtitle="Waste" /></div>
                <AgentNode icon={<FileText size={20} />} title="AI Report" subtitle="Recommendations" active={state === "complete"} />
              </div>

              <div className="rounded-[1.75rem] border border-cyan-400/20 bg-[#081120]/95 p-4 shadow-[0_0_70px_rgba(0,212,255,.13)]">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 font-bold"><Cloud className="text-cyan-300" size={20} /> Azure Optimizer Console</div>
                  <span className="rounded-full border border-green-400/25 bg-green-400/10 px-3 py-1 font-mono text-xs text-green-200">ACTIVE</span>
                </div>

                <div className="mb-4 flex gap-2">
                  {(["overview", "findings", "report"] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-cyan-400/15 text-cyan-200" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}>{tab}</button>)}
                </div>

                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <MetricCard label="Resources" value={`${result.resources}`} icon={<Server size={17} />} tone="text-cyan-300" sub="tracked" />
                      <MetricCard label="Savings" value={`€${result.savings.toLocaleString()}`} icon={<Zap size={17} />} tone="text-green-300" sub="monthly" />
                      <MetricCard label="Issues" value={`${result.issues}`} icon={<AlertTriangle size={17} />} tone="text-red-300" sub="open" />
                      <MetricCard label="Health" value={`${result.score}/100`} icon={<ShieldCheck size={17} />} tone="text-green-300" sub="score" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Optimization Overview</h3><Layers3 size={16} className="text-slate-500" /></div>
                        <div className="grid grid-cols-[112px_1fr] items-center gap-4">
                          <Donut score={result.score} />
                          <div className="space-y-3">
                            <MiniBar label="Compute right-sizing" value={78} color="bg-cyan-400" />
                            <MiniBar label="Storage cleanup" value={64} color="bg-purple-400" />
                            <MiniBar label="Alert coverage" value={52} color="bg-orange-400" />
                            <MiniBar label="Tag governance" value={41} color="bg-green-400" />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Top Recommendations</h3><span className="text-xs text-cyan-300">View all →</span></div>
                        <div className="space-y-2">
                          {result.findings.map((f) => (
                            <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm">
                              <span className="truncate text-slate-300">{f.title}</span>
                              <span className="font-mono text-green-300">€{(f.savings ?? 0).toLocaleString()}/mo</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Recent Analysis</h3><span className="text-xs text-slate-500">last runs</span></div>
                        <div className="space-y-2">{recentRuns.map((run) => <div key={run.env} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-xs"><div><div className="font-semibold text-slate-200">{run.env}</div><div className="text-slate-500">{run.time}</div></div><div className="text-right"><div className="text-green-300">{run.status}</div><div className="font-mono text-slate-300">{run.score}/100</div></div></div>)}</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Infrastructure Health</h3><span className="text-xs text-slate-500">trend</span></div>
                        <TrendChart data={costTrend} />
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Telemetry</h3><span className="text-xs text-slate-500">sample metrics</span></div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-black/20 p-3"><div className="text-slate-500">CPU</div><div className="font-mono text-white">{telemetry.cpuUsed}/{telemetry.cpuTotal} cores</div></div>
                          <div className="rounded-xl bg-black/20 p-3"><div className="text-slate-500">Memory</div><div className="font-mono text-white">{telemetry.memoryUsed}/{telemetry.memoryTotal} GB</div></div>
                          <div className="rounded-xl bg-black/20 p-3"><div className="text-slate-500">Disk free</div><div className="font-mono text-white">{telemetry.diskFree} GB</div></div>
                          <div className="rounded-xl bg-black/20 p-3"><div className="text-slate-500">Network</div><div className="font-mono text-white">{telemetry.bandwidth}% used</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "findings" && (
                  <div className="max-h-[560px] space-y-3 overflow-auto pr-1">
                    {result.findings.map((f) => <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="mb-2 flex items-center justify-between gap-3"><h3 className="font-bold text-white">{f.title}</h3><span className={`rounded-full border px-2 py-1 font-mono text-[10px] uppercase ${severityStyle[f.severity]}`}>{f.severity}</span></div><p className="text-sm leading-6 text-slate-400">{f.detail}</p><div className="mt-3 grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-red-400/15 bg-red-400/5 p-3 text-sm text-red-100"><b>Impact:</b> {f.impact}</div><div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-3 text-sm text-cyan-100"><b>Recommendation:</b> {f.recommendation}</div></div></div>)}
                  </div>
                )}

                {activeTab === "report" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-4 text-sm leading-7 text-slate-200">{result.report}</div>
                    <pre className="max-h-[390px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-6 text-cyan-100">{reportJson}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-xl font-black">Run Infrastructure Audit</h2><p className="mt-1 text-sm text-slate-500">Demo UI by default; connect backend through NEXT_PUBLIC_API_BASE.</p></div>
              <button onClick={runAudit} disabled={state === "running"} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-3 font-bold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60">{state === "running" ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />} Run Audit</button>
            </div>
            <div className="max-h-[205px] overflow-auto rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-xs leading-6 text-slate-300">{logs.map((log, i) => <div key={`${log}-${i}`}><span className="text-cyan-400">{">"}</span> {log}</div>)}</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-xl font-black">Export Bundle</h2><p className="mt-1 text-sm text-slate-500">Portfolio-ready outputs for audit handoff.</p></div>
              <button onClick={() => downloadText("azure_optimizer_report.json", reportJson)} className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/35 bg-purple-400/10 px-4 py-3 font-bold text-purple-100 transition hover:bg-purple-400/20"><Download size={18} /> JSON</button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4"><Database className="mb-3 text-cyan-300" /><b>Structured Findings</b><p className="mt-1 text-sm text-slate-400">JSON-ready issue details.</p></div>
              <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-4"><CheckCircle2 className="mb-3 text-green-300" /><b>Action Plan</b><p className="mt-1 text-sm text-slate-400">Prioritized remediation steps.</p></div>
              <div className="rounded-2xl border border-purple-400/20 bg-purple-400/5 p-4"><Lock className="mb-3 text-purple-300" /><b>Audit Trail</b><p className="mt-1 text-sm text-slate-400">Agent and report history.</p></div>
            </div>
          </div>
        </section>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm text-slate-500">
          <span>Azure Optimizer · Multi-Agent Infrastructure Analysis</span>
          <span className="inline-flex items-center gap-1">Built by ZtotheZ <ChevronRight size={14} /> Python · React · AI Workflows</span>
        </footer>
      </div>
    </main>
  );
}
