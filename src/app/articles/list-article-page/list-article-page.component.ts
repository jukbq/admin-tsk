import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { ArticlePageService } from '../../shared/services/articles/article-page/article-page.service';
import { Router } from '@angular/router';
import { data } from 'jquery';

@Component({
  selector: 'app-list-article-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-article-page.component.html',
  styleUrl: './list-article-page.component.scss'
})
export class ListArticlePageComponent {
  articlePages: any[] = [];
  delete: any;


  constructor(
    private articlePageService: ArticlePageService,
    private router: Router,

  ) { }


  ngOnInit(): void {
    this.getArticlePages();
    /*     this.navigateToAddOrEditCategorie('add', 0); */
  }


  getArticlePages() {
    this.articlePageService.getAll().subscribe((data: any) => {
      this.articlePages = data
      this.articlePages.sort((a, b) => a.title.localeCompare(b.title));
      console.log(this.articlePages);

    })
  }




  navigateToAddOrEditCategorie(action: string, object: any): void {
    this.router.navigate(['/add-article-page'], {
      queryParams: { action, object: JSON.stringify(object) },
    });
  }


}
