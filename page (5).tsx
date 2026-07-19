import { chromium as pw } from "playwright";
import chromium from "@sparticuz/chromium";

const executablePath = await chromium.executablePath();
const unstableGpuArgs = new Set([
  "--in-process-gpu",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
]);
const args = chromium.args
  .filter((arg) => arg !== "--single-process" && arg !== "--no-zygote" && !unstableGpuArgs.has(arg))
  .concat("--disable-gpu");
const browser = await pw.launch({ executablePath, headless: true, args });
const baseUrl = process.env.VISUAL_BASE_URL ?? "http://localhost:45000";

async function capture(name, path, viewport, setup) {
  const context = await browser.newContext({ viewport });
  try {
    const page = await context.newPage();
    if (setup) await setup(page);
    else await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `docs/validation/screenshots/${name}.png`, fullPage: true });
  } finally {
    await context.close();
  }
}

const mobile = { width: 390, height: 844 };
const desktop = { width: 1440, height: 1000 };
await capture("mobile-menu", "/menu", mobile);
await capture("mobile-product", "/product/original-chicken", mobile);
await capture("mobile-group-create", "/group/create", mobile);
await capture("mobile-group-room", "/group/room", mobile, async (page) => {
  await page.goto(`${baseUrl}/group/create`, { waitUntil: "networkidle" });
  await page.getByLabel("發起人名稱").fill("測試房主");
  await page.getByRole("button", { name: "建立房間" }).click();
  await page.waitForURL(/group\/room/);
});
await capture("mobile-checkout", "/checkout", mobile, async (page) => {
  await page.goto(`${baseUrl}/menu`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "快速加入咚雞原味炸雞" }).click();
  await page.getByRole("link", { name: /查看購物車/ }).click();
  await page.getByRole("link", { name: "前往確認訂單" }).click();
});
await capture("mobile-success", "/order/success", mobile, async (page) => {
  await page.goto(`${baseUrl}/menu`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "快速加入咚雞原味炸雞" }).click();
  await page.getByRole("link", { name: /查看購物車/ }).click();
  await page.getByRole("link", { name: "前往確認訂單" }).click();
  await page.getByRole("button", { name: "前往 LINE Pay 付款" }).click();
  await page.waitForURL(/order\/success/);
});
await capture("desktop-menu", "/menu", desktop);
await capture("desktop-admin", "/admin", desktop);
await capture("mobile-admin", "/admin", mobile);
await browser.close();
