import type { ProductDetail } from "@/entities/product/model/types";
import { formatDateTime, formatMoney } from "@/shared/lib/formatters";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

function getStatusVariant(status: "new" | "activated") {
  return status === "activated" ? "success" : "outline";
}

export function PromoCodesTable({ product }: { product: ProductDetail }) {
  if (!product.promoCodes.length) {
    return (
      <EmptyState
        title="Promokodlar topilmadi"
        description="Bu mahsulot uchun hali promokod generatsiya qilinmagan."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Bonus qiymati
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatMoney(product.bonusAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Aktiv kodlar
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {product.activatedCodesCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Bo'sh kodlar
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {product.availableCodesCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-surface-enter">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promokod</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Faollashgan user</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Faollashgan vaqt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.promoCodes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status === "activated" ? "activated" : "new"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.activatedBy?.fullName || item.activatedBy?.telegramId || "Yo'q"}
                  </TableCell>
                  <TableCell>{item.activatedBy?.phoneNumber || "Yo'q"}</TableCell>
                  <TableCell>{formatDateTime(item.activatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
