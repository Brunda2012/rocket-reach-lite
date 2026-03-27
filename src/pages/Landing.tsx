import { ArrowRight, Sparkles, Search, Zap, TrendingUp, Shield, BarChart3, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">ProspectAI</span>
          </div>
          <Button size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5">
            Start Now <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/10 mb-6">
          <Sparkles className="w-3 h-3" />
          AI-Powered Prospect Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight max-w-3xl mx-auto">
          HEALTHTECH HACKATHON
        </h1>
        <p className="mt-5 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Paste a website, get instant AI-generated insights — key signals, personalized conversation starters, and ready-to-send outreach emails.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/dashboard")} className="gap-2 text-sm px-6">
            Start Now <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-sm px-6">
            See How It Works
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { icon: Search, value: "Multi-page", label: "Deep Analysis" },
            { icon: Zap, value: "< 30s", label: "Instant Results" },
            { icon: TrendingUp, value: "0–100", label: "Relevance Score" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-card rounded-xl border border-border shadow-card p-4">
              <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10 tracking-tight">
          Everything you need to prospect smarter
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search, title: "Company Intelligence", desc: "Automatically extract industry, size, tech stack, and strategic signals from any website." },
            { icon: BarChart3, title: "Comparison Board", desc: "Analyze multiple companies side-by-side and identify the best-fit prospects instantly." },
            { icon: Mail, title: "Outreach Emails", desc: "AI-crafted, personalized outreach emails with subject lines, CTAs, and relevance scoring." },
            { icon: TrendingUp, title: "Growth Signals", desc: "Detect hiring trends, funding rounds, product launches, and expansion indicators." },
            { icon: Shield, title: "Confidence Scoring", desc: "Every insight comes with a confidence score so you know what to trust." },
            { icon: Sparkles, title: "AI Discovery", desc: "Describe your ideal customer and let AI find matching companies for you." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-xl border border-border shadow-card p-5 hover:shadow-elevated transition-shadow">
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="gradient-primary rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Ready to close more deals?</h2>
          <p className="text-sm text-primary-foreground/80 max-w-md mx-auto mb-6">
            Start analyzing prospects in seconds — no signup required.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")} className="gap-2 text-sm px-6">
            Start Now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} ProspectAI. Built with intelligence.</p>
      </footer>
    </div>
  );
};

export default Landing;
