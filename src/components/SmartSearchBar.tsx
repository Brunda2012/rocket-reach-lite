import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { ALL_COUNTRIES, ALL_REGIONS } from "@/lib/regions";

const INDUSTRIES = [
  "Health Tech", "AI / Machine Learning", "Fintech", "EdTech", "CleanTech",
  "Biotech", "SaaS", "Cybersecurity", "IoT", "Robotics", "AgriTech",
  "InsurTech", "PropTech", "LegalTech", "E-Commerce", "Gaming",
];

const POPULAR_KEYWORDS = [
  "AI hiring", "climate tech funding", "remote-first", "series A",
  "open source", "developer tools", "digital health", "blockchain",
];

function buildSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  if (!q) return [];
  const all = [
    ...INDUSTRIES,
    ...ALL_COUNTRIES.filter((c) => c !== "All Countries"),
    ...ALL_REGIONS.filter((r) => r !== "All Regions"),
    ...POPULAR_KEYWORDS,
  ];
  return all.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
}

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SmartSearchBar = ({ value, onChange, onSubmit, placeholder, disabled }: SmartSearchBarProps) => {
  const [open, setOpen] = useState(false);
  const suggestions = buildSuggestions(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (s: string) => {
    onChange(s);
    onSubmit(s);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex-1">
      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg border border-border px-3 py-2 focus-within:border-primary/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter") { onSubmit(value); setOpen(false); } }}
          placeholder={placeholder || "Search companies, industries, countries…"}
          className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 outline-none"
          disabled={disabled}
        />
        {value && (
          <button onClick={() => { onChange(""); }} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-elevated overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pick(s)}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary/60 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;
