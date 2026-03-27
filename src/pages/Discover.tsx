import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Globe, MapPin } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import CompanyDiscovery from "@/components/CompanyDiscovery";
import SmartSearchBar from "@/components/SmartSearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { ALL_COUNTRIES, ALL_REGIONS, countriesForRegion, regionForCountry } from "@/lib/regions";
import type { SnapshotResult } from "@/components/SnapshotDisplay";

const Discover = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, updateSetting } = useSettings();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [country, setCountry] = useState(settings.lastCountry || "All Countries");
  const [region, setRegion] = useState(settings.lastRegion || "All Regions");
  const [keyword, setKeyword] = useState(settings.lastKeyword || "");

  // Sync region ↔ country
  const handleRegionChange = (r: string) => {
    setRegion(r);
    setCountry("All Countries");
    updateSetting("lastRegion", r);
    updateSetting("lastCountry", "All Countries");
  };

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c !== "All Countries") {
      const r = regionForCountry(c);
      if (r) { setRegion(r); updateSetting("lastRegion", r); }
    }
    updateSetting("lastCountry", c);
  };

  const handleSearchSubmit = (val: string) => {
    setKeyword(val);
    updateSetting("lastKeyword", val);
  };

  // Compute effective country filter
  const effectiveCountry = (() => {
    if (country !== "All Countries") return country;
    if (region !== "All Regions") return undefined; // pass region countries to edge fn
    return undefined;
  })();

  const effectiveRegionCountries = region !== "All Regions" && country === "All Countries"
    ? countriesForRegion(region)
    : undefined;

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
      <TopNav title="Discover" description="Find companies by theme, interest, country, or region" />
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

            {/* Region & Country Filters */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <select
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="bg-secondary/50 border border-border rounded-lg text-sm px-3 py-1.5 text-foreground outline-none focus:border-primary/30"
                >
                  {ALL_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="bg-secondary/50 border border-border rounded-lg text-sm px-3 py-1.5 text-foreground outline-none focus:border-primary/30"
                >
                  {ALL_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing selected companies...
              </div>
            )}
            <CompanyDiscovery
              onSelectCompanies={handleSelectCompanies}
              country={effectiveCountry}
              regionCountries={effectiveRegionCountries}
              initialKeyword={keyword}
              onKeywordChange={(k) => { setKeyword(k); updateSetting("lastKeyword", k); }}
            />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Discover;
