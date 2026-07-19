export type FilterableProduct = {
  id: string;
  name: string;
  shortDescription: string;
  categoryId: string;
  tag?: string;
  spicy?: boolean;
  available: boolean;
};

export type ProductFilter = "all" | "popular" | "new" | "spicy" | "available";

export function filterProducts<T extends FilterableProduct>(
  products: T[],
  options: { categoryId: string; query: string; filter: ProductFilter },
): T[] {
  const normalizedQuery = options.query.trim().toLocaleLowerCase("zh-TW");
  return products.filter((product) => {
    const categoryMatches = options.categoryId === "all" || product.categoryId === options.categoryId;
    const queryMatches = normalizedQuery.length === 0 || `${product.name} ${product.shortDescription}`.toLocaleLowerCase("zh-TW").includes(normalizedQuery);
    const filterMatches =
      options.filter === "all" ||
      (options.filter === "popular" && product.tag === "熱門") ||
      (options.filter === "new" && product.tag === "新品") ||
      (options.filter === "spicy" && product.spicy === true) ||
      (options.filter === "available" && product.available);
    return categoryMatches && queryMatches && filterMatches;
  });
}
