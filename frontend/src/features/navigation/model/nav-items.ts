import type { LucideIcon } from "lucide-react";
import { Boxes, FileText, Users } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const navItems: NavItem[] = [
  {
    title: "Users",
    href: ROUTES.users,
    icon: Users,
    description: "Ro'yxatdan o'tgan foydalanuvchilar",
  },
  {
    title: "Products",
    href: ROUTES.products,
    icon: Boxes,
    description: "Mahsulotlar va promokodlar",
  },
  {
    title: "Arizalar",
    href: ROUTES.applications,
    icon: FileText,
    description: "Pul yechish so'rovlari",
  },
];
