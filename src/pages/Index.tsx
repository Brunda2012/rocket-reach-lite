import { useRef, useState } from "react";
import HeroSection from "@/components/HeroSection";
import CompanyInput, { type CompanyEntry } from "@/components/CompanyInput";
import CompanyDiscovery from "@/components/CompanyDiscovery";
import SnapshotDisplay, { type SnapshotResult } from "@/components/SnapshotDisplay";
import ComparisonBoard from "@/components/ComparisonBoard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<SnapshotResult[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGenerate = async (entries: CompanyEntry[], linkedinUrl?: string) => {
    setIsLoading(true);
    setSnapshots([]);

    try {
      const results = await Promise.all(
        entries.map(async ({ url, prospectEmail }) => {
          const { data, error } = await supabase.functions.invoke("prospect-snapshot", {
            body: { url, linkedinUrl, prospectEmail: prospectEmail || undefined },
          });
          if (error) throw new Error(`Failed for ${url}: ${error.message}`);
          if (!data?.conversationStarters && !data?.insights)
            throw new Error(data?.error || `Analysis failed for ${url}`);

          const snapshot = {
            companyProfile: data.companyProfile || {},
            signals: data.signals || {},
            recentChanges: data.recentChanges || [],
            insights: data.insights || [],
            conversationStarters: data.conversationStarters || {},
            whyItMatters: data.whyItMatters,
            confidenceScore: data.confidenceScore ?? 0,
            suitabilityScore: data.suitabilityScore ?? 0,
            publicContacts: data.publicContacts,
          } as SnapshotResult;

          // Store in database
          await supabase.from("prospect_snapshots" as any).insert({
            url,
            company_profile: snapshot.companyProfile,
            signals: snapshot.signals,
            recent_changes: snapshot.recentChanges,
            insights: snapshot.insights,
            conversation_starters: snapshot.conversationStarters,
            why_it_matters: snapshot.whyItMatters,
            confidence_score: snapshot.confidenceScore,
            suitability_score: snapshot.suitabilityScore,
          } as any);

          return snapshot;
        })
      );
      setSnapshots(results);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not analyze the URLs.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscoverySelect = (urls: string[]) => {
    handleGenerate(urls);
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onScrollToInput={scrollToInput} />
      <CompanyInput ref={inputRef} onSubmit={handleGenerate} isLoading={isLoading} />
      <CompanyDiscovery onSelectCompanies={handleDiscoverySelect} />
      {snapshots.length === 1 && <SnapshotDisplay data={snapshots[0]} />}
      {snapshots.length >= 2 && <ComparisonBoard snapshots={snapshots} />}
    </div>
  );
};

export default Index;
