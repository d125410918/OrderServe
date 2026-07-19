import { describe, expect, it } from "vitest";
import { validateProductImageFile } from "./product-image";

describe("product image validation", () => {
  it("接受常用網頁圖片格式", () => {
    expect(validateProductImageFile({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(validateProductImageFile({ type: "image/png", size: 1000 })).toBeNull();
    expect(validateProductImageFile({ type: "image/webp", size: 1000 })).toBeNull();
  });

  it("拒絕不支援格式與過大檔案", () => {
    expect(validateProductImageFile({ type: "image/gif", size: 1000 })).toContain("僅支援");
    expect(validateProductImageFile({ type: "image/png", size: 7 * 1024 * 1024 })).toContain("6 MB");
  });
});
