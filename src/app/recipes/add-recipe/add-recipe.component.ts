import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
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
import { RecipesService } from '../../shared/services/recipes/recipes.service';
import { DishesService } from '../../shared/services/dishes/dishes.service';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { CountriesService } from '../../shared/services/countries/countries.service';
import { HolidayService } from '../../shared/services/holiday/holiday.service';
import { RecipeTypeService } from '../../shared/services/recipe-type/recipe-type.service';
import { MethodCookinService } from '../../shared/services/method-cookin/method-cookin.service';
import { ToolsService } from '../../shared/services/tools/tools.service';
import { LocalStorageService } from '../../shared/services/local-storage/local-storage.service';
import { MatSelectModule } from '@angular/material/select';
import { DishesResponse } from '../../shared/interfaces/dishes';
import { ActivatedRoute, Router } from '@angular/router';
import { СuisineResponse } from '../../shared/interfaces/countries';
import { NgbScrollSpyModule } from '@ng-bootstrap/ng-bootstrap';
import { AddDishesModalComponent } from '../../madals/add-dishes-modal/add-dishes-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddCategoriesModalComponent } from '../../madals/add-categories-modal/add-categories-modal.component';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddCuisineModalComponent } from '../../madals/add-cuisine-modal/add-cuisine-modal.component';
import { ToolsResponse } from '../../shared/interfaces/tools';
import { AddToolModalComponent } from '../../madals/add-tool-modal/add-tool-modal.component';
import { RecipeTypeResponse } from '../../shared/interfaces/reciprType';
import { AddRecipeTypenameComponent } from '../../madals/add-recipe-typename/add-recipe-typename.component';
import { HolidayResponse } from '../../shared/interfaces/holiday';
import { AddHolidayModalComponent } from '../../madals/add-holiday-modal/add-holiday-modal.component';
import { EditorComponent } from '@tinymce/tinymce-angular';
import Swal from 'sweetalert2';
import { AddInsyructionComponent } from '../../madals/add-insyruction/add-insyruction.component';
import { AddIngredientsComponent } from '../../madals/add-ingredients/add-ingredients.component';
import { RecipesResponse } from '../../shared/interfaces/recipes';
import { RegionRequest } from '../../shared/interfaces/region';

interface categoryFilter {
  id: number | string;
  categoryName: string;
}


const dpList: any[] = [
  { name: 'Базовий рецепт', list: 'light' },
  { name: 'Середній рівень', list: 'medium' },
  { name: 'Складний рецепт', list: 'hard' },
];

const season: any[] = [
  { name: 'Зима', list: 'winter' },
  { name: 'Весна', list: 'spring' },
  { name: 'Літо', list: 'summer' },
  { name: 'Осінь', list: 'Autumn' },
  { name: 'Цілий рік', list: 'All-year' },
];

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbScrollSpyModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    EditorComponent,
  ],
  templateUrl: './add-recipe.component.html',
  styleUrl: './add-recipe.component.scss',
})
export class AddRecipeComponent {
  edit_status = false;
  recipesForm!: FormGroup;
  autor = '';
  uploadPercent!: number;
  createdAt: any = '';
  recipes_form = false;
  cuisineList: Array<СuisineResponse> = [];
  toolsList: Array<ToolsResponse> = [];
  difficultyPreparationList: any[] = dpList;
  recipeTypeList: Array<RecipeTypeResponse> = [];
  bestSeasonList: any[] = season;
  holidayList: Array<HolidayResponse> = [];
  mainImage = '';
  instructions: any = [];
  numberServings = 1;
  numberCalories = 1;
  ingredients: any = [];


  //ФіЛТР
  filterCategoriesDishes: Array<categoryFilter> = [];
  regionFilter: Array<RegionRequest> = [];
  dishesID = '';
  dishesList: Array<DishesResponse> = [];
  recipeCategoryName = '';
  recipeKeys: any[] = [];
  groupedRecipeKeys: { disheName: string; recipes: any[] }[] = [];

  //Приватне
  private recipeID!: number | string;


  slug: string = '';
  slugExists: boolean | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private recipesService: RecipesService,
    private dishessService: DishesService,
    private categoriesDishesService: CategoriesService,
    private cuisineService: CountriesService,
    private holidayService: HolidayService,
    private recipeTyppeService: RecipeTypeService,
    private toolsService: ToolsService,
    private storsge: Storage,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initRecipeForm();
    this.getDishes();
    this.getCategories();
    this.getCuisine();
    this.getTools();
    this.getRecipeTyoe();
    this.getHolidays();
    this.createdAt = new Date().toISOString().split('T')[0];

    this.route.queryParams.subscribe((params) => {
      const action = params['action'];
      const object = params['object'] ? JSON.parse(params['object']) : null;


      if (action === 'edit' && object) {
        this.edit_status = true;
        this.editRecipe(object);


      }
    });
  }

  //Ініціалізація форми
  initRecipeForm(): void {
    this.recipesForm = this.formBuilder.group({
      //Сторінка 1
      dishes: [null],
      categoriesDishes: [null],
      recipeKeys: [null],
      cuisine: [null],
      region: [null],
      autor: this.autor,
      methodCooking: [null],
      tools: [null],
      difficultyPreparation: [null],
      bestSeason: [null],
      rating: [0],
      totalTime: [null],
      prepTime: [null],
      cookTime: [null],

      //Сторінка 2
      recipeTitle: [null],
      recipeSubtitles: [null],
      descriptionRecipe: [null],
      mainImage: [null],
      seoName: [null],
      seoDescription: [null],
      seoImage: [null],
      keywords: [null],

      //Сторінка 3
      numberServings: [1],
      numberCalories: [1],
      ingredients: [null],
      createdAt: [null],
      holiday: [null],
      completion: [null],
      recipeType: [null],

      //Сторінка 4
      instructions: [null],
      advice: [null],
      videoUrl: [null],
      comments: [null],
    });
  }


  //Отримання списку страв
  getDishes(): void {
    this.dishessService.getAllDishesight().subscribe((data: any[]) => {
      this.dishesList = data as DishesResponse[];
      this.dishesList.sort((a, b) => a.dishesName.localeCompare(b.dishesName));
    });
  }

  //Всі категорії
  getCategories() {
    this.categoriesDishesService
      .getAllCategoryLight()
      .subscribe((data: any[]) => {
        this.recipeKeys = data;
        this.recipeKeys.sort((a, b) =>
          a.categoryName.localeCompare(b.categoryName)
        );
        const grouped = this.recipeKeys.reduce((acc, recipe) => {
          const group = acc.find(
            (g: { disheName: any }) => g.disheName === recipe.disheName
          );
          if (group) {
            group.recipes.push(recipe);
          } else {
            acc.push({ disheName: recipe.disheName, recipes: [recipe] });
          }
          return acc;
        }, []);
        this.groupedRecipeKeys = grouped;
      });
  }

  //Фільтор списку категорій страв
  filterCategoriesDishesById(data: any): void {
    this.categoriesDishesService
      .getCategoryByDishesID(data)
      .subscribe((data: any) => {
        this.filterCategoriesDishes = [];
        this.filterCategoriesDishes = data;
        this.filterCategoriesDishes.sort((a, b) =>
          a.categoryName.localeCompare(b.categoryName)
        );
      });
  }

  //Виборка категорій
  onDishesSelection(): void {
    const dishesID = this.recipesForm.value.dishes.id;
    this.filterCategoriesDishes = [];
    this.filterCategoriesDishesById(dishesID);
  }

  onCategoriSelection() {
    const category =
      this.recipesForm.value.categoriesDishes.categoryName;
    this.recipeCategoryName = this.convertToSlug(category)
  }


  convertToSlug(text: string): string {
    // Мапа для конвертації кириличних літер в латиницю
    const translitMap: { [key: string]: string } = {
      а: 'a', б: 'b', в: 'v', г: 'h', д: 'd', е: 'e', є: 'ye', ж: 'zh', з: 'z',
      и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch',
      ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya', ' ': '-',
    };

    // Перетворюємо текст
    return text.toLowerCase()
      .split('') // Розбиваємо рядок на символи
      .map(char => translitMap[char] || char) // Заміщуємо символи за мапою
      .join(''); // Збираємо назад в рядок
  }


  // Отримання даних карїни
  getCuisine(): void {
    this.cuisineService.getAll().subscribe((data: any) => {
      this.cuisineList = data;
      this.cuisineList.sort((a, b) => a.cuisineName.localeCompare(b.cuisineName));
    });
  }

  //Виборка категорій
  onCountriSelection(): void {
    const cuisineID = this.recipesForm.value.cuisine.id;
    this.regionFilter = [];
    this.filterContryRegion(cuisineID);
  }

  //Фільтор регіонів
  filterContryRegion(data: any): void {
    this.cuisineService
      .getRegiopnByCusineID(data)
      .subscribe((data: any) => {
        this.regionFilter = [];
        this.regionFilter = data;
        this.regionFilter.sort((a, b) =>
          a.regionName.localeCompare(b.regionName)
        );
      });
  }


  /*  onRegionSelection() {
     const region = this.recipesForm.value.region;
   } */




  //Доодати інструменти
  getTools() {
    this.toolsService.getAll().subscribe((data: any) => {
      this.toolsList = data as ToolsResponse[];
      this.toolsList.sort((a, b) => a.toolsName.localeCompare(b.toolsName));
    });
  }

  getRecipeTyoe(): void {
    this.recipeTyppeService.getAll().subscribe((data: any) => {
      this.recipeTypeList = data as RecipeTypeResponse[];
      this.recipeTypeList.sort((a, b) =>
        a.recipeTypeName.localeCompare(b.recipeTypeName)
      );
    });
  }

  getHolidays(): void {
    this.holidayService.getAll().subscribe((data: any) => {
      this.holidayList = data as HolidayResponse[];
      this.holidayList.sort((a, b) =>
        a.holidayName.localeCompare(b.holidayName)
      );
    });
  }

  //Створення або редагування рецепта
  creatRecipe() {
    if (this.edit_status == true) {
      this.recipesService
        .editrecipes(this.recipesForm.value, this.recipeID as string)
        .then(() => {
          this.exit();
        });
    } else {
      this.recipesForm.patchValue({
        createdAt: this.createdAt,
      });
      const formData = this.recipesForm.value;
      const slug = this.slug;
      if (slug !== '') {
        this.recipesService
          .addRecipess(formData, slug)
          .then(() => console.log(`Документ створено з ID: ${slug}`))
          .catch(err => console.error(err));
        this.exit();
      } else {
        alert('Slug не може бути порожнім!');

      }
    }



  }

  exit() {
    this.router.navigate(['/recipes']);
  }

  editRecipe(recipe: RecipesResponse) {
    this.recipesForm.patchValue({
      dishes: recipe.dishes,
      categoriesDishes: recipe.categoriesDishes,
      recipeKeys: recipe.recipeKeys,
      cuisine: recipe.cuisine,
      region: recipe.region,

      autor: recipe.autor,
      methodCooking: recipe.methodCooking,
      tools: recipe.tools,
      difficultyPreparation: recipe.difficultyPreparation,
      bestSeason: recipe.bestSeason,
      totalTime: recipe.totalTime,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,

      recipeTitle: recipe.recipeTitle,
      recipeSubtitles: recipe.recipeSubtitles,
      descriptionRecipe: recipe.descriptionRecipe,
      mainImage: recipe.mainImage,

      seoName: recipe.seoName,
      seoDescription: recipe.seoDescription,
      seoImage: recipe.seoImage,
      keywords: recipe.keywords,

      ingredients: recipe.ingredients,
      numberServings: recipe.numberServings,
      numberCalories: recipe.numberCalories,
      createdAt: recipe.createdAt,
      holiday: recipe.holiday,
      completion: recipe.completion,
      recipeType: recipe.recipeType,

      instructions: recipe.instructions,
      videoUrl: recipe.videoUrl,
      advice: recipe.advice,
    });


    this.ingredients = recipe.ingredients;
    this.instructions = recipe.instructions;
    this.numberServings = recipe.numberServings;
    this.numberCalories = recipe.numberCalories;
    this.mainImage = recipe.mainImage;
    this.recipes_form = true;
    this.edit_status = true;
    this.recipeID = recipe.id;
  }

  // Відкриття модального вікна для додавання або редагування адреси
  addModal(action: string, object: any): void {
    if (action === 'dishes') {
      const dialogRef = this.dialog.open(AddDishesModalComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: { action, object },
      });

      dialogRef.afterClosed().subscribe(() => {
        this.getDishes();
      });
    }

    if (action === 'categoriesDishes') {
      const dialogRef = this.dialog.open(AddCategoriesModalComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: { action, object },
      });

      dialogRef.afterClosed().subscribe(() => {
        this.getDishes();
      });
    }

    if (action === 'cuisine') {
      const dialogRef = this.dialog.open(AddCuisineModalComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: { action, object },
      });

      dialogRef.afterClosed().subscribe(() => {
        this.getCuisine();
      });
    }

    if (action === 'tools') {
      const dialogRef = this.dialog.open(AddToolModalComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: { action, object },
      });

      dialogRef.afterClosed().subscribe(() => {
        this.getTools();
      });
    }

    if (action === 'recipe-typename') {
      const dialogRef = this.dialog.open(AddRecipeTypenameComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: { action, object },
      });

      dialogRef.afterClosed().subscribe(() => {
        this.getRecipeTyoe();
      });
    }

    if (action === 'holiday') {
      const dialogRef = this.dialog.open(AddHolidayModalComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: { action, object },
      });

      dialogRef.afterClosed().subscribe(() => {
        this.getHolidays();
      });
    }

    if (action === 'insyruction') {
      if (object === 'add') {
        const dialogRef = this.dialog.open(AddInsyructionComponent, {
          hasBackdrop: true,
          panelClass: 'custom-dialog-container',
          data: { object },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.instructions = result.instructions;
            this.recipesForm.patchValue({
              instructions: this.instructions,
            });
          }
        });
      } else if (object === 'edit' && this.instructions.length > 0) {
        const dialogRef = this.dialog.open(AddInsyructionComponent, {
          hasBackdrop: true,
          panelClass: 'custom-dialog-container',
          data: {
            object,
            instructions: this.instructions,
          },

        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.instructions = result.instructions;
          }
        });
      } else {
        console.log('Виникла помилка! ');
        Swal.fire({
          icon: 'error',
          title: 'Виникла помилка! ',
          text: 'Не введено еічого!',
        });
      }
    }

    if (action === 'ingredients') {
      if (object === 'add') {
        const dialogRef = this.dialog.open(AddIngredientsComponent, {
          hasBackdrop: true,
          panelClass: 'custom-dialog-container',
          data: { object },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.ingredients = result.ingredients;
            this.recipesForm.patchValue({
              ingredients: this.ingredients,
            });
          }
        });
      } else if (object === 'edit' && this.ingredients.length > 0) {
        const dialogRef = this.dialog.open(AddIngredientsComponent, {
          hasBackdrop: true,
          panelClass: 'custom-dialog-container',
          data: {
            object,
            ingredients: this.ingredients,
          },


        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.ingredients = result.ingredients;
          }

        });
      } else {
        console.log('Виникла помилка! ');
      }
    }
  }


  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.mainImage; // Поточне зображення
    const task = ref(this.storsge, previousImageURL);

    const category =
      this.recipesForm.value.categoriesDishes.categoryName;
    this.recipeCategoryName = this.convertToSlug(category)


    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.recipesForm.patchValue({ mainImage: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile(`recipe-main-images/${this.recipeCategoryName}`, file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.recipesForm.patchValue({ mainImage: data });
          this.mainImage = data;
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
        const storageRef = ref(this.storsge, pathIcon);
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


  compareFn(c1: DishesResponse, c2: DishesResponse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }


  test() {

    console.log(this.recipesForm.value);
  }

  openHome() {
    this.router.navigate(['/recipes']);
  }



  async slugValid(): Promise<void> {
    const trimmed = this.slug.trim();

    // 🔴 Перевірка на наявність кирилиці
    const hasCyrillic = /[а-яіїєґА-ЯІЇЄҐ]/.test(trimmed);
    if (hasCyrillic) {
      alert('❌ Слаг не має містити кирилицю. Використовуй тільки латиницю, цифри та дефіси.');
      this.slugExists = true; // можна показати, що невалідний
      return;
    }

    if (!trimmed) {
      this.slugExists = null;
      return;
    }

    const docSnap = await this.recipesService.checkSlugExistsOnce(trimmed);
    this.slugExists = docSnap.exists();

    if (this.slugExists) {
      alert('❌ Такий слаг вже існує. Вибери інший.');
    } else {
      alert('✅ Слаг виглядає добре і вільний.');
    }
  }


}
