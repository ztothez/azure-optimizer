"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart2,
  Box,
  CheckCircle2,
  ChevronRight,
  Cloud,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Zap,
  Terminal,
  Play,
  Loader2,
  Bot,
  Code2,
  LineChart,
  GitBranch,
  Activity,
  Cpu,
  Gauge,
  HardDrive,
  Network,
  Download,
  Lock,
  Database
} from "lucide-react";

// --- EXACT DATA FROM config.json & metrics.json ---
const appData = {
  summary: {
    resources: 142,
    monthlyCost: { currency: "EUR", amount: 600 },
    potentialSavings: { currency: "EUR", amount: 3240 },
    issuesFound: 28,
    healthScore: 78
  },
  telemetry: {
    cpuUsage: { usedCores: 1, availableCores: 8, utilizationPercent: 12.5 },
    memoryUsage: { usedGb: 16, totalGb: 16, utilizationPercent: 100 },
    diskUsage: { freeGb: 2250, totalGb: 2500, utilizationPercent: 10 },
    networkBandwidth: { utilizationPercent: 10 }
  },
  issueMix: [
    { severity: "Critical", count: 0, color: "#EF4444", bgClass: "bg-red-500" },
    { severity: "High", count: 2, color: "#F97316", bgClass: "bg-orange-500" },
    { severity: "Medium", count: 1, color: "#EAB308", bgClass: "bg-yellow-500" },
    { severity: "Low", count: 1, color: "#22C55E", bgClass: "bg-green-500" }
  ],
  findings: [
    {
      id: "AZ-CONFIG-001",
      severity: "High",
      source: "Terraform",
      title: "Missing backup policy on production resources",
      description: "Production resources should define backup coverage and recovery expectations.",
      recommendation: "Add backup configuration and document retention requirements."
    },
    {
      id: "AZ-METRIC-002",
      severity: "High",
      source: "Metrics",
      title: "Memory utilization at 100%",
      description: "Memory profile shows all available memory in use.",
      recommendation: "Review workload sizing, add memory headroom, or right-size the instance."
    },
    {
      id: "AZ-METRIC-003",
      severity: "Medium",
      source: "Metrics",
      title: "Low CPU utilization compared with provisioned cores",
      description: "Only 1 of 8 cores is currently used, suggesting possible over-provisioning.",
      recommendation: "Evaluate smaller compute profile or autoscaling policy."
    },
    {
      id: "AZ-GOV-004",
      severity: "Low",
      source: "Governance",
      title: "Tag governance coverage incomplete",
      description: "Tag governance score is below target for audit-ready resource ownership.",
      recommendation: "Require owner, environment, cost_center, and lifecycle tags."
    }
  ],
  topRecommendations: [
    { title: "Right-size VM instances", impact: "€1,420/mo", severity: "High" },
    { title: "Remove unused resources", impact: "€820/mo", severity: "High" },
    { title: "Optimize storage accounts", impact: "€540/mo", severity: "Medium" },
    { title: "Review networking costs", impact: "€460/mo", severity: "Low" }
  ],
  recentAnalysis: [
    { env: "Production Environment", time: "May 10, 2024 10:30 AM", status: "Completed", score: 82 },
    { env: "Staging Environment", time: "May 10, 2024 09:15 AM", status: "Completed", score: 74 },
    { env: "Dev Environment", time: "May 9, 2024 04:45 PM", status: "Completed", score: 69 },
  ],
  infrastructureHealth: [
    { date: "May 4", score: 92 }, { date: "May 5", score: 74 }, { date: "May 6", score: 79 },
    { date: "May 7", score: 58 }, { date: "May 8", score: 64 }, { date: "May 9", score: 72 }, { date: "May 10", score: 86 }
  ],
  exportBundle: [
    { name: "Structured Findings", description: "JSON-ready issue details.", icon: <Database className="text-blue-400 mb-3" size={24}/> },
    { name: "Action Plan", description: "Prioritized remediation steps.", icon: <CheckCircle2 className="text-green-400 mb-3" size={24}/> },
    { name: "Audit Trail", description: "Agent and report history.", icon: <Lock className="text-purple-400 mb-3" size={24}/> }
  ]
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function now() {
  return new Date().toISOString().substring(11, 19) + "Z";
}

// --- COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        active ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Pill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "purple" | "green" | "amber" | "red" }) {
  const tones = {
    blue: "border-blue-400/35 bg-blue-400/10 text-blue-300",
    purple: "border-purple-400/35 bg-purple-400/10 text-purple-300",
    green: "border-green-400/30 bg-green-400/10 text-green-300",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    red: "border-red-400/30 bg-red-400/10 text-red-300",
  };
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

function AgentNode({ icon, title, subtitle, active }: { icon: React.ReactNode; title: string; subtitle: string; active?: boolean }) {
  return (
    <div className={`relative rounded-2xl border p-4 text-center transition-all ${active ? "border-blue-500/60 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,.15)]" : "border-slate-800/60 bg-[#0F172A]"}`}>
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-400">{icon}</div>
      <div className="font-mono text-sm font-bold uppercase tracking-[0.08em] text-slate-200 truncate">{title}</div>
      <div className="mt-1 text-xs text-slate-500 truncate">{subtitle}</div>
    </div>
  );
}

function DonutChart({ total, items }: { total: number; items: typeof appData.issueMix }) {
  // Using actual counts from issueMix (which sums to 4 in your json, though summary.issues is 28)
  // To avoid dividing by 0 if everything is 0, we sum it up:
  const chartTotal = items.reduce((acc, item) => acc + item.count, 0) || 1;
  let cumulativePercent = 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,.05)" strokeWidth="12" fill="none" />
        {items.map((item) => {
          if (item.count === 0) return null;
          const percent = item.count / chartTotal;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <circle
              key={item.severity}
              cx="50"
              cy="50"
              r={radius}
              stroke={item.color}
              strokeWidth="12"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={-strokeDashoffset}
              strokeLinecap="round"
              className="drop-shadow-md transition-all duration-1000"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-bold text-white">{total}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400">Total Issues</div>
      </div>
    </div>
  );
}

function TrendLineChart({ data }: { data: typeof appData.infrastructureHealth }) {
  const min = 0;
  const max = 100;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v.score - min) / (max - min)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-40 w-full pt-4">
      {/* Y-Axis Labels */}
      <div className="absolute inset-y-0 left-0 flex flex-col justify-between py-4 text-[10px] text-slate-500">
        <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
      </div>
      
      {/* Chart Area */}
      <div className="ml-6 h-full border-b border-l border-slate-700/50">
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,.03)" strokeWidth="0.5" />
          ))}
          <polyline fill="url(#areaGradient)" points={`0,100 ${points} 100,100`} />
          <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
          {data.map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((v.score - min) / (max - min)) * 100;
            return <circle key={i} cx={x} cy={y} r="1.5" fill="#3b82f6" className="drop-shadow-[0_0_4px_rgba(59,130,246,0.8)]" />;
          })}
        </svg>
        
        {/* X-Axis Labels */}
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          {data.map((d, i) => (
            <span key={i}>{d.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function AzureOptimizerLayout() {
  const [activeNav, setActiveNav] = useState("Overview");
  
  // Analysis State
  const [auditState, setAuditState] = useState<"idle" | "running" | "complete" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([
    `${now()} [SYSTEM] UI initialized. Ready for multi-agent analysis.`,
    `${now()} [SYSTEM] Connecting to backend data stores...`
  ]);
  const [reportText, setReportText] = useState<string>("");

  async function runAudit() {
    if (auditState === "running") return;
    setAuditState("running");
    setReportText("");
    setLogs([`${now()} [SUPERVISOR] Run started. Orchestrating agents...`]);

    const steps = [
      "[CONFIG AGENT] Reading infrastructure.tf...",
      "[CONFIG AGENT] Found missing cost_alerts and backup_alerts.",
      "[METRIC AGENT] Loading data/metrics.json...",
      "[METRIC AGENT] CPU: 12.5%, Memory: 100%. Emitting findings.",
      "[SUPERVISOR] Correlating configuration drift with operational waste...",
      "[SUPERVISOR] Prompting LLM (Claude) with combined context..."
    ];

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 600)); 
      setLogs((prev) => [...prev, `${now()} ${step}`]);
    }

    if (API_BASE) {
      try {
        const response = await fetch(`${API_BASE}/audit`, { method: "POST" });
        if (response.ok) {
           const result = await response.json();
           setReportText(result.report || "Audit complete.");
        }
      } catch {
        setLogs((prev) => [...prev, `${now()} [SYSTEM] Backend unavailable. Showing autonomous mock report.`]);
        setMockReport();
      }
    } else {
      setMockReport();
    }

    setLogs((prev) => [...prev, `${now()} [SYSTEM] Analysis complete. Output generated.`]);
    setAuditState("complete");
  }

  function setMockReport() {
    setReportText(`Based on the analysis of the infrastructure configuration and performance metrics, here are the key findings and recommendations:

**1. Critical: Memory Exhaustion on Web App**
The \`ztothez-app-service\` is currently at 100% memory utilization. 
*Recommendation:* Review the .NET application memory profile. Consider scaling up the \`ztothez-app-plan\` from \`P3v2\` or increasing the worker count to handle the load effectively.

**2. High: Missing Alerting Guardrails**
The Terraform configuration lacks \`azurerm_monitor_metric_alert\` resources.
*Recommendation:* Implement cost and saturation alerts immediately to prevent unexpected billing spikes and unnoticed downtime.

**3. High: Missing Backup Policies**
Critical resources are deployed without \`azurerm_backup_policy_vm\` or associated recovery vaults.
*Recommendation:* Ensure all stateful workloads are attached to a recovery services vault.

**4. Medium: Underutilized CPU / Storage**
While memory is saturated, CPU utilization across the cores remains very low (12.5%). Furthermore, disk usage is only at 10%. 
*Recommendation:* Depending on the workload, consider switching to a memory-optimized instance family rather than general compute to save costs while alleviating the memory bottleneck.`);
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "azure-optimizer-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/60 bg-[#0B1120] px-4 py-6 flex flex-col shrink-0">
        <div className="mb-10 flex items-center gap-3 px-2">
          <Cloud className="text-blue-400" size={28} />
          <span className="text-lg font-bold text-white tracking-wide">Azure Optimizer</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeNav === "Overview"} onClick={() => setActiveNav("Overview")} />
          <SidebarItem icon={<BarChart2 size={18} />} label="Analysis" active={activeNav === "Analysis"} onClick={() => setActiveNav("Analysis")} />
          <SidebarItem icon={<Box size={18} />} label="Resources" active={activeNav === "Resources"} onClick={() => setActiveNav("Resources")} />
          <SidebarItem icon={<Zap size={18} />} label="Recommendations" active={activeNav === "Recommendations"} onClick={() => setActiveNav("Recommendations")} />
          <SidebarItem icon={<FileText size={18} />} label="Reports" active={activeNav === "Reports"} onClick={() => setActiveNav("Reports")} />
          <div className="mt-8">
            <SidebarItem icon={<Settings size={18} />} label="Settings" active={activeNav === "Settings"} onClick={() => setActiveNav("Settings")} />
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 lg:p-10 max-w-[1400px]">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-white">{activeNav}</h1>
        </header>

        {/* OVERVIEW TAB */}
        {activeNav === "Overview" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* TOP CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                <div className="text-xs text-slate-400 mb-2">Total Resources</div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-white">{appData.summary.resources}</span>
                  <Box size={24} className="text-blue-500/80 mb-1" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                <div className="text-xs text-slate-400 mb-2">Potential Savings</div>
                <div className="text-3xl font-bold text-green-400">€{appData.summary.potentialSavings.amount.toLocaleString()}<span className="text-base font-normal text-green-400/70 ml-1">/mo</span></div>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                <div className="text-xs text-slate-400 mb-2">Issues Found</div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-red-500">{appData.summary.issuesFound}</span>
                  <AlertTriangle size={24} className="text-red-500/80 mb-1" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                <div className="text-xs text-slate-400 mb-2">Health Score</div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-green-500">{appData.summary.healthScore}<span className="text-base font-normal text-slate-500 ml-1">/100</span></div>
                  <ShieldAlert size={24} className="text-green-500/80 mb-1" />
                </div>
              </div>
            </div>

            {/* MIDDLE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg">
                <h2 className="text-base font-semibold text-slate-200 mb-6">Optimization Overview</h2>
                <div className="flex items-center justify-around gap-6">
                  <DonutChart total={appData.summary.issuesFound} items={appData.issueMix} />
                  <div className="space-y-3">
                    {appData.issueMix.map((item) => (
                      <div key={item.severity} className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${item.bgClass}`}></div>
                        <span className="text-sm text-slate-300 w-16">{item.severity}</span>
                        <span className="text-sm font-semibold text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-slate-200">Top Recommendations</h2>
                  <button onClick={() => setActiveNav("Recommendations")} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ChevronRight size={14}/></button>
                </div>
                <div className="flex-1 flex flex-col justify-between gap-2">
                  {appData.topRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0 last:pb-0">
                      <span className="text-sm text-slate-300">{rec.title}</span>
                      <span className="text-sm font-medium text-green-400">{rec.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-slate-200">Recent Analysis</h2>
                  <ChevronRight size={16} className="text-slate-600" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  {appData.recentAnalysis.map((run, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{run.env}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{run.time}</div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className="flex items-center gap-1.5 text-xs text-green-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          {run.status}
                        </div>
                        <div className="text-sm font-semibold text-green-500 w-12">{run.score}<span className="text-xs text-slate-500 font-normal">/100</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg">
                <h2 className="text-base font-semibold text-slate-200 mb-2">Infrastructure Health</h2>
                <TrendLineChart data={appData.infrastructureHealth} />
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeNav === "Analysis" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-bold text-white">Infrastructure Audit</h2>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Trigger the supervision agent to coordinate Terraform configuration checks and operational telemetry reviews. The final output is synthesized using the Anthropic API to provide actionable recommendations.
                </p>
                <button 
                  onClick={runAudit} 
                  disabled={auditState === "running"} 
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {auditState === "running" ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />} 
                  {auditState === "running" ? "Agents Analyzing..." : "Run AI Audit"}
                </button>
              </div>

              <div className="flex-1 rounded-xl border border-slate-800/60 bg-[#0F172A] p-5 shadow-lg flex items-center justify-center gap-4">
                 <div className="flex flex-col gap-3">
                   <AgentNode icon={<Code2 size={18}/>} title="Config Agent" subtitle="Terraform" active={auditState === "running"}/>
                   <AgentNode icon={<Gauge size={18}/>} title="Metric Agent" subtitle="Telemetry" active={auditState === "running"}/>
                 </div>
                 <ChevronRight size={24} className="text-slate-600" />
                 <AgentNode icon={<Bot size={24}/>} title="Supervisor" subtitle="Synthesis" active={auditState === "running" || auditState === "complete"}/>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6">
              <div className="rounded-xl border border-slate-800/60 bg-[#0B1120] p-4 shadow-inner flex flex-col h-[500px]">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
                  <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500/80"></div><div className="h-3 w-3 rounded-full bg-yellow-500/80"></div><div className="h-3 w-3 rounded-full bg-green-500/80"></div></div>
                  <span className="text-xs text-slate-500 font-mono ml-2">agent_console.log</span>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-1 pr-2">
                  {logs.map((log, i) => (
                    <div key={i} className={`${log.includes("[SUPERVISOR]") ? "text-purple-400" : log.includes("AGENT]") ? "text-blue-400" : "text-slate-400"}`}>{log}</div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg flex flex-col h-[500px]">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><FileText size={20} className="text-blue-400" /> Synthesized Report</h3>
                  {auditState === "complete" && <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold text-green-400 uppercase tracking-wider">Complete</span>}
                </div>
                <div className="flex-1 overflow-y-auto pr-2 prose prose-invert prose-sm max-w-none">
                  {auditState === "idle" && <div className="h-full flex flex-col items-center justify-center text-slate-500"><Bot size={48} className="mb-4 opacity-20" /><p>Run the audit to generate the AI report.</p></div>}
                  {auditState === "running" && <div className="h-full flex flex-col items-center justify-center text-blue-400"><Loader2 size={48} className="mb-4 animate-spin opacity-50" /><p className="animate-pulse text-sm">Claude is reviewing agent findings...</p></div>}
                  {auditState === "complete" && <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-sm">{reportText}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeNav === "Resources" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Tracked Resources</h2>
              <Pill tone="blue">Total Assets: {appData.summary.resources}</Pill>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">This view represents the aggregated operational telemetry gathered by the Metric Agent across the entire Terraform-defined estate.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
               {/* CPU Card */}
               <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg relative overflow-hidden group">
                 <Cpu className="text-blue-500/10 absolute -right-4 -bottom-4 w-32 h-32 transform group-hover:scale-110 transition-transform" />
                 <div className="relative z-10">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">CPU Profile</div>
                   <div className="text-4xl font-bold text-white mb-1">{appData.telemetry.cpuUsage.utilizationPercent}%</div>
                   <div className="text-sm text-slate-500">{appData.telemetry.cpuUsage.usedCores} of {appData.telemetry.cpuUsage.availableCores} cores utilized</div>
                 </div>
               </div>
               
               {/* Memory Card */}
               <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg relative overflow-hidden group">
                 <Activity className="text-red-500/10 absolute -right-4 -bottom-4 w-32 h-32 transform group-hover:scale-110 transition-transform" />
                 <div className="relative z-10">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Memory Profile</div>
                   <div className="text-4xl font-bold text-red-400 mb-1">{appData.telemetry.memoryUsage.utilizationPercent}%</div>
                   <div className="text-sm text-slate-500">{appData.telemetry.memoryUsage.usedGb} of {appData.telemetry.memoryUsage.totalGb} GB in use</div>
                 </div>
               </div>

               {/* Disk Card */}
               <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg relative overflow-hidden group">
                 <HardDrive className="text-green-500/10 absolute -right-4 -bottom-4 w-32 h-32 transform group-hover:scale-110 transition-transform" />
                 <div className="relative z-10">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Storage Profile</div>
                   <div className="text-4xl font-bold text-green-400 mb-1">{appData.telemetry.diskUsage.utilizationPercent}%</div>
                   <div className="text-sm text-slate-500">{appData.telemetry.diskUsage.freeGb} GB free of {appData.telemetry.diskUsage.totalGb} GB</div>
                 </div>
               </div>

               {/* Network Card */}
               <div className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg relative overflow-hidden group">
                 <Network className="text-purple-500/10 absolute -right-4 -bottom-4 w-32 h-32 transform group-hover:scale-110 transition-transform" />
                 <div className="relative z-10">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Network Profile</div>
                   <div className="text-4xl font-bold text-white mb-1">{appData.telemetry.networkBandwidth.utilizationPercent}%</div>
                   <div className="text-sm text-slate-500">Avg Bandwidth Utilization</div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeNav === "Recommendations" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white">Agent Findings & Recommendations</h2>
            <p className="text-slate-400 text-sm max-w-3xl">Specific issues flagged by the configuration and metrics agents during the infrastructure review process.</p>
            
            <div className="grid gap-4 mt-6">
              {appData.findings.map((finding) => {
                const colorTone = finding.severity.toLowerCase() === "high" ? "red" : finding.severity.toLowerCase() === "medium" ? "amber" : "green";
                return (
                  <div key={finding.id} className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/4 flex flex-col items-start gap-3 border-b md:border-b-0 md:border-r border-slate-800/60 pb-4 md:pb-0 pr-0 md:pr-4">
                      <Pill tone={colorTone as "red" | "amber" | "green"}>{finding.severity} Severity</Pill>
                      <span className="text-xs font-mono text-slate-500">{finding.id}</span>
                      <span className="text-xs text-blue-400 border border-blue-400/20 bg-blue-400/10 rounded px-2 py-1">Source: {finding.source}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-bold text-slate-200">{finding.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{finding.description}</p>
                      <div className="mt-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 block">Recommendation</span>
                        <p className="text-sm text-blue-300">{finding.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeNav === "Reports" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Export & Reporting</h2>
              <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700">
                <Download size={16} /> Download Full JSON
              </button>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">Access the raw data bundles structured for compliance archiving, automated ticketing, and external system ingests.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {appData.exportBundle.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg flex flex-col items-center text-center hover:border-slate-700 transition-colors cursor-pointer" onClick={handleExport}>
                  {item.icon}
                  <h3 className="text-lg font-bold text-slate-200 mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-400">{item.description}</p>
                  <span className="mt-4 text-xs font-medium text-blue-400 hover:text-blue-300">Export Asset →</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg">
               <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2"><Code2 size={18} className="text-slate-500"/> Raw Agent Payload Preview</h3>
               <div className="bg-[#0B1120] rounded-lg p-4 h-64 overflow-y-auto">
                 <pre className="text-xs font-mono text-slate-400 leading-relaxed">
                   {JSON.stringify(appData, null, 2)}
                 </pre>
               </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeNav === "Settings" && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <h2 className="text-2xl font-bold text-white">Application Settings</h2>
             <p className="text-slate-400 text-sm max-w-3xl">Configure agent behaviors, thresholds, and external API connections.</p>
             
             <div className="max-w-2xl rounded-xl border border-slate-800/60 bg-[#0F172A] p-6 shadow-lg mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Anthropic API Key</label>
                  <div className="flex gap-3">
                    <input type="password" value="sk-ant-api03-xxxxxxxxx" readOnly className="flex-1 bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none focus:border-blue-500" />
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Update</button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Required for Supervisor LLM synthesis generation.</p>
                </div>
                
                <hr className="border-slate-800" />
                
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Terraform Configuration Path</label>
                   <input type="text" value="./config/infrastructure.tf" readOnly className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none" />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Metrics Data Source</label>
                   <input type="text" value="./data/metrics.json" readOnly className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none" />
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}