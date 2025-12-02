
import { CategoriesResponse } from "./categories";
import { СuisineResponse } from "./countries";
import { DishesResponse } from "./dishes";
import { ProductsRequest } from "./products";
import { RegionResponse } from "./region";

export interface RecipeStep {
  setepNumber: number;
  stepName: string;
  stepDescription: string;
  image: string;
  stepVideo: string;
  stepNotes: string;
}

export interface Instructions {
  name: string;
  description: string;
  image: string;
}
export interface Comments {
  user: string;
  userImage: string;
  date: Date;
  comments: string;
}

export interface MethodCooking {
  methodCookingName: string;
}

export interface DifficultyPreparation {
  list: string;
  linamest: string;
}

export interface RecipesRequest {
  //Сторінка 1
  dishes: DishesResponse;
  categoriesDishes: CategoriesResponse;
  recipeKeys: CategoriesResponse;
  cuisine: СuisineResponse;
  region: RegionResponse;
  autor: string;
  methodCooking: MethodCooking[];
  tools: string[];
  difficultyPreparation: DifficultyPreparation[];
  bestSeason: string;
  totalTime: string;
  prepTime: string;
  cookTime: string;

  //Сторінка 2
  recipeTitle: string;
  recipeSubtitles: string;
  descriptionRecipe: string;
  mainImage: string;
  keywords: string;

  //Сторінка 3
  numberServings: number;
  numberCalories: number;
  quantityIngredients: number;
  unitsMeasure: number | string;
  ingredients: ProductsRequest;
  notes: string;

  //Сторінка 4
  instructions: Instructions[];
  advice: string;
  videoUrl: string;
  comments: Comments[];
  createdAt: string;
  holiday: string;
  completion: string;
  recipeType: string;

  rating: number | string;
  seoName: string;
  seoDescription: string;
  seoImage: string;

  adRecipeID: string;
  recipeName: string;
  articleID: string;
  articleName: string;
}
export interface RecipesResponse extends RecipesRequest {
  id: number | string;
}