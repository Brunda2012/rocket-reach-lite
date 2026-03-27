import { MessageSquare, Target, CheckCircle } from "lucide-react";

export interface SnapshotResult {
  insights: string[];
  conversationStarter: string;
  whyItMatters: string;
}

const SnapshotDisplay = ({ data }: { data: SnapshotResult }) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Insights as bullet points */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
          <ul className="space-y-3">
            {data.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground/85 leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conversation starter in highlighted box */}
        <div className="bg-card rounded-2xl shadow-card border-2 border-primary/20 p-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Conversation Starter</h3>
          </div>
          <p className="text-foreground/90 italic leading-relaxed text-lg">
            "{data.conversationStarter}"
          </p>
        </div>

        {/* Why it matters below */}
        <div className="flex items-start gap-3 px-2">
          <Target className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Why this matters:</span>{" "}
            {data.whyItMatters}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SnapshotDisplay;
