import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { DisheListComponent } from './components/dishe-list/dishe-list.component';
import { ListCategoriesComponent } from './components/list-categories/list-categories.component';
import { ListCountriesComponent } from './components/list-countries/list-countries.component';
import { ListHolidayComponent } from './components/list-holiday/list-holiday.component';
import { ListMethodsComponent } from './components/list-methods/list-methods.component';
import { ListProductTypesComponent } from './components/list-product-types/list-product-types.component';
import { ListProductsComponent } from './components/list-products/list-products.component';
import { ListUnitsComponent } from './components/list-units/list-units.component';
import { ListToolsComponent } from './components/list-tools/list-tools.component';
import { ListRecipeTypeComponent } from './components/list-recipe-type/list-recipe-type.component';
import { ListRecipesComponent } from './recipes/list-recipes/list-recipes.component';
import { AddRecipeComponent } from './recipes/add-recipe/add-recipe.component';
import { ListRegionComponent } from './components/list-region/list-region.component';


export const routes: Routes = [
  { path: 'recipes', component: ListRecipesComponent },
  { path: 'add-recipe', component: AddRecipeComponent },
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'dishes', component: DisheListComponent },
      { path: 'categories', component: ListCategoriesComponent },
      { path: 'countries', component: ListCountriesComponent },
      { path: 'regions', component: ListRegionComponent },
      { path: 'holiday', component: ListHolidayComponent },
      { path: 'methodCooking', component: ListMethodsComponent },
      { path: 'productCategory', component: ListProductTypesComponent },
      { path: 'products', component: ListProductsComponent },
      { path: 'units', component: ListUnitsComponent },
      { path: 'tools', component: ListToolsComponent },
      { path: 'rcipe-tyoe', component: ListRecipeTypeComponent },
    ],
  },

];
