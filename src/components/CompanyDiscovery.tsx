import { useState } from "react";
import { Search, Loader2, Globe, ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DiscoveredCompany {
  name: string;
  website: string;
  description: string;
  whyItMatches: string;
}

interface CompanyDiscoveryProps {
  onSelectCompanies: (urls: string[], theme?: string) => void;
  country?: string;
}

const CompanyDiscovery = ({ onSelectCompanies, country }: CompanyDiscoveryProps) => {
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<DiscoveredCompany[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;
    setIsLoading(true);
    setCompanies([]);
    setSelected(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("discover-companies", {
        body: { theme: theme.trim(), country },
      });
      if (error) throw error;
      if (data?.companies) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else if (next.size < 4) next.add(idx);
      return next;
    });
  };

  const handleAnalyze = () => {
    const urls = Array.from(selected).map((i) => companies[i].website);
    onSelectCompanies(urls, theme);
  };

  return (
    <div className="animate-fade-in-up stagger-2">
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Discover Companies</h3>
            <p className="text-xs text-muted-foreground">Enter a theme to find matching prospects</p>
          </div>
        </div>

        <form onSubmit={handleDiscover} className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg border border-border px-3 py-2 focus-within:border-primary/30 transition-all">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. health tech, AI infrastructure, fintech..."
              className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 outline-none"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={!theme.trim() || isLoading} size="sm" className="gap-1.5 shrink-0">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {isLoading ? "Searching..." : "Find"}
          </Button>
        </form>

        {companies.length > 0 && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {companies.map((company, idx) => {
                const isSelected = selected.has(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSelect(idx)}
                    className={`text-left p-3.5 rounded-lg border transition-all duration-150 ${
                      isSelected
                        ? "bg-primary/5 border-primary/25 shadow-sm"
                        : "bg-secondary/30 border-border hover:bg-secondary/60 hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{company.name}</span>
                      </div>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-1.5">{company.description}</p>
                    <div className="flex items-start gap-1.5">
                      <Globe className="w-2.5 h-2.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-[10px] text-primary/80 leading-relaxed">{company.whyItMatches}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selected.size > 0 && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleAnalyze} size="sm" className="gap-1.5">
                  Analyze {selected.size} {selected.size === 1 ? "Company" : "Companies"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <p className="text-center text-[10px] text-muted-foreground mt-2">
              Select up to 4 companies to analyze side-by-side
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDiscovery;
