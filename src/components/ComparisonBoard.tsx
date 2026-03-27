import { useMemo, useState } from "react";
import {
  Building2, Users, Volume2, Hash, Briefcase, Code, Rocket,
  AlertTriangle, TrendingUp, Zap, MessageSquare, Target, Sparkles,
  ArrowUpDown, Filter, ClipboardList, Download, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SnapshotResult, SnapshotSignals, ConversationStarters } from "./SnapshotDisplay";

const signalSections: { key: keyof SnapshotSignals; label: string; icon: React.ElementType; accent: string; cellBg: string; dotColor: string }[] = [
  { key: "hiringSignals", label: "Hiring", icon: Briefcase, accent: "bg-warning/10 text-warning", cellBg: "bg-warning/5", dotColor: "bg-warning" },
  { key: "techStack", label: "Tech Stack", icon: Code, accent: "bg-info/10 text-info", cellBg: "bg-info/5", dotColor: "bg-info" },
  { key: "strategicInitiatives", label: "Initiatives", icon: Rocket, accent: "bg-info/10 text-info", cellBg: "bg-info/5", dotColor: "bg-info" },
  { key: "painPoints", label: "Pain Points", icon: AlertTriangle, accent: "bg-destructive/10 text-destructive", cellBg: "bg-destructive/5", dotColor: "bg-destructive" },
  { key: "growthIndicators", label: "Growth", icon: TrendingUp, accent: "bg-success/10 text-success", cellBg: "bg-success/5", dotColor: "bg-success" },
];

const personas: { key: keyof ConversationStarters; label: string; emoji: string }[] = [
  { key: "ceo", label: "CEO", emoji: "👔" },
  { key: "cto", label: "CTO", emoji: "⚙️" },
  { key: "headOfOperations", label: "Head of Ops", emoji: "📋" },
  { key: "headOfSales", label: "Head of Sales", emoji: "📈" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
          <circle
            cx="24" cy="24" r="20" fill="none" strokeWidth="3"
            strokeDasharray={`${(score / 100) * 125.66} 125.66`}
            strokeLinecap="round"
            className={color}
            stroke="currentColor"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>{score}</span>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, label, accent }: { icon: React.ElementType; label: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${accent || "bg-primary/10 text-primary"}`}>
        <Icon className="w-3 h-3" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

function CompanyHeader({ data }: { data: SnapshotResult }) {
  const domain = data.companyProfile?.industry || "Unknown";
  return (
    <div className="text-center space-y-1">
      <p className="text-sm font-bold text-foreground">{domain}</p>
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
        <Users className="w-3 h-3" />
        <span className="text-xs">{data.companyProfile?.companySize}</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
        <Volume2 className="w-3 h-3" />
        <span className="text-xs">{data.companyProfile?.tone}</span>
      </div>
      {data.companyProfile?.keywords?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 pt-1">
          {data.companyProfile.keywords.slice(0, 4).map((kw, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/10">
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function buildBoardText(snapshots: SnapshotResult[]): string {
  return snapshots.map((s, idx) => {
    const p = s.companyProfile;
    let t = `COMPANY ${idx + 1}: ${p.industry}\nSize: ${p.companySize} | Tone: ${p.tone}\nKeywords: ${p.keywords?.join(", ") || "N/A"}\n`;
    for (const { key, label } of signalSections) {
      const items = s.signals?.[key];
      if (items?.length) t += `\n${label.toUpperCase()}\n${items.map((i) => `• ${i}`).join("\n")}`;
    }
    if (s.recentChanges?.length) t += `\n\nRECENT CHANGES\n${s.recentChanges.map((c) => `• ${c}`).join("\n")}`;
    for (const { key, label } of personas) {
      const v = s.conversationStarters?.[key];
      if (v) t += `\n${label}: "${v}"`;
    }
    if (s.whyItMatters) t += `\nWhy It Matters: ${s.whyItMatters}`;
    t += `\nConfidence: ${s.confidenceScore ?? 0}/100`;
    return t;
  }).join("\n\n" + "=".repeat(50) + "\n\n");
}

function openPrintablePdf(snapshots: SnapshotResult[]) {
  const w = window.open("", "_blank");
  if (!w) return;
  const css = `body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:20px;color:#1a1a1a;font-size:13px;line-height:1.5}h1{font-size:20px;border-bottom:2px solid #6366f1;padding-bottom:6px}h2{font-size:15px;margin-top:20px;color:#6366f1}h3{font-size:13px;margin-top:12px;color:#444}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #e5e7eb;padding:8px;vertical-align:top;font-size:12px}th{background:#f9fafb;text-align:left;font-weight:600}.score{display:inline-block;background:#6366f1;color:white;padding:1px 8px;border-radius:10px;font-weight:bold;font-size:12px}.green{background:#f0fdf4}.yellow{background:#fefce8}.red{background:#fef2f2}.blue{background:#eff6ff}`;
  let html = `<!DOCTYPE html><html><head><title>Comparison Board</title><style>${css}</style></head><body><h1>Prospect Comparison Board</h1>`;

  // Overview table
  html += `<h2>Company Overview</h2><table><tr>${snapshots.map((s) => `<th>${s.companyProfile.industry}</th>`).join("")}</tr>`;
  html += `<tr>${snapshots.map((s) => `<td>Size: ${s.companyProfile.companySize}<br>Tone: ${s.companyProfile.tone}<br>Keywords: ${s.companyProfile.keywords?.join(", ")}</td>`).join("")}</tr></table>`;

  // Signals
  const colorMap: Record<string, string> = { hiringSignals: "yellow", techStack: "blue", strategicInitiatives: "blue", painPoints: "red", growthIndicators: "green" };
  html += `<h2>Strategic Signals</h2>`;
  for (const { key, label } of signalSections) {
    const hasAny = snapshots.some((s) => s.signals?.[key]?.length > 0);
    if (!hasAny) continue;
    html += `<h3>${label}</h3><table><tr>${snapshots.map((s) => `<td class="${colorMap[key]}">${(s.signals?.[key] || []).map((i) => `• ${i}`).join("<br>") || "<em>No data</em>"}</td>`).join("")}</tr></table>`;
  }

  // Recent Changes
  html += `<h2>Recent Changes</h2><table><tr>${snapshots.map((s) => `<td>${(s.recentChanges || []).map((c) => `• ${c}`).join("<br>") || "<em>None</em>"}</td>`).join("")}</tr></table>`;

  // Persona Starters
  html += `<h2>Persona-Based Starters</h2>`;
  for (const { key, label, emoji } of personas) {
    html += `<h3>${emoji} ${label}</h3><table><tr>${snapshots.map((s) => `<td><em>"${s.conversationStarters?.[key] || "—"}"</em></td>`).join("")}</tr></table>`;
  }
  html += `<h3>💡 Why It Matters</h3><table><tr>${snapshots.map((s) => `<td>${s.whyItMatters || "—"}</td>`).join("")}</tr></table>`;

  // Confidence
  html += `<h2>Confidence Score</h2><table><tr>${snapshots.map((s) => `<td><span class="score">${s.confidenceScore ?? 0}/100</span></td>`).join("")}</tr></table>`;

  html += `</body></html>`;
  w.document.write(html);
  w.document.close();
  w.print();
}

const ComparisonBoard = ({ snapshots }: { snapshots: SnapshotResult[] }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const cols = snapshots.length;
  const gridCols = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Comparison Board</h2>
              <p className="text-xs text-muted-foreground">Side-by-side intelligence for {cols} companies</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={async () => {
                await navigator.clipboard.writeText(buildBoardText(snapshots));
                setCopiedAll(true);
                setTimeout(() => setCopiedAll(false), 2000);
              }}
            >
              {copiedAll ? <Check className="w-4 h-4 text-success" /> : <ClipboardList className="w-4 h-4" />}
              {copiedAll ? "Copied!" : "Copy Board"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => openPrintablePdf(snapshots)}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* ── Company Overview Row ── */}
        <div className="animate-fade-in-up stagger-1 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="gradient-subtle p-4 border-b border-border">
            <SectionLabel icon={Building2} label="Company Overview" />
          </div>
          <div className={`grid ${gridCols} divide-x divide-border`}>
            {snapshots.map((s, i) => (
              <div key={i} className="p-5">
                <CompanyHeader data={s} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Strategic Signals ── */}
        <div className="animate-fade-in-up stagger-2 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="gradient-subtle p-4 border-b border-border">
            <SectionLabel icon={Target} label="Strategic Signals" accent="bg-accent/10 text-accent" />
          </div>
          {signalSections.map(({ key, label, icon: Icon, accent, cellBg, dotColor }) => {
            const hasAny = snapshots.some((s) => s.signals?.[key]?.length > 0);
            if (!hasAny) return null;
            return (
              <div key={key} className="border-b border-border last:border-b-0">
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${accent}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                  </div>
                </div>
                <div className={`grid ${gridCols} divide-x divide-border`}>
                  {snapshots.map((s, i) => (
                    <div key={i} className={`px-5 pb-4 ${cellBg}`}>
                      <ul className="space-y-1.5">
                        {(s.signals?.[key] || []).map((item, j) => (
                          <li key={j} className="flex items-start gap-1.5">
                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                            <span className="text-xs text-foreground/75 leading-relaxed">{item}</span>
                          </li>
                        ))}
                        {(!s.signals?.[key] || s.signals[key].length === 0) && (
                          <li className="text-xs text-muted-foreground/50 italic">No data</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Recent Changes ── */}
        <div className="animate-fade-in-up stagger-3 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="gradient-subtle p-4 border-b border-border">
            <SectionLabel icon={Zap} label="Recent Changes" accent="bg-warning/10 text-warning" />
          </div>
          <div className={`grid ${gridCols} divide-x divide-border`}>
            {snapshots.map((s, i) => (
              <div key={i} className="p-5 space-y-2">
                {(s.recentChanges || []).map((change, j) => (
                  <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-warning/5 border border-warning/10">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                    <span className="text-xs text-foreground/80 leading-relaxed">{change}</span>
                  </div>
                ))}
                {(!s.recentChanges || s.recentChanges.length === 0) && (
                  <p className="text-xs text-muted-foreground/50 italic">No recent changes detected</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Persona Starters ── */}
        <div className="animate-fade-in-up stagger-4 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="gradient-subtle p-4 border-b border-border">
            <SectionLabel icon={MessageSquare} label="Persona-Based Starters" accent="bg-primary/10 text-primary" />
          </div>
          {personas.map(({ key, label, emoji }) => {
            const hasAny = snapshots.some((s) => s.conversationStarters?.[key]);
            if (!hasAny) return null;
            return (
              <div key={key} className="border-b border-border last:border-b-0">
                <div className="px-5 pt-4 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {emoji} {label}
                  </span>
                </div>
                <div className={`grid ${gridCols} divide-x divide-border`}>
                  {snapshots.map((s, i) => (
                    <div key={i} className="px-5 pb-4">
                      {s.conversationStarters?.[key] ? (
                        <p className="text-xs text-foreground/80 italic leading-relaxed">
                          "{s.conversationStarters[key]}"
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/50 italic">—</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Why It Matters */}
          <div className="border-t border-border">
            <div className="px-5 pt-4 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                💡 Why It Matters
              </span>
            </div>
            <div className={`grid ${gridCols} divide-x divide-border`}>
              {snapshots.map((s, i) => (
                <div key={i} className="px-5 pb-4">
                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">{s.whyItMatters || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Confidence Score ── */}
        <div className="animate-fade-in-up stagger-5 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="gradient-subtle p-4 border-b border-border">
            <SectionLabel icon={Target} label="Confidence Score" accent="bg-success/10 text-success" />
          </div>
          <div className={`grid ${gridCols} divide-x divide-border`}>
            {snapshots.map((s, i) => (
              <div key={i} className="p-5 flex justify-center">
                <ScoreBadge score={s.confidenceScore ?? 0} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonBoard;
