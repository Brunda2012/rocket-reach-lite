import { Search, Sparkles, Zap } from "lucide-react";

const HeroSection = ({ onScrollToInput }: { onScrollToInput: () => void }) => {
  return (
    <section className="gradient-hero min-h-[60vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary-foreground/80 text-sm">
          <Sparkles className="w-4 h-4" />
          AI-Powered Prospect Intelligence
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight tracking-tight">
          Know Your Prospect
          <br />
          <span className="gradient-primary bg-clip-text text-transparent">Before They Know You</span>
        </h1>

        <p className="text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto leading-relaxed">
          Enter any company URL and get instant, AI-generated insights — key signals, 
          personalized conversation starters, and a ready-to-use briefing card.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-primary-foreground/50 text-sm">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Deep web analysis
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Instant insights
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI-powered
          </div>
        </div>

        <button
          onClick={onScrollToInput}
          className="gradient-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold shadow-elevated hover:opacity-90 transition-opacity"
        >
          Try It Now
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
