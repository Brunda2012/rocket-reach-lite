import { useRef, useState } from "react";
import HeroSection from "@/components/HeroSection";
import CompanyInput from "@/components/CompanyInput";
import SnapshotDisplay, { type SnapshotResult } from "@/components/SnapshotDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<SnapshotResult | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGenerate = async (url: string) => {
    setIsLoading(true);
    setSnapshot(null);

    try {
      const { data, error } = await supabase.functions.invoke("prospect-snapshot", {
        body: { url },
      });

      if (error) throw error;

      if (data?.insights) {
        setSnapshot({
          insights: data.insights,
          conversationStarter: data.conversationStarter,
          whyItMatters: data.whyItMatters,
        });
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not analyze this URL.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onScrollToInput={scrollToInput} />
      <CompanyInput ref={inputRef} onSubmit={handleGenerate} isLoading={isLoading} />
      {snapshot && <SnapshotDisplay data={snapshot} />}
    </div>
  );
};

export default Index;
