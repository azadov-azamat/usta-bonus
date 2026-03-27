import type { UserItem } from "@/entities/user/model/types";
import { formatMoney } from "@/shared/lib/formatters";
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

export function UsersTable({ items }: { items: UserItem[] }) {
  if (!items.length) {
    return (
      <EmptyState
        title="Users hali yo'q"
        description="Bot orqali ro'yxatdan o'tgan foydalanuvchilar shu bo'limda chiqadi."
      />
    );
  }

  return (
    <Card className="animate-surface-enter">
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Til</TableHead>
              <TableHead>Balans</TableHead>
              <TableHead>Promokod</TableHead>
              <TableHead>Jami bonus</TableHead>
              <TableHead>Yechilgan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="min-w-64">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {item.fullName || "Ism kiritilmagan"}
                    </p>
                    <p className="text-sm text-muted-foreground">ID: {item.telegramId}</p>
                    {item.username ? (
                      <p className="text-sm text-muted-foreground">@{item.username}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{item.phoneNumber || "Yo'q"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.language}</Badge>
                </TableCell>
                <TableCell>{formatMoney(item.balance)}</TableCell>
                <TableCell>{item.promoCodesCount}</TableCell>
                <TableCell>{formatMoney(item.totalEarned)}</TableCell>
                <TableCell>{formatMoney(item.totalWithdrawn)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
