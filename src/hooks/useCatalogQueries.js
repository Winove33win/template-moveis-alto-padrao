import { useQuery } from "@tanstack/react-query";
import { fetchCatalogCategories, fetchCatalogProducts } from "@/api/catalog";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export function useCatalogCategories(options = {}) {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCatalogCategories,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
}

export function useCatalogProducts({ category } = {}, options = {}) {
  return useQuery({
    queryKey: ["catalog", "products", category ?? "all"],
    queryFn: () => fetchCatalogProducts({ category }),
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
}
