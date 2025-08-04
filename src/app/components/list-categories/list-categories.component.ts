import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DishesResponse } from '../../shared/interfaces/dishes';
import { CategoriesResponse } from '../../shared/interfaces/categories';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { DishesService } from '../../shared/services/dishes/dishes.service';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { Router } from '@angular/router';
import { AddCategoriesModalComponent } from '../../madals/add-categories-modal/add-categories-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-list-categories',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-categories.component.html',
  styleUrl: './list-categories.component.scss',
})
export class ListCategoriesComponent {
  dishes?: Array<DishesResponse> = [];
  categoriesDishes: Array<CategoriesResponse> = [];
  filterCategoriesDishes: Array<CategoriesResponse> = [];
  dishesID = '';
  filter = false;

  constructor(
    private storsgeIcon: Storage,
    private dishesService: DishesService,
    private categoriesDishesService: CategoriesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getDishes();
    this.getCategories();
  }

  // Отримання страв  з сервера
  getDishes(): void {
    this.dishesService.getAll().subscribe((data: any) => {
      this.dishes = data as DishesResponse[];
      console.log(this.dishes);

    });
  }

  //ФІЛЬТР РЕЦЕПТІВ
  dishesFiltre(event: any): void {
    const dishesID = event.target.value;
    this.filterCategoriesDishes = [];
    this.filterCategoriesDishesById(dishesID);
  }

  //Отримання списку категорій страв
  filterCategoriesDishesById(data: any): void {
    if (data == 'all') {
      this.filter = false;
    } else {
      const dishesid = data;
      this.filterCategoriesDishes = this.categoriesDishes.filter((dish) =>
        dishesid.includes(dish.dishes.id)
      );


      this.filterCategoriesDishes.sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName)
      );
      this.filter = true;
    }
  }

  // Отримання категорій  з сервера
  getCategories(): void {
    this.categoriesDishesService.getAll().subscribe((data: any) => {
      this.categoriesDishes = data as CategoriesResponse[];


      this.categoriesDishes.sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName)
      );
      console.log(this.categoriesDishes);

    });
  }

  // Видалення категорію
  delCategori(index: CategoriesResponse) {



    if (index.image) {
      const task = ref(this.storsgeIcon, index.image);
      deleteObject(task).catch((error) => {
        console.error('Error deleting image:', error);
      });
    }

    this.categoriesDishesService.delCategories(index.id as string).then(() => {
      this.getDishes();
    });
  }


  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddCategoriesModalComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCategories();
    });
  }
}
