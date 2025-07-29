import { Injectable } from '@angular/core';
import { AboutProductsResponse } from '../../interfaces/about-products';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentData, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { deleteObject, getStorage, listAll, ref, Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class AboutProductsService {
  private aboutProductsCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,
    private storage: Storage,
    private localStorageService: LocalStorageService
  ) {
    this.aboutProductsCollection = collection(this.afs, 'aboutProducts') as CollectionReference<DocumentData>;
  }



  getAll() {
    return collectionData(this.aboutProductsCollection, { idField: 'id' });
  }

  addaboutProducts(aboutProducts: AboutProductsResponse, slug: string) {
    const docRef = doc(this.aboutProductsCollection, slug);
    return setDoc(docRef, { ...aboutProducts, slug });
  }

  editaboutProducts(aboutProducts: AboutProductsResponse, id: string) {
    const aboutProductsDocumentReference = doc(this.afs, `aboutProducts/${id}`);
    return updateDoc(aboutProductsDocumentReference, { ...aboutProducts });
  }


  checkSlugExistsOnce(slug: string) {
    const ref = doc(this.aboutProductsCollection, slug);
    return getDoc(ref);
  }


  async deleteArticleWithImages(articleSlug: string, articleId: string): Promise<void> {
    console.log(`🗑️ Видалення статті з ID: ${articleId} та slug: ${articleSlug}`);

    const storage = getStorage();
    const folderRef = ref(storage, `about-products/${articleSlug}`);

    try {
      const filesList = await listAll(folderRef);

      if (filesList.items.length > 0) {
        // Якщо файли є, видаляємо всі
        const deletePromises = filesList.items.map(item => deleteObject(item));
        await Promise.all(deletePromises);
      } else {
        console.log('ℹ️ Файлів для видалення не знайдено');
      }

    } catch (error: any) {
      // Якщо 400 Bad Request — швидше за все, папка порожня (нема файлів)
      if (error.code === 'storage/invalid-root-operation' || error.code === 'storage/object-not-found' || error.message.includes('400')) {
        console.warn('⚠️ Папка для зображень порожня або не існує — продовжуємо видалення статті');
      } else {
        console.error('❌ Помилка при видаленні файлів:', error);
        throw error;
      }
    }

    // Видаляємо документ Firestore після очищення Storage
    const aboutProductsDocumentReference = doc(this.afs, `aboutProducts/${articleId}`);
    await deleteDoc(aboutProductsDocumentReference);
  }

}
