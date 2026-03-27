import { useState } from "react";
import {
  Settings as SettingsIcon, User, Monitor, Database, Send, Info,
  Sun, Moon, RotateCcw, Trash2, ChevronDown, ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettings, type AppSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

type SectionId = "preferences" | "display" | "data" | "outreach" | "system";

const sections: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "preferences", label: "User Preferences", icon: User },
  { id: "display", label: "Display & UI", icon: Monitor },
  { id: "data", label: "Data & Intelligence", icon: Database },
  { id: "outreach", label: "Outreach", icon: Send },
  { id: "system", label: "System", icon: Info },
];

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SelectRow({ label, description, value, options, onChange }: {
  label: string; description?: string; value: string;
  options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary/50 border border-border rounded-lg text-sm px-3 py-1.5 text-foreground outline-none focus:border-primary/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function InputRow({ label, description, value, placeholder, onChange }: {
  label: string; description?: string; value: string; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5 mb-2">{description}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary/50 border border-border rounded-lg text-sm px-3 py-2 text-foreground outline-none focus:border-primary/30 placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

const Settings = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(["preferences"]));

  const toggle = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleClearCache = () => {
    localStorage.removeItem("prospectai-emails");
    toast({ title: "Cache cleared", description: "All cached results have been removed." });
  };

  const handleReset = () => {
    resetSettings();
    toast({ title: "Settings reset", description: "All settings restored to defaults." });
  };

  return (
    <DashboardLayout>
      <TopNav title="Settings" description="Configure your experience" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-4">
          {sections.map(({ id, label, icon: Icon }) => {
            const isOpen = openSections.has(id);
            return (
              <div key={id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground flex-1 text-left">{label}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4">
                    {id === "preferences" && (
                      <>
                        <InputRow
                          label="Default interest category"
                          description="Pre-fill the discovery search with this category"
                          value={settings.defaultCategory}
                          placeholder="e.g., health tech, AI, fintech"
                          onChange={(v) => updateSetting("defaultCategory", v)}
                        />
                        <SelectRow
                          label="Default email tone"
                          value={settings.defaultTone}
                          options={[
                            { value: "friendly", label: "Friendly" },
                            { value: "formal", label: "Formal" },
                            { value: "bold", label: "Bold" },
                          ]}
                          onChange={(v) => updateSetting("defaultTone", v as AppSettings["defaultTone"])}
                        />
                        <InputRow
                          label="Default email CTA"
                          description="Custom call-to-action for generated emails"
                          value={settings.defaultCTA}
                          placeholder="e.g., Let's connect for a quick chat"
                          onChange={(v) => updateSetting("defaultCTA", v)}
                        />
                        <ToggleRow
                          label="Show advanced insights"
                          description="Display detailed strategic signals and growth indicators"
                          checked={settings.showAdvancedInsights}
                          onChange={(v) => updateSetting("showAdvancedInsights", v)}
                        />
                        <ToggleRow
                          label='Include "Helpful For" classification'
                          description="Show who each organisation is most helpful for"
                          checked={settings.includeHelpfulFor}
                          onChange={(v) => updateSetting("includeHelpfulFor", v)}
                        />
                      </>
                    )}

                    {id === "display" && (
                      <>
                        <ToggleRow
                          label="Dark mode"
                          description="Switch between light and dark themes"
                          checked={settings.darkMode}
                          onChange={(v) => updateSetting("darkMode", v)}
                        />
                        <ToggleRow
                          label="Compact layout"
                          description="Use tighter spacing for more content density"
                          checked={settings.compactLayout}
                          onChange={(v) => updateSetting("compactLayout", v)}
                        />
                        <ToggleRow
                          label="Enable animations"
                          description="Smooth transitions and entrance animations"
                          checked={settings.enableAnimations}
                          onChange={(v) => updateSetting("enableAnimations", v)}
                        />
                        <ToggleRow
                          label="Enable skeleton loaders"
                          description="Show skeleton placeholders while content loads"
                          checked={settings.enableSkeletons}
                          onChange={(v) => updateSetting("enableSkeletons", v)}
                        />
                      </>
                    )}

                    {id === "data" && (
                      <>
                        <ToggleRow
                          label="Fetch public contact details"
                          description="Extract emails, phones, and addresses from company websites"
                          checked={settings.fetchPublicContacts}
                          onChange={(v) => updateSetting("fetchPublicContacts", v)}
                        />
                        <ToggleRow
                          label="Classify organisation helpfulness"
                          description="Determine who each organisation is most helpful for"
                          checked={settings.classifyHelpfulness}
                          onChange={(v) => updateSetting("classifyHelpfulness", v)}
                        />
                        <ToggleRow
                          label="Generate suitability score"
                          description="AI-powered 0-100 score for prospect fit"
                          checked={settings.generateSuitabilityScore}
                          onChange={(v) => updateSetting("generateSuitabilityScore", v)}
                        />
                        <ToggleRow
                          label="Include growth indicators"
                          description="Detect and show company growth signals"
                          checked={settings.includeGrowthIndicators}
                          onChange={(v) => updateSetting("includeGrowthIndicators", v)}
                        />
                        <ToggleRow
                          label="Include hiring signals"
                          description="Show current hiring trends and job openings"
                          checked={settings.includeHiringSignals}
                          onChange={(v) => updateSetting("includeHiringSignals", v)}
                        />
                      </>
                    )}

                    {id === "outreach" && (
                      <>
                        <SelectRow
                          label="Subject line style"
                          value={settings.subjectLineStyle}
                          options={[
                            { value: "short", label: "Short (3-5 words)" },
                            { value: "punchy", label: "Punchy & bold" },
                            { value: "descriptive", label: "Descriptive" },
                          ]}
                          onChange={(v) => updateSetting("subjectLineStyle", v as AppSettings["subjectLineStyle"])}
                        />
                        <SelectRow
                          label="Email length"
                          value={settings.emailLength}
                          options={[
                            { value: "short", label: "Short (~75 words)" },
                            { value: "medium", label: "Medium (~150 words)" },
                            { value: "detailed", label: "Detailed (~250 words)" },
                          ]}
                          onChange={(v) => updateSetting("emailLength", v as AppSettings["emailLength"])}
                        />
                        <ToggleRow
                          label="Include relevance score"
                          description="Show AI-generated relevance score with each email"
                          checked={settings.includeRelevanceScore}
                          onChange={(v) => updateSetting("includeRelevanceScore", v)}
                        />
                        <ToggleRow
                          label="Include recommended recipient"
                          description="Suggest the best email address to send outreach to"
                          checked={settings.includeRecommendedRecipient}
                          onChange={(v) => updateSetting("includeRecommendedRecipient", v)}
                        />
                      </>
                    )}

                    {id === "system" && (
                      <div className="space-y-4 pt-1">
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">Clear cached results</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Remove all locally cached email and analysis data</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleClearCache}>
                            <Trash2 className="w-3.5 h-3.5" /> Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">Reset to defaults</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Restore all settings to their original values</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleReset}>
                            <RotateCcw className="w-3.5 h-3.5" /> Reset
                          </Button>
                        </div>
                        <div className="py-3 bg-secondary/30 rounded-lg px-4">
                          <p className="text-sm font-medium text-foreground">ProspectAI</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Version 1.0.0 · HealthTech Hackathon Edition</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Built with Lovable Cloud · Powered by AI</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Settings;
