import { ProductCategoryResponse } from "./productCategory";

export interface ProductsRequest {
  productsCategory: ProductCategoryResponse;
  productsName: string;
  productsCalories: number;
  productsImages: string;
  recipeID: string;
  recipeName: string;
  articleList: string;
}
export interface ProductsResponse extends ProductsRequest {
  id: number | string;
}