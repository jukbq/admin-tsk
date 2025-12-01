import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, doc, DocumentData, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { LocalStorageService } from '../../local-storage/local-storage.service';
import { ArticlePAgesResponse } from '../../../interfaces/article-page';
import { Observable } from 'rxjs';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root',
})
export class ArticlePageService {
  private articlePageCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,
    private storage: Storage,
    private localStorageService: LocalStorageService
  ) {
    this.articlePageCollection = collection(
      this.afs,
      'article-pages'
    ) as CollectionReference<DocumentData>;
  }

  getAll() {
    return collectionData(this.articlePageCollection, { idField: 'id' });
  }

  addArticlePage(articlePage: ArticlePAgesResponse, slug: string) {
    const docRef = doc(this.articlePageCollection, slug);
    return setDoc(docRef, { ...articlePage, slug });
  }

  editArticlePage(articlePage: ArticlePAgesResponse, id: string) {
    const aarticlePageDocumentReference = doc(this.afs, `article-pages/${id}`);
    return updateDoc(aarticlePageDocumentReference, { ...articlePage });
  }

  checkSlugExistsOnce(slug: string) {
    const ref = doc(this.articlePageCollection, slug);
    return getDoc(ref);
  }

  searchArticles(query: string): Observable<any[]> {
    return new Observable((observer) => {
      this.getAll().subscribe((recipes: any[]) => {
        const fuse = new Fuse(recipes, {
          keys: ['articleName', 'seoDescription'], // Пошук по назвах рецептів та опису
          includeScore: true,
          threshold: 0.3, // Регулює чутливість пошуку
        });

        const result = fuse.search(query).map((result) => result.item);

        // Мапінг рецептів перед поверненням
        const mappedResults = result.map((article: any) => ({
          slug: article.slug,
          articleName: article.articleName,
          seoDescription: article.seoDescription,
          mainImage: article.mainImage,
        }));

        observer.next(mappedResults);
        observer.complete();
      });
    });
  }
}
