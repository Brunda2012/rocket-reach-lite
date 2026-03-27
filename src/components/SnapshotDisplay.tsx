import {
  MessageSquare, Target, CheckCircle, Sparkles, Briefcase, Code,
  Rocket, AlertTriangle, TrendingUp, Building2, Users, Hash, Volume2,
  Zap, Copy, Check
} from "lucide-react";
import { useState } from "react";

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

export interface SnapshotResult {
  companyProfile: CompanyProfile;
  signals: SnapshotSignals;
  recentChanges: string[];
  insights: string[];
  conversationStarters: ConversationStarters;
  whyItMatters: string;
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

/* ── main component ── */
const SnapshotDisplay = ({ data }: { data: SnapshotResult }) => {
  const profile = data.companyProfile;

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
        </div>

        {/* ── Company Profile Card ── */}
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

        {/* ── Why This Matters ── */}
        <div className="animate-fade-in-up stagger-6 gradient-primary rounded-2xl p-6 shadow-glow">
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
