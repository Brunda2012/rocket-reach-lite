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
      <section ref={ref} className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Enter Company URLs
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Add up to {MAX_URLS} companies to analyze. We'll generate a prospect intelligence card for each.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {entries.map((entry, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2 bg-card rounded-2xl shadow-card border border-border p-2 focus-within:shadow-elevated transition-shadow">
                  <div className="pl-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={entry.url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder={`https://company${entries.length > 1 ? `-${index + 1}` : ""}.com`}
                    className="flex-1 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/50 outline-none py-3"
                    disabled={isLoading}
                  />
                  {entries.length > MIN_URLS && (
                    <button
                      type="button"
                      onClick={() => removeUrl(index)}
                      disabled={isLoading}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-card rounded-2xl shadow-card border border-border p-2 focus-within:shadow-elevated transition-shadow ml-6">
                  <div className="pl-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    value={entry.prospectEmail}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="prospect@company.com (optional)"
                    className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 outline-none py-2"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}

            {entries.length < MAX_URLS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUrl}
                disabled={isLoading}
                className="w-full gap-2 rounded-2xl border-dashed"
              >
                <Plus className="w-4 h-4" />
                Add another company ({entries.length}/{MAX_URLS})
              </Button>
            )}

            <div className="flex items-center gap-2 bg-card rounded-2xl shadow-card border border-border p-2 focus-within:shadow-elevated transition-shadow">
              <div className="pl-3">
                <Linkedin className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/... (optional)"
                className="flex-1 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/50 outline-none py-3"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={!hasValidUrl || isLoading}
              className="w-full gradient-primary text-primary-foreground px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
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
            </button>
          </form>
        </div>
      </section>
    );
  }
);

CompanyInput.displayName = "CompanyInput";

export default CompanyInput;
