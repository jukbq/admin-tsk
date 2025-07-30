import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddAboutProductsComponent } from '../add-about-products/add-about-products.component';
import { AboutProductsResponse } from '../../../shared/interfaces/about-products';
import { AboutProductsService } from '../../../shared/services/about-products/about-products.service';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { deleteDoc, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-list-about-products',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-about-products.component.html',
  styleUrl: './list-about-products.component.scss'
})
export class ListAboutProductsComponent {
  aboutProducts: any[] = [];
  delete: any;

  constructor(
    private storageIcon: Storage,
    private aboutProductsService: AboutProductsService,
    private router: Router,
    public dialog: MatDialog
  ) { }



  ngOnInit(): void {
    this.getAboutProdokta();
    /*  this.addModal('add', 0); */
  }


  // Отримання даних з сервера
  getAboutProdokta(): void {
    this.aboutProductsService.getAll().subscribe((data: any) => {
      this.aboutProducts = data as AboutProductsResponse[];
      this.aboutProducts.sort((a, b) => a.title.localeCompare(b.title));

    });
  }

  navigateToAddOrEditCategorie(action: string, object: any): void {

    this.router.navigate(['/add-about-products'], {
      queryParams: { action, object: JSON.stringify(object) },
    });
  }

  // Видалення пункту меню
  async delArticle(item: any): Promise<void> {
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
  }






  openHome() {
    this.router.navigate(['/']);
  }
}
