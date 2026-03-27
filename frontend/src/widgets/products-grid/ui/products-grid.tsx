import { ArrowRight, Barcode, Boxes, Ticket } from "lucide-react";
import Link from "next/link";
import type { ProductItem } from "@/entities/product/model/types";
import { ROUTES } from "@/shared/config/routes";
import { formatMoney } from "@/shared/lib/formatters";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

export function ProductsGrid({ items }: { items: ProductItem[] }) {
  if (!items.length) {
    return (
      <EmptyState
        title="Mahsulotlar yo'q"
        description="Import qilingan mahsulotlar va ularga biriktirilgan promokodlar shu yerda ko'rinadi."
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
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Product #{item.id}
                </p>
                <CardTitle className="text-2xl">{item.name}</CardTitle>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Boxes className="size-5" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] bg-secondary/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Soni
                </p>
                <p className="mt-1 text-xl font-semibold">{item.quantity}</p>
              </div>
              <div className="rounded-[22px] bg-secondary/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Bonus
                </p>
                <p className="mt-1 text-xl font-semibold">{formatMoney(item.bonusAmount)}</p>
              </div>
              <div className="rounded-[22px] bg-secondary/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Mavjud
                </p>
                <p className="mt-1 text-xl font-semibold">{item.availableCodesCount}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Barcode className="size-4" />
                Jami kod: {item.generatedCodesCount}
              </span>
              <span className="inline-flex items-center gap-2">
                <Ticket className="size-4" />
                Aktiv: {item.activatedCodesCount}
              </span>
            </div>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`${ROUTES.products}/${item.id}`}>
                Promo kodlarni ko'rish
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
