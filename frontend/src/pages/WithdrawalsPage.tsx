import { type ChangeEvent, useState } from "react";
import EmptyState from "@/components/empty-state";
import FeedbackState from "@/components/feedback-state";
import MetricCard from "@/components/metric-card";
import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAsyncResource } from "@/hooks/use-async-resource";
import {
  completeWithdrawal,
  getWithdrawals,
  type WithdrawalItem
} from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

function getStatusVariant(status: WithdrawalItem["status"]) {
  if (status === "completed") {
    return "success" as const;
  }

  if (status === "rejected") {
    return "destructive" as const;
  }

  return "warning" as const;
}

export default function WithdrawalsPage() {
  const {
    data: items,
    isLoading,
    error,
    reload
  } = useAsyncResource<WithdrawalItem[]>(async () => {
    const response = await getWithdrawals();
    return response.items;
  }, []);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleFileChange =
    (id: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      setSelectedFiles((current) => ({ ...current, [id]: file }));
    };

  const handleSendReceipt = async (item: WithdrawalItem) => {
    const file = selectedFiles[item.id];

    if (!file) {
      setActionError("Avval kvitansiya rasmini tanlang.");
      return;
    }

    setBusyId(item.id);
    setActionError(null);

    try {
      await completeWithdrawal(item.id, file);
      await reload();
    } catch (caughtError) {
      setActionError((caughtError as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="To'lov nazorati"
        title="Kartaga o‘tkazish arizalari"
        description="Kutilayotgan arizalar uchun kvitansiya yuklab, to‘lov tasdig‘ini to‘g‘ridan-to‘g‘ri foydalanuvchining Telegram botiga yuboring."
        stats={
          <MetricCard
            label="Kutilayotgan ariza"
            value={items.filter((item) => item.status === "pending").length}
          />
        }
      />

      <FeedbackState isLoading={isLoading} error={error ?? actionError} />

      {!isLoading && !error && !items.length ? (
        <EmptyState
          title="Arizalar mavjud emas"
          description="Foydalanuvchilar pul yechish uchun ariza yuborganda ular shu sahifada ko‘rinadi."
        />
      ) : null}

      {!isLoading && !error && items.length ? (
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                      Ariza #{item.id}
                    </p>
                    <CardTitle>{item.user?.fullName || "Foydalanuvchi topilmadi"}</CardTitle>
                  </div>
                  <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-secondary/80 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Summa
                    </dt>
                    <dd className="mt-1 text-base font-semibold">{formatMoney(item.amount)}</dd>
                  </div>
                  <div className="rounded-2xl bg-secondary/80 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Karta
                    </dt>
                    <dd className="mt-1 text-base font-semibold">{item.cardNumber}</dd>
                  </div>
                  <div className="rounded-2xl bg-secondary/80 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Telefon
                    </dt>
                    <dd className="mt-1 text-base font-semibold">
                      {item.user?.phoneNumber || "Yo'q"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-secondary/80 p-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Sana
                    </dt>
                    <dd className="mt-1 text-base font-semibold">{formatDate(item.requestedAt)}</dd>
                  </div>
                </dl>

                {item.receiptImageUrl ? (
                  <Button asChild variant="outline">
                    <a href={item.receiptImageUrl} target="_blank" rel="noreferrer">
                      Yuklangan kvitansiyani ko'rish
                    </a>
                  </Button>
                ) : null}

                {item.status === "pending" ? (
                  <>
                    <Separator />
                    <div className="grid gap-3">
                      <Input type="file" accept="image/*" onChange={handleFileChange(item.id)} />
                      <Button
                        type="button"
                        variant="success"
                        onClick={() => handleSendReceipt(item)}
                        disabled={busyId === item.id}
                      >
                        {busyId === item.id ? "Yuborilmoqda..." : "Telegramga yuborish"}
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
