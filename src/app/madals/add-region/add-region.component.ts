import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountriesService } from '../../shared/services/countries/countries.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Firestore } from '@angular/fire/firestore';
import { RegionResponse } from '../../shared/interfaces/region';
import { СuisineResponse } from '../../shared/interfaces/countries';
import { RecipesService } from '../../shared/services/recipes/recipes.service';
import { Storage, deleteObject, getDownloadURL, percentage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Component({
  selector: 'app-add-region',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-region.component.html',
  styleUrl: './add-region.component.scss'
})
export class AddRegionComponent {
  countries: any[] = [];
  regios: any[] = [];
  regionFlag: string | undefined;
  region_edit_status = false;
  regoinID!: number | string;
  regionForm!: FormGroup;
  uploadPercent!: number;



  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    public dialogRef: MatDialogRef<AddRegionComponent>,
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private afs: Firestore,
    private cuisineService: CountriesService,
    private recipeService: RecipesService,
  ) { }

  ngOnInit(): void {
    this.initpRegionForm();
    this.getCountries();
    this.getRegions();

    if (this.data.action === 'edit') {
      this.editRegion(this.data.object);
    }
  }

  // Ініціалізація форми
  initpRegionForm(): void {
    this.regionForm = this.formBuild.group({
      country: [null],
      regionName: [null],
      slug: [null],
      regionDescription: [null],
      metaTtile: [null],
      metaDescription: [null],
      regionFlag: [null],

    });
  }


  // Отримання кпаїни з сервера
  getCountries(): void {
    this.cuisineService.getAll().subscribe((data: any) => {
      this.countries = data as СuisineResponse[];
      this.countries.sort((a, b) =>
        a.cuisineName.localeCompare(b.cuisineName)
      );
    });
  }


  // Отримання регіона з сервера
  getRegions(): void {
    this.cuisineService.getAllRegiom().subscribe((data: any) => {
      this.regios = data as RegionResponse[];
      this.regios.sort((a, b) =>
        a.regionName.localeCompare(b.regionName)
      );
    });
  }


  // Додавання або редагування регіона
  creatRegion() {
    const regionID = this.regoinID as string;
    const updatedRegionData = this.regionForm.value;


    if (this.region_edit_status) {
      this.recipeService.getRecipesByFilter({ regionID: regionID }).then((recipes: any[]) => {
        // Перебираємо знайдені рецепти
        // Перебираємо знайдені рецепти
        recipes.forEach((recipe) => {
          if (recipe && recipe.dishes) {
            recipe.region = {
              ...recipe.region, // Зберігаємо всі старі дані
              regionName: updatedRegionData.regionName,
              slug: updatedRegionData.slug,
              regionDescription: updatedRegionData.regionDescription,
              metaTtile: updatedRegionData.metaTtile,
              metaDescription: updatedRegionData.metaDescription,
              regionFlag: updatedRegionData.regionFlag,
            };
          }

          this.recipeService.editrecipes(recipe, recipe.id);


        });
      });

      this.cuisineService.editRegion(
        this.regionForm.value,
        this.regoinID as string
      );

    } else {
      this.cuisineService.addRegion(this.regionForm.value);
    }
    this.dialogRef.close();
  }


  compareFn(c1: RegionResponse, c2: RegionResponse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }



  // Редагування регіон
  editRegion(region: RegionResponse) {
    this.regionForm.patchValue({
      country: region.country,
      regionName: region.regionName,
      slug: region.slug,
      regionDescription: region.regionDescription,
      metaTtile: region.metaTtile,
      metaDescription: region.metaDescription,
      regionFlag: region.regionFlag,

    });

    this.regionFlag = region.regionFlag;
    this.region_edit_status = true;
    this.regoinID = region.id;
  }


  close(): void {
    this.dialogRef.close();
  }



  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.regionFlag; // Поточне зображення
    const task = ref(this.storsgeIcon, previousImageURL);

    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.regionForm.patchValue({ regionFlag: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile('flags-of-regions', file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.regionForm.patchValue({ regionFlag: data });
          this.regionFlag = data;
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
}
