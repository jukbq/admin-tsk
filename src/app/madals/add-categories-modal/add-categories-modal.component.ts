import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { EditorComponent } from '@tinymce/tinymce-angular';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { DishesResponse } from '../../shared/interfaces/dishes';
import { CategoriesResponse } from '../../shared/interfaces/categories';
import { DishesService } from '../../shared/services/dishes/dishes.service';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { Firestore } from '@angular/fire/firestore';
import { RecipesService } from '../../shared/services/recipes/recipes.service';

@Component({
  selector: 'app-add-categories-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorComponent,
    MatDialogModule,
  ],
  templateUrl: './add-categories-modal.component.html',
  styleUrl: './add-categories-modal.component.scss',
})
export class AddCategoriesModalComponent {
  dishes: Array<DishesResponse> = [];
  categoriesDishes: Array<CategoriesResponse> = [];
  categoriesDishesForm!: FormGroup;
  uploadPercent!: number;
  categories_edit_status = false;
  categoriesID!: number | string;
  categoryImage: string | undefined;
  additionalImage: string | undefined;

  createdAt: any = '';

  slug: string = '';
  slugExists: boolean | null = null;

  constructor(
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private dishesService: DishesService,
    private categoryService: CategoriesService,
    private recipeService: RecipesService,
    public dialogRef: MatDialogRef<AddCategoriesModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) {}

  ngOnInit(): void {
    this.initCategoriesDishesForm();
    this.getDishes();
    this.getCategories();
    this.createdAt = new Date().toISOString().split('T')[0];
    if (this.data.action === 'edit') {
      this.editCategoriesDishes(this.data.object);
    }

    /*  this.categoryService.addPetitionField() */
  }

  // Ініціалізація форми категорій
  initCategoriesDishesForm(): void {
    this.categoriesDishesForm = this.formBuild.group({
      dishes: [null],
      categoryIndex: [null],
      smallName: [null],
      slug: [null],
      categoryName: [null],
      categoryDescription: [null],
      seoCategoryName: [null],
      seoCategoryDescription: [null],
      keywords: [null],
      image: [null],
      additionalImage: [null],
      createdAt: [null],
    });
  }

  // Отримання страв  з сервера
  getDishes(): void {
    this.dishesService.getAll().subscribe((data: any) => {
      this.dishes = data as DishesResponse[];
      this.dishes.sort((a, b) => a.dishesName.localeCompare(b.dishesName));
    });
  }

  // Отримання категорій  з сервера
  getCategories(): void {
    this.categoryService.getAll().subscribe((data: any) => {
      this.categoriesDishes = data as CategoriesResponse[];
      this.categoriesDishes.sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName)
      );
    });
  }

  // Редагування категорію
  editCategoriesDishes(categori: CategoriesResponse) {
    this.categoriesDishesForm.patchValue({
      dishes: categori.dishes,
      categoryIndex: categori.categoryIndex,
      categoryName: categori.categoryName,
      categoryDescription: categori.categoryDescription,
      seoCategoryName: categori.seoCategoryName,
      seoCategoryDescription: categori.seoCategoryDescription,
      keywords: categori.keywords,
      image: categori.image,
      additionalImage: categori.additionalImage,
      createdAt: this.createdAt,
    });

    this.categoryImage = categori.image;
    this.additionalImage = categori.additionalImage;
    this.categories_edit_status = true;
    this.categoriesID = categori.id;
  }

  compareFn(c1: DishesResponse, c2: DishesResponse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  // Додавання або редагування меню
  creatCategories() {
    const categoriesID = this.categoriesID as string;
    const updatedCuisineData = this.categoriesDishesForm.value;

    


    const formData = {
  ...this.categoriesDishesForm.value,
  createdAt: this.createdAt,
};
    const slug = this.slug;
 


    if (this.categories_edit_status) {
      this.recipeService
        .getRecipesByFilter({ categoriesID: categoriesID })
        .then((recipes: any[]) => {
          // Перебираємо знайдені рецепти
          recipes.forEach((recipe) => {
            if (recipe && recipe.categoriesDishes) {
              recipe.categoriesDishes = {
                ...recipe.categoriesDishes, // Зберігаємо всі старі дані
                categoryName: updatedCuisineData.categoryName,
              };
            }

            this.recipeService.editrecipes(recipe, recipe.id);
          });
        });

      this.categoryService
        .editCategories(
          this.categoriesDishesForm.value,
          this.categoriesID as string
        )
        .then(() => {
          this.dialogRef.close();
        });
    } else {
         
      let currentCategoriesNumber =
        this.categoriesDishesForm.get('dishes')?.value?.numberСategories;
      if (
        typeof currentCategoriesNumber === 'number' &&
        !isNaN(currentCategoriesNumber)
      ) {
        // Збільшуємо значення на 1 при додаванні нової категорії
        currentCategoriesNumber += 1;

        // Оновлюємо значення numberСategories у формі перед відправкою
        this.categoriesDishesForm.patchValue({
          numberСategories: currentCategoriesNumber,
        });
      }

      this.categoryService
        .addCategories(formData, slug)
        .then(() => console.log(`Документ створено з ID: ${slug}`))
        .catch((err) => console.error(err));

      this.dialogRef.close();
    }
  }

  // Завантаження зображення
  async uploadUserImage(
    event: any,
    type: 'main' | 'additional' = 'main'
  ): Promise<void> {
    const file = event.target.files[0];

    const previousImageURL =
      type === 'main' ? this.categoryImage : this.additionalImage;

    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      // Парсимо шлях з URL
      const decodedUrl = decodeURIComponent(previousImageURL);
      const match = decodedUrl.match(/\/o\/(.*?)\?alt=media/);
      if (match && match[1]) {
        const filePath = match[1]; // Шлях до файлу у Firebase Storage
        const storageRef = ref(this.storsgeIcon, filePath); // Правильний референс

        try {
          await deleteObject(storageRef); // Видаляємо файл
          this.uploadPercent = 0;
          this.categoriesDishesForm.patchValue({
            [type === 'main' ? 'image' : 'additionalImage']: null,
          });
        } catch (error) {
          console.error('Помилка при видаленні файлу:', error);
        }
      } else {
        console.warn(
          'Не вдалося отримати шлях до файлу з URL:',
          previousImageURL
        );
      }
    }

    // Завантажуємо нове зображення
    this.loadFIle(
      type === 'main' ? 'categoriesDishes-image' : 'additional-image',
      file.name,
      file
    )
      .then((data) => {
        if (this.uploadPercent == 100) {
          this.categoriesDishesForm.patchValue({
            [type === 'main' ? 'image' : 'additionalImage']: data,
          });
          this.getDishes();
          if (type === 'main') {
            this.categoryImage = data;
          } else {
            this.additionalImage = data;
          }
        }
      })
      .catch((err) => {
        console.error('Помилка при завантаженні файлу:', err);
      });
  }

  // Завантаження файлу в хмарне сховище
  async loadFIle(
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

  close(): void {
    this.dialogRef.close();
  }

  //Перевірка slug
  async slugValid(): Promise<void> {
    const trimmed = this.slug.trim();

    // 🔴 Перевірка на наявність кирилиці
    const hasCyrillic = /[а-яіїєґА-ЯІЇЄҐ]/.test(trimmed);
    if (hasCyrillic) {
      alert(
        '❌ Слаг не має містити кирилицю. Використовуй тільки латиницю, цифри та дефіси.'
      );
      this.slugExists = true; // можна показати, що невалідний
      return;
    }

    if (!trimmed) {
      this.slugExists = null;
      return;
    }

    const docSnap = await this.recipeService.checkSlugExistsOnce(trimmed);
    this.slugExists = docSnap.exists();

    if (this.slugExists) {
      alert('❌ Такий слаг вже існує. Вибери інший.');
    } else {
      alert('✅ Слаг виглядає добре і вільний.');
    }
  }
}
