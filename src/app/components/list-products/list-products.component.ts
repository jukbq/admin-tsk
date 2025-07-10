import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { ProductsService } from '../../shared/services/products/products.service';
import { ProductCategoryService } from '../../shared/services/productCategory/product-category.service';
import { ProductCategoryResponse } from '../../shared/interfaces/productCategory';
import { ProductsResponse } from '../../shared/interfaces/products';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddProductComponent } from '../../madals/add-product/add-product.component';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.scss',
})
export class ListProductsComponent {
  productsCategories: ProductCategoryResponse[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategories: Record<string, boolean> = {};
  isDropdownOpen = false;
  isAllSelected = false;



  constructor(
    private storsgeIcon: Storage,
    private productsService: ProductsService,
    private productCategoruService: ProductCategoryService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getProductCategories();
    this.getProducts();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen; // Відкрити/закрити меню
  }

  selectAll(event: any): void {
    this.isAllSelected = event.target.checked;
    this.productsCategories.forEach((item) => {
      this.selectedCategories[item.id] = this.isAllSelected;
    });
    this.updateSelectedCategories();
  }

  updateSelectedCategories(): void {
    const selectedIds = Object.keys(this.selectedCategories).filter(
      (key) => this.selectedCategories[key]
    );

    if (this.isAllSelected) {
      this.filteredProducts = [...this.products]; // Всі продукти
    } else {
      this.filteredProducts = this.products.filter((product) =>
        selectedIds.includes(product.productsCategory.id)
      );
    }
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

  // Отримання продукти з сервера
  getProducts(): void {
    this.productsService.getAll().subscribe((data: any) => {
      this.products = data as ProductsResponse[];
      this.filteredProducts = [...this.products]; // Спочатку всі продукти


    });
  }

  // Видалення категорію
  delProducts(index: ProductsResponse) {
    const task = ref(this.storsgeIcon, index.productsImages);
    deleteObject(task);
    this.productsService.delProducts(index.id as string).then(() => {
      this.getProducts();
    });
  }

  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddProductComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getProductCategories();
    });
  }
}
