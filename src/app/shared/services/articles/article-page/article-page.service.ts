import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, doc, DocumentData, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { LocalStorageService } from '../../local-storage/local-storage.service';
import { ArticlePAgesResponse } from '../../../interfaces/article-page';

@Injectable({
  providedIn: 'root'
})
export class ArticlePageService {
  private articlePageCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,
    private storage: Storage,
    private localStorageService: LocalStorageService
  ) {
    this.articlePageCollection = collection(this.afs, 'article-pages') as CollectionReference<DocumentData>;
  }


  getAll() {
    return collectionData(this.articlePageCollection, { idField: 'id' });
  }

  addArticlePage(articlePage: ArticlePAgesResponse, slug: string) {

    const docRef = doc(this.articlePageCollection, slug);
    return setDoc(docRef, { ...articlePage, slug });
  }

  editArticlePage(articlePage: ArticlePAgesResponse, id: string) {
    const aarticlePageDocumentReference = doc(this.afs, `article-page/${id}`);
    return updateDoc(aarticlePageDocumentReference, { ...articlePage });
  }



  checkSlugExistsOnce(slug: string) {
    const ref = doc(this.articlePageCollection, slug);
    return getDoc(ref);
  }
}
