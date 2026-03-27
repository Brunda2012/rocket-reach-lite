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

export interface KeyPerson {
  name: string;
  role: string;
  email?: string;
  linkedinUrl?: string;
}

export interface PublicContacts {
  emails: string[];
  phones: string[];
  formUrls: string[];
  address?: string;
  contactFormUrl?: string;
}

export interface OutreachEmail {
  subject: string;
  emailBody: string;
  recommendedRecipient: string;
  reasoning: string;
  relevanceScore: number;
}

export interface SnapshotResult {
  companyProfile: CompanyProfile;
  helpfulFor?: string[];
  signals: SnapshotSignals;
  recentChanges: string[];
  insights: string[];
  conversationStarters: ConversationStarters;
  whyItMatters: string;
  confidenceScore: number;
  suitabilityScore: number;
  publicContacts?: PublicContacts;
  keyPeople?: KeyPerson[];
  prospectEmail?: string;
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
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent || "bg-primary/10 text-primary"}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
    </div>
  );
}

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
const SnapshotDisplay = ({ data, userTheme }: { data: SnapshotResult; userTheme?: string }) => {
  const profile = data.companyProfile;
  const [copiedAll, setCopiedAll] = useState(false);
  const [outreach, setOutreach] = useState<OutreachEmail | null>(null);
  const [outreachLoading, setOutreachLoading] = useState(false);

  const generateOutreach = async () => {
    setOutreachLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-outreach", {
        body: { snapshot: data, prospectEmail: data.prospectEmail, userTheme },
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setOutreach(result);
    } catch (e) {
      console.error("Outreach generation failed:", e);
    } finally {
      setOutreachLoading(false);
    }
  };

  const score = data.confidenceScore ?? 0;
  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";

  const suit = data.suitabilityScore ?? 0;
  const suitColor = suit >= 70 ? "text-success" : suit >= 50 ? "text-warning" : "text-destructive";

  return (
    <div className="space-y-4 animate-fade-in-up stagger-2">
      {/* Header Card */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Prospect Snapshot</h3>
              <p className="text-[11px] text-muted-foreground">AI-generated intelligence report</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-secondary/60 rounded-lg px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Confidence</p>
              <p className={`text-xs font-bold ${scoreColor}`}>{score}/100</p>
            </div>
            <div className="bg-secondary/60 rounded-lg px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Suitability</p>
              <p className={`text-xs font-bold ${suitColor}`}>{suit}/100</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              await navigator.clipboard.writeText(buildPlainText(data));
              setCopiedAll(true);
              setTimeout(() => setCopiedAll(false), 2000);
            }}
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-success" /> : <ClipboardList className="w-3.5 h-3.5" />}
            {copiedAll ? "Copied!" : "Copy All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const printWindow = window.open("", "_blank");
              if (printWindow) {
                const p = data.companyProfile;
                printWindow.document.write(`<!DOCTYPE html><html><head><title>Prospect Snapshot</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1a1a1a;line-height:1.6;font-size:14px}h1{font-size:22px;border-bottom:2px solid #6366f1;padding-bottom:8px}h2{font-size:16px;margin-top:24px;color:#6366f1}ul{padding-left:20px}li{margin-bottom:4px}blockquote{border-left:3px solid #6366f1;padding-left:12px;font-style:italic;color:#555}.score{display:inline-block;background:#6366f1;color:white;padding:2px 10px;border-radius:12px;font-weight:bold}</style></head><body>`);
                printWindow.document.write(`<h1>Prospect Snapshot</h1>`);
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
            <Download className="w-3.5 h-3.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Company Profile */}
      {profile && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <SectionHeader icon={Building2} title="Company Profile" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Industry</p>
              <p className="text-sm font-semibold text-foreground">{profile.industry}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Size</p>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{profile.companySize}</p>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Tone</p>
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{profile.tone}</p>
              </div>
            </div>
          </div>
          {profile.keywords?.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
              {profile.keywords.map((kw, i) => (
                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/10">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Changes */}
      {data.recentChanges?.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <SectionHeader icon={Zap} title="What's New" accent="bg-warning/10 text-warning" />
          <div className="grid gap-2">
            {data.recentChanges.map((change, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-warning/5 border border-warning/10">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                <span className="text-xs text-foreground/85 leading-relaxed">{change}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signals Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Target className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Signals</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {signalSections.map(({ key, label, icon: Icon, accent }) => {
            const items = data.signals?.[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key} className="bg-card rounded-xl border border-border shadow-card p-4 hover:shadow-elevated transition-all">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${accent}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                      <span className="text-xs text-foreground/75 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      {data.insights?.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <SectionHeader icon={CheckCircle} title="Key Insights" accent="bg-success/10 text-success" />
          <div className="space-y-2">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-success/5 border border-success/10">
                <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-success">{i + 1}</span>
                </div>
                <span className="text-xs text-foreground/85 leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Starters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Conversation Starters</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {personaLabels.map(({ key, label, emoji }) => {
            const text = data.conversationStarters?.[key];
            if (!text) return null;
            return (
              <div key={key} className="bg-card rounded-xl border border-border shadow-card p-4 hover:shadow-elevated transition-all group relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                  </div>
                  <CopyButton text={text} />
                </div>
                <p className="text-xs text-foreground/80 italic leading-relaxed">"{text}"</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Public Contacts */}
      {data.publicContacts && (data.publicContacts.emails?.length > 0 || data.publicContacts.phones?.length > 0 || data.publicContacts.formUrls?.length > 0) && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <SectionHeader icon={Mail} title="Public Contacts" accent="bg-info/10 text-info" />
          <div className="grid gap-4 sm:grid-cols-3">
            {data.publicContacts.emails?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Emails</span>
                </div>
                {data.publicContacts.emails.map((email, i) => (
                  <a key={i} href={`mailto:${email}`} className="block text-xs text-primary hover:underline truncate">{email}</a>
                ))}
              </div>
            )}
            {data.publicContacts.phones?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Phones</span>
                </div>
                {data.publicContacts.phones.map((phone, i) => (
                  <a key={i} href={`tel:${phone}`} className="block text-xs text-primary hover:underline">{phone}</a>
                ))}
              </div>
            )}
            {data.publicContacts.formUrls?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ExternalLink className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Forms</span>
                </div>
                {data.publicContacts.formUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline truncate">{url}</a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outreach Email Generator */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <SectionHeader icon={Send} title="Outreach Email" accent="bg-primary/10 text-primary" />
        {!outreach ? (
          <Button onClick={generateOutreach} disabled={outreachLoading} className="w-full gap-2">
            {outreachLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Crafting personalized email...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Outreach Email
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-warning" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Relevance: {outreach.relevanceScore}/100
                </span>
              </div>
              <CopyButton text={`Subject: ${outreach.subject}\n\n${outreach.emailBody}`} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Subject</p>
              <p className="text-sm font-semibold text-foreground">{outreach.subject}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">To</p>
              <a href={`mailto:${outreach.recommendedRecipient}`} className="text-xs text-primary hover:underline">{outreach.recommendedRecipient}</a>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-xs text-foreground/85 leading-relaxed whitespace-pre-line">
              {outreach.emailBody}
            </div>
            <p className="text-[11px] text-muted-foreground italic">{outreach.reasoning}</p>
            <Button variant="outline" size="sm" onClick={generateOutreach} disabled={outreachLoading} className="gap-1.5">
              {outreachLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Regenerate
            </Button>
          </div>
        )}
      </div>

      {/* Why This Matters */}
      <div className="gradient-primary rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">Why This Matters</h3>
        </div>
        <p className="text-primary-foreground/90 leading-relaxed text-sm">{data.whyItMatters}</p>
      </div>
    </div>
  );
};

export default SnapshotDisplay;
