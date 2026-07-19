import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OrderProvider } from "@/presentation/providers/order-provider";
import { CatalogProvider } from "@/presentation/providers/catalog-provider";

export const metadata: Metadata = {
  title: "咚雞點餐｜多品牌餐飲點餐系統",
  description: "一般點餐、一起點房間、LINE Pay 結帳與多分店管理示範網站。",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#b71916",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW" data-scroll-behavior="smooth">
      <body>
        <CatalogProvider><OrderProvider>{children}</OrderProvider></CatalogProvider>
      </body>
    </html>
  );
}
