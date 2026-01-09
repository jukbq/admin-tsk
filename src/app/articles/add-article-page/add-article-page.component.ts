import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  percentage,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { CommonModule } from '@angular/common';
import { ArticlePageService } from '../../shared/services/articles/article-page/article-page.service';
import { ArticleTypeResponse } from '../../shared/interfaces/article-type';
import { ArticleTypeService } from '../../shared/services/articles/article-type/article-type.service';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { ArticleCategoriesService } from '../../shared/services/articles/article-categories/article-categories.service';
import { ArticleCategoriesResponse } from '../../shared/interfaces/article-categories';
import { ProductCategoryService } from '../../shared/services/productCategory/product-category.service';
import { ProductCategoryResponse } from '../../shared/interfaces/productCategory';
import Swal from 'sweetalert2';
import { AddArticleOaragraphComponent } from '../add-article-oaragraph/add-article-oaragraph.component';
import { MatDialog } from '@angular/material/dialog';
import { ArticlePAgesResponse } from '../../shared/interfaces/article-page';
import { ProductsService } from '../../shared/services/products/products.service';
import { ProductsResponse } from '../../shared/interfaces/products';

@Component({
  selector: 'app-add-article-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-article-page.component.html',
  styleUrl: './add-article-page.component.scss',
})
export class AddArticlePageComponent {
  slug: string = '';
  slugExists: boolean | null = null;
  articleType: Array<ArticleTypeResponse> = [];
  articleCategories: any[] = [];
  filterCategoriesArticles: Array<ArticleCategoriesResponse> = [];
  productsCategories: any[] = [];
  selectedCategory!: ProductCategoryResponse;
  articleContent: any = [];
  articlePageForm!: FormGroup;

  articleTypeName: string = '';
  articleName: string = '';

  article_edit_status = false;
  filter = false;

  uploadPercent!: number;
  mainImage = '';

  createdAt: any = '';

  filteredProducts: any[] = [];
  products: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private storsge: Storage,
    private route: ActivatedRoute,
    private articleTypeService: ArticleTypeService,
    private articleCategoriesService: ArticleCategoriesService,
    private articlePageService: ArticlePageService,
    private productCategoruService: ProductCategoryService,
    private productsService: ProductsService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initarticlePageForm();
    this.getType();
    this.getArticleCategories();
    this.getProductCategories();
    this.getProducts();
    /*    this.addModal(this.slug, 'add') */

    this.route.queryParams.subscribe((params) => {
      const action = params['action'];
      const object = params['object'] ? JSON.parse(params['object']) : null;

      this.createdAt = new Date().toISOString().split('T')[0];
      if (action === 'edit' && object) {
        this.article_edit_status = true;
        this.editRecipe(object);
      }
    });
  }

  initarticlePageForm(): void {
    this.articlePageForm = this.formBuilder.group({
      slug: [null],
      articleCategory: [null],
      products: [null],
      articleName: [null],
      mainImage: [null],
      seoName: [null],
      seoDescription: [null],
      keywords: [null],
      articleContent: [null],
    });
  }

  // Отримання страв  з сервера
  getType(): void {
    this.articleTypeService.getAllarticleTypeLieght().subscribe((data: any) => {
      this.articleType = data as ArticleTypeResponse[];
      this.articleType.sort((a, b) =>
        a.articleTypeName.localeCompare(b.articleTypeName)
      );
    });
  }

  articlesFiltre(event: any): void {
    const typeID = event.target.value;
    this.filterCategoriesArticles = [];
    this.filterArticleCategoriesTypeById(typeID);
  }

  //Отримання списку категорій страв
  filterArticleCategoriesTypeById(data: any): void {
    const typeID = data;
    this.filterCategoriesArticles = this.articleCategories.filter((data) =>
      typeID.includes(data.articleTypeID)
    );
    this.filterCategoriesArticles.sort((a, b) =>
      a.aticleCategoryName.localeCompare(b.aticleCategoryName)
    );
    this.filter = true;
  }

  // Отримання категорій  з сервера
  getArticleCategories(): void {
    this.articleCategoriesService
      .getAllArticleCategoryLight()
      .subscribe((data: any) => {
        this.articleCategories = data as ArticleCategoriesResponse[];
        this.articleCategories.sort((a, b) =>
          a.aticleCategoryName.localeCompare(b.aticleCategoryName)
        );
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

  // Отримання продуктів з сервера
  getProducts(): void {
    this.productsService.getAll().subscribe((data: any) => {
      this.products = data as ProductsResponse[];
      this.products.sort((a, b) =>
        a.productsName.localeCompare(b.productsName)
      );
    });
  }

  onCategorySelectionChange(event: any): void {
    const typeID = event.target.value;
    this.filteredProducts = this.products.filter(
      (product) => product.productsCategory.id === typeID
    );
  }

  async slugValid(): Promise<void> {
    // 1. Очистити, привести до нижнього регістру, замінити пробіли на дефіси, вирізати зайві символи
    const cleaned = this.slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // пробіли на дефіси
      .replace(/[^a-z0-9\-]/g, '') // все, що не латиниця/цифра/дефіс — геть
      .replace(/--+/g, '-') // кілька дефісів поспіль — в один
      .replace(/^-+|-+$/g, ''); // дефіси на початку або в кінці — геть

    // 2. Якщо після очищення нічого не лишилось — фейл
    if (!cleaned) {
      window.alert('❌ Слаг порожній або некоректний. Введи щось на латиниці.');
      this.slugExists = true;
      return;
    }

    // 3. Записуємо очищений слаг у форму (опціонально — якщо хочеш показувати юзеру)
    this.slug = cleaned;

    // 4. Перевіряємо, чи існує вже такий слаг
    const docSnap = await this.articlePageService.checkSlugExistsOnce(cleaned);
    this.slugExists = docSnap.exists();

    this.articlePageForm.patchValue({
      slug: this.slug,
    });

    // 5. Повідомляємо результат
    if (this.slugExists) {
      window.alert('❌ Такий слаг вже існує. Вибери інший.');
    } else {
      window.alert('✅ Слаг вільний і валідний.');
    }
  }

  // Відкриття модального вікна для додавання або редагування адреси
  addModal(slug: string, object: any): void {
    if (object === 'add') {
      const dialogRef = this.dialog.open(AddArticleOaragraphComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: { slug, object },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.articleContent = result.articleContent;
          this.articlePageForm.patchValue({
            articleContent: this.articleContent,
          });
        }
      });
    } else if (object === 'edit') {
      const dialogRef = this.dialog.open(AddArticleOaragraphComponent, {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        data: {
          object,
          articleContent: this.articleContent || [],
          slug: slug,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.articleContent = result.articleContent;
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

  editRecipe(article: ArticlePAgesResponse) {
    this.articlePageForm.patchValue({
      slug: article.slug,
      articleCategory: article.articleCategory,
      products: article.products,
      articleName: article.articleName,
      mainImage: article.mainImage,
      seoName: article.seoName,
      seoDescription: article.seoDescription,
      keywords: article.keywords,
      articleContent: article.articleContent,
    });

    this.slug = article.slug as string;

    this.articleContent = article.articleContent;

    this.articleName = article.articleName;
    this.mainImage = article.mainImage;
  }

  // Додавання або редагування статті
  creatArticle() {
   const formData = {
      ...this.articlePageForm.value,
      createdAt: this.createdAt,
          
    };


    if (this.article_edit_status == true) {

      this.articlePageService
        .editArticlePage(formData, this.slug)
        .then(() => {
          this.close();
        });
    } else {
          const slug = this.slug;

      if (slug !== '') {
        this.articlePageService
          .addArticlePage(formData, slug)
          .then(() => console.log(`Документ створено з ID: ${slug}`))
          .catch((err) => console.error(err));
        this.close();
      } else {
        alert('Slug не може бути порожнім!');
      }
    }
  }

  test() {
    console.log(this.articlePageForm.value);
  }

  // Завантаження зображення
  async uploadImage(event: any): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL = this.mainImage; // Поточне зображення
    const task = ref(this.storsge, previousImageURL);

    // Видалення попереднього зображення, якщо воно існує в Firebase Storage
    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.articlePageForm.patchValue({ mainImage: null });
      });
    }

    // Завантаження нового зображення
    this.loadFile(`article-page/${this.slug}`, file.name, file)
      .then((data) => {
        if (this.uploadPercent === 100) {
          this.articlePageForm.patchValue({ mainImage: data });
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

  compareFn(c1: ArticleTypeResponse, c2: ArticleTypeResponse): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  close(): void {
    this.router.navigate(['/list-article-page']);
  }
}
