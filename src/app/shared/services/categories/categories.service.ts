import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { CategoriesResponse } from '../../interfaces/categories';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private categoriesArr!: Array<CategoriesResponse>;
  private categoriesCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,
    private localStorageService: LocalStorageService
  ) {
    this.categoriesCollection = collection(this.afs, 'categoriesDishes');
  }

  getAll() {
    return collectionData(this.categoriesCollection, { idField: 'id' });
  }

  getAllCategoryLight() {
    return collectionData(this.categoriesCollection, { idField: 'id' }).pipe(
      map((category: any[]) =>
        category.map((category) => ({
          disheName: category.dishes.dishesName,
          id: category.id,
          categoryName: category.categoryName,

        }))
      )
    );
  }


  getCategoryByDishesID(dishesID: string) {
    const queryRef = query(
      this.categoriesCollection,
      where('dishes.id', '==', dishesID)
    );
    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((category: any[]) =>
        category.map((category) => ({
          id: category.id,
          categoryName: category.categoryName,
        }))
      )
    );
  }

  addCategories(categories: CategoriesResponse, slug?: string) {
    const categoriesCollection = collection(this.afs, 'categoriesDishes');

    if (slug) {
      // Використовуємо slug як ID
      return setDoc(doc(categoriesCollection, slug), categories);
    } else {
      // Якщо slug не заданий — авто-ID
      return addDoc(categoriesCollection, categories);
    }
  }



  editCategories(categories: CategoriesResponse, id: string) {
    const categoriesDocumentReference = doc(this.afs, `categoriesDishes/${id}`);
    return updateDoc(categoriesDocumentReference, { ...categories });
  }

  delCategories(id: any) {
    const categoriesDocumentReference = doc(this.afs, `categoriesDishes/${id}`);
    return deleteDoc(categoriesDocumentReference);
  }

  // Перевірка наявності користувача в локальному сховищі
  isUserLoggedIn(): boolean {
    const currentUser = this.localStorageService.getData('currentUser');
    return !!currentUser;
  }

  async getCategoryByFilter(dishesID: string) {
    const q = query(this.categoriesCollection);
    const querySnapshot = await getDocs(q);
    const matchedRecipes: any[] = [];

    querySnapshot.forEach((document) => {
      const categoryData = document.data();
      const categoryId = document.id;


      if (categoryData['dishes'] && typeof categoryData['dishes'] === 'object') {
        // Перевіряємо, чи є поле id в об'єкті dishes і чи воно співпадає з dishesID
        if (categoryData['dishes'].id === dishesID) {
          matchedRecipes.push({ categoryId, dishes: categoryData['dishes'] });
        }
      }



    })


    return matchedRecipes;
  }


  /*   async addPetitionField(): Promise<void> {
      const q = query(this.categoriesCollection);
      const querySnapshot = await getDocs(q);
  
  
      querySnapshot.forEach(async (document) => {
        const docRef = doc(this.afs, `categoriesDishes/${document.id}`);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const dishesArray = docSnap.data()?.['dishes'] || [];
          if (dishesArray.id === 'hszE9T3DZUpP8SpkV4b2') {
            dishesArray.id = '4MCFaem0AFHOcC65nqMX'
            console.log(dishesArray);
          }
  
          await updateDoc(docRef, { dishes: dishesArray });
          console.log(`Updated document ${document.id}`);
        }
  
  
      });
    } */
}
