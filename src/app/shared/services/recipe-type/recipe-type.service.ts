import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  updateDoc,
} from '@angular/fire/firestore';
import { RecipeTypeResponse } from '../../interfaces/reciprType';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RecipeTypeService {
  private recipeTypeArr!: Array<RecipeTypeResponse>;
  private recipeTypeCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,

  ) {
    this.recipeTypeCollection = collection(this.afs, 'recipe-type');
  }

  getAll() {
    return collectionData(this.recipeTypeCollection, { idField: 'id' });
  }

  addrecipeType(recipeType: RecipeTypeResponse) {
    return addDoc(this.recipeTypeCollection, recipeType);
  }

  editrecipeType(recipeType: RecipeTypeResponse, id: string) {
    const recipeTypeDocumentReference = doc(this.afs, `recipe-type/${id}`);
    return updateDoc(recipeTypeDocumentReference, { ...recipeType });
  }

  delrecipeType(id: any) {
    const recipeTypeDocumentReference = doc(this.afs, `recipe-type/${id}`);
    return deleteDoc(recipeTypeDocumentReference);
  }
}
