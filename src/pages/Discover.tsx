import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Globe } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import CompanyDiscovery from "@/components/CompanyDiscovery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SnapshotResult } from "@/components/SnapshotDisplay";

const COUNTRIES = [
  "All Countries", "United States", "United Kingdom", "India", "Germany", "France",
  "Canada", "Australia", "Japan", "South Korea", "China", "Brazil", "Mexico",
  "Netherlands", "Sweden", "Denmark", "Norway", "Finland", "Switzerland",
  "Singapore", "Israel", "UAE", "South Africa", "Nigeria", "Kenya",
  "Ireland", "Spain", "Italy", "Poland", "Indonesia", "Thailand", "Vietnam",
  "New Zealand", "Austria", "Belgium", "Czech Republic", "Portugal", "Argentina",
  "Chile", "Colombia", "Egypt", "Saudi Arabia", "Turkey", "Malaysia", "Philippines",
];

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [country, setCountry] = useState("All Countries");

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
      <TopNav title="Discover" description="Find companies by theme, interest, or country" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Discover Companies</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Describe your ideal prospect — industry, tech stack, stage, or theme — and AI will find matching companies.
            </p>

            {/* Country Filter */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg text-sm px-3 py-1.5 text-foreground outline-none focus:border-primary/30"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing selected companies...
              </div>
            )}
            <CompanyDiscovery
              onSelectCompanies={handleSelectCompanies}
              country={country === "All Countries" ? undefined : country}
            />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Discover;
