import { Component } from '@angular/core';
import { RecipesService } from '../../shared/services/recipes/recipes.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { DishesService } from '../../shared/services/dishes/dishes.service';
import { DishesResponse } from '../../shared/interfaces/dishes';
import { RecipesResponse } from '../../shared/interfaces/recipes';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../shared/services/search/search.service';

interface categoryFilter {
  id: number | string;
  categoryName: string;
}

@Component({
  selector: 'app-list-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-recipes.component.html',
  styleUrl: './list-recipes.component.scss',
})
export class ListRecipesComponent {
  allrecipeSumm: number = 0;
  dishesList: Array<DishesResponse> = [];
  recipes: Array<RecipesResponse> = [];

  query: string = '';

  count: number = 0;

  filterCategoriesDishes: Array<categoryFilter> = [];
  dishesID = '';

  constructor(
    private dishessService: DishesService,
    private categoriesDishesService: CategoriesService,
    private recipesService: RecipesService,
    private searchService: SearchService,
    private storsge: Storage,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.allRecipe();
    this.getDishes();
    /* this.recipesService.clearHolidayFieldInAllRecipes() */
  }

  //Отримання списку страв
  getDishes(): void {
    this.dishessService.getAllDishesight().subscribe((data: any) => {
      this.dishesList = data as DishesResponse[];
      this.dishesList.sort((a, b) => a.dishesName.localeCompare(b.dishesName));
    });
  }

  async allRecipe() {
    this.allrecipeSumm = await this.recipesService.getCollectionCount();
  }

  //ФІЛЬТР РЕЦЕПТІВ
  dishesFiltre(event: any): void {
    const dishesID = event.target.value;
    this.dishesID = dishesID;
    this.filterCategoriesDishes = [];
    this.filterCategoriesDishesById(dishesID);
  }

  //Отримання списку категорій страв
  filterCategoriesDishesById(data: any): void {
    this.categoriesDishesService
      .getCategoryByDishesID(data)
      .subscribe((data: any) => {
        this.filterCategoriesDishes = [];
        this.filterCategoriesDishes = data;
        this.filterCategoriesDishes.sort((a, b) =>
          a.categoryName.localeCompare(b.categoryName)
        );
      });
  }

  //Фільтр рецептів
  resipeFiltre(event: any): void {
    const cayegoryID = event.target.value;
    this.recipes = [];
    if (cayegoryID == 'All') {
      this.recipesService
        .getRecipeByDishesID(this.dishesID)
        .subscribe((data: any) => {
          this.recipes = data;
          this.recipes.sort((a, b) =>
            a.recipeTitle.localeCompare(b.recipeTitle)
          );
          this.count = this.recipes.length;
        });
    } else {
      this.recipesService
        .getRecipeByCategoryID(cayegoryID)
        .subscribe((data: any) => {
          this.recipes = data;
          this.recipes.sort((a, b) =>
            a.recipeTitle.localeCompare(b.recipeTitle)
          );
          this.count = this.recipes.length;
        });
    }
  }

  delRecipe(recipe: RecipesResponse) {
    if (recipe.mainImage) {
      const task = ref(this.storsge, recipe.mainImage);
      deleteObject(task).catch((error) => {
        console.error('Error deleting image:', error);
      });
    }

    this.recipesService.delRecipess(recipe.id as string).then(() => {

    });



  }

  navigateToAddOrEditCategorie(action: string, object: any): void {

    this.router.navigate(['/add-recipe'], {
      queryParams: { action, object: JSON.stringify(object) },
    });
  }
  openHome() {
    this.router.navigate(['/']);
  }

  onSearch(value: string): void {
    const recipeID = this.query
    if (value === 'id') {
      this.recipesService.getRecipeByID(recipeID).subscribe((recipe: any) => {
        this.recipes = recipe;
      })
    } else {
      if (this.query.length >= 3) {
        this.searchService.searchRecipes(this.query).subscribe((results) => {
          this.recipes = results;
        });
      } else {
        this.recipes = [];
      }

    }

  }
}
