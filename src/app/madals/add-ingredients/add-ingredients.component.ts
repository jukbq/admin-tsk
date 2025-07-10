import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ProductCategoryService } from '../../shared/services/productCategory/product-category.service';
import { ProductsService } from '../../shared/services/products/products.service';
import { UnitsService } from '../../shared/services/units/units.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProductCategoryResponse } from '../../shared/interfaces/productCategory';
import { ProductsResponse } from '../../shared/interfaces/products';
import { UnitResponse } from '../../shared/interfaces/units';
import { AddProductTypesComponent } from '../add-product-types/add-product-types.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { AddUnitsComponent } from '../add-units/add-units.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbScrollSpyModule } from '@ng-bootstrap/ng-bootstrap';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-ingredients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    NgbScrollSpyModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
  ],
  templateUrl: './add-ingredients.component.html',
  styleUrl: './add-ingredients.component.scss',
})
export class AddIngredientsComponent {
  @ViewChild('productSelect') productSelect!: MatSelect;
  @ViewChild('productcategory') productcategory!: MatSelect;
  ingredients: any[] = [];
  selectProduct = {};
  selectedCategory!: ProductCategoryResponse;
  productsCategories: any[] = [];
  products: any[] = [];
  units: any[] = [];
  filteredProducts: any[] = [];
  toppings = new FormControl('');
  productControl = new FormControl();
  group: any = [];
  productId = '';
  number: any;


  constructor(
    private formBuild: FormBuilder,
    private productCategoruService: ProductCategoryService,
    private productsService: ProductsService,
    private unitService: UnitsService,
    public dialogRef: MatDialogRef<AddIngredientsComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      object: 'add' | 'edit';
      ingredients: any;
    }
  ) { }

  ngOnInit(): void {
    if (this.data.object === 'edit') {
      this.ingredients = this.data.ingredients;
      const selectedProductFromData =
        this.data.ingredients[0]?.group[0]?.selectedProduct;

      if (selectedProductFromData) {
        const selectedProduct = this.filteredProducts.find(
          (product) =>
            product.productsName === selectedProductFromData.productsName
        );

        if (selectedProduct) {
          this.ingredients[0].group[0].selectedProduct = selectedProduct;
        }
      }
    }
    this.getProductCategories();
    this.getProducts();
    this.getUnits();
    this.addGroup();
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

  // Отримання продуктів з сервера
  getProducts(): void {
    this.productsService.getAll().subscribe((data: any) => {
      this.products = data as ProductsResponse[];
      this.products.sort((a, b) =>
        a.productsName.localeCompare(b.productsName)
      );
    });
  }

  onCategorySelectionChange(): void {
    if (this.selectedCategory) {
      this.filteredProducts = this.products.filter(
        (product) =>
          product.productsCategory.id ===
          this.selectedCategory.id
      );
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  compareFn(c1: ProductsResponse, c2: ProductsResponse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }



  addGroup(): void {
    this.ingredients.push({ name: '', group: [] });
  }

  addIngredient(index: number): void {
    const newIngredient = {
      ingredientId: this.productId,
      selectedProduct: this.selectProduct,
      amount: this.group.amount || 0,
      unitsMeasure: this.group.unitsMeasure || '',
      notes: this.group.notes || '',
    };
    this.ingredients[index].group.push(newIngredient);

    if (this.productSelect) {
      this.productSelect.writeValue(null);
      this.productcategory.writeValue(null);
    }

    // Очищення даних у формах
    this.selectProduct = {};
    this.group = {}; // або можна по-черзі очистити поля group
  }

  // Отримання одинці з сервера
  getUnits(): void {
    this.unitService.getAll().subscribe((data: any[]) => {
      this.units = data as UnitResponse[];
      this.units.sort((a, b) => a.unitName.localeCompare(b.unitName));
    });
  }

  delGroup(index: number): void {
    this.ingredients.splice(index, 1);
  }

  delIng(i: number, j: number): void {
    this.ingredients[i].group.splice(j, 1);
  }

  save(): void {
    this.dialogRef.close({
      ingredients: this.ingredients,
    });
  }

  creatIng(action: string): void {
    //Створити категорію продукта
    if (action === 'getCategory') {
      const dialogRef = this.dialog.open(AddProductTypesComponent, {
        panelClass: 'productCatgories_modal_dialog',
        data: { action: 'add' },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getProductCategories();
        this.getProducts();
      });
    }

    //Створити продукт
    if (action === 'getProduct') {
      const dialogRef = this.dialog.open(AddProductComponent, {
        panelClass: 'creat_ingredient_modal',
        data: { action: 'add' },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getProductCategories();
        this.getProducts();
      });
    }

    //Створити одиницю виміру
    if (action === 'getUnit') {
      const dialogRef = this.dialog.open(AddUnitsComponent, {
        panelClass: 'add_units',
        data: { action: 'add' },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.getUnits();
      });
    }
  }

  // Додайте метод для фільтрації продуктів
  getFilteredProducts(group: any): any[] {
    const filterValue = group.selectedProduct?.toLowerCase() || '';
    return this.filteredProducts.filter((product) =>
      product.productsName.toLowerCase().includes(filterValue)
    );
  }

  getFilteredUnits(): any[] {
    const filterValue = this.group.unitsMeasure?.toLowerCase() || '';
    return this.units.filter((unit) =>
      unit.unitName.toLowerCase().includes(filterValue)
    );
  }

  moveIngredientUp(groupIndex: number, ingredientIndex: number): void {
    if (ingredientIndex > 0) {
      const currentIngredient =
        this.ingredients[groupIndex].group[ingredientIndex];
      const previousIngredient =
        this.ingredients[groupIndex].group[ingredientIndex - 1];

      this.ingredients[groupIndex].group[ingredientIndex] = previousIngredient;
      this.ingredients[groupIndex].group[ingredientIndex - 1] =
        currentIngredient;
    }
  }

  moveIngredientDown(groupIndex: number, ingredientIndex: number): void {
    const ingredientsLength = this.ingredients[groupIndex].group.length;

    if (ingredientIndex < ingredientsLength - 1) {
      const currentIngredient =
        this.ingredients[groupIndex].group[ingredientIndex];
      const nextIngredient =
        this.ingredients[groupIndex].group[ingredientIndex + 1];

      this.ingredients[groupIndex].group[ingredientIndex] = nextIngredient;
      this.ingredients[groupIndex].group[ingredientIndex + 1] =
        currentIngredient;
    }
  }

  editIngredent(i: any, j: any) {
    console.log(i, j);

    const ingredientToEdit = this.ingredients[i];
    const product = ingredientToEdit.group;
    this.selectedCategory = product[j].selectedProduct.
      productsCategory.productCategoryName
    this.selectProduct = product[j].selectedProduct.productsName
    this.group.amount = product[j].amount
    this.group.unitsMeasure = product[j].unitsMeasure
    this.group.notes = product[j].notes
    this.group.productId = product[j].selectedProduct.id
    console.log(ingredientToEdit);
    console.log(product[j]);

    /*   if (this.ingredients[i]) {
           this.productId = ingredientToEdit.ingredientId;
      } else {
        console.error('Ingredient or selected product not found');
      } */

  }
  delIngredent(ingrediebtL: any) { }

  close(): void {
    this.dialogRef.close();
  }
}
