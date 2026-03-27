import { getProducts } from "@/shared/api/admin";
import { ProductsGrid } from "@/widgets/products-grid/ui/products-grid";
import { PageIntro } from "@/widgets/page-copy/ui/page-intro";

export default async function ProductsPage() {
  const items = await getProducts();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Products"
        title="Mahsulotlar va promokodlar"
        description="Har bir product bo'yicha quantity, bonus summasi va promokodlar holati ko'rinadi. Ichkariga kirib o'sha product’ga tegishli barcha promokodlarni ko'rish mumkin."
        stats={[
          { label: "Jami products", value: items.length },
          {
            label: "Yaratilgan kodlar",
            value: items.reduce((sum, item) => sum + item.generatedCodesCount, 0),
          },
          {
            label: "Mavjud kodlar",
            value: items.reduce((sum, item) => sum + item.availableCodesCount, 0),
          },
        ]}
      />
      <ProductsGrid items={items} />
    </div>
  );
}
