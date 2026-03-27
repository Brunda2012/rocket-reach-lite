import { useState } from "react";
import {
  Send, Loader2, Copy, Check, Mail, Phone, ExternalLink, Star, Building2, ClipboardList, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { SnapshotResult, OutreachEmail } from "@/components/SnapshotDisplay";

interface DashboardEntry {
  snapshot: SnapshotResult;
  url: string;
  outreach: OutreachEmail | null;
  loading: boolean;
}

function CopyEmailButton({ subject, body }: { subject: string; body: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={async () => {
        await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy Email"}
    </Button>
  );
}

function RelevanceBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  return (
    <div className="flex items-center gap-1.5">
      <Star className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-bold ${color}`}>{score}/100</span>
    </div>
  );
}

const OutreachDashboard = ({
  snapshots,
  urls,
  userTheme,
}: {
  snapshots: SnapshotResult[];
  urls: string[];
  userTheme?: string;
}) => {
  const [entries, setEntries] = useState<DashboardEntry[]>(
    snapshots.map((s, i) => ({ snapshot: s, url: urls[i] || "", outreach: null, loading: false }))
  );

  const generateOne = async (index: number) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, loading: true } : e))
    );
    try {
      const entry = entries[index];
      const { data, error } = await supabase.functions.invoke("generate-outreach", {
        body: {
          snapshot: entry.snapshot,
          prospectEmail: entry.snapshot.prospectEmail,
          userTheme,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, outreach: data, loading: false } : e))
      );
    } catch {
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, loading: false } : e))
      );
    }
  };

  const generateAll = async () => {
    await Promise.all(entries.map((_, i) => (!entries[i].outreach ? generateOne(i) : Promise.resolve())));
  };

  const allGenerated = entries.every((e) => e.outreach);
  const anyLoading = entries.some((e) => e.loading);

  const generatedEntries = entries.filter((e) => e.outreach);

  const [copiedPack, setCopiedPack] = useState(false);
  const copyOutreachPack = async () => {
    const block = generatedEntries
      .map((e, i) => {
        const o = e.outreach!;
        const domain = e.url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
        return `--- Company ${i + 1}: ${domain} ---\nTo: ${o.recommendedRecipient}\nSubject: ${o.subject}\nRelevance: ${o.relevanceScore}/100\n\n${o.emailBody}`;
      })
      .join("\n\n========================================\n\n");
    await navigator.clipboard.writeText(`=== OUTREACH PACK ===\n${generatedEntries.length} emails generated\n\n${block}`);
    setCopiedPack(true);
    setTimeout(() => setCopiedPack(false), 2000);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Outreach Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {snapshots.length} {snapshots.length === 1 ? "company" : "companies"} analyzed
            </p>
          </div>
          <div className="flex gap-2">
            {generatedEntries.length >= 1 && (
              <Button variant="outline" onClick={copyOutreachPack} className="gap-2">
                {copiedPack ? <Check className="w-4 h-4 text-success" /> : <ClipboardList className="w-4 h-4" />}
                {copiedPack ? "Copied!" : "Copy Outreach Pack"}
              </Button>
            )}
            {!allGenerated && (
              <Button onClick={generateAll} disabled={anyLoading} className="gap-2 gradient-primary text-primary-foreground">
                {anyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Generate All Emails
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5">
          {[...entries]
            .map((entry, originalIndex) => ({ entry, originalIndex }))
            .sort((a, b) => {
              const scoreA = a.entry.outreach?.relevanceScore ?? -1;
              const scoreB = b.entry.outreach?.relevanceScore ?? -1;
              return scoreB - scoreA;
            })
            .map(({ entry, originalIndex }, sortedIndex) => {
            const profile = entry.snapshot.companyProfile;
            const contacts = entry.snapshot.publicContacts;
            const isBestFit = entry.outreach && sortedIndex < 2 && generatedEntries.length >= 2;

            return (
              <div
                key={originalIndex}
                className={`rounded-2xl shadow-card border overflow-hidden hover:shadow-elevated transition-shadow ${
                  isBestFit
                    ? "bg-card border-primary/30 ring-2 ring-primary/20"
                    : "bg-card border-border"
                }`}
              >
                {isBestFit && (
                  <div className="gradient-primary px-4 py-1.5 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-primary-foreground" />
                    <span className="text-xs font-semibold text-primary-foreground uppercase tracking-wider">
                      Best Fit Prospect
                    </span>
                  </div>
                )}
                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {entry.url.replace(/^https?:\/\//, "").replace(/\/+$/, "")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {profile.industry} · {profile.companySize}
                      </p>
                    </div>
                  </div>
                  {entry.outreach && <RelevanceBadge score={entry.outreach.relevanceScore} />}
                </div>

                <div className="p-5 grid gap-5 lg:grid-cols-[280px_1fr]">
                  {/* Left — Contacts */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Contact Info
                    </p>
                    {contacts?.emails?.length ? (
                      <div className="space-y-1.5">
                        {contacts.emails.map((email, j) => (
                          <a
                            key={j}
                            href={`mailto:${email}`}
                            className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            {email}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {contacts?.phones?.length ? (
                      <div className="space-y-1.5">
                        {contacts.phones.map((phone, j) => (
                          <a
                            key={j}
                            href={`tel:${phone}`}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {phone}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {contacts?.formUrls?.length ? (
                      <div className="space-y-1.5">
                        {contacts.formUrls.map((url, j) => (
                          <a
                            key={j}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            Contact Form
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {entry.snapshot.prospectEmail && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
                          Prospect Email
                        </p>
                        <a
                          href={`mailto:${entry.snapshot.prospectEmail}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          {entry.snapshot.prospectEmail}
                        </a>
                      </div>
                    )}
                    {!contacts?.emails?.length && !contacts?.phones?.length && !contacts?.formUrls?.length && !entry.snapshot.prospectEmail && (
                      <p className="text-xs text-muted-foreground italic">No contacts found</p>
                    )}
                  </div>

                  {/* Right — Email */}
                  <div>
                    {entry.outreach ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                              Subject Line
                            </p>
                            <p className="text-sm font-semibold text-foreground">{entry.outreach.subject}</p>
                          </div>
                          <CopyEmailButton subject={entry.outreach.subject} body={entry.outreach.emailBody} />
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            To: {entry.outreach.recommendedRecipient}
                          </p>
                        </div>

                        <div className="bg-secondary/50 rounded-xl p-4 text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                          {entry.outreach.emailBody}
                        </div>

                        <p className="text-xs text-muted-foreground italic">{entry.outreach.reasoning}</p>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateOne(i)}
                          disabled={entry.loading}
                          className="gap-2"
                        >
                          {entry.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Regenerate
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[120px]">
                        <Button
                          onClick={() => generateOne(i)}
                          disabled={entry.loading}
                          className="gap-2 gradient-primary text-primary-foreground"
                        >
                          {entry.loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Generate Email
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OutreachDashboard;
