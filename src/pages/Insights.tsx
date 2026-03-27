import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Eye, Send, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SnapshotRow {
  id: string;
  url: string;
  company_profile: any;
  confidence_score: number | null;
  suitability_score: number | null;
  created_at: string | null;
  insights: any;
  signals: any;
  recent_changes: any;
  conversation_starters: any;
  why_it_matters: string | null;
}

const Insights = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("prospect_snapshots")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) setRows(data as any);
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout>
      <TopNav title="Insights" description="View analysis history" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading history...
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
              <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No analyses yet</h2>
              <p className="text-sm text-muted-foreground mb-6">Analyze a company to see insights here.</p>
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            rows.map((row) => {
              const profile = row.company_profile as any;
              return (
                <div key={row.id} className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{row.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.industry || "Unknown"} · Confidence {row.confidence_score ?? 0}/100 · Suitability {row.suitability_score ?? 0}/100
                    </p>
                    {row.created_at && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(row.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate("/company", {
                        state: {
                          snapshot: {
                            companyProfile: row.company_profile || {},
                            signals: row.signals || {},
                            recentChanges: row.recent_changes || [],
                            insights: row.insights || [],
                            conversationStarters: row.conversation_starters || {},
                            whyItMatters: row.why_it_matters,
                            confidenceScore: row.confidence_score ?? 0,
                            suitabilityScore: row.suitability_score ?? 0,
                          },
                        },
                      })}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate("/outreach", {
                        state: {
                          snapshot: {
                            companyProfile: row.company_profile || {},
                            signals: row.signals || {},
                            recentChanges: row.recent_changes || [],
                            insights: row.insights || [],
                            conversationStarters: row.conversation_starters || {},
                            whyItMatters: row.why_it_matters,
                            confidenceScore: row.confidence_score ?? 0,
                            suitabilityScore: row.suitability_score ?? 0,
                          },
                        },
                      })}
                    >
                      <Send className="w-3.5 h-3.5" /> Outreach
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Insights;
