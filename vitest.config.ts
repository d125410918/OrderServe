"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BellRing, Building2, ClipboardList, LayoutDashboard, LogOut, MenuSquare } from "lucide-react";
import { BrandMark } from "@/presentation/components/brand-mark";
import { useCatalog } from "@/presentation/providers/catalog-provider";

const navItems = [
  { href: "/admin", label: "儀表板", icon: LayoutDashboard },
  { href: "/admin/orders", label: "即時訂單", icon: ClipboardList },
  { href: "/admin/menu", label: "菜單管理", icon: MenuSquare },
  { href: "/admin/branches", label: "分店管理", icon: Building2 },
];

export function AdminShell({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedAdminBranch } = useCatalog();
  return <div className="admin-layout"><aside className="admin-sidebar"><Link href="/menu"><BrandMark compact /></Link><nav>{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? "is-active" : ""}><Icon size={20} />{label}</Link>)}<Link href="/menu"><BarChart3 size={20} />顧客端預覽</Link></nav><div className="admin-sidebar__foot"><strong>{selectedAdminBranch?.name ?? "尚未選擇分店"}</strong><br />分店管理者・demo@dongji.tw</div></aside><main className="admin-main"><div className="admin-topbar"><div><p className="muted" style={{ margin: 0 }}>咚雞餐飲管理中心</p><h1>{title}</h1></div><div className="admin-actions"><button className="icon-button" type="button" aria-label="通知"><BellRing size={19} /></button>{actions}<button className="icon-button" type="button" aria-label="登出"><LogOut size={19} /></button></div></div>{children}</main><nav className="mobile-admin-nav" aria-label="管理端導覽">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Icon size={20} />{label}</Link>)}</nav></div>;
}
