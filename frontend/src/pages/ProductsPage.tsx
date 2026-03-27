import { type ChangeEvent, useState } from "react";
import { Download } from "lucide-react";
import DataTableShell from "@/components/data-table-shell";
import EmptyState from "@/components/empty-state";
import FeedbackState from "@/components/feedback-state";
import FileUploadButton from "@/components/file-upload-button";
import MetricCard from "@/components/metric-card";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { type ProductItem, getProducts, importProducts } from "@/lib/api";
import { formatMoney } from "@/lib/format";

const demoExcelUrl = import.meta.env.DEV
  ? "/demo-products.xlsx"
  : "/admin/demo-products.xlsx";

export default function ProductsPage() {
  const {
    data: items,
    isLoading,
    error,
    reload
  } = useAsyncResource<ProductItem[]>(async () => {
    const response = await getProducts();
    return response.items;
  }, []);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setUploadError(null);
    setMessage(null);

    try {
      const response = await importProducts(file);
      await reload();
      setMessage(
        `${response.importedProducts} ta mahsulot va ${response.generatedPromoCodes} ta promokod yaratildi.`
      );
    } catch (caughtError) {
      setUploadError((caughtError as Error).message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Excel import"
        title="Mahsulotlar va promokodlar"
        description="Demo faylni yuklab olib, mahsulot nomi, soni va bonus summasini shu formatda to‘ldiring. Upload qilinganda har birlik uchun unikal promokod yaratiladi."
        stats={<MetricCard label="Jami mahsulot" value={items.length} />}
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <a href={demoExcelUrl} download>
                <Download className="size-4" />
                Demo excel yuklash
              </a>
            </Button>
            <FileUploadButton
              label={uploading ? "Yuklanmoqda..." : "Excel yuklash"}
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </>
        }
      />

      <FeedbackState isLoading={isLoading} error={error ?? uploadError} success={message} />

      {!isLoading && !error && !items.length ? (
        <EmptyState
          title="Mahsulotlar hali yuklanmagan"
          description="Excel orqali import qilingan mahsulotlar va ular uchun generatsiya qilingan promokodlar shu yerda ko‘rinadi."
        />
      ) : null}

      {!isLoading && !error && items.length ? (
        <DataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Soni</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Yaratilgan kod</TableHead>
                <TableHead>Ishlatilgan</TableHead>
                <TableHead>Mavjud</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-64 font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatMoney(item.bonusAmount)}</TableCell>
                  <TableCell>{item.generatedCodesCount}</TableCell>
                  <TableCell>{item.activatedCodesCount}</TableCell>
                  <TableCell>{item.availableCodesCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableShell>
      ) : null}
    </section>
  );
}
