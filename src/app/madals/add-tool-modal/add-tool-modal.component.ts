import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToolsService } from '../../shared/services/tools/tools.service';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ToolsResponse } from '../../shared/interfaces/tools';
import { RecipesService } from '../../shared/services/recipes/recipes.service';

@Component({
  selector: 'app-add-tool-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-tool-modal.component.html',
  styleUrl: './add-tool-modal.component.scss',
})
export class AddToolModalComponent {
  tools: any[] = [];
  toolsForm!: FormGroup;
  uploadPercent!: number;
  toolses_edit_status = false;
  toolsID!: number | string;
  tolImage: string | undefined;

  constructor(
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private toolsService: ToolsService,
    private recipeService: RecipesService,
    public dialogRef: MatDialogRef<AddToolModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) { }

  ngOnInit(): void {
    this.initpToolsForm();
    this.getTools();
    if (this.data.action === 'edit') {
      this.editTools(this.data.object);
    }
  }

  // Ініціалізація форми продуктів
  initpToolsForm(): void {
    this.toolsForm = this.formBuild.group({
      toolsName: [null],
      image: [null],
    });
  }

  // Отримання продукти з сервера
  getTools(): void {
    this.toolsService.getAll().subscribe((data: any[]) => {
      this.tools = data as ToolsResponse[];
      this.tools.sort((a, b) => a.toolsName.localeCompare(b.toolsName));
    });
  }

  // Редагування категорію
  editTools(products: ToolsResponse) {
    this.toolsForm.patchValue({
      toolsName: products.toolsName,
      image: products.image,
    });
    this.tolImage = products.image;
    this.toolses_edit_status = true;
    this.toolsID = products.id;
  }

  // Додавання або редагування продукта
  creatTools() {
    const toolsID = this.toolsID as string;
    const updatedCuisineData = this.toolsForm.value

    if (this.toolses_edit_status) {

      this.recipeService.getRecipesByFilter({ toolsID: toolsID }).then((recipes: any[]) => {
        // Перебираємо знайдені рецепти
        recipes.forEach((recipe) => {
          if (recipe && recipe.tools) {
            recipe.tools = {
              ...recipe.tools, // Зберігаємо всі старі дані
              toolsName: updatedCuisineData.toolsName,
              image: updatedCuisineData.image,
            };
          }

          this.recipeService.editrecipes(recipe, recipe.id);


        });
      });

      this.toolsService
        .editTools(this.toolsForm.value, this.toolsID as string)
        .then(() => {
          this.dialogRef.close();
        });
    } else {
      this.toolsService.addTools(this.toolsForm.value).then(() => {
        this.dialogRef.close();
      });
    }

  }

  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.tolImage; // Поточне зображення
    const task = ref(this.storsgeIcon, previousImageURL);

    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.toolsForm.patchValue({ image: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile('tools-icon', file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.toolsForm.patchValue({ image: data });
          this.tolImage = data;
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
