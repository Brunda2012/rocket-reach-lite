import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Mail, Copy, Check, ChevronDown, ChevronUp, Star, ClipboardList, Building2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";

interface EmailEntry {
  companyName: string;
  url: string;
  subject: string;
  emailBody: string;
  recommendedRecipient: string;
  reasoning: string;
  relevanceScore: number;
}

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

const EmailPack = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emails = (location.state?.emails || []) as EmailEntry[];
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [copiedAll, setCopiedAll] = useState(false);

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const copyAll = async () => {
    const text = emails
      .map((e, i) => `--- ${i + 1}. ${e.companyName} ---\nTo: ${e.recommendedRecipient}\nSubject: ${e.subject}\nRelevance: ${e.relevanceScore}/100\n\n${e.emailBody}`)
      .join("\n\n" + "=".repeat(40) + "\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (!emails.length) {
    return (
      <DashboardLayout>
        <TopNav title="Email Pack" description="All generated outreach emails" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
              <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No emails generated yet</h2>
              <p className="text-sm text-muted-foreground mb-6">Generate outreach emails from the dashboard first.</p>
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TopNav title="Email Pack" description={`${emails.length} outreach emails ready`} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={copyAll}>
              {copiedAll ? <Check className="w-3.5 h-3.5 text-success" /> : <ClipboardList className="w-3.5 h-3.5" />}
              {copiedAll ? "Copied All!" : "Copy All Emails"}
            </Button>
          </div>

          <div className="space-y-3">
            {emails.map((email, i) => {
              const isOpen = expanded.has(i);
              const scoreColor = email.relevanceScore >= 80 ? "text-success" : email.relevanceScore >= 60 ? "text-warning" : "text-destructive";

              return (
                <div key={i} className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-fade-in-up">
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{email.companyName}</p>
                        <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${scoreColor}`} />
                        <span className={`text-xs font-bold ${scoreColor}`}>{email.relevanceScore}/100</span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Subject</p>
                          <p className="text-sm font-semibold text-foreground">{email.subject}</p>
                        </div>
                        <CopyBtn text={`Subject: ${email.subject}\n\n${email.emailBody}`} label="Copy Email" />
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground font-medium">To:</span>
                        <a href={`mailto:${email.recommendedRecipient}`} className="text-primary hover:underline">{email.recommendedRecipient}</a>
                      </div>

                      <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Email Body</p>
                          <CopyBtn text={email.emailBody} label="Copy Body" />
                        </div>
                        <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                          {email.emailBody}
                        </div>
                      </div>

                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Why this email works</p>
                        <p className="text-xs text-foreground/75 italic leading-relaxed">{email.reasoning}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default EmailPack;
