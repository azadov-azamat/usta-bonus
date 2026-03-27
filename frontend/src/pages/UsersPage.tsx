import EmptyState from "@/components/empty-state";
import FeedbackState from "@/components/feedback-state";
import MetricCard from "@/components/metric-card";
import PageHeader from "@/components/page-header";
import DataTableShell from "@/components/data-table-shell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { type UserItem, getUsers } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function UsersPage() {
  const {
    data: items,
    isLoading,
    error
  } = useAsyncResource<UserItem[]>(async () => {
    const response = await getUsers();
    return response.items;
  }, []);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin panel"
        title="Registratsiyadan o‘tgan foydalanuvchilar"
        description="Botdan o‘tgan ustalar, ularning tillari, balansi va promokod faolligi shu yerda ko‘rinadi."
        stats={<MetricCard label="Jami foydalanuvchi" value={items.length} />}
      />

      <FeedbackState isLoading={isLoading} error={error} />

      {!isLoading && !error && !items.length ? (
        <EmptyState
          title="Foydalanuvchilar hali yo‘q"
          description="Bot orqali registratsiya qilingan ustalar shu ro‘yxatda paydo bo‘ladi."
        />
      ) : null}

      {!isLoading && !error && items.length ? (
        <DataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usta</TableHead>
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
                      <p className="font-semibold">{item.fullName || "Ism kiritilmagan"}</p>
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
        </DataTableShell>
      ) : null}
    </section>
  );
}
