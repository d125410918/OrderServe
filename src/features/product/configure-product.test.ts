import { describe, expect, it } from "vitest";
import { validateSelections } from "./configure-product";

const groups = [
  { id: "size", name: "份量", required: true, min: 1, max: 1, options: [{ id: "small", name: "小份", priceDelta: 0 }] },
  { id: "extras", name: "加購", required: false, min: 0, max: 2, options: [{ id: "rice", name: "白飯", priceDelta: 20 }] },
];

describe("validateSelections", () => {
  it("回報未完成的必選群組", () => {
    expect(validateSelections(groups, {})).toEqual(["請完成「份量」"]);
  });

  it("合法選擇不回傳錯誤", () => {
    expect(validateSelections(groups, { size: ["small"], extras: ["rice"] })).toEqual([]);
  });
});
