import { useState, forwardRef } from "react";
import { Globe, ArrowRight, Loader2, Linkedin, Plus, X } from "lucide-react";
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
    const [urls, setUrls] = useState<string[]>([""]);
    const [linkedinUrl, setLinkedinUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const validUrls = urls.map((u) => u.trim()).filter(Boolean);
      if (validUrls.length > 0) onSubmit(validUrls, linkedinUrl.trim() || undefined);
    };

    const updateUrl = (index: number, value: string) => {
      setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
    };

    const addUrl = () => {
      if (urls.length < MAX_URLS) setUrls((prev) => [...prev, ""]);
    };

    const removeUrl = (index: number) => {
      if (urls.length > MIN_URLS) setUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const hasValidUrl = urls.some((u) => u.trim().length > 0);

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
            {urls.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-card rounded-2xl shadow-card border border-border p-2 focus-within:shadow-elevated transition-shadow"
              >
                <div className="pl-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder={`https://company${urls.length > 1 ? `-${index + 1}` : ""}.com`}
                  className="flex-1 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/50 outline-none py-3"
                  disabled={isLoading}
                />
                {urls.length > MIN_URLS && (
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
            ))}

            {urls.length < MAX_URLS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUrl}
                disabled={isLoading}
                className="w-full gap-2 rounded-2xl border-dashed"
              >
                <Plus className="w-4 h-4" />
                Add another company ({urls.length}/{MAX_URLS})
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
                  Analyzing {urls.filter((u) => u.trim()).length} {urls.filter((u) => u.trim()).length === 1 ? "company" : "companies"}...
                </>
              ) : (
                <>
                  Generate {urls.filter((u) => u.trim()).length > 1 ? "Snapshots" : "Snapshot"}
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
