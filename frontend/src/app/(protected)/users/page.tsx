import { getUsers } from "@/shared/api/admin";
import { PageIntro } from "@/widgets/page-copy/ui/page-intro";
import { UsersTable } from "@/widgets/users-table/ui/users-table";

export default async function UsersPage() {
  const items = await getUsers();

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Users"
        title="Ro'yxatdan o'tgan foydalanuvchilar"
        description="Botdan o'tgan user'lar, ularning balansi, promokod faolligi va umumiy pul oqimi shu sahifada ko'rinadi."
        stats={[
          { label: "Jami users", value: items.length },
          {
            label: "Faol balans",
            value: `${items.reduce((sum, item) => sum + item.balance, 0).toLocaleString("uz-UZ")} so'm`,
          },
          {
            label: "Ishlatilgan kodlar",
            value: items.reduce((sum, item) => sum + item.promoCodesCount, 0),
          },
        ]}
      />
      <UsersTable items={items} />
    </div>
  );
}
