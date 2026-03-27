import { getApplications } from "@/shared/api/admin";
import { ApplicationsList } from "@/widgets/applications-list/ui/applications-list";
import { PageIntro } from "@/widgets/page-copy/ui/page-intro";

export default async function ApplicationsPage() {
  const items = await getApplications();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Applications"
        title="Pul yechish arizalari"
        description="Arizalar status, summa, karta va foydalanuvchi ma'lumotlari bilan ko'rsatiladi. Agar backendda kvitansiya mavjud bo'lsa, shu yerning o'zidan ko'rish mumkin."
        stats={[
          { label: "Jami ariza", value: items.length },
          {
            label: "Pending",
            value: items.filter((item) => item.status === "pending").length,
          },
          {
            label: "Completed",
            value: items.filter((item) => item.status === "completed").length,
          },
        ]}
      />
      <ApplicationsList items={items} />
    </div>
  );
}
