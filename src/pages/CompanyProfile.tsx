import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2, Users, Volume2, Hash, Briefcase, Code, Rocket, AlertTriangle,
  TrendingUp, Zap, MessageSquare, Mail, Phone, ExternalLink, Target,
  CheckCircle, ArrowLeft, Copy, Check, Shield, BarChart3, UserCircle, Linkedin,
} from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import type { SnapshotResult, SnapshotSignals, ConversationStarters, KeyPerson } from "@/components/SnapshotDisplay";

const signalSections: { key: keyof SnapshotSignals; label: string; icon: React.ElementType; accent: string; tagBg: string; tagText: string; dotColor: string }[] = [
  { key: "hiringSignals", label: "Hiring Signals", icon: Briefcase, accent: "bg-warning/10 text-warning", tagBg: "bg-warning/10", tagText: "text-warning", dotColor: "bg-warning" },
  { key: "techStack", label: "Tech Stack", icon: Code, accent: "bg-info/10 text-info", tagBg: "bg-info/10", tagText: "text-info", dotColor: "bg-info" },
  { key: "strategicInitiatives", label: "Strategic Initiatives", icon: Rocket, accent: "bg-primary/10 text-primary", tagBg: "bg-primary/10", tagText: "text-primary", dotColor: "bg-primary" },
  { key: "painPoints", label: "Pain Points", icon: AlertTriangle, accent: "bg-destructive/10 text-destructive", tagBg: "bg-destructive/10", tagText: "text-destructive", dotColor: "bg-destructive" },
  { key: "growthIndicators", label: "Growth Indicators", icon: TrendingUp, accent: "bg-success/10 text-success", tagBg: "bg-success/10", tagText: "text-success", dotColor: "bg-success" },
];

const personaLabels: { key: keyof ConversationStarters; label: string; emoji: string }[] = [
  { key: "ceo", label: "CEO", emoji: "👔" },
  { key: "cto", label: "CTO", emoji: "⚙️" },
  { key: "headOfOperations", label: "Head of Ops", emoji: "📋" },
  { key: "headOfSales", label: "Head of Sales", emoji: "📈" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ScoreBadge({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  const bg = score >= 80 ? "bg-success/8" : score >= 60 ? "bg-warning/8" : "bg-destructive/8";
  return (
    <div className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{score}<span className="text-xs font-normal text-muted-foreground">/100</span></p>
      </div>
    </div>
  );
}

const CompanyProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.snapshot as SnapshotResult | undefined;

  if (!data) {
    return (
      <DashboardLayout>
        <TopNav title="Company Profile" description="Detailed company view" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No company data</h2>
              <p className="text-sm text-muted-foreground mb-6">Analyze a company first to view its full profile.</p>
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const profile = data.companyProfile;
  const contacts = data.publicContacts;

  return (
    <DashboardLayout>
      <TopNav title="Company Profile" description="Detailed intelligence view" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-5">
          {/* Back */}
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          {/* Header Card */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6 animate-fade-in-up">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground mb-1">{profile.industry} Company</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" /> {profile.companySize}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Volume2 className="w-3.5 h-3.5" /> {profile.tone}
                  </span>
                </div>
                {profile.keywords?.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
                    {profile.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/10">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up stagger-1">
            <ScoreBadge label="Confidence" score={data.confidenceScore ?? 0} icon={Shield} />
            <ScoreBadge label="Suitability" score={data.suitabilityScore ?? 0} icon={BarChart3} />
          </div>

          {/* Recent Changes */}
          {data.recentChanges?.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-warning" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">What's New</h2>
              </div>
              <div className="grid gap-2">
                {data.recentChanges.map((change, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-warning/5 border border-warning/10">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                    <span className="text-xs text-foreground/85 leading-relaxed">{change}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signals — Color-Coded Tags */}
          <div className="animate-fade-in-up stagger-3">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Signals & Intelligence</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {signalSections.map(({ key, label, icon: Icon, accent, tagBg, tagText, dotColor }) => {
                const items = data.signals?.[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} className="bg-card rounded-xl border border-border shadow-card p-5 hover:shadow-elevated transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                      <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tagBg} ${tagText}`}>
                        {items.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item, i) => (
                        <span key={i} className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${tagBg} ${tagText} border-current/10`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                          {item.length > 40 ? item.slice(0, 40) + "…" : item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights */}
          {data.insights?.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6 animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Key Insights</h2>
              </div>
              <div className="space-y-2">
                {data.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10">
                    <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-success">{i + 1}</span>
                    </div>
                    <span className="text-xs text-foreground/85 leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Starters */}
          <div className="animate-fade-in-up stagger-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Conversation Starters</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {personaLabels.map(({ key, label, emoji }) => {
                const text = data.conversationStarters?.[key];
                if (!text) return null;
                return (
                  <div key={key} className="bg-card rounded-xl border border-border shadow-card p-4 hover:shadow-elevated transition-shadow group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{emoji}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                      </div>
                      <CopyBtn text={text} />
                    </div>
                    <p className="text-xs text-foreground/80 italic leading-relaxed">"{text}"</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Public Contacts */}
          {contacts && (contacts.emails?.length > 0 || contacts.phones?.length > 0 || contacts.formUrls?.length > 0) && (
            <div className="bg-card rounded-xl border border-border shadow-card p-6 animate-fade-in-up stagger-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-info" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Contact Information</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {contacts.emails?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Emails</span>
                    </div>
                    {contacts.emails.map((email, i) => (
                      <a key={i} href={`mailto:${email}`} className="block text-xs text-primary hover:underline truncate">{email}</a>
                    ))}
                  </div>
                )}
                {contacts.phones?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Phones</span>
                    </div>
                    {contacts.phones.map((phone, i) => (
                      <a key={i} href={`tel:${phone}`} className="block text-xs text-primary hover:underline">{phone}</a>
                    ))}
                  </div>
                )}
                {contacts.formUrls?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ExternalLink className="w-3 h-3" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Forms</span>
                    </div>
                    {contacts.formUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline truncate">{url}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Why It Matters */}
          <div className="gradient-primary rounded-xl p-6 animate-fade-in-up stagger-7">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-sm font-semibold text-primary-foreground/80 uppercase tracking-wider">Why This Matters</h2>
            </div>
            <p className="text-primary-foreground/90 leading-relaxed text-sm">{data.whyItMatters}</p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default CompanyProfilePage;
