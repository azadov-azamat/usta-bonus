import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  className?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  stats,
  className
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 rounded-[2rem] border border-white/45 bg-white/40 p-6 shadow-[0_30px_70px_-36px_rgba(55,44,23,0.38)] backdrop-blur-sm lg:flex-row lg:items-start lg:justify-between",
        className
      )}
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[240px] lg:items-end">
        {stats}
        {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  );
}
