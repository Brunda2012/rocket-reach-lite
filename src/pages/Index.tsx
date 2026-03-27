import { useRef, useState } from "react";
import HeroSection from "@/components/HeroSection";
import CompanyInput from "@/components/CompanyInput";
import InsightCard, { type ProspectInsight } from "@/components/InsightCard";
import { useToast } from "@/hooks/use-toast";

// Mock data for demo until backend is connected
const mockInsight: ProspectInsight = {
  companyName: "Acme Robotics",
  summary:
    "Acme Robotics is a fast-growing automation company focused on logistics and warehouse solutions. They recently raised Series B funding and are aggressively expanding their engineering team.",
  insights: [
    {
      icon: "trending",
      title: "Recent Funding",
      detail: "Raised $45M Series B led by Sequoia, signaling aggressive growth plans.",
    },
    {
      icon: "users",
      title: "Hiring Surge",
      detail: "12 open ML engineer roles — scaling their autonomous systems team.",
    },
    {
      icon: "building",
      title: "Strategic Partnership",
      detail: "New partnership with DHL for automated warehouse fulfillment.",
    },
  ],
  conversationStarter:
    "Noticed you're scaling your ML team while doubling down on logistics automation with DHL — curious how you're balancing build vs. buy for your perception stack?",
  whyItMatters:
    "Their rapid hiring + funding signals they're in a buy-ready phase. Reaching out with automation-related value props could land well right now.",
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<ProspectInsight | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setInsight(null);

    // TODO: Replace with real backend call once Cloud is enabled
    try {
      await new Promise((r) => setTimeout(r, 2000)); // simulate loading
      setInsight({ ...mockInsight, companyName: new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "").split(".")[0].charAt(0).toUpperCase() + new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "").split(".")[0].slice(1) });
    } catch {
      toast({
        title: "Error",
        description: "Could not analyze this URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onScrollToInput={scrollToInput} />
      <CompanyInput ref={inputRef} onSubmit={handleAnalyze} isLoading={isLoading} />
      {insight && <InsightCard data={insight} />}
    </div>
  );
};

export default Index;
