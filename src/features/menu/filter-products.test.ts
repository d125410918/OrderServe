import { describe, expect, it } from "vitest";
import { filterProducts } from "./filter-products";

const products = [
  { id: "1", name: "原味炸雞", shortDescription: "經典酥脆", categoryId: "chicken", tag: "熱門", spicy: false, available: true },
  { id: "2", name: "韓式辣雞", shortDescription: "香辣醬汁", categoryId: "chicken", tag: "新品", spicy: true, available: true },
  { id: "3", name: "可樂", shortDescription: "冰涼飲品", categoryId: "drinks", spicy: false, available: false },
];

describe("filterProducts", () => {
  it("依分類、關鍵字與篩選條件交集查詢", () => {
    expect(filterProducts(products, { categoryId: "chicken", query: "辣", filter: "spicy" }).map((item) => item.id)).toEqual(["2"]);
  });

  it("available 篩選排除售完商品", () => {
    expect(filterProducts(products, { categoryId: "all", query: "", filter: "available" }).map((item) => item.id)).toEqual(["1", "2"]);
  });
});
