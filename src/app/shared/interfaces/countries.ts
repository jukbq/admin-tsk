export interface СuisineRequest {
  cuisineName: string;
  slug: string;
  cusineDescription: string;
  metaTtile: string;
  metaDescription: string;
  image: string;
}
export interface СuisineResponse extends СuisineRequest {
  id: number | string;
}
