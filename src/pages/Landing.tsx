import {
  ArrowRight, Sparkles, Search, Zap, TrendingUp, Shield, BarChart3, Mail,
  Users, Phone, Settings, Layers, Globe, Send, HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Search, title: "Discover Companies", desc: "Enter a theme or interest and let AI find matching companies worldwide. Filter by country." },
  { icon: BarChart3, title: "Insights Engine", desc: "Deep analysis of company websites — signals, pain points, growth indicators, tech stack, and more." },
  { icon: Users, title: 'Organisation Relevance ("Helpful For")', desc: "Each company is classified by who it's most useful for: startups, students, founders, investors, etc." },
  { icon: Phone, title: "Public Contact Intelligence", desc: "Extract publicly available emails, phone numbers, addresses, and contact form URLs from company websites." },
  { icon: Send, title: "Outreach Email Generator", desc: "AI-crafted personalized cold emails with subject lines, CTAs, relevance scores, and recommended recipients." },
  { icon: Mail, title: "Email Pack", desc: "All generated emails in one place — collapsible cards with copy buttons and a 'Copy All' feature." },
  { icon: Layers, title: "Comparison Dashboard", desc: "Select multiple companies and compare them side-by-side: signals, scores, contacts, and helpfulness." },
  { icon: Settings, title: "Settings & Personalization", desc: "Configure email tone, length, subject style, dark mode, and toggle data features on or off." },
];

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
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate("/help")} className="gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Help
            </Button>
            <Button size="sm" onClick={() => navigate("/discover")} className="gap-1.5">
              Start Now <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/10 mb-6">
          <Sparkles className="w-3 h-3" />
          HealthTech Hackathon Edition
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight max-w-3xl mx-auto">
          AI-Powered Prospect Intelligence{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">& Outreach Platform</span>
        </h1>
        <p className="mt-5 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Discover companies by theme, analyse their websites for strategic signals, generate personalised outreach emails, and manage your prospect pipeline — all powered by AI.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/discover")} className="gap-2 text-sm px-6">
            Start Discovering <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-sm px-6">
            See All Features
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

      {/* What's Inside */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> What's Inside This App
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Search, label: "AI Discovery" },
              { icon: BarChart3, label: "Deep Insights" },
              { icon: Send, label: "Email Outreach" },
              { icon: Users, label: "Relevance Tags" },
              { icon: Phone, label: "Contact Intel" },
              { icon: Layers, label: "Side-by-Side" },
              { icon: Globe, label: "Country Filter" },
              { icon: Shield, label: "Scoring" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2 border border-border">
                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10 tracking-tight">
          Everything you need to prospect smarter
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
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
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="gradient-primary rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Ready to find your next opportunity?</h2>
          <p className="text-sm text-primary-foreground/80 max-w-md mx-auto mb-6">
            Start discovering and analysing companies in seconds — no signup required.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/discover")} className="gap-2 text-sm px-6">
            Start Now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ProspectAI · v1.0.0 · HealthTech Hackathon</p>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" onClick={() => navigate("/help")}>
            <HelpCircle className="w-3 h-3" /> Help
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
