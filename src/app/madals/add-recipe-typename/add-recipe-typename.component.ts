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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipeTypeResponse } from '../../shared/interfaces/reciprType';
import { RecipeTypeService } from '../../shared/services/recipe-type/recipe-type.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { RecipesService } from '../../shared/services/recipes/recipes.service';

@Component({
  selector: 'app-add-recipe-typename',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-recipe-typename.component.html',
  styleUrl: './add-recipe-typename.component.scss',
})
export class AddRecipeTypenameComponent {
  recipeType: Array<RecipeTypeResponse> = [];
  recipeTypeForm!: FormGroup;
  recipeType_edit_status = false;
  recipeTypeID!: number | string;
  uploadPercent!: number;
  recipeTypeImage: string | undefined;

  constructor(
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private recipeTypeService: RecipeTypeService,
    public dialogRef: MatDialogRef<AddRecipeTypenameComponent>,
    private recipeService: RecipesService,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) { }

  ngOnInit(): void {
    this.initRecipeTypeForm();
    this.getRecipeType();
    if (this.data.action === 'edit') {
      this.editRecipeTypee(this.data.object);
    }
  }

  // Ініціалізація форми
  initRecipeTypeForm(): void {
    this.recipeTypeForm = this.formBuild.group({
      recipeTypeName: [null],
      slug: [null],
      recipeTypeDescription: [null],
      metaTtile: [null],
      metaDescription: [null],
      image: [null],
    });
  }

  // Отримання даних
  getRecipeType(): void {
    this.recipeTypeService.getAll().subscribe((data: any) => {
      this.recipeType = data as RecipeTypeResponse[];
      this.recipeType.sort((a, b) =>
        a.recipeTypeName.localeCompare(b.recipeTypeName)
      );
    });
  }

  // Редагування
  editRecipeTypee(recipeType: RecipeTypeResponse) {
    this.recipeTypeForm.patchValue({
      recipeTypeName: recipeType.recipeTypeName,
      slug: recipeType.slug,
      recipeTypeDescription: recipeType.recipeTypeDescription,
      metaTtile: recipeType.metaTtile,
      metaDescription: recipeType.metaDescription,
      image: recipeType.image,
    });
    this.recipeType_edit_status = true;
    this.recipeTypeID = recipeType.id;
    this.recipeTypeImage = recipeType.image;
  }

  // Додавання або редагування
  creatRecipeTypee() {
    const recipeTypeID = this.recipeTypeID as string;
    const updatedRecipeTypeIDData = this.recipeTypeForm.value;

    if (this.recipeType_edit_status) {
      this.recipeService.getRecipesByFilter({ recipeTypeID: recipeTypeID }).then((recipes: any[]) => {
        recipes.forEach((recipe) => {
          if (Array.isArray(recipe.recipeType)) {
            recipe.recipeType = recipe.recipeType.map((recipeType: any) => {
              if (recipeType.id === recipeTypeID) {
                return {
                  ...recipeType,
                  recipeTypeName: updatedRecipeTypeIDData.recipeTypeName,
                  slug: updatedRecipeTypeIDData.slug,
                  recipeTypeDescription: updatedRecipeTypeIDData.recipeTypeDescription,
                  metaTtile: updatedRecipeTypeIDData.metaTtile,
                  metaDescription: updatedRecipeTypeIDData.metaDescription,
                  image: updatedRecipeTypeIDData.image,
                };
              }
              return recipeType;
            });
          }

          this.recipeService.editrecipes(recipe, recipe.id);
        });

        // Після оновлення всіх рецептів редагуємо свято і закриваємо діалог
        this.recipeTypeService.editrecipeType(this.recipeTypeForm.value, recipeTypeID).then(() => {
          this.dialogRef.close();
        });
      });
    } else {
      // Додаємо нове свято
      this.recipeTypeService.addrecipeType(this.recipeTypeForm.value).then(() => {
        this.dialogRef.close();
      });
    }


  }

  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.recipeTypeImage; // Поточне зображення
    const task = ref(this.storsgeIcon, previousImageURL);

    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.recipeTypeForm.patchValue({ image: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile('recipe-type-icon', file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.recipeTypeForm.patchValue({ image: data });
          this.recipeTypeImage = data;
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
