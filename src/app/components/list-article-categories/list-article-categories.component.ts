import { Component } from '@angular/core';
import { ArticleTypeResponse } from '../../shared/interfaces/article-type';
import { ArticleCategoriesResponse } from '../../shared/interfaces/article-categories';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { ArticleTypeService } from '../../shared/services/articles/article-type/article-type.service';
import { ArticleCategoriesService } from '../../shared/services/articles/article-categories/article-categories.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AddArticleComponentsComponent } from '../../madals/add-article-components/add-article-components.component';

@Component({
  selector: 'app-list-article-categories',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './list-article-categories.component.html',
  styleUrl: './list-article-categories.component.scss'
})
export class ListArticleCategoriesComponent {
  articleType: Array<ArticleTypeResponse> = [];
  articleCategories: Array<ArticleCategoriesResponse> = [];
  filterCategoriesArticles: Array<ArticleCategoriesResponse> = [];
  articlesID = '';
  filter = false;



  constructor(
    private storsgeIcon: Storage,
    private articleTypeService: ArticleTypeService,
    private articleCategoriesService: ArticleCategoriesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getType();
    this.getArticleCategories();
  }


  // Отримання страв  з сервера
  getType(): void {
    this.articleTypeService.getAll().subscribe((data: any) => {
      this.articleType = data as ArticleTypeResponse[];
    });
  }



  articlesFiltre(event: any): void {
    const typeID = event.target.value;
    this.filterCategoriesArticles = [];
    this.filterArticleCategoriesTypeById(typeID);
  }

  //Отримання списку категорій страв
  filterArticleCategoriesTypeById(data: any): void {
    if (data == 'all') {
      this.filter = false;
    } else {
      const typeID = data;
      this.filterCategoriesArticles = this.articleCategories.filter((data) =>
        typeID.includes(data.articleType.id)
      );

      this.filterCategoriesArticles.sort((a, b) =>
        a.aticleCategoryName.localeCompare(b.aticleCategoryName)
      );
      this.filter = true;
    }
  }

  // Отримання категорій  з сервера
  getArticleCategories(): void {
    this.articleCategoriesService.getAll().subscribe((data: any) => {
      this.articleCategories = data as ArticleCategoriesResponse[];
      this.articleCategories.sort((a, b) =>
        a.aticleCategoryName.localeCompare(b.aticleCategoryName)
      );
      console.log('Article Categories:', this.articleCategories);

    });
  }



  // Видалення категорію
  delArticleCategori(index: ArticleCategoriesResponse) {



    if (index.image) {
      const task = ref(this.storsgeIcon, index.image);
      deleteObject(task).catch((error) => {
        console.error('Error deleting image:', error);
      });
    }

    this.articleCategoriesService.delArticleCategories(index.id as string).then(() => {
      this.getType();
    });
  }



  addModal(action: string, object: any): void {
    const dialogRef = this.dialog.open(AddArticleComponentsComponent, {
      hasBackdrop: true,
      panelClass: 'custom-dialog-container',
      data: { action, object },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getArticleCategories();
    });
  }

}
