export interface DishesRequest {
  dishesindex: number;
  dishesName: string;
  dishDescription: string;
  seoName: string;
  seoDescription: string;
  keywords: string;
  image: string;
  createdAt: string;
  additionalImage: string;
  numberСategories: number;
}
export interface DishesResponse extends DishesRequest {
  value: any;
  id: number | string;
}