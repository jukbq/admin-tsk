import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { DishesResponse } from '../../interfaces/dishes';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root',
})
export class DishesService {
  private dishesCollection: any;

  constructor(private afs: Firestore) {
    this.dishesCollection = collection(this.afs, 'dishes');
  }

  getAll() {
    return collectionData(this.dishesCollection, { idField: 'id' });
  }

  getAllDishesight() {
    return collectionData(this.dishesCollection, { idField: 'id' }).pipe(
      map((dishes: any[]) =>
        dishes.map((dishes) => ({
          id: dishes.id,
          dishesName: dishes.dishesName,
        }))
      )
    );
  }

  getDishesByName(id: any) {
    const dishesDocumentReference = doc(this.afs, `dishes/${id}`);
    return docData(dishesDocumentReference, { idField: 'id' });
  }

  addDishesWithSlug(dishes: DishesResponse, slug?: string) {
    const dishesCol = collection(this.afs, 'dishes');
    if (slug) {
      // Використовуємо slug як ID
      return setDoc(doc(dishesCol, slug), dishes);
    } else {
      // Якщо slug не заданий — авто-ID
      return addDoc(dishesCol, dishes);
    }
  }


  editdishes(dishes: DishesResponse, id: string) {
    const dishesDocumentReference = doc(this.afs, `dishes/${id}`);
    return updateDoc(dishesDocumentReference, { ...dishes });
  }

  delDishes(id: any) {
    const dishesDocumentReference = doc(this.afs, `dishes/${id}`);
    return deleteDoc(dishesDocumentReference);
  }

  checkSlugExistsOnce(slug: string) {
    const ref = doc(this.afs, `dishes/${slug}`);
    return getDoc(ref);
  }


}
