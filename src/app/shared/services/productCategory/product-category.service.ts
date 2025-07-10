import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { ProductCategoryResponse } from '../../interfaces/productCategory';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private productCategoryArr!: Array<ProductCategoryResponse>;
  private productCategoryCollection!: CollectionReference<DocumentData>;

  constructor(private afs: Firestore) {
    this.productCategoryCollection = collection(this.afs, 'productCategory');
  }

  getAll() {
    return collectionData(this.productCategoryCollection, { idField: 'id' });
  }

  getAllproductCategory(name: string) {
    return collectionData(this.productCategoryCollection, { idField: 'name' });
  }

  addProductCategory(productCategory: ProductCategoryResponse) {
    return addDoc(this.productCategoryCollection, productCategory);
  }

  editProductCategory(productCategory: ProductCategoryResponse, id: string) {
    const productCategoryDocumentReference = doc(
      this.afs,
      `productCategory/${id}`
    );
    return updateDoc(productCategoryDocumentReference, { ...productCategory });
  }

  delProductCategory(id: any) {
    const productCategoryDocumentReference = doc(
      this.afs,
      `productCategory/${id}`
    );
    return deleteDoc(productCategoryDocumentReference);
  }
}
