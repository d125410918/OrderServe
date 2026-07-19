"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="page-header">
      <button type="button" className="icon-button icon-button--ghost" onClick={() => router.back()} aria-label="返回上一頁"><ArrowLeft /></button>
      <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      <div className="page-header__actions">{actions}</div>
    </header>
  );
}
