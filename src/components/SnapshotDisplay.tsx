import { MessageSquare, Target, CheckCircle, Sparkles, Briefcase, Code, Rocket, AlertTriangle, TrendingUp } from "lucide-react";

export interface SnapshotSignals {
  hiringSignals: string[];
  techStack: string[];
  strategicInitiatives: string[];
  painPoints: string[];
  growthIndicators: string[];
}

export interface SnapshotResult {
  signals: SnapshotSignals;
  insights: string[];
  conversationStarter: string;
  whyItMatters: string;
}

const signalSections = [
  { key: "hiringSignals" as const, label: "Hiring Signals", icon: Briefcase, color: "text-primary" },
  { key: "techStack" as const, label: "Tech Stack", icon: Code, color: "text-primary" },
  { key: "strategicInitiatives" as const, label: "Strategic Initiatives", icon: Rocket, color: "text-primary" },
  { key: "painPoints" as const, label: "Pain Points", icon: AlertTriangle, color: "text-destructive" },
  { key: "growthIndicators" as const, label: "Growth Indicators", icon: TrendingUp, color: "text-accent" },
];

const SnapshotDisplay = ({ data }: { data: SnapshotResult }) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        {/* Card Title */}
        <div className="px-8 py-6 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Prospect Snapshot</h2>
        </div>

        <div className="divide-y divide-border">
          {/* Signals Grid */}
          <div className="px-8 py-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Signals
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {signalSections.map(({ key, label, icon: Icon, color }) => {
                const items = data.signals?.[key];
                if (!items || items.length === 0) return null;
                return (
                  <div key={key} className="bg-secondary/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                    </div>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm text-foreground/80 leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Insights */}
          <div className="px-8 py-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Key Insights
            </h3>
            <ul className="space-y-3">
              {data.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span className="text-foreground/85 leading-relaxed text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversation Starter */}
          <div className="px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Conversation Starter
              </h3>
            </div>
            <div className="bg-primary/5 border border-primary/15 rounded-xl px-5 py-4">
              <p className="text-foreground/90 italic leading-relaxed">
                "{data.conversationStarter}"
              </p>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Why This Matters
              </h3>
            </div>
            <p className="text-foreground/80 leading-relaxed text-sm">{data.whyItMatters}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SnapshotDisplay;
