import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ProductCategoryService } from '../../shared/services/productCategory/product-category.service';
import { RecipesService } from '../../shared/services/recipes/recipes.service';
import { ProductsService } from '../../shared/services/products/products.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Firestore } from '@angular/fire/firestore';
import { ProductCategoryResponse } from '../../shared/interfaces/productCategory';
import { ProductsResponse } from '../../shared/interfaces/products';
import { ArticlePageService } from '../../shared/services/articles/article-page/article-page.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  productsImages: string | undefined;
  allRecipes: any[] = [];
  recipesResults: any[] = [];
  articlesResults: any[] = [];
  products: any[] = [];
  productsForm!: FormGroup;
  productsCategories: any[] = [];
  uploadPercent!: number;
  productses_edit_status = false;
  productsID!: number | string;

  constructor(
    private productCategoruService: ProductCategoryService,
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private recipeService: RecipesService,
    private articlePageService: ArticlePageService,
    private productsService: ProductsService,
    public dialogRef: MatDialogRef<AddProductComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) {}

  ngOnInit(): void {
    this.initpPoductsForm();
    this.getProductCategories();
    this.getProducts();
    if (this.data.action === 'edit') {
      this.editProducts(this.data.object);
    }
  }

  // Ініціалізація форми продуктів
  initpPoductsForm(): void {
    this.productsForm = this.formBuild.group({
      productsCategory: [null],
      productsName: [null],
      productsCalories: [0],
      productsImages: [null],
      recipeID: [null],
      recipeName: [null],
      recipeImage: [null],
      articleID: [null],
      articleName: [null],
      articleImage: [null],
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

  // Отримання продукти з сервера
  getProducts(): void {
    this.productsService.getAll().subscribe((data: any) => {
      this.products = data as ProductsResponse[];
      this.products.sort((a, b) =>
        a.productsName.localeCompare(b.productsName)
      );
    });
  }

  // Редагування категорію
  editProducts(products: ProductsResponse) {
    this.productsForm.patchValue({
      productsCategory: products.productsCategory,
      productsName: products.productsName,
      productsCalories: products.productsCalories,
      productsImages: products.productsImages,
      recipeID: products.recipeID,
      recipeName: products.recipeName,
      recipeImage: products.recipeImage,
      articleID: products.articleID,
      articleName: products.articleName,
      articleImage: products.articleImage,
    });

    this.productsImages = products.productsImages;
    this.productses_edit_status = true;
    this.productsID = products.id;
  }

  selectRecipe(recipeData: any) {
    this.productsForm.patchValue({
      recipeID: recipeData.id,
      recipeName: recipeData.recipeTitle,
      recipeImage: recipeData.mainImage,
    });
  }

  selectArticle(articleData: any) {
    this.productsForm.patchValue({
      articleID: articleData.slug,
      articleName: articleData.articleName,
      articleImage: articleData.articleImage,
    });
  }

  compareFn(c1: ProductsResponse, c2: ProductsResponse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  // Додавання або редагування продукта
  creatProducts() {
    const productID = this.productsID as string;
    const updatedProductData = this.productsForm.value;

    if (this.productses_edit_status) {
      this.recipeService
        .getRecipesByFilter({ productID: productID })
        .then((recipes: any[]) => {
          // Перебираємо знайдені рецепти

          recipes.forEach((recipe) => {
            // Перебираємо всі інгредієнти та групи в рецепті, щоб знайти та оновити продукт
            recipe.ingredients.forEach((ingredient: any) => {
              ingredient.group.forEach((groupItem: any) => {
                if (groupItem.selectedProduct.id === productID) {
                  // Оновлюємо дані продукту у рецепті

                  groupItem.selectedProduct = {
                    ...groupItem.selectedProduct,
                    productsName: updatedProductData.productsName,
                    productsCalories: updatedProductData.productsCalories,
                    productsImages: updatedProductData.productsImages,
                    recipeID: updatedProductData.recipeID,
                    recipeName: updatedProductData.recipeName,
                    recipeImage: updatedProductData.recipeImage,
                    articleID: updatedProductData.articleID,
                    articleName: updatedProductData.articleName,
                    articleImage: updatedProductData.articleImage,
                  };
                }
              });
            });
            // Оновлюємо рецепт після внесення змін
            this.recipeService.editrecipes(recipe, recipe.id);
          });
        });

      this.productsService.editproducts(
        this.productsForm.value,
        this.productsID as string
      );
    } else {
      this.productsService.addProducts(this.productsForm.value);
    }
    this.dialogRef.close();
  }

  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.productsImages; // Поточне зображення
    const task = ref(this.storsgeIcon, previousImageURL);

    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.productsForm.patchValue({ productsImages: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile('products-icon', file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.productsForm.patchValue({ productsImages: data });
          this.productsImages = data;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Завантаження файлу в хмарне сховище
  async loadFile(
    folder: string,
    name: string,
    file: File | null
  ): Promise<string> {
    const pathIcon = `${folder}/${name}`;
    let urlIcon = '';
    if (file) {
      try {
        const storageRef = ref(this.storsgeIcon, pathIcon);
        const task = uploadBytesResumable(storageRef, file);
        percentage(task).subscribe((data: { progress: number }) => {
          this.uploadPercent = data.progress;
        });
        await task;
        urlIcon = await getDownloadURL(storageRef);
      } catch (e: any) {
        console.error(e);
      }
    } else {
      console.log('Wrong file');
    }
    return Promise.resolve(urlIcon);
  }

  //Пошук рецепта
  onRecipeSearch(): void {
    const query = this.productsForm.get('recipeName')?.value || '';

    if (query.length >= 3) {
      this.recipeService.searchRecipes(query).subscribe((results) => {
        this.allRecipes = results;
        this.recipesResults = this.allRecipes;
      });
    } else {
      this.recipesResults = [];
    }
  }

  //Пошук статті
  onArticleSearch(): void {
    const query = this.productsForm.get('articleName')?.value || '';

    if (query.length >= 3) {
      this.articlePageService.searchArticles(query).subscribe((results) => {
        this.allRecipes = results;
        this.articlesResults = this.allRecipes;
      });
    } else {
      this.articlesResults = [];
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
