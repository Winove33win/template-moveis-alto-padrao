import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCatalogCategory,
  updateCatalogCategory,
  deleteCatalogCategory,
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
} from "@/api/admin";

const CATEGORIES_KEY = ["catalog", "categories"];
const PRODUCTS_KEY = ["catalog", "products"];

export function useAdminCatalog() {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: createCatalogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateCatalogCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCatalogCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createCatalogProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => updateCatalogProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteCatalogProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });

  return {
    createCategory: createCategoryMutation.mutateAsync,
    createCategoryStatus: createCategoryMutation,
    updateCategory: updateCategoryMutation.mutateAsync,
    updateCategoryStatus: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    deleteCategoryStatus: deleteCategoryMutation,
    createProduct: createProductMutation.mutateAsync,
    createProductStatus: createProductMutation,
    updateProduct: updateProductMutation.mutateAsync,
    updateProductStatus: updateProductMutation,
    deleteProduct: deleteProductMutation.mutateAsync,
    deleteProductStatus: deleteProductMutation,
  };
}
