import { useState, forwardRef } from "react";
import { Globe, ArrowRight, Loader2, Linkedin } from "lucide-react";

interface CompanyInputProps {
  onSubmit: (url: string, linkedinUrl?: string) => void;
  isLoading: boolean;
}

const CompanyInput = forwardRef<HTMLDivElement, CompanyInputProps>(
  ({ onSubmit, isLoading }, ref) => {
    const [url, setUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (url.trim()) onSubmit(url.trim(), linkedinUrl.trim() || undefined);
    };

    return (
      <section ref={ref} className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Enter a Company URL
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            We'll analyze their website and generate a prospect intelligence card
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3 bg-card rounded-2xl shadow-card border border-border p-2 focus-within:shadow-elevated transition-shadow">
              <div className="pl-4">
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://company.com"
                className="flex-1 bg-transparent text-foreground text-lg placeholder:text-muted-foreground/50 outline-none py-3"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-3 bg-card rounded-2xl shadow-card border border-border p-2 focus-within:shadow-elevated transition-shadow">
              <div className="pl-4">
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
              disabled={!url.trim() || isLoading}
              className="w-full gradient-primary text-primary-foreground px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Generate Snapshot
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
