import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddAboutProductsComponent } from '../add-about-products/add-about-products.component';
import { AboutProductsResponse } from '../../../shared/interfaces/about-products';
import { AboutProductsService } from '../../../shared/services/about-products/about-products.service';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-about-products',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-about-products.component.html',
  styleUrl: './list-about-products.component.scss'
})
export class ListAboutProductsComponent {
  aboutProducts: any[] = [];
  delete: any;

  constructor(
    private storageIcon: Storage,
    private aboutProductsService: AboutProductsService,
    private router: Router,
    public dialog: MatDialog
  ) { }



  ngOnInit(): void {
    this.geHoliday();
    /*  this.addModal('add', 0); */
  }


  // Отримання даних з сервера
  geHoliday(): void {
    this.aboutProductsService.getAll().subscribe((data: any) => {
      this.aboutProducts = data as AboutProductsResponse[];
      this.aboutProducts.sort((a, b) => a.title.localeCompare(b.title));
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddAboutProductsComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.geHoliday();
    });
  }


  // Видалення пункту меню
  delArticle(index: any) {
    const confirmed = window.confirm('Точно видалити цю статтю? Назад дороги нема.');
    if (!confirmed) return;

    this.aboutProductsService.deleteArticleWithImages(index.slug, index.id)
      .then(() => {
        this.geHoliday(); // Оновлення списку
      })
      .catch(error => {
        console.error('Помилка при видаленні:', error);
        alert('Біда! Не вдалось видалити статтю.');
      });
  }



  openHome() {
    this.router.navigate(['/']);
  }
}
