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
  onSelectCompanies: (urls: string[]) => void;
}

const CompanyDiscovery = ({ onSelectCompanies }: CompanyDiscoveryProps) => {
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
        body: { theme: theme.trim() },
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
    onSelectCompanies(urls);
  };

  return (
    <section className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Discover Companies</h3>
            <p className="text-xs text-muted-foreground">Enter an industry or theme to find prospects</p>
          </div>
        </div>

        <form onSubmit={handleDiscover} className="flex gap-2 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-card rounded-2xl shadow-card border border-border p-2 focus-within:shadow-elevated transition-shadow">
            <div className="pl-3">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. health tech, AI infrastructure, fintech..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none py-3"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!theme.trim() || isLoading}
            className="rounded-2xl px-6 gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Discover
          </Button>
        </form>

        {companies.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {companies.map((company, idx) => {
                const isSelected = selected.has(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSelect(idx)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/5 border-primary/30 shadow-elevated"
                        : "bg-card border-border shadow-card hover:shadow-elevated hover:border-primary/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{company.name}</span>
                      </div>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed mb-2">{company.description}</p>
                    <div className="flex items-start gap-1.5">
                      <Globe className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-[11px] text-primary/80 leading-relaxed">{company.whyItMatches}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selected.size > 0 && (
              <div className="mt-6 flex justify-center">
                <Button onClick={handleAnalyze} className="rounded-2xl px-8 gap-2">
                  Analyze {selected.size} {selected.size === 1 ? "Company" : "Companies"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-3">
              Select up to 4 companies to analyze side-by-side
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default CompanyDiscovery;
