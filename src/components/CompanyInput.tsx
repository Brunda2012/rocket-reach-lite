import { useState, forwardRef } from "react";
import { Globe, ArrowRight, Loader2, Linkedin, Plus, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CompanyEntry {
  url: string;
  prospectEmail: string;
}

interface CompanyInputProps {
  onSubmit: (entries: CompanyEntry[], linkedinUrl?: string) => void;
  isLoading: boolean;
}

const MAX_URLS = 4;
const MIN_URLS = 1;

const CompanyInput = forwardRef<HTMLDivElement, CompanyInputProps>(
  ({ onSubmit, isLoading }, ref) => {
    const [entries, setEntries] = useState<CompanyEntry[]>([{ url: "", prospectEmail: "" }]);
    const [linkedinUrl, setLinkedinUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const validEntries = entries
        .map((e) => ({ url: e.url.trim(), prospectEmail: e.prospectEmail.trim() }))
        .filter((e) => e.url.length > 0);
      if (validEntries.length > 0) onSubmit(validEntries, linkedinUrl.trim() || undefined);
    };

    const updateUrl = (index: number, value: string) => {
      setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, url: value } : e)));
    };

    const updateEmail = (index: number, value: string) => {
      setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, prospectEmail: value } : e)));
    };

    const addUrl = () => {
      if (entries.length < MAX_URLS) setEntries((prev) => [...prev, { url: "", prospectEmail: "" }]);
    };

    const removeUrl = (index: number) => {
      if (entries.length > MIN_URLS) setEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const hasValidUrl = entries.some((e) => e.url.trim().length > 0);

    return (
      <div ref={ref} className="animate-fade-in-up stagger-1">
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Company URLs</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Add up to {MAX_URLS} companies to analyze</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {entries.map((entry, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-lg border border-border px-3 py-2 focus-within:border-primary/30 focus-within:shadow-sm transition-all">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={entry.url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder={`https://company${entries.length > 1 ? `-${index + 1}` : ""}.com`}
                    className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 outline-none"
                    disabled={isLoading}
                  />
                  {entries.length > MIN_URLS && (
                    <button
                      type="button"
                      onClick={() => removeUrl(index)}
                      disabled={isLoading}
                      className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-secondary/30 rounded-lg border border-border/60 px-3 py-1.5 ml-5 focus-within:border-primary/20 transition-all">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="email"
                    value={entry.prospectEmail}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="prospect@company.com (optional)"
                    className="flex-1 bg-transparent text-foreground text-xs placeholder:text-muted-foreground/50 outline-none"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}

            {entries.length < MAX_URLS && (
              <button
                type="button"
                onClick={addUrl}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add company ({entries.length}/{MAX_URLS})
              </button>
            )}

            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg border border-border px-3 py-2 focus-within:border-primary/30 transition-all">
              <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="LinkedIn company URL (optional)"
                className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 outline-none"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={!hasValidUrl || isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing {entries.filter((e) => e.url.trim()).length} {entries.filter((e) => e.url.trim()).length === 1 ? "company" : "companies"}...
                </>
              ) : (
                <>
                  Generate {entries.filter((e) => e.url.trim()).length > 1 ? "Snapshots" : "Snapshot"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }
);

CompanyInput.displayName = "CompanyInput";

export default CompanyInput;
