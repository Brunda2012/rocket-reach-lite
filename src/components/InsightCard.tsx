import { Lightbulb, MessageSquare, TrendingUp, Building2, Users, Target } from "lucide-react";

export interface ProspectInsight {
  companyName: string;
  summary: string;
  insights: Array<{
    icon: string;
    title: string;
    detail: string;
  }>;
  conversationStarter: string;
  whyItMatters: string;
}

const iconMap: Record<string, React.ReactNode> = {
  trending: <TrendingUp className="w-5 h-5" />,
  building: <Building2 className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  lightbulb: <Lightbulb className="w-5 h-5" />,
};

const InsightCard = ({ data }: { data: ProspectInsight }) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Company Header */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              {data.companyName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{data.companyName}</h2>
              <p className="text-muted-foreground text-sm">Prospect Intelligence Report</p>
            </div>
          </div>
          <p className="text-foreground/80 leading-relaxed">{data.summary}</p>
        </div>

        {/* Key Insights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.insights.map((insight, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl shadow-card border border-border p-6 hover:shadow-elevated transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                {iconMap[insight.icon] || <Lightbulb className="w-5 h-5" />}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{insight.detail}</p>
            </div>
          ))}
        </div>

        {/* Conversation Starter */}
        <div className="bg-card rounded-2xl shadow-card border-2 border-primary/20 p-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Conversation Starter</h3>
          </div>
          <p className="text-foreground/90 italic leading-relaxed text-lg">
            "{data.conversationStarter}"
          </p>
        </div>

        {/* Why It Matters */}
        <div className="gradient-accent rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-accent-foreground" />
            <h3 className="font-semibold text-accent-foreground">Why This Matters</h3>
          </div>
          <p className="text-accent-foreground/90 leading-relaxed">
            {data.whyItMatters}
          </p>
        </div>
      </div>
    </section>
  );
};

export default InsightCard;
