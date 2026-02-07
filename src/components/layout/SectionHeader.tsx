import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function SectionHeader({ title, description, icon: Icon, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
