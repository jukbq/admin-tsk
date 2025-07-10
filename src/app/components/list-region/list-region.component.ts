import { Component } from '@angular/core';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { СuisineResponse } from '../../shared/interfaces/countries';
import { CountriesService } from '../../shared/services/countries/countries.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddRegionComponent } from '../../madals/add-region/add-region.component';
import { RegionResponse } from '../../shared/interfaces/region';

@Component({
  selector: 'app-list-region',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './list-region.component.html',
  styleUrl: './list-region.component.scss'
})
export class ListRegionComponent {
  country: СuisineResponse[] = [];
  region: any[] = [];
  filterRegion: any[] = [];
  selectedCountry: Record<string, boolean> = {};
  isDropdownOpen = false;
  isAllSelected = false;


  constructor(
    private storsgeIcon: Storage,
    private cuisineService: CountriesService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getCountry();
    this.getRegionss();
  }


  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen; // Відкрити/закрити меню
  }



  selectAll(event: any): void {
    this.isAllSelected = event.target.checked;
    this.country.forEach((item) => {
      this.selectedCountry[item.id] = this.isAllSelected;
    });
    this.updateSelectedCountry();
  }


  updateSelectedCountry(): void {
    const selectedIds = Object.keys(this.selectedCountry).filter(
      (key) => this.selectedCountry[key]
    );

    if (this.isAllSelected) {
      this.filterRegion = [...this.region]; // Всі продукти
    } else {
      this.filterRegion = this.region.filter((region) =>
        selectedIds.includes(region.country.id)
      );
    }
  }


  // Отримання країни з сервера
  getCountry(): void {
    this.cuisineService.getAll().subscribe((data: any) => {
      this.country = data as СuisineResponse[];
      this.country.sort((a, b) => a.cuisineName.localeCompare(b.cuisineName));
    });
  }


  // Отримання регіонів з сервера
  getRegionss(): void {
    this.cuisineService.getAllRegiom().subscribe((data: any) => {
      this.region = data as RegionResponse[];
      this.filterRegion = [...this.region]; // Спочатку всі продукти
    });
  }


  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddRegionComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getCountry();
    });
  }

  // Видалення регіоон
  delProducts(index: RegionResponse) {
    const flagRef = ref(this.storsgeIcon, index.regionFlag);

    deleteObject(flagRef);

    this.cuisineService.delRegion(index.id as string).then(() => {
      this.getRegionss();
    });
  }
}
