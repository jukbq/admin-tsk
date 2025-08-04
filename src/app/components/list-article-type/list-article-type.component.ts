import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ArticleTypeResponse } from '../../shared/interfaces/article-type';
import { ArticleTypeService } from '../../shared/services/articles/article-type/article-type.service';
import { AddArticleTypeComponent } from '../../madals/add-article-type/add-article-type.component';

@Component({
  selector: 'app-list-article-type',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-article-type.component.html',
  styleUrl: './list-article-type.component.scss'
})
export class ListArticleTypeComponent {
  articleType: Array<ArticleTypeResponse> = [];
  articleType_edit_status = false;


  constructor(
    private articleTypeService: ArticleTypeService,
    private storsgeIcon: Storage,
    public dialog: MatDialog,
  ) { }


  ngOnInit(): void {
    this.getArticleType();
  }


  // Отримання даних з сервера
  getArticleType(): void {
    this.articleTypeService.getAll().subscribe((data: any) => {
      this.articleType = data as ArticleTypeResponse[];
    });
  }


  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddArticleTypeComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getArticleType();
    });


  }


  // Видалення пункту меню
  delArticleTypeService(index: ArticleTypeResponse) {
    if (index.image) {
      const task = ref(this.storsgeIcon, index.image);
      deleteObject(task).catch((error) => {
        console.error('Error deleting image:', error);
      });
    }

    this.articleTypeService.delArticleTypeService(index.id as string).then(() => {
      this.getArticleType();
    });
  }


  // Видалення пункту меню
  /*    async delArticle(item: any): Promise<void> {
       const slug = item.id; // або item.slug, залежно як зветься
       if (!slug) {
         console.error('❌ Немає slug або id у обʼєкта.');
         return;
       }
       const confirmDelete = window.confirm(`Ти впевнений(-а), що хочеш видалити статтю "${item.title || slug}"? Це діло без вороття, друже.`);
       if (!confirmDelete) {
         console.log('🚫 Видалення скасовано користувачем.');
         return;
       }
   
   
       try {
         // Отримати повний обʼєкт статті
         const docRef = doc(this.aboutProductsService['afs'], `aboutProducts/${slug}`);
         const docSnap = await getDoc(docRef);
   
         if (!docSnap.exists()) {
           console.warn(`⚠️ Стаття зі slug "${slug}" не знайдена.`);
           return;
         }
   
         const data = docSnap.data();
         const paragraphs = data['articleParagraphs'] || [];
   
   
   
   
         const deletePromises: Promise<void>[] = [];
   
   
         for (const para of paragraphs) {
           const imageUrl = para.paragraphImage;
   
           if (imageUrl) {
             const match = decodeURIComponent(imageUrl.match(/\/o\/(.+?)\?alt=/)?.[1] || '');
             if (match) {
               const fileRef = ref(this.storageIcon, match);
               deletePromises.push(deleteObject(fileRef));
               console.log('🧨 Готуємось видалити зображення:', match);
             }
           }
         }
         await Promise.all(deletePromises);
         console.log('✅ Всі зображення видалені.');
   
         // Видалити саму статтю
         await deleteDoc(docRef);
         console.log('🧹 Стаття успішно видалена.');
   
         // Оновити список
         this.getAboutProdokta();
       } catch (err) {
         console.error('❌ Помилка при видаленні статті або зображень:', err);
       }
     } */

}
