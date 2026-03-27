import { useRef, useState } from "react";
import HeroSection from "@/components/HeroSection";
import CompanyInput from "@/components/CompanyInput";
import InsightCard, { type ProspectInsight } from "@/components/InsightCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

    try {
      const { data, error } = await supabase.functions.invoke("prospect-analyze", {
        body: { url },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setInsight(data.data);
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not analyze this URL.";
      toast({
        title: "Analysis Error",
        description: message,
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
