import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Globe, ArrowRight, BarChart3, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import CompanyDiscovery from "@/components/CompanyDiscovery";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SnapshotResult } from "@/components/SnapshotDisplay";

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelectCompanies = async (urls: string[], theme?: string) => {
    setIsAnalyzing(true);
    try {
      const results = await Promise.all(
        urls.map(async (url) => {
          const { data, error } = await supabase.functions.invoke("prospect-snapshot", {
            body: { url },
          });
          if (error) throw new Error(`Failed for ${url}: ${error.message}`);
          if (data?.error) throw new Error(data.error);
          return {
            companyProfile: data.companyProfile || {},
            helpfulFor: data.helpfulFor || [],
            signals: data.signals || {},
            recentChanges: data.recentChanges || [],
            insights: data.insights || [],
            conversationStarters: data.conversationStarters || {},
            whyItMatters: data.whyItMatters,
            confidenceScore: data.confidenceScore ?? 0,
            suitabilityScore: data.suitabilityScore ?? 0,
            publicContacts: data.publicContacts,
            keyPeople: data.keyPeople || [],
          } as SnapshotResult;
        })
      );
      navigate("/dashboard", { state: { snapshots: results, userTheme: theme } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <TopNav title="Discover" description="Find companies by theme or interest" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Discover Companies</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Describe your ideal customer profile — industry, tech stack, stage, or any theme — and we'll find matching prospects.
            </p>
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing selected companies...
              </div>
            )}
            <CompanyDiscovery onSelectCompanies={handleSelectCompanies} />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Discover;
