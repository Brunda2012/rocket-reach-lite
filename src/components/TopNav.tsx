import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";

interface TopNavProps {
  title: string;
  description?: string;
}

const TopNav = ({ title, description }: TopNavProps) => {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-5 w-px bg-border" />
        <div>
          <h2 className="text-sm font-semibold text-foreground leading-tight">{title}</h2>
          {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          U
        </div>
      </div>
    </header>
  );
};

export default TopNav;
