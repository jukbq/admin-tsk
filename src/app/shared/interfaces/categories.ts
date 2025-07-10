import { DishesResponse } from './dishes';

export interface CategoriesRequest {
  dishes: DishesResponse;
  dishesName: DishesResponse;
  dishDescription: DishesResponse;
  seoName: DishesResponse;
  seoDescription: DishesResponse;
  dishesImage: DishesResponse;
  categoryIndex: number;
  categoryName: string;
  categoryDescription: string;
  seoCategoryName: string;
  seoCategoryDescription: string;
  keywords: string;
  image: string;
  additionalImage: string;
}

export interface CategoriesResponse extends CategoriesRequest {
  id: number | string;
}
