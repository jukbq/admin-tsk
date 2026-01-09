import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { ArticleTypeResponse } from '../../shared/interfaces/article-type';
import { ArticleCategoriesResponse } from '../../shared/interfaces/article-categories';
import {
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { ArticleTypeService } from '../../shared/services/articles/article-type/article-type.service';
import { ArticleCategoriesService } from '../../shared/services/articles/article-categories/article-categories.service';
import { AboutProductsService } from '../../shared/services/articles/about-products/about-products.service';
import { AddCategoriesModalComponent } from '../add-categories-modal/add-categories-modal.component';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-article-components',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorComponent,
    MatDialogModule,
  ],
  templateUrl: './add-article-components.component.html',
  styleUrl: './add-article-components.component.scss'
})
export class AddArticleComponentsComponent {
  type: Array<ArticleTypeResponse> = [];
  articleCategories: Array<ArticleCategoriesResponse> = [];
  articleCategoriesForm!: FormGroup;
  uploadPercent!: number;
  categories_edit_status = false;
  categoryID!: number | string;
  categoryImage: string | undefined;
  additionalImage: string | undefined;

  slug: string = '';
  slugExists: boolean | null = null;
  createdAt: any = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private articleTypeService: ArticleTypeService,
    private articleCategoryService: ArticleCategoriesService,
    private articlePageService: AboutProductsService,
    public dialogRef: MatDialogRef<AddCategoriesModalComponent>,
    private afs: Firestore
  ) { }


  ngOnInit(): void {
    this.initArticleCategoriesForm();
    this.getType();
    this.getCategories();
         this.createdAt = new Date().toISOString().split('T')[0];
    if (this.data.action === 'edit') {
      this.editArticleCategories(this.data.object);
    }

  }


  // Ініціалізація форми категорій
  initArticleCategoriesForm(): void {
    this.articleCategoriesForm = this.formBuild.group({
      articleType: [null],
      aticleCategoryIndex: [null],
      aticleCategoryName: [null],
      aticleCategoryDescription: [null],
      seoAticleCategoryName: [null],
      seoAticleCategoryDescription: [null],
      keywords: [null],
      image: [null],
      additionalImage: [null],
      slug: [null],
      numberСategories: [null],
      });
  }


  // Отримання страв  з сервера
  getType(): void {
    this.articleTypeService.getAllarticleTypeLieght().subscribe((data: any) => {
      this.type = data as ArticleTypeResponse[];
      this.type.sort((a, b) => a.articleTypeName.localeCompare(b.articleTypeName));
    });
  }


  // Отримання категорій  з сервера
  getCategories(): void {
    this.articleCategoryService.getAll().subscribe((data: any) => {
      this.articleCategories = data as ArticleCategoriesResponse[];
      this.articleCategories.sort((a, b) =>
        a.aticleCategoryName.localeCompare(b.aticleCategoryName)
      );
    });
  }



  // Редагування категорію
  editArticleCategories(categori: ArticleCategoriesResponse) {
    this.articleCategoriesForm.patchValue({
      articleType: categori.articleType,
      aticleCategoryIndex: categori.aticleCategoryIndex,
      aticleCategoryName: categori.aticleCategoryName,
      aticleCategoryDescription: categori.aticleCategoryDescription,
      seoAticleCategoryName: categori.seoAticleCategoryName,
      seoAticleCategoryDescription: categori.seoAticleCategoryDescription,
      keywords: categori.keywords,
      image: categori.image,
      additionalImage: categori.additionalImage,
   
    });

    this.categoryImage = categori.image;
    this.additionalImage = categori.additionalImage;
    this.categories_edit_status = true;
    this.categoryID = categori.id;
  }

  compareFn(c1: ArticleTypeResponse, c2: ArticleTypeResponse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  // Додавання або редагування меню
  creatCategories() {
    const categoriesID = this.categoryID as string;
    const formData = {
     ...this.articleCategoriesForm.value,
       createdAt: this.createdAt,
    }
    const slug = this.slug;

    if (this.categories_edit_status) {
            this.articleCategoryService
        .editArticleCategories(
          formData,
          categoriesID
        )
        .then(() => {
          this.dialogRef.close();
        });
    } else {
      let currentCategoriesNumber =
        this.articleCategoriesForm.get('articleType')?.value?.numberСategories;
      if (
        typeof currentCategoriesNumber === 'number' &&
        !isNaN(currentCategoriesNumber)
      ) {
        // Збільшуємо значення на 1 при додаванні нової категорії
        currentCategoriesNumber += 1;

        // Оновлюємо значення numberСategories у формі перед відправкою
        this.articleCategoriesForm.patchValue({
          numberСategories: currentCategoriesNumber,
        });
      }


      this.articleCategoryService
        .addArticleCategories(formData, slug)
        .then(() => console.log(`Документ створено з ID: ${slug}`))
        .catch(err => console.error(err));

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
          this.articleCategoriesForm.patchValue({
            [type === 'main' ? 'image' : 'additionalImage']: null,
          });
        } catch (error) {
          console.error('Помилка при видаленні файлу:', error);
        }
      } else {
        console.warn('Не вдалося отримати шлях до файлу з URL:', previousImageURL);
      }
    }

    // Завантажуємо нове зображення
    this.loadFIle(
      type === 'main' ? 'articleCategory/articleCategory-image' : 'articleCategory/additional-image',
      file.name,
      file
    )
      .then((data) => {
        if (this.uploadPercent == 100) {
          this.articleCategoriesForm.patchValue({
            [type === 'main' ? 'image' : 'additionalImage']: data,
          });
          this.getType();
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


  async slugValid(): Promise<void> {
    // 1. Очистити, привести до нижнього регістру, замінити пробіли на дефіси, вирізати зайві символи
    const cleaned = this.slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')          // пробіли на дефіси
      .replace(/[^a-z0-9\-]/g, '')   // все, що не латиниця/цифра/дефіс — геть
      .replace(/--+/g, '-')          // кілька дефісів поспіль — в один
      .replace(/^-+|-+$/g, '');      // дефіси на початку або в кінці — геть

    // 2. Якщо після очищення нічого не лишилось — фейл
    if (!cleaned) {
      window.alert('❌ Слаг порожній або некоректний. Введи щось на латиниці.');
      this.slugExists = true;
      return;
    }

    // 3. Записуємо очищений слаг у форму (опціонально — якщо хочеш показувати юзеру)
    this.slug = cleaned;

    // 4. Перевіряємо, чи існує вже такий слаг
    const docSnap = await this.articleTypeService.checkSlugExistsOnce(cleaned);
    this.slugExists = docSnap.exists();

    this.articleCategoriesForm.patchValue({
      slug: this.slug,
    });

    // 5. Повідомляємо результат
    if (this.slugExists) {
      window.alert('❌ Такий слаг вже існує. Вибери інший.');
    } else {
      window.alert('✅ Слаг вільний і валідний.');
    }
  }


  close(): void {
    this.dialogRef.close();
  }


  test() {
    console.log(this.articleCategoriesForm.value);
  }
}
