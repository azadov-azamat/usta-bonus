import type { ApplicationItem } from "@/entities/application/model/types";
import { formatDateTime, formatMoney } from "@/shared/lib/formatters";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

function getStatusVariant(status: ApplicationItem["status"]) {
  if (status === "completed") {
    return "success" as const;
  }

  if (status === "rejected") {
    return "destructive" as const;
  }

  return "warning" as const;
}

export function ApplicationsList({ items }: { items: ApplicationItem[] }) {
  if (!items.length) {
    return (
      <EmptyState
        title="Arizalar yo'q"
        description="Foydalanuvchilar pul yechish so'rovi yuborganda shu bo'limda chiqadi."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item, index) => (
        <Card
          key={item.id}
          className="animate-surface-enter"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <CardHeader className="gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Ariza #{item.id}
                </p>
                <CardTitle>{item.user?.fullName || "Foydalanuvchi topilmadi"}</CardTitle>
              </div>
              <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] bg-secondary/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Summa
                </p>
                <p className="mt-1 text-lg font-semibold">{formatMoney(item.amount)}</p>
              </div>
              <div className="rounded-[22px] bg-secondary/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Karta
                </p>
                <p className="mt-1 text-lg font-semibold">{item.cardNumber}</p>
              </div>
              <div className="rounded-[22px] bg-secondary/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Telefon
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {item.user?.phoneNumber || "Yo'q"}
                </p>
              </div>
              <div className="rounded-[22px] bg-secondary/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  So'rov vaqti
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatDateTime(item.requestedAt)}
                </p>
              </div>
            </div>

            {item.receiptImageUrl ? (
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={item.receiptImageUrl} target="_blank" rel="noreferrer">
                  Kvitansiyani ko'rish
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
