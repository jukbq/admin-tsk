import { ProductCategoryResponse } from "./productCategory";

export interface ProductsRequest {
  productsCategory: ProductCategoryResponse;
  productsName: string;
  productsCalories: number;
  productsImages: string;
  recipeID: string;
  recipeName: string;
  recipeImage: string;
  articleID: string;
  articleName: string;
  articleImage: string;
}
export interface ProductsResponse extends ProductsRequest {
  id: number | string;
}