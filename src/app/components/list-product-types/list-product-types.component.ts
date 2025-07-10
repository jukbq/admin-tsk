import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ProductCategoryService } from '../../shared/services/productCategory/product-category.service';
import { Router } from '@angular/router';
import { ProductCategoryResponse } from '../../shared/interfaces/productCategory';
import { MatDialog } from '@angular/material/dialog';
import { AddProductTypesComponent } from '../../madals/add-product-types/add-product-types.component';

@Component({
  selector: 'app-list-product-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-product-types.component.html',
  styleUrl: './list-product-types.component.scss',
})
export class ListProductTypesComponent {
  public productsCategories: any[] = [];
  public productses_edit_status = false;
  private productsID!: number | string;

  constructor(
    private productCategoruService: ProductCategoryService,
      public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getProductCategories();
  }

  // Отримання категорії з сервера
  getProductCategories(): void {
    this.productCategoruService.getAll().subscribe((data: any) => {
      this.productsCategories = data as ProductCategoryResponse[];
      this.productsCategories.sort((a, b) =>
        a.productCategoryName.localeCompare(b.productCategoryName)
      );
    });
  }

  // Видалення категорію
  delCategory(index: ProductCategoryResponse) {
    this.productCategoruService
      .delProductCategory(index.id as string)
      .then(() => {
        this.getProductCategories();
      });
  }

  addModal(action: string, object: any): void {
     const dialogRef = this.dialog.open(AddProductTypesComponent, {
       hasBackdrop: true,
       panelClass: 'custom-dialog-container',
       data: { action, object },
     });
 
     dialogRef.afterClosed().subscribe(() => {
       this.getProductCategories();
     });
   }
}
