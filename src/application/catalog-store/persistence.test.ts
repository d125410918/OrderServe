import { describe, expect, it } from "vitest";
import { normalizePersistedCatalogState, serializeCatalogState } from "./persistence";
import { createInitialCatalogState } from "./reducer";

describe("catalog persistence", () => {
  it("可保存與還原分店獨立菜單", () => {
    const state = createInitialCatalogState();
    const restored = normalizePersistedCatalogState(JSON.parse(serializeCatalogState(state)));
    expect(serializeCatalogState(restored)).toBe(serializeCatalogState(state));
  });

  it("損壞資料會回復安全的預設菜單", () => {
    const restored = normalizePersistedCatalogState({ version: 1, state: { branches: "bad" } });
    expect(restored.branches.length).toBeGreaterThan(0);
    expect(restored.productsByBranch.xinyi.length).toBeGreaterThan(0);
  });
});
