import { Sparkles, Zap, Search, TrendingUp } from "lucide-react";

const HeroSection = ({ onScrollToInput }: { onScrollToInput: () => void }) => {
  return (
    <div className="animate-fade-in-up">
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/10">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </div>
            <h1 className="text-xl font-bold text-foreground leading-snug tracking-tight">
              Prospect Intelligence
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Enter any company URL to get instant AI-generated insights — key signals, 
              personalized conversation starters, and outreach-ready briefings.
            </p>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3">
            {[
              { icon: Search, label: "Deep Analysis", value: "Multi-page" },
              { icon: Zap, label: "Instant Insights", value: "< 30s" },
              { icon: TrendingUp, label: "Relevance Score", value: "0–100" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-secondary/60 rounded-lg p-3 text-center min-w-[100px]">
                <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
