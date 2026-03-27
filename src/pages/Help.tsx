import {
  HelpCircle, Search, BarChart3, Send, Mail, Settings, Users, Phone,
  Globe, Shield, Sparkles, FileText, AlertTriangle, CheckCircle, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";

interface HelpCard {
  icon: React.ElementType;
  title: string;
  content: string[];
}

const modules: HelpCard[] = [
  {
    icon: Search,
    title: "Discover",
    content: [
      "Enter a theme like 'health tech', 'AI fintech', or 'climate startups' and the AI will find 8 matching companies.",
      "You can filter by country to narrow results to a specific region.",
      "Select up to 4 companies, then click 'Analyze' to generate deep intelligence.",
    ],
  },
  {
    icon: BarChart3,
    title: "Insights",
    content: [
      "View the history of all analysed companies with confidence and suitability scores.",
      "Click any company to see its full profile, signals, key people, and contact details.",
      "Use insights to understand a company's strategic direction before reaching out.",
    ],
  },
  {
    icon: Send,
    title: "Outreach Engine",
    content: [
      "After analysing a company, open the Outreach Engine to generate a personalised cold email.",
      "The AI uses company signals, pain points, and growth indicators to craft a warm, credible email.",
      "Each email includes a subject line, body, recommended recipient, relevance score, and reasoning.",
    ],
  },
  {
    icon: Mail,
    title: "Email Pack",
    content: [
      "All generated emails are collected on the Email Pack page in collapsible cards.",
      "Each card shows the company name, subject, email body, and relevance score.",
      "Use 'Copy' on individual emails or 'Copy All' to grab everything at once.",
    ],
  },
  {
    icon: Settings,
    title: "Settings",
    content: [
      "Configure default interest categories, email tone (friendly/formal/bold), and CTA text.",
      "Toggle features like dark mode, compact layout, animations, and skeleton loaders.",
      "Control data options: public contacts, helpfulness classification, suitability scoring, growth and hiring signals.",
      "Set outreach preferences: subject line style, email length, relevance score, and recipient display.",
    ],
  },
];

const faqItems = [
  {
    q: 'What does "Helpful For" mean?',
    a: "Each organisation is classified by who it's most useful for — Startups, Students, Job Seekers, Researchers, Innovators, Founders, Investors, Employees, Corporates, or Early-stage Entrepreneurs. This helps you quickly identify relevance.",
  },
  {
    q: "How are public contact details collected?",
    a: "We only extract publicly available, company-level contact information (info@, support@, contact@ emails, phone numbers, addresses) from the company's own website. No private data is collected.",
  },
  {
    q: "How does country filtering work?",
    a: "On the Discover page, select a country from the dropdown. The AI will focus its search on companies operating in or headquartered in that country. Choose 'All Countries' for global results.",
  },
  {
    q: "How do I compare companies?",
    a: "Select 2–4 companies from Discover and analyse them. The Comparison Board automatically appears, showing side-by-side signals, scores, pain points, and contacts.",
  },
  {
    q: "Why is an analysis failing?",
    a: "Some websites block scraping or have very little text content. If analysis fails, try a different URL or check that the website is publicly accessible.",
  },
  {
    q: "Are my settings saved?",
    a: "Yes. All settings are saved in your browser's local storage and persist across sessions. Use 'Reset to defaults' in Settings to restore original values.",
  },
];

const Help = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <TopNav title="Help & Documentation" description="Learn how to use ProspectAI" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Intro */}
          <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome to ProspectAI</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              ProspectAI is an AI-powered prospect intelligence platform. Discover companies by theme, analyse their websites for strategic signals, generate personalised outreach emails, and manage everything from a single dashboard.
            </p>
            <Button className="mt-5 gap-2" onClick={() => navigate("/discover")}>
              <Search className="w-4 h-4" /> Start Discovering <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Modules */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">How Each Module Works</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map(({ icon: Icon, title, content }) => (
                <div key={title} className="bg-card rounded-xl border border-border shadow-card p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                  </div>
                  <ul className="space-y-2">
                    {content.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                        <CheckCircle className="w-3 h-3 text-success shrink-0 mt-0.5" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqItems.map(({ q, a }, i) => (
                <div key={i} className="bg-card rounded-xl border border-border shadow-card p-4">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-3 h-3 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">{q}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Troubleshooting</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Page shows 404? Use the sidebar to navigate — all pages are registered.",
                "Analysis stuck loading? The AI may take up to 30 seconds. If it fails, retry or try a different URL.",
                "Email not generating? Ensure you've analysed a company first, then open the Outreach Engine.",
                "Settings not saving? Check that your browser allows localStorage. Try clearing cache in Settings.",
                "Dark mode not working? Toggle it in Settings → Display & UI.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-destructive">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-[10px] text-muted-foreground">ProspectAI v1.0.0 · HealthTech Hackathon Edition</p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Help;
