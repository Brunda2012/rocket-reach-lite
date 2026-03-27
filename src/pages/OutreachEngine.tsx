import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, Briefcase, Code, Rocket, AlertTriangle, TrendingUp,
  Target, CheckCircle, Zap, Send, Loader2, Copy, Check, Star, Mail,
  Phone, ExternalLink, MessageSquare, RefreshCw,
} from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { SnapshotResult, SnapshotSignals, OutreachEmail } from "@/components/SnapshotDisplay";

const signalSections: { key: keyof SnapshotSignals; label: string; icon: React.ElementType; tagBg: string; tagText: string; dotColor: string }[] = [
  { key: "hiringSignals", label: "Hiring", icon: Briefcase, tagBg: "bg-warning/10", tagText: "text-warning", dotColor: "bg-warning" },
  { key: "techStack", label: "Tech Stack", icon: Code, tagBg: "bg-info/10", tagText: "text-info", dotColor: "bg-info" },
  { key: "strategicInitiatives", label: "Initiatives", icon: Rocket, tagBg: "bg-primary/10", tagText: "text-primary", dotColor: "bg-primary" },
  { key: "painPoints", label: "Pain Points", icon: AlertTriangle, tagBg: "bg-destructive/10", tagText: "text-destructive", dotColor: "bg-destructive" },
  { key: "growthIndicators", label: "Growth", icon: TrendingUp, tagBg: "bg-success/10", tagText: "text-success", dotColor: "bg-success" },
];

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 shrink-0"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      {label ?? (copied ? "Copied!" : "Copy")}
    </Button>
  );
}

const OutreachEngine = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const snapshot = location.state?.snapshot as SnapshotResult | undefined;
  const userTheme = location.state?.userTheme as string | undefined;

  const [outreach, setOutreach] = useState<OutreachEmail | null>(null);
  const [loading, setLoading] = useState(false);

  if (!snapshot) {
    return (
      <DashboardLayout>
        <TopNav title="Outreach Engine" description="Generate personalized emails" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
              <Send className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No company selected</h2>
              <p className="text-sm text-muted-foreground mb-6">Analyze a company first, then open the Outreach Engine.</p>
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-outreach", {
        body: { snapshot, prospectEmail: snapshot.prospectEmail, userTheme },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOutreach(data);
    } catch (e) {
      console.error("Outreach generation failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const profile = snapshot.companyProfile;
  const contacts = snapshot.publicContacts;
  const score = outreach?.relevanceScore ?? 0;
  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";

  return (
    <DashboardLayout>
      <TopNav title="Outreach Engine" description="Generate personalized emails" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-5">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            {/* ── LEFT: Company Insights ── */}
            <div className="space-y-4">
              {/* Company Header */}
              <div className="bg-card rounded-xl border border-border shadow-card p-5 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground">{profile.industry}</h2>
                    <p className="text-xs text-muted-foreground">{profile.companySize} · {profile.tone}</p>
                  </div>
                </div>
                {profile.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/10">{kw}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Signals */}
              {signalSections.map(({ key, label, icon: Icon, tagBg, tagText, dotColor }) => {
                const items = snapshot.signals?.[key];
                if (!items?.length) return null;
                return (
                  <div key={key} className="bg-card rounded-xl border border-border shadow-card p-4 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${tagBg} ${tagText}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                      <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tagBg} ${tagText}`}>{items.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${tagBg} ${tagText}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                          {item.length > 50 ? item.slice(0, 50) + "…" : item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Key Insights */}
              {snapshot.insights?.length > 0 && (
                <div className="bg-card rounded-xl border border-border shadow-card p-4 animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key Insights</span>
                  </div>
                  <ul className="space-y-1.5">
                    {snapshot.insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/85 leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-success">{i + 1}</span>
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contacts */}
              {contacts && (contacts.emails?.length || contacts.phones?.length || contacts.formUrls?.length) ? (
                <div className="bg-card rounded-xl border border-border shadow-card p-4 animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-info/10 flex items-center justify-center">
                      <Mail className="w-3 h-3 text-info" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contacts</span>
                  </div>
                  <div className="space-y-1.5">
                    {contacts.emails?.map((e, i) => (
                      <a key={i} href={`mailto:${e}`} className="flex items-center gap-2 text-xs text-primary hover:underline truncate">
                        <Mail className="w-3 h-3 shrink-0" /> {e}
                      </a>
                    ))}
                    {contacts.phones?.map((p, i) => (
                      <a key={i} href={`tel:${p}`} className="flex items-center gap-2 text-xs text-primary hover:underline">
                        <Phone className="w-3 h-3 shrink-0" /> {p}
                      </a>
                    ))}
                    {contacts.formUrls?.map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" /> Contact Form
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Why It Matters */}
              <div className="gradient-primary rounded-xl p-4 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-primary-foreground/70" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">Why This Matters</span>
                </div>
                <p className="text-xs text-primary-foreground/90 leading-relaxed">{snapshot.whyItMatters}</p>
              </div>
            </div>

            {/* ── RIGHT: Generated Email ── */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border shadow-card p-6 animate-fade-in-up stagger-1 sticky top-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Outreach Email</h3>
                    <p className="text-[11px] text-muted-foreground">AI-crafted personalized email</p>
                  </div>
                </div>

                {!outreach ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                      Click below to generate a personalized outreach email based on the company insights.
                    </p>
                    <Button size="lg" className="gap-2" onClick={generate} disabled={loading}>
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Crafting email…</>
                      ) : (
                        <><Send className="w-4 h-4" /> Generate Email</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Relevance */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-warning" />
                        <span className="text-xs font-semibold text-muted-foreground">Relevance</span>
                        <span className={`text-sm font-bold ${scoreColor}`}>{score}/100</span>
                      </div>
                      <CopyBtn text={`Subject: ${outreach.subject}\n\n${outreach.emailBody}`} label="Copy All" />
                    </div>

                    {/* Subject */}
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Subject Line</p>
                        <CopyBtn text={outreach.subject} label="Copy" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{outreach.subject}</p>
                    </div>

                    {/* Recipient */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground font-medium">To:</span>
                      <a href={`mailto:${outreach.recommendedRecipient}`} className="text-primary hover:underline">{outreach.recommendedRecipient}</a>
                    </div>

                    {/* Body */}
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Email Body</p>
                        <CopyBtn text={outreach.emailBody} label="Copy Body" />
                      </div>
                      <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                        {outreach.emailBody}
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Why this email works</p>
                      <p className="text-xs text-foreground/75 italic leading-relaxed">{outreach.reasoning}</p>
                    </div>

                    {/* Regenerate */}
                    <Button variant="outline" className="w-full gap-2" onClick={generate} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Regenerate Email
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default OutreachEngine;
