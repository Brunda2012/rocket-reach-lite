import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, Globe, BarChart3, Send, Eye } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import StepIndicator from "@/components/StepIndicator";
import CompanyInput, { type CompanyEntry } from "@/components/CompanyInput";
import CompanyDiscovery from "@/components/CompanyDiscovery";
import SnapshotDisplay, { type SnapshotResult } from "@/components/SnapshotDisplay";
import ComparisonBoard from "@/components/ComparisonBoard";
import OutreachDashboard from "@/components/OutreachDashboard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  { number: 1, label: "Enter Interest" },
  { number: 2, label: "Discover" },
  { number: 3, label: "Analyze" },
  { number: 4, label: "Outreach" },
];

const Index = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<SnapshotResult[]>([]);
  const [analyzedUrls, setAnalyzedUrls] = useState<string[]>([]);
  const [userTheme, setUserTheme] = useState<string | undefined>();
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerate = async (entries: CompanyEntry[], linkedinUrl?: string) => {
    setIsLoading(true);
    setSnapshots([]);
    setAnalyzedUrls([]);

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
            keyPeople: data.keyPeople || [],
            prospectEmail: prospectEmail,
          } as SnapshotResult;

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
      setAnalyzedUrls(entries.map((e) => e.url));
      setStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not analyze the URLs.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscoverySelect = (urls: string[], theme?: string) => {
    if (theme) setUserTheme(theme);
    setDiscoveredUrls(urls);
    handleGenerate(urls.map((url) => ({ url, prospectEmail: "" })));
  };

  const goToOutreach = () => setStep(4);
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <DashboardLayout>
      <TopNav title="Analyze" description="Company intelligence & outreach" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Step Indicator */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <StepIndicator steps={STEPS} currentStep={step} />
          </div>

          {/* Step 1: Enter Interest */}
          {step === 1 && (
            <div className="animate-fade-in-up space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">What type of companies are you looking for?</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Describe your ideal customer profile — industry, tech stack, stage, or any theme — and we'll find matching prospects.
                </p>
                <CompanyDiscovery
                  onSelectCompanies={(urls, theme) => {
                    handleDiscoverySelect(urls, theme);
                  }}
                />
                <div className="mt-6 flex items-center gap-3 justify-center">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">or enter URLs directly</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => setStep(2)}>
                    <Globe className="w-4 h-4" />
                    Enter Company URLs
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Manual URL Entry */}
          {step === 2 && (
            <div className="animate-fade-in-up space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Enter company websites to analyze</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Paste up to 4 company URLs. We'll extract signals, insights, and generate personalized outreach.
                </p>
              </div>

              <CompanyInput ref={inputRef} onSubmit={handleGenerate} isLoading={isLoading} />

              <div className="flex justify-start">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={goBack}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Discovery
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Analysis Results */}
          {step === 3 && snapshots.length > 0 && (
            <div className="animate-fade-in-up space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-7 h-7 text-success" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {snapshots.length === 1 ? "Company Analysis Complete" : `${snapshots.length} Companies Analyzed`}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Review AI-generated intelligence below, then proceed to generate personalized outreach emails.
                </p>
                <Button size="lg" className="gap-2" onClick={goToOutreach}>
                  <Send className="w-4 h-4" />
                  Generate Outreach
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {snapshots.map((snap, i) => (
                <div key={i} className="bg-card rounded-xl border border-border shadow-card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{snap.companyProfile.industry} · {snap.companyProfile.companySize}</p>
                    <p className="text-xs text-muted-foreground">Confidence {snap.confidenceScore}/100 · Suitability {snap.suitabilityScore}/100</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/company", { state: { snapshot: snap } })}>
                      <Eye className="w-3.5 h-3.5" /> Profile
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => navigate("/outreach", { state: { snapshot: snap, userTheme } })}>
                      <Send className="w-3.5 h-3.5" /> Outreach
                    </Button>
                  </div>
                </div>
              ))}

              {snapshots.length === 1 && <SnapshotDisplay data={snapshots[0]} userTheme={userTheme} />}
              {snapshots.length >= 2 && <ComparisonBoard snapshots={snapshots} />}

              <div className="flex justify-between">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Start Over
                </Button>
                <Button size="sm" className="gap-1.5" onClick={goToOutreach}>
                  Continue to Outreach
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Outreach */}
          {step === 4 && snapshots.length > 0 && (
            <div className="animate-fade-in-up space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Generate & Send Outreach</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  AI-crafted, personalized emails ready to send. Generate, review, and copy your outreach pack.
                </p>
              </div>

              <OutreachDashboard snapshots={snapshots} urls={analyzedUrls} userTheme={userTheme} />

              <div className="flex justify-between">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Analysis
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setStep(1); setSnapshots([]); setAnalyzedUrls([]); }}>
                  Start New Search
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Index;
