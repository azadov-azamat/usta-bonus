import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function DataTableShell({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">{children}</CardContent>
    </Card>
  );
}
