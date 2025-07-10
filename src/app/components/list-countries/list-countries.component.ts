import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { СuisineResponse } from '../../shared/interfaces/countries';
import { CountriesService } from '../../shared/services/countries/countries.service';
import { AddCuisineModalComponent } from '../../madals/add-cuisine-modal/add-cuisine-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-list-countries',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-countries.component.html',
  styleUrl: './list-countries.component.scss',
})
export class ListCountriesComponent {
  cuisine: Array<СuisineResponse> = [];
  delete: any;

  constructor(
    private storsgeIcon: Storage,
    private cuisineService: CountriesService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getCuisine();
  }

  // Отримання даних з сервера
  getCuisine(): void {
    this.cuisineService.getAll().subscribe((data: any) => {
      this.cuisine = data as СuisineResponse[];
      this.cuisine.sort((a, b) => a.cuisineName.localeCompare(b.cuisineName));
    });
  }

  // Видалення пункту меню
  delCuisine(index: СuisineResponse) {
    const task = ref(this.storsgeIcon, index.image);
    deleteObject(task);
    this.cuisineService.delCuisine(index.id as string).then(() => {
      this.getCuisine();
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddCuisineModalComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCuisine();
    });
  }
}
