import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RecipeTypeResponse } from '../../shared/interfaces/reciprType';
import { RecipeTypeService } from '../../shared/services/recipe-type/recipe-type.service';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { AddRecipeTypenameComponent } from '../../madals/add-recipe-typename/add-recipe-typename.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-list-recipe-type',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-recipe-type.component.html',
  styleUrl: './list-recipe-type.component.scss',
})
export class ListRecipeTypeComponent {
  recipeType: Array<RecipeTypeResponse> = [];

  constructor(
    private storsgeIcon: Storage,
    private recipeTypeService: RecipeTypeService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.geRecipeType();
  }

  // Отримання даних з сервера
  geRecipeType(): void {
    this.recipeTypeService.getAll().subscribe((data: any) => {
      this.recipeType = data as RecipeTypeResponse[];
      this.recipeType.sort((a, b) =>
        a.recipeTypeName.localeCompare(b.recipeTypeName)
      );
    });
  }

  // Видалення пункту меню
  delRecipeType(index: RecipeTypeResponse) {
    const task = ref(this.storsgeIcon, index.image);
    deleteObject(task);
    this.recipeTypeService.delrecipeType(index.id as string).then(() => {
      this.geRecipeType();
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddRecipeTypenameComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.geRecipeType();
    });
  }
}
