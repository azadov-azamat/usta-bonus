import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: ReactNode;
};

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="min-w-[180px] bg-foreground text-primary-foreground shadow-[0_30px_60px_-24px_rgba(29,31,24,0.55)]">
      <CardContent className="space-y-2 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">{label}</p>
        <p className="text-3xl font-semibold tracking-[-0.06em]">{value}</p>
      </CardContent>
    </Card>
  );
}
