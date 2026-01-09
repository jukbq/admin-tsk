import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, docData, DocumentData, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { LocalStorageService } from '../../local-storage/local-storage.service';
import { map } from 'rxjs';
import { ArticleTypeResponse } from '../../../interfaces/article-type';

@Injectable({
  providedIn: 'root'
})
export class ArticleTypeService {
  private articleTypeCollection!: CollectionReference<DocumentData>;


  constructor(
    private afs: Firestore,
    private storage: Storage,
    private localStorageService: LocalStorageService
  ) {
    this.articleTypeCollection = collection(this.afs, 'article-type') as CollectionReference<DocumentData>;
  }

  getAll() {
    return collectionData(this.articleTypeCollection, { idField: 'id' });
  }

  getAllarticleTypeLieght() {
    return collectionData(this.articleTypeCollection, { idField: 'id' }).pipe(
      map((articleType: any[]) =>
        articleType.map((articleType) => ({
          id: articleType.id,
          articleTypeName: articleType.articleTypeName,
        }))
      )
    );
  }


  getArticleTypesByName(id: any) {
    const articleTypeDocumentReference = doc(this.afs, `article-type/${id}`);
    return docData(articleTypeDocumentReference, { idField: 'id' });
  }

  addArticleTypeServiceWithSlug(articleType: ArticleTypeResponse, slug?: string) {
    const articleTypeCol = collection(this.afs, 'article-type');
    if (slug) {
      // Використовуємо slug як ID
      return setDoc(doc(articleTypeCol, slug), articleType);
    } else {
      // Якщо slug не заданий — авто-ID
      return addDoc(articleTypeCol, articleType);
    }
  }


  editarticleType(articleType: ArticleTypeResponse, id: string) {
    const articleTypeDocumentReference = doc(this.afs, `article-type/${id}`);
     
    return updateDoc(articleTypeDocumentReference, { ...articleType });
  }

  delArticleTypeService(id: any) {
    const articleTypeDocumentReference = doc(this.afs, `article-type/${id}`);
    return deleteDoc(articleTypeDocumentReference);
  }

  checkSlugExistsOnce(slug: string) {
    const ref = doc(this.afs, `article-type/${slug}`);
    return getDoc(ref);
  }



}
