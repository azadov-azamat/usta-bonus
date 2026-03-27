import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/shared/api/admin";
import { ApiError } from "@/shared/api/api-error";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { PageIntro } from "@/widgets/page-copy/ui/page-intro";
import { PromoCodesTable } from "@/widgets/promo-codes-table/ui/promo-codes-table";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  try {
    const product = await getProductDetail(productId);

    return (
      <div className="space-y-8">
        <div>
          <Button asChild variant="ghost">
            <Link href={ROUTES.products}>
              <ChevronLeft className="size-4" />
              Products ga qaytish
            </Link>
          </Button>
        </div>

        <PageIntro
          eyebrow={`Product #${product.id}`}
          title={product.name}
          description="Bu sahifada tanlangan product uchun yaratilgan barcha promokodlar va ularning aktivatsiya holati ko'rsatiladi."
          stats={[
            { label: "Jami kod", value: product.generatedCodesCount },
            { label: "Aktiv kod", value: product.activatedCodesCount },
            { label: "Bo'sh kod", value: product.availableCodesCount },
          ]}
        />

        <PromoCodesTable product={product} />
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
