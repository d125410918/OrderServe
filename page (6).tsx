import { chromium as pw } from "playwright";
import chromium from "@sparticuz/chromium";
import path from "node:path";
const args = chromium.args.filter((arg) => !["--single-process","--no-zygote","--in-process-gpu","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"].includes(arg)).concat("--disable-gpu");
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? await chromium.executablePath();
const browser = await pw.launch({ executablePath, headless: true, args });
async function setup(page, suffix) {
  await page.goto("http://localhost:3000/admin/branches", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "新增分店" }).click();
  await page.getByLabel("分店名稱").fill(`高雄巨蛋店${suffix}`);
  await page.getByLabel("完整地址").fill("高雄市左營區博愛二路 777 號");
  await page.getByLabel("聯絡電話").fill("07-555-7788");
  await page.getByRole("button", { name: "建立並進入菜單設定" }).click();
  await page.getByPlaceholder("輸入新分區名稱，例如：主餐").fill("招牌主餐");
  await page.getByRole("button", { name: "新增分區" }).click();
  await page.getByRole("button", { name: "新增菜品" }).click();
  await page.getByLabel("菜品名稱").fill("高雄限定香酥雞");
  await page.getByLabel("售價").fill("188");
  await page.getByLabel("卡片簡介").fill("高雄分店限定，現點現做");
  await page.getByLabel("完整說明").fill("店長可直接上傳圖片、設定價格與供應狀態，發布後顧客端立即可選購。");
  await page.locator('input[type="file"]').setInputFiles(path.resolve("tests/fixtures/test-product.png"));
  await page.getByRole("button", { name: "儲存菜品" }).click();
  await page.getByText("高雄限定香酥雞").waitFor();
}
for (const [name, viewport, suffix] of [["desktop-branch-menu", {width:1440,height:1000}, ""], ["mobile-branch-menu", {width:390,height:844}, "-手機"]]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await setup(page, suffix);
  await page.screenshot({ path: `docs/validation/screenshots/${name}.png`, fullPage: true });
  await context.close();
}
const context = await browser.newContext({ viewport: {width:1440,height:1000} });
const page = await context.newPage();
await page.goto("http://localhost:3000/admin/branches", { waitUntil: "networkidle" });
await page.screenshot({ path: "docs/validation/screenshots/desktop-branches-v102.png", fullPage: true });
await context.close();
await browser.close();
