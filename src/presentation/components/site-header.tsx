"use client";

import Link from "next/link";
import { ChevronDown, MapPin, UsersRound, LayoutDashboard } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ModeSwitcher } from "./mode-switcher";
import { branches } from "@/infrastructure/mock/catalog";
import { useOrder } from "@/presentation/providers/order-provider";

export function SiteHeader() {
  const { state, setBranch, setMode } = useOrder();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__top">
          <Link href="/menu" className="brand-link"><BrandMark /></Link>
          <nav className="desktop-nav" aria-label="主要導覽">
            <Link href="/menu">開始點餐</Link>
            <Link href="/group/create"><UsersRound size={17} />一起點</Link>
            <Link href="/admin"><LayoutDashboard size={17} />管理後台</Link>
          </nav>
          <label className="branch-selector">
            <MapPin size={18} />
            <select value={state.branchId} onChange={(event) => setBranch(event.target.value)} aria-label="選擇分店">
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <ChevronDown size={17} aria-hidden="true" />
          </label>
        </div>
        <ModeSwitcher value={state.mode} onChange={setMode} />
      </div>
    </header>
  );
}
