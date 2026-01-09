import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { RecipesService } from '../../shared/services/recipes/recipes.service';
import { Firestore } from '@angular/fire/firestore';
import { ArticleTypeService } from '../../shared/services/articles/article-type/article-type.service';
import { ArticleTypeResponse } from '../../shared/interfaces/article-type';
import { deleteObject, getDownloadURL, percentage, ref, Storage, uploadBytesResumable } from '@angular/fire/storage';

@Component({
  selector: 'app-add-article-type',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditorComponent,
    MatDialogModule,
  ],
  templateUrl: './add-article-type.component.html',
  styleUrl: './add-article-type.component.scss'
})
export class AddArticleTypeComponent {
  articleTypeForm!: FormGroup;
  articleType: any[] = [];
  articleTypeImage: string | undefined;
  additionalImage: string | undefined;
  articleTypeID!: number | string;
  articleTypes_edit_status = false;
  uploadPercent!: number;
  slug: string = '';
  slugExists: boolean | null = null;

  createdAt: any = '';

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private formBuild: FormBuilder,
    private storsgeIcon: Storage,
    private articleTypeService: ArticleTypeService,

    public dialogRef: MatDialogRef<AddArticleTypeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    private afs: Firestore
  ) { }

  ngOnInit(): void {
    this.initArticleTypeForm();
     this.getArticleType();
     this.createdAt = new Date().toISOString().split('T')[0];
     if (this.data.action === 'edit') {
  this.editArticleType(this.data.object);

    }
  }



  // Ініціалізація форми для страв
  initArticleTypeForm(): void {
    this.articleTypeForm = this.formBuild.group({
      slug: [null],
      articleTypeindex: 0,
      articleTypeName: [null],
      articleTypeDescription: [null],
      seoName: [null],
      seoDescription: [null],
      keywords: [null],
      image: [null],
      additionalImage: [null],
      numberСategories: [null],
    });
  }

  // Отримання страв  з сервера
  getArticleType(): void {
    this.articleTypeService.getAll().subscribe((data: any) => {
      this.articleType = data as ArticleTypeResponse[];
    });
  }

  // Редагування категорію
  editArticleType(articleType: ArticleTypeResponse) {
    this.articleTypeForm.patchValue({
      slug: articleType.id,
      articleTypeindex: articleType.articleTypeindex,
      articleTypeName: articleType.articleTypeName,
      articleTypeDescription: articleType.articleTypeDescription,
      seoName: articleType.seoName,
      keywords: articleType.keywords,
      seoDescription: articleType.seoDescription,
      image: articleType.image,
      additionalImage: articleType.additionalImage,
    
    });

    this.articleTypeImage = articleType.image;
    this.additionalImage = articleType.additionalImage;
    this.articleTypes_edit_status = true;
    this.articleTypeID = articleType.id;
    
  }


  // Додавання або редагування меню
  creatArticleType() {
    const formData = {
      ...this.articleTypeForm.value,
      createdAt: this.createdAt,
    };
    const slug = this.slug;

    if (this.articleTypes_edit_status) {
         const articleTypeID = this.articleTypeID as string
      this.articleTypeService.editarticleType(
        formData,
        articleTypeID
      );
  

    } else {
      this.articleTypeService
        .addArticleTypeServiceWithSlug(formData, slug)
        .then(() => console.log(`Документ створено з ID: ${slug}`))
        .catch(err => console.error(err));
    }
    this.dialogRef.close();
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

    // 5. Повідомляємо результат
    if (this.slugExists) {
      window.alert('❌ Такий слаг вже існує. Вибери інший.');
    } else {
      window.alert('✅ Слаг вільний і валідний.');
    }
  }



  // Завантаження зображення
  async uploadUserImage(
    event: any,
    type: 'main' | 'additional' = 'main'
  ): Promise<void> {
    const file = event.target.files[0];
    const previousImageURL =
      type === 'main' ? this.articleTypeImage : this.additionalImage;
    const task = ref(this.storsgeIcon, previousImageURL);

    if (
      previousImageURL &&
      previousImageURL.startsWith('https://firebasestorage.googleapis.com')
    ) {
      await deleteObject(task).then(() => {
        this.uploadPercent = 0;
        this.articleTypeForm.patchValue({
          [type === 'main' ? 'image' : 'additionalImage']: null,
        });
      });
    }

    this.loadFIle(
      type === 'main' ? 'articleType/main-image' : 'articleType/additional-image',
      file.name,
      file
    )
      .then((data) => {
        if (this.uploadPercent == 100) {
          this.articleTypeForm.patchValue({
            [type === 'main' ? 'image' : 'additionalImage']: data,
          });
          if (type === 'main') {
            this.articleTypeImage = data;
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
