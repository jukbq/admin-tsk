import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EditorComponent } from '@tinymce/tinymce-angular';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { DishesService } from '../../shared/services/dishes/dishes.service';
import { Firestore } from '@angular/fire/firestore';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { DishesResponse } from '../../shared/interfaces/dishes';
import { RecipesService } from '../../shared/services/recipes/recipes.service';
import { CategoriesService } from '../../shared/services/categories/categories.service';

@Component({
  selector: 'app-add-dishes-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorComponent,
    MatDialogModule,
  ],
  templateUrl: './add-dishes-modal.component.html',
  styleUrl: './add-dishes-modal.component.scss',
})
export class AddDishesModalComponent {
  dishesForm!: FormGroup;
  dishes: any[] = [];
  dishesImage: string | undefined;
  additionalImage: string | undefined;
  dishesID!: number | string;
  dishess_edit_status = false;
  uploadPercent!: number;

  slug: string = '';
  slugExists: boolean | null = null;



  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private dishesService: DishesService,
    private categoryService: CategoriesService,
    private recipeService: RecipesService,
    public dialogRef: MatDialogRef<AddDishesModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) { }

  ngOnInit(): void {
    this.initDishesForm();
    this.getDishes();
    if (this.data.action === 'edit') {
      this.editDishes(this.data.object);
    }
  }

  // Ініціалізація форми для страв
  initDishesForm(): void {
    this.dishesForm = this.formBuild.group({
      dishesindex: 0,
      dishesName: [null, Validators.required],
      dishDescription: [null],
      seoName: [null],
      seoDescription: [null],
      keywords: [null],
      image: [null, Validators.required],
      additionalImage: [null],
      numberСategories: [null]
    });
  }

  // Отримання страв  з сервера
  getDishes(): void {
    this.dishesService.getAll().subscribe((data: any) => {
      this.dishes = data as DishesResponse[];
    });
  }

  // Редагування категорію
  editDishes(dishes: DishesResponse) {
    this.dishesForm.patchValue({
      dishesindex: dishes.dishesindex,
      dishesName: dishes.dishesName,
      dishDescription: dishes.dishDescription,
      seoName: dishes.seoName,
      keywords: dishes.keywords,
      seoDescription: dishes.seoDescription,
      image: dishes.image,
      additionalImage: dishes.additionalImage,
    });
    this.dishesImage = dishes.image;
    this.additionalImage = dishes.additionalImage;
    this.dishess_edit_status = true;
    this.dishesID = dishes.id;
  }

  // Додавання або редагування меню
  creatDishes() {
    const formData = this.dishesForm.value;
    const slug = this.slug;

    if (this.dishess_edit_status) {
      const dishesID = this.dishesID as string;
      const updatedCuisineData = this.dishesForm.value
      this.recipeService.getRecipesByFilter({ dishesID: dishesID }).then((recipes: any[]) => {
        // Перебираємо знайдені рецепти
        recipes.forEach((recipe) => {
          if (recipe && recipe.dishes) {
            recipe.dishes = {
              ...recipe.dishes, // Зберігаємо всі старі дані
              dishesName: updatedCuisineData.dishesName,
            };
          }

          this.recipeService.editrecipes(recipe, recipe.id);


        });
      });

      this.categoryService.getCategoryByFilter(dishesID).then((category: any[]) => {
        // Перебираємо знайдені рецепти
        category.forEach((category) => {
          if (category && category.dishes) {
            category.dishes = {
              ...category.dishes, // Зберігаємо всі старі дані
              additionalImage: updatedCuisineData.additionalImage,
              dishDescription: updatedCuisineData.dishDescription,
              dishesName: updatedCuisineData.dishesName,
              dishesindex: updatedCuisineData.dishesindex,
              image: updatedCuisineData.image,
              keywords: updatedCuisineData.keywords,
              numberСategories: updatedCuisineData.numberСategories,
              seoName: updatedCuisineData.seoName,
            };
          }


          this.categoryService.editCategories(category, category.categoryId);


        });
      });

      this.dishesService.editdishes(
        formData,
        this.dishesID as string
      );

    } else {
      this.dishesService
        .addDishesWithSlug(formData, slug)
        .then(() => console.log(`Документ створено з ID: ${slug}`))
        .catch(err => console.error(err));
    }
    this.dialogRef.close();
  }


  //Перевірка slug
  async slugValid(): Promise<void> {
    const trimmed = this.slug.trim();
    if (!trimmed) {
      this.slugExists = null;
      return;
    }

    const docSnap = await this.dishesService.checkSlugExistsOnce(trimmed);
    this.slugExists = docSnap.exists();
  }


  // Завантаження зображення
  async uploadUserImage(
    event: any,
    type: 'main' | 'additional' = 'main'
  ): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL =
      type === 'main' ? this.dishesImage : this.additionalImage;
    const task = ref(this.storsgeIcon, previousImageURL);

    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.dishesForm.patchValue({
          [type === 'main' ? 'image' : 'additionalImage']: null,
        });
      });
    }

    this.loadFIle(
      type === 'main' ? 'dishes-image' : 'additional-image',
      file.name,
      file
    )
      .then((data) => {
        if (this.uploadPercent == 100) {
          this.dishesForm.patchValue({
            [type === 'main' ? 'image' : 'additionalImage']: data,
          });
          if (type === 'main') {
            this.dishesImage = data;
          } else {
            this.additionalImage = data;
          }
        }
      })
      .catch((err) => {
        console.error(err);
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
}
