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
  getDocs,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { ProductsResponse } from '../../interfaces/products';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private productsArr!: Array<ProductsResponse>;
  private productsCollection!: CollectionReference<DocumentData>;

  constructor(private afs: Firestore) {
    this.productsCollection = collection(this.afs, 'products');
  }

  getAll() {
    return collectionData(this.productsCollection, { idField: 'id' });
  }

  getAllproducts(name: string) {
    return collectionData(this.productsCollection, { idField: 'name' });
  }

  addProducts(products: ProductsResponse) {
    return addDoc(this.productsCollection, products);
  }

  editproducts(products: ProductsResponse, id: string) {
    const productsDocumentReference = doc(this.afs, `products/${id}`);
    return updateDoc(productsDocumentReference, { ...products });
  }

  delProducts(id: any) {
    const productsDocumentReference = doc(this.afs, `products/${id}`);
    return deleteDoc(productsDocumentReference);
  }

  
}
