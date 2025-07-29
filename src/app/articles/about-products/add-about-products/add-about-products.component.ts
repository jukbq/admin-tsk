import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AboutProductsService } from '../../../shared/services/about-products/about-products.service';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { Storage, deleteObject, getDownloadURL, percentage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { AboutProductsResponse } from '../../../shared/interfaces/about-products';
import { ListAboutProductsComponent } from '../list-about-products/list-about-products.component';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-add-about-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EditorComponent],
  templateUrl: './add-about-products.component.html',
  styleUrl: './add-about-products.component.scss',
})
export class AddAboutProductsComponent {
  @ViewChild('selectParagraph') paragraphSelect!: MatSelect;
  selectParagraph = {
    paragraphName: '',
    description: '',
    imageSize: '',
    paragraphImage: '',
  };
  articleParagraphs: any[] = [];
  slug: string = '';
  articleName: string = '';
  slugExists: boolean | null = null;
  paragraphForm!: FormGroup;

  paragraphImage = '';
  uploadPercent!: number;



  article_edit_status = false;
  paragraph_edit_status = false;

  articleID: number | string = '';

  pIndex!: number;


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { action: 'add' | 'edit'; object: any },
    public dialogRef: MatDialogRef<ListAboutProductsComponent>,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private aboutProductsService: AboutProductsService,
    private storsge: Storage,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initparagraphForm();
    if (this.data.action === 'edit') {
      this.editarticle(this.data.object);
    }
  }



  // Додавання або редагування статті
  creatArticle() {
    const articleID = this.articleID as string;
    const doc = {
      slug: this.slug,
      articleName: this.articleName,
      articleParagraphs: this.articleParagraphs
    }
    const updatedArticleData = doc as AboutProductsResponse;

    if (this.article_edit_status) {

      this.aboutProductsService
        .editaboutProducts(updatedArticleData, this.articleID as string)
        .then(() => {
          this.dialogRef.close();
        });
    } else {
      this.aboutProductsService
        .addaboutProducts(updatedArticleData, this.slug.trim().toLowerCase())
        .then(() => this.dialogRef.close());
    }
  }


  // Редагування меню
  editarticle(article: AboutProductsResponse): void {
    this.articleName = article.articleName;
    this.articleParagraphs = article.articleParagraphs || [];
    this.article_edit_status = true;
    this.articleID = article.slug;
  }


  openHome() {
    this.router.navigate(['/about-products']);
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
    const docSnap = await this.aboutProductsService.checkSlugExistsOnce(cleaned);
    this.slugExists = docSnap.exists();

    // 5. Повідомляємо результат
    if (this.slugExists) {
      window.alert('❌ Такий слаг вже існує. Вибери інший.');
    } else {
      window.alert('✅ Слаг вільний і валідний.');
    }
  }




  //***************************** *//
  //ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ
  // Завантаження зображення
  async uploadParagraphImage(actionImage: any): Promise<void> {
    const file = actionImage.target.files[0];
    const previousImageURL = this.paragraphImage;
    this.paragraphImage = '';
    if (previousImageURL) {
      this.uploadPercent = 0;
      const task = ref(this.storsge, previousImageURL);
      await deleteObject(task);
    }


    this.loadFIle(`about-products/${this.slug}`, file.name, file)
      .then((data) => {
        if (this.uploadPercent == 100) {
          this.paragraphImage = data;
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

    if (!file) {
      console.log('Wrong file');
      return '';
    }

    const storageRef = ref(this.storsge, pathIcon);

    // 🛑 Перевірка, чи існує файл
    try {
      await getDownloadURL(storageRef); // Якщо не викине помилку — значить файл існує
      window.alert(`❌ Файл з назвою "${name}" вже існує. Перейменуй його або вибери інший.`);
      return ''; // Скасувати завантаження
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error('🔥 Помилка при перевірці файлу:', error);
        return '';
      }
      // Файл не знайдено — можна завантажувати
    }

    try {
      const task = uploadBytesResumable(storageRef, file);
      percentage(task).subscribe((data: { progress: number }) => {
        this.uploadPercent = data.progress;
      });
      await task;
      urlIcon = await getDownloadURL(storageRef);
    } catch (e: any) {
      console.error('🔥 Помилка завантаження:', e);
    }

    return urlIcon;
  }
  //*************************/


  test() {
    const doc = {
      slug: this.slug,
      articleName: this.articleName,
      articleParagraphs: this.articleParagraphs
    }
    console.log('doc', doc);

  }



  //ініцілізація форми параграфів
  initparagraphForm() {
    this.paragraphForm = this.formBuilder.group({
      paragraphName: [null],
      description: [null],
      imageSize: [null],
    });
  }

  //редагувати парагграф
  editParagraph(i: number) {
    this.paragraph_edit_status = true;
    this.pIndex = i;
    this.paragraphImage = this.articleParagraphs[i].paragraphImage || '';
    this.paragraphForm.patchValue({
      paragraphName: this.articleParagraphs[i].paragraphName || '',
      description: this.articleParagraphs[i].description || '',
      imageSize: this.articleParagraphs[i].description || '',

    });
  }


  //додати параграф
  addParagraph(): void {
    if (this.paragraph_edit_status == true) {
      const editedParagraphName = this.paragraphForm.value.paragraphName;
      const editedDescription = this.paragraphForm.value.description;
      const editedimageSize = this.paragraphForm.value.imageSize;
      const editedParagraphImage = this.paragraphImage;

      // Оновлення значень у відповідному об'єкті масиву instructions
      this.articleParagraphs[this.pIndex].paragraphName =
        editedParagraphName;
      this.articleParagraphs[this.pIndex].description =
        editedDescription;
      this.articleParagraphs[this.pIndex].imageSize =
        editedimageSize;
      this.articleParagraphs[this.pIndex].paragraphImage =
        editedParagraphImage;


      // Очищення даних у формах після редагування
      this.paragraphForm.reset();
      this.paragraphImage = '';

    } else {
      const newParagraph = {
        paragraphName: this.paragraphForm.value.paragraphName,
        description: this.paragraphForm.value.description,
        imageSize: this.paragraphForm.value.imageSize,
        paragraphImage: this.paragraphImage,
      };

      this.articleParagraphs.push(newParagraph);

      if (this.paragraphSelect) {
        this.paragraphSelect.writeValue(null);
      }

      // Очищення даних у формах
      this.paragraphForm.reset();
      this.paragraphImage = '';

    }
  }


  //видалити крок
  delParagraph(i: number): void {
    this.articleParagraphs.splice(i, 1);
  }

}
