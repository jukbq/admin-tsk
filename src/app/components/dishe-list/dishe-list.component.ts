import { Component } from '@angular/core';
import { DishesResponse } from '../../shared/interfaces/dishes';
import { CommonModule } from '@angular/common';
import { DishesService } from '../../shared/services/dishes/dishes.service';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { AddDishesModalComponent } from '../../madals/add-dishes-modal/add-dishes-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dishe-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './dishe-list.component.html',
  styleUrl: './dishe-list.component.scss',
})
export class DisheListComponent {
  dishes: Array<DishesResponse> = [];
  dishes_edit_status = false;

  constructor(
    private dishesService: DishesService,
    private storsgeIcon: Storage,
     public dialog: MatDialog,
 
  ) {}

  ngOnInit(): void {
    this.getDishes();
  }

  // Отримання даних з сервера
  getDishes(): void {
    this.dishesService.getAll().subscribe((data: any) => {
      console.log(data);
      this.dishes = data as DishesResponse[];
    });
  }

  // Видалення пункту меню
  delDishes(index: DishesResponse) {
    if (index.image) {
      const task = ref(this.storsgeIcon, index.image);
      deleteObject(task).catch((error) => {
        console.error('Error deleting image:', error);
      });
    }

    this.dishesService.delDishes(index.id as string).then(() => {
      this.getDishes();
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddDishesModalComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
         this.getDishes();
    });
  }
}
