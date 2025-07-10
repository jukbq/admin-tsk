import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { СuisineResponse } from '../../shared/interfaces/countries';
import { CountriesService } from '../../shared/services/countries/countries.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { RecipesService } from '../../shared/services/recipes/recipes.service';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-add-cuisine-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditorComponent,],
  templateUrl: './add-cuisine-modal.component.html',
  styleUrl: './add-cuisine-modal.component.scss',
})
export class AddCuisineModalComponent {
  cuisine: Array<СuisineResponse> = [];
  cuisineForm!: FormGroup;
  cuisine_edit_status = false;
  cuisineID!: number | string;
  uploadPercent!: number;
  cuisineImage: string | undefined;

  constructor(
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private countriesService: CountriesService,
    private recipeService: RecipesService,
    public dialogRef: MatDialogRef<AddCuisineModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) { }

  ngOnInit(): void {
    this.initCuisineForm();
    this.getCuisine();
    if (this.data.action === 'edit') {
      this.editСuisine(this.data.object);
    }
  }

  // Ініціалізація форми для страв
  initCuisineForm(): void {
    this.cuisineForm = this.formBuild.group({
      cuisineName: [null],
      slug: [null],
      cusineDescription: [null],
      metaTtile: [null],
      metaDescription: [null],
      image: [null],
    });
  }

  // Отримання даних з сервера
  getCuisine(): void {
    this.countriesService.getAll().subscribe((data: any) => {
      this.cuisine = data as СuisineResponse[];
      this.cuisine.sort((a, b) => a.cuisineName.localeCompare(b.cuisineName));
    });
  }

  // Редагування меню
  editСuisine(cuisine: СuisineResponse) {
    this.cuisineForm.patchValue({
      cuisineName: cuisine.cuisineName,
      slug: cuisine.slug,
      cusineDescription: cuisine.cusineDescription,
      metaTtile: cuisine.metaTtile,
      metaDescription: cuisine.metaDescription,
      image: cuisine.image,
    });
    this.cuisineImage = cuisine.image;
    this.cuisine_edit_status = true;
    this.cuisineID = cuisine.id;
  }

  // Додавання або редагування кухні
  creatCuisine() {
    const cuisineID = this.cuisineID as string;
    const updatedCuisineData = this.cuisineForm.value

    if (this.cuisine_edit_status) {
      this.recipeService.getRecipesByFilter({ cuisineID: cuisineID }).then((recipes: any[]) => {
        // Перебираємо знайдені рецепти
        recipes.forEach((recipe) => {
          if (recipe && recipe.cuisine) {
            recipe.cuisine = {
              ...recipe.cuisine, // Зберігаємо всі старі дані
              cuisineName: updatedCuisineData.cuisineName,
              slug: updatedCuisineData.slug,
              cusineDescription: updatedCuisineData.cusineDescription,
              metaTtile: updatedCuisineData.metaTtile,
              metaDescription: updatedCuisineData.metaDescription,
              image: updatedCuisineData.image, // Оновлюємо фото, якщо потрібно
            };
          }

          this.recipeService.editrecipes(recipe, recipe.id);


        });
      });

      this.countriesService
        .editCuisine(this.cuisineForm.value, this.cuisineID as string)
        .then(() => {
          this.dialogRef.close();
        });
    } else {
      this.countriesService.addCuisine(this.cuisineForm.value).then(() => {
        this.dialogRef.close();
      });
    }
  }

  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.cuisineImage; // Поточне зображення
    const task = ref(this.storsgeIcon, previousImageURL);

    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.cuisineForm.patchValue({ image: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile('cuisine-icon', file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.cuisineForm.patchValue({ image: data });
          this.cuisineImage = data;
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

  close(): void {
    this.dialogRef.close();
  }
}
