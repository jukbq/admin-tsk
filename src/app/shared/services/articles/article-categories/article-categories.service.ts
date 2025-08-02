import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentData, Firestore, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { LocalStorageService } from '../../local-storage/local-storage.service';
import { map } from 'rxjs';
import { ArticleCategoriesResponse } from '../../../interfaces/article-categories';

@Injectable({
  providedIn: 'root'
})
export class ArticleCategoriesService {

  private articleCategoriesCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,
    private localStorageService: LocalStorageService
  ) {
    this.articleCategoriesCollection = collection(this.afs, 'article-category');
  }

  getAll() {
    return collectionData(this.articleCategoriesCollection, { idField: 'id' });
  }

  getAllArticleCategoryLight() {
    return collectionData(this.articleCategoriesCollection, { idField: 'id' }).pipe(
      map((articlesCategory: any[]) =>
        articlesCategory.map((articlesCategory) => ({
          articleTypeID: articlesCategory.articleType.id,
          articleTypeName: articlesCategory.articleType.articleTypeName,
          id: articlesCategory.id,
          aticleCategoryName: articlesCategory.aticleCategoryName,
        }))
      )
    );
  }


  getArticleCategoryByTypeID(TypeID: string) {
    const queryRef = query(
      this.articleCategoriesCollection,
      where('articleType.id', '==', TypeID)
    );
    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((articlesCategory: any[]) =>
        articlesCategory.map((articlesCategory) => ({
          id: articlesCategory.id,
          aticleCategoryName: articlesCategory.aticleCategoryName,
        }))
      )
    );
  }

  addArticleCategories(articleCategory: ArticleCategoriesResponse, slug?: string) {
    const articleCategoriesCollection = collection(this.afs, 'article-category');

    if (slug) {
      // Використовуємо slug як ID
      return setDoc(doc(articleCategoriesCollection, slug), articleCategory);
    } else {
      // Якщо slug не заданий — авто-ID
      return addDoc(articleCategoriesCollection, articleCategory);
    }
  }



  editArticleCategories(articleCategory: ArticleCategoriesResponse, id: string) {
    const articleCategoriesCollection = doc(this.afs, `article-category/${id}`);
    return updateDoc(articleCategoriesCollection, { ...articleCategory });
  }

  delArticleCategories(id: any) {
    const articleCategoriesCollection = doc(this.afs, `article-category/${id}`);
    return deleteDoc(articleCategoriesCollection);
  }

  // Перевірка наявності користувача в локальному сховищі
  isUserLoggedIn(): boolean {
    const currentUser = this.localStorageService.getData('currentUser');
    return !!currentUser;
  }

  async getAArticleCategoryByFilter(typeID: string) {
    const q = query(this.articleCategoriesCollection);
    const querySnapshot = await getDocs(q);
    const matchedRecipes: any[] = [];

    querySnapshot.forEach((document) => {
      const artivleCategoryData = document.data();
      const articleCategoryId = document.id;


      if (artivleCategoryData['articleType'] && typeof artivleCategoryData['articleType'] === 'object') {
        // Перевіряємо, чи є поле id в об'єкті dishes і чи воно співпадає з dishesID
        if (artivleCategoryData['articleType'].id === typeID) {
          matchedRecipes.push({ articleCategoryId, articleType: artivleCategoryData['articleType'] });
        }
      }



    })


    return matchedRecipes;
  }
}
