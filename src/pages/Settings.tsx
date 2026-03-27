import { Settings as SettingsIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import TopNav from "@/components/TopNav";

const Settings = () => (
  <DashboardLayout>
    <TopNav title="Settings" description="Manage your preferences" />
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
          <SettingsIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Settings</h2>
          <p className="text-sm text-muted-foreground">Settings and configuration options coming soon.</p>
        </div>
      </div>
    </main>
  </DashboardLayout>
);

export default Settings;
