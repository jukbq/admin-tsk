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



}
