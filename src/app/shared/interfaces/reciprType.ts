export interface RecipeTypeRequest {
  recipeTypeName: string;
  slug: string;
  recipeTypeDescription: string;
  metaTtile: string;
  metaDescription: string;
  image: string;
}
export interface RecipeTypeResponse extends RecipeTypeRequest {
  id: number | string;
}
