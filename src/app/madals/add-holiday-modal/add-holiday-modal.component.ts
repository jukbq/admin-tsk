import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { HolidayResponse } from '../../shared/interfaces/holiday';
import { HolidayService } from '../../shared/services/holiday/holiday.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { RecipesService } from '../../shared/services/recipes/recipes.service';


@Component({
  selector: 'app-add-holiday-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-holiday-modal.component.html',
  styleUrl: './add-holiday-modal.component.scss',
})
export class AddHolidayModalComponent {
  holiday: Array<HolidayResponse> = [];
  holidayForm!: FormGroup;
  holiday_edit_status = false;
  holidayID!: number | string;
  uploadPercent!: number;
  holidayImage: string | undefined;

  constructor(
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private holidayService: HolidayService,
    private recipeService: RecipesService,
    public dialogRef: MatDialogRef<AddHolidayModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) { }

  ngOnInit(): void {
    this.initHolidayForm();
    this.getHolidays();
    if (this.data.action === 'edit') {
      this.editHolidaye(this.data.object);
    }
  }

  // Ініціалізація форми для свят
  initHolidayForm(): void {
    this.holidayForm = this.formBuild.group({
      holidayName: [null],
      slug: [null],
      holidayDescription: [null],
      metaTtile: [null],
      metaDescription: [null],
      image: [null],
    });
  }

  // Отримання даних з сервера
  getHolidays(): void {
    this.holidayService.getAll().subscribe((data: any) => {
      this.holiday = data as HolidayResponse[];
      this.holiday.sort((a, b) => a.holidayName.localeCompare(b.holidayName));
    });
  }

  // Редагування меню
  editHolidaye(holiday: HolidayResponse) {
    this.holidayForm.patchValue({
      holidayName: holiday.holidayName,
      slug: holiday.slug,
      holidayDescription: holiday.holidayDescription,
      metaTtile: holiday.metaTtile,
      metaDescription: holiday.metaDescription,
      image: holiday.image,
    });
    this.holidayImage = holiday.image;
    this.holiday_edit_status = true;
    this.holidayID = holiday.id;


  }

  // Додавання або редагування свята
  creatHoliday() {
    const holidayID = this.holidayID as string;
    const updatedHolidayData = this.holidayForm.value;

    if (this.holiday_edit_status) {
      this.recipeService.getRecipesByFilter({ holidayID: holidayID }).then((recipes: any[]) => {
        recipes.forEach((recipe) => {
          if (Array.isArray(recipe.holiday)) {
            recipe.holiday = recipe.holiday.map((holiday: any) => {
              if (holiday.id === holidayID) {
                return {
                  ...holiday,
                  holidayName: updatedHolidayData.holidayName,
                  slug: updatedHolidayData.slug,
                  holidayDescription: updatedHolidayData.holidayDescription,
                  metaTtile: updatedHolidayData.metaTtile,
                  metaDescription: updatedHolidayData.metaDescription,
                  image: updatedHolidayData.image,
                };
              }
              return holiday;
            });
          }

          this.recipeService.editrecipes(recipe, recipe.id);
        });

        // Після оновлення всіх рецептів редагуємо свято і закриваємо діалог
        this.holidayService.editHoliday(this.holidayForm.value, holidayID).then(() => {
          this.dialogRef.close();
        });
      });
    } else {
      // Додаємо нове свято
      this.holidayService.addHoliday(this.holidayForm.value).then(() => {
        this.dialogRef.close();
      });
    }
  }

  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.holidayImage; // Поточне зображення
    const task = ref(this.storsgeIcon, previousImageURL);

    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.holidayForm.patchValue({ image: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile('holiday-icon', file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.holidayForm.patchValue({ image: data });
          this.holidayImage = data;
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
