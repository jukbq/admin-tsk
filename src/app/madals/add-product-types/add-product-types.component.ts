import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ProductCategoryService } from '../../shared/services/productCategory/product-category.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductCategoryResponse } from '../../shared/interfaces/productCategory';

@Component({
  selector: 'app-add-product-types',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-product-types.component.html',
  styleUrl: './add-product-types.component.scss',
})
export class AddProductTypesComponent {
  productsCategories: any[] = [];
  productsCategoryForm!: FormGroup;
  active_form = false;
  productses_edit_status = false;
  private productsID!: number | string;

  constructor(
    private productCategoruService: ProductCategoryService,
    private formBuild: FormBuilder,
    public dialogRef: MatDialogRef<AddProductTypesComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any }
  ) { }

  ngOnInit(): void {
    this.initpCategoryForm();
    this.getProductCategories();
    if (this.data.action === 'edit') {
      this.editCategory(this.data.object);
    }
  }

  // Ініціалізація форми категорій
  initpCategoryForm(): void {
    this.productsCategoryForm = this.formBuild.group({
      productCategoryName: [null],
    });
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

  // Редагування категорію
  editCategory(category: ProductCategoryResponse) {
    this.productsCategoryForm.patchValue({
      productCategoryName: category.productCategoryName,
    });
    this.active_form = true;
    this.productses_edit_status = true;
    this.productsID = category.id;
  }

  // Додавання або редагування продукта
  creatProductCategory() {
    if (this.productses_edit_status) {
      this.productCategoruService
        .editProductCategory(
          this.productsCategoryForm.value,
          this.productsID as string
        )
        .then(() => {
          this.dialogRef.close();
        });
    } else {
      this.productCategoruService
        .addProductCategory(this.productsCategoryForm.value)
        .then(() => {
          this.dialogRef.close();
        });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
