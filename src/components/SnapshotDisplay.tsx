import {
  MessageSquare, Target, CheckCircle, Sparkles, Briefcase, Code,
  Rocket, AlertTriangle, TrendingUp, Building2, Users, Hash, Volume2,
  Zap, Copy, Check, ClipboardList, Download, Mail, Phone, ExternalLink,
  Send, Loader2, Star
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyProfile {
  industry: string;
  companySize: string;
  keywords: string[];
  tone: string;
}

export interface SnapshotSignals {
  hiringSignals: string[];
  techStack: string[];
  strategicInitiatives: string[];
  painPoints: string[];
  growthIndicators: string[];
}

export interface ConversationStarters {
  cto: string;
  ceo: string;
  headOfOperations: string;
  headOfSales: string;
}

export interface PublicContacts {
  emails: string[];
  phones: string[];
  formUrls: string[];
}

export interface SnapshotResult {
  companyProfile: CompanyProfile;
  signals: SnapshotSignals;
  recentChanges: string[];
  insights: string[];
  conversationStarters: ConversationStarters;
  whyItMatters: string;
  confidenceScore: number;
  suitabilityScore: number;
  publicContacts?: PublicContacts;
}

/* ── helpers ── */
const signalSections = [
  { key: "hiringSignals" as const, label: "Hiring Signals", icon: Briefcase, accent: "bg-info/10 text-info" },
  { key: "techStack" as const, label: "Tech Stack", icon: Code, accent: "bg-primary/10 text-primary" },
  { key: "strategicInitiatives" as const, label: "Strategic Initiatives", icon: Rocket, accent: "bg-accent/10 text-accent" },
  { key: "painPoints" as const, label: "Pain Points", icon: AlertTriangle, accent: "bg-warning/10 text-warning" },
  { key: "growthIndicators" as const, label: "Growth Indicators", icon: TrendingUp, accent: "bg-success/10 text-success" },
];

const personaLabels: { key: keyof ConversationStarters; label: string; emoji: string }[] = [
  { key: "ceo", label: "CEO", emoji: "👔" },
  { key: "cto", label: "CTO", emoji: "⚙️" },
  { key: "headOfOperations", label: "Head of Ops", emoji: "📋" },
  { key: "headOfSales", label: "Head of Sales", emoji: "📈" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, accent }: { icon: React.ElementType; title: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || "bg-primary/10 text-primary"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
    </div>
  );
}

/* ── helpers for export ── */
function buildPlainText(data: SnapshotResult): string {
  const p = data.companyProfile;
  let text = `PROSPECT SNAPSHOT\n${"=".repeat(40)}\n\n`;
  text += `COMPANY PROFILE\nIndustry: ${p.industry}\nSize: ${p.companySize}\nTone: ${p.tone}\nKeywords: ${p.keywords?.join(", ") || "N/A"}\n\n`;

  if (data.recentChanges?.length) {
    text += `WHAT'S NEW\n${data.recentChanges.map((c) => `• ${c}`).join("\n")}\n\n`;
  }

  for (const { key, label } of signalSections) {
    const items = data.signals?.[key];
    if (items?.length) text += `${label.toUpperCase()}\n${items.map((s) => `• ${s}`).join("\n")}\n\n`;
  }

  text += `KEY INSIGHTS\n${data.insights.map((ins, i) => `${i + 1}. ${ins}`).join("\n")}\n\n`;
  text += `CONVERSATION STARTERS\n`;
  for (const { key, label } of personaLabels) {
    const t = data.conversationStarters?.[key];
    if (t) text += `${label}: "${t}"\n`;
  }
  text += `\nWHY THIS MATTERS\n${data.whyItMatters}\n\nConfidence Score: ${data.confidenceScore ?? 0}/100`;
  return text;
}

/* ── main component ── */
const SnapshotDisplay = ({ data }: { data: SnapshotResult }) => {
  const profile = data.companyProfile;
  const [copiedAll, setCopiedAll] = useState(false);

  const score = data.confidenceScore ?? 0;
  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  const scoreLabel = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";

  const suit = data.suitabilityScore ?? 0;
  const suitColor = suit >= 70 ? "text-success" : suit >= 50 ? "text-warning" : "text-destructive";
  const suitLabel = suit >= 90 ? "Exceptional" : suit >= 70 ? "Strong" : suit >= 50 ? "Moderate" : "Weak";

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* ── Dashboard Header ── */}
        <div className="animate-fade-in-up flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Prospect Snapshot</h2>
              <p className="text-xs text-muted-foreground">AI-generated intelligence report</p>
            </div>
          </div>

          {/* Confidence Score Badge */}
          <div className="flex items-center gap-3 bg-card rounded-2xl shadow-card border border-border px-5 py-3">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Confidence</p>
              <p className={`text-xs font-bold ${scoreColor}`}>{scoreLabel}</p>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                <circle
                  cx="24" cy="24" r="20" fill="none" strokeWidth="3"
                  strokeDasharray={`${(score / 100) * 125.66} 125.66`}
                  strokeLinecap="round"
                  className={scoreColor}
                  stroke="currentColor"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${scoreColor}`}>
                {score}
              </span>
            </div>
          </div>

          {/* Suitability Score Badge */}
          <div className="flex items-center gap-3 bg-card rounded-2xl shadow-card border border-border px-5 py-3">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suitability</p>
              <p className={`text-xs font-bold ${suitColor}`}>{suitLabel}</p>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                <circle
                  cx="24" cy="24" r="20" fill="none" strokeWidth="3"
                  strokeDasharray={`${(suit / 100) * 125.66} 125.66`}
                  strokeLinecap="round"
                  className={suitColor}
                  stroke="currentColor"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${suitColor}`}>
                {suit}
              </span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="animate-fade-in-up flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={async () => {
              await navigator.clipboard.writeText(buildPlainText(data));
              setCopiedAll(true);
              setTimeout(() => setCopiedAll(false), 2000);
            }}
          >
            {copiedAll ? <Check className="w-4 h-4 text-success" /> : <ClipboardList className="w-4 h-4" />}
            {copiedAll ? "Copied!" : "Copy All Insights"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              const text = buildPlainText(data);
              const blob = new Blob([text], { type: "application/pdf" });
              // Build a simple text-based printable page for PDF
              const printWindow = window.open("", "_blank");
              if (printWindow) {
                printWindow.document.write(`<!DOCTYPE html><html><head><title>Prospect Snapshot</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1a1a1a;line-height:1.6;font-size:14px}h1{font-size:22px;border-bottom:2px solid #6366f1;padding-bottom:8px}h2{font-size:16px;margin-top:24px;color:#6366f1}ul{padding-left:20px}li{margin-bottom:4px}blockquote{border-left:3px solid #6366f1;padding-left:12px;font-style:italic;color:#555}.score{display:inline-block;background:#6366f1;color:white;padding:2px 10px;border-radius:12px;font-weight:bold}</style></head><body>`);
                printWindow.document.write(`<h1>Prospect Snapshot</h1>`);
                const p = data.companyProfile;
                printWindow.document.write(`<h2>Company Profile</h2><p><strong>Industry:</strong> ${p.industry} · <strong>Size:</strong> ${p.companySize} · <strong>Tone:</strong> ${p.tone}</p>`);
                if (p.keywords?.length) printWindow.document.write(`<p><strong>Keywords:</strong> ${p.keywords.join(", ")}</p>`);
                if (data.recentChanges?.length) {
                  printWindow.document.write(`<h2>What's New</h2><ul>${data.recentChanges.map(c => `<li>${c}</li>`).join("")}</ul>`);
                }
                for (const { key, label } of signalSections) {
                  const items = data.signals?.[key];
                  if (items?.length) printWindow.document.write(`<h2>${label}</h2><ul>${items.map(s => `<li>${s}</li>`).join("")}</ul>`);
                }
                printWindow.document.write(`<h2>Key Insights</h2><ol>${data.insights.map(ins => `<li>${ins}</li>`).join("")}</ol>`);
                printWindow.document.write(`<h2>Conversation Starters</h2>`);
                for (const { key, label } of personaLabels) {
                  const t = data.conversationStarters?.[key];
                  if (t) printWindow.document.write(`<p><strong>${label}:</strong> <em>"${t}"</em></p>`);
                }
                printWindow.document.write(`<h2>Why This Matters</h2><blockquote>${data.whyItMatters}</blockquote>`);
                printWindow.document.write(`<p>Confidence Score: <span class="score">${data.confidenceScore ?? 0}/100</span></p>`);
                printWindow.document.write(`</body></html>`);
                printWindow.document.close();
                printWindow.print();
              }
            }}
          >
            <Download className="w-4 h-4" />
            Download as PDF
          </Button>
        </div>

        {profile && (
          <div className="animate-fade-in-up stagger-1 bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="gradient-subtle p-6">
              <SectionHeader icon={Building2} title="Company Profile" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Industry</p>
                  <p className="text-sm font-semibold text-foreground">{profile.industry}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Size</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">{profile.companySize}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Tone</p>
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">{profile.tone}</p>
                  </div>
                </div>
              </div>
              {profile.keywords?.length > 0 && (
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  {profile.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/10"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Recent Changes ── */}
        {data.recentChanges?.length > 0 && (
          <div className="animate-fade-in-up stagger-2 bg-card rounded-2xl shadow-card border border-border p-6">
            <SectionHeader icon={Zap} title="What's New" accent="bg-warning/10 text-warning" />
            <div className="grid gap-2.5">
              {data.recentChanges.map((change, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-warning/5 border border-warning/10">
                  <div className="mt-1 w-2 h-2 rounded-full bg-warning shrink-0" />
                  <span className="text-sm text-foreground/85 leading-relaxed">{change}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Signals Grid ── */}
        <div className="animate-fade-in-up stagger-3">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Signals</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signalSections.map(({ key, label, icon: Icon, accent }) => {
              const items = data.signals?.[key];
              if (!items || items.length === 0) return null;
              return (
                <div key={key} className="bg-card rounded-2xl shadow-card border border-border p-5 hover:shadow-elevated transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="mt-2 w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                        <span className="text-[13px] text-foreground/75 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Key Insights ── */}
        <div className="animate-fade-in-up stagger-4 bg-card rounded-2xl shadow-card border border-border p-6">
          <SectionHeader icon={CheckCircle} title="Key Insights" accent="bg-success/10 text-success" />
          <div className="space-y-3">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-success/5 border border-success/10">
                <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-success">{i + 1}</span>
                </div>
                <span className="text-sm text-foreground/85 leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Conversation Starters ── */}
        <div className="animate-fade-in-up stagger-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Conversation Starters</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {personaLabels.map(({ key, label, emoji }) => {
              const text = data.conversationStarters?.[key];
              if (!text) return null;
              return (
                <div
                  key={key}
                  className="bg-card rounded-2xl shadow-card border border-border p-5 hover:shadow-elevated hover:border-primary/20 transition-all duration-300 group relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{emoji}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                    </div>
                    <CopyButton text={text} />
                  </div>
                  <p className="text-sm text-foreground/80 italic leading-relaxed">"{text}"</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Public Contacts ── */}
        {data.publicContacts && (data.publicContacts.emails?.length > 0 || data.publicContacts.phones?.length > 0 || data.publicContacts.formUrls?.length > 0) && (
          <div className="animate-fade-in-up stagger-6 bg-card rounded-2xl shadow-card border border-border p-6">
            <SectionHeader icon={Mail} title="Public Contacts" accent="bg-info/10 text-info" />
            <div className="grid gap-4 sm:grid-cols-3">
              {data.publicContacts.emails?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Emails</span>
                  </div>
                  {data.publicContacts.emails.map((email, i) => (
                    <a key={i} href={`mailto:${email}`} className="block text-sm text-primary hover:underline truncate">{email}</a>
                  ))}
                </div>
              )}
              {data.publicContacts.phones?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Phone Numbers</span>
                  </div>
                  {data.publicContacts.phones.map((phone, i) => (
                    <a key={i} href={`tel:${phone}`} className="block text-sm text-primary hover:underline">{phone}</a>
                  ))}
                </div>
              )}
              {data.publicContacts.formUrls?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Contact Forms</span>
                  </div>
                  {data.publicContacts.formUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline truncate">{url}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Why This Matters ── */}
        <div className="animate-fade-in-up stagger-7 gradient-primary rounded-2xl p-6 shadow-glow">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Why This Matters</h3>
          </div>
          <p className="text-primary-foreground/90 leading-relaxed text-base font-medium">{data.whyItMatters}</p>
        </div>
      </div>
    </section>
  );
};

export default SnapshotDisplay;
