import type { ModifierGroup } from "@/domain/catalog/types";

export type SelectionMap = Record<string, string[]>;

export function validateSelections(groups: ModifierGroup[], selections: SelectionMap): string[] {
  const errors: string[] = [];
  for (const group of groups) {
    const count = selections[group.id]?.length ?? 0;
    if ((group.required || group.min > 0) && count < group.min) {
      errors.push(`請完成「${group.name}」`);
    }
    if (count > group.max) {
      errors.push(`「${group.name}」最多可選 ${group.max} 項`);
    }
  }
  return errors;
}

export function calculateConfiguredPrice(basePrice: number, groups: ModifierGroup[], selections: SelectionMap): number {
  return groups.reduce((total, group) => {
    const selectedIds = selections[group.id] ?? [];
    return total + group.options.filter((option) => selectedIds.includes(option.id)).reduce((sum, option) => sum + option.priceDelta, 0);
  }, basePrice);
}
