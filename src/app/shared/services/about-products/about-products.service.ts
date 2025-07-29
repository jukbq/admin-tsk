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






}
