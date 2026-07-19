import assert from "node:assert/strict";
import { chromium as playwrightChromium } from "playwright";
import chromium from "@sparticuz/chromium";

const [name, widthText, heightText, phase = "all"] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(heightText);
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
if (!executablePath) throw new Error("缺少 PLAYWRIGHT_CHROMIUM_PATH");
if (!name || !Number.isFinite(width) || !Number.isFinite(height)) {
  throw new Error("viewport-runner 需要名稱、寬度與高度");
}

const unstableGpuArgs = [
  "--in-process-gpu",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];
const launchArgs = chromium.args
  .filter((arg) => arg !== "--single-process" && arg !== "--no-zygote")
  .filter((arg) => !unstableGpuArgs.includes(arg))
  .concat("--disable-gpu");
const browser = await playwrightChromium.launch({ executablePath, headless: true, args: launchArgs });

async function withIsolatedPage(task) {
  const context = await browser.newContext({ viewport: { width, height } });
  try {
    const page = await context.newPage();
    await task(page);
  } finally {
    await context.close().catch((error) => {
      if (!String(error).includes("Failed to find context")) throw error;
    });
  }
}

async function verifyOrderingFlow(page) {
  await page.goto(`${BASE_URL}/menu`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "雙享餐", exact: true }).waitFor();
  await page.getByRole("button", { name: "快速加入咚雞原味炸雞" }).click();
  const cartText = await page.getByRole("region", { name: "購物車摘要" }).textContent();
  assert.match(cartText ?? "", /購物車 1 項/);
  await page.getByRole("link", { name: /查看購物車/ }).click();
  await page.getByRole("link", { name: "前往確認訂單" }).click();
  await page.getByRole("button", { name: "前往 LINE Pay 付款" }).click();
  await page.waitForURL(/order\/success/, { timeout: 10_000 });
  await page.getByRole("heading", { name: "付款成功，餐點製作中" }).waitFor();
}

async function verifyGroupOrderFlow(page) {
  await page.goto(`${BASE_URL}/group/create`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("發起人名稱").fill("測試房主");
  await page.getByRole("button", { name: "建立房間" }).click();
  await page.waitForURL(/group\/room/, { timeout: 10_000 });
  await page.getByRole("heading", { name: /成員與餐點/ }).waitFor();
  await page.getByText("目前總金額").waitFor();
  await page.getByRole("button", { name: "送出訂單" }).click();
  await page.waitForURL(/checkout/, { timeout: 10_000 });
  await page.getByRole("heading", { name: /咚雞原味炸雞（小美）/ }).first().waitFor();
  await page.getByRole("button", { name: "前往 LINE Pay 付款" }).click();
  await page.getByText("一起點明細已保存").waitFor({ timeout: 10_000 });
}

async function verifyAdmin(page) {
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" });
  const title = page.getByRole("heading", { name: "營運儀表板" });
  await title.waitFor();
  await page.getByText("今日營業額").waitFor();
  if (width <= 640) {
    const box = await title.boundingBox();
    assert.ok(box && box.height <= 52, `手機管理端標題高度不應超過 52px，實際為 ${box?.height ?? "未知"}px`);
  }
}

async function verifyOverflow(page) {
  const routes = ["/menu", "/product/original-chicken", "/group/create", "/group/room", "/checkout", "/admin"];
  for (const route of routes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
    await page.locator("main").waitFor({ state: "visible" });
    const overflowInfo = await page.evaluate(() => {
      const root = document.documentElement;
      const viewportWidth = root.clientWidth;
      const offenders = Array.from(document.querySelectorAll("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${typeof element.className === "string" && element.className ? `.${element.className.trim().replace(/\s+/g, ".")}` : ""}`,
            left: rect.left,
            right: rect.right,
            width: rect.width,
          };
        })
        .filter((item) => item.left < -1 || item.right > viewportWidth + 1)
        .sort((a, b) => b.right - a.right)
        .slice(0, 8);
      return { overflow: root.scrollWidth - root.clientWidth, clientWidth: root.clientWidth, scrollWidth: root.scrollWidth, offenders };
    });
    if (overflowInfo.overflow > 1) console.error(JSON.stringify({ route, ...overflowInfo }, null, 2));
    assert.ok(overflowInfo.overflow <= 1, `${name} ${route} 產生 ${overflowInfo.overflow}px 整頁水平溢位`);
  }
}

try {
  if (phase === "all" || phase === "flows") {
    await withIsolatedPage(verifyOrderingFlow);
    console.log(`✓ ${name}：一般點餐與 LINE Pay 模擬付款`);
    await withIsolatedPage(verifyGroupOrderFlow);
    console.log(`✓ ${name}：一起點房間、參與者明細與送單`);
  }
  if (phase === "all" || phase === "layout") {
    await withIsolatedPage(verifyAdmin);
    await withIsolatedPage(verifyOverflow);
    console.log(`✓ ${name}：管理端與六個主要頁面無水平溢位`);
  }
  if (!["all", "flows", "layout"].includes(phase)) throw new Error(`未知驗證階段：${phase}`);
} finally {
  await browser.close().catch(() => undefined);
}
