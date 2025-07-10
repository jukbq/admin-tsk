import { Injectable } from '@angular/core';
import { СuisineResponse } from '../../interfaces/countries';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { RegionResponse } from '../../interfaces/region';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private cuisineArr!: Array<СuisineResponse>;
  private regionArr!: Array<RegionResponse>
  private cuisineCollection!: CollectionReference<DocumentData>;
  private regionCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,
    private localStorageService: LocalStorageService
  ) {
    this.cuisineCollection = collection(this.afs, 'cuisine');
    this.regionCollection = collection(this.afs, 'region');
  }

  getAll() {
    return collectionData(this.cuisineCollection, { idField: 'id' });
  }

  getAllRegiom() {
    return collectionData(this.regionCollection, { idField: 'id' });
  }



  getAllcuisine(name: string) {
    return collectionData(this.cuisineCollection, { idField: 'name' });
  }

  addCuisine(cuisine: СuisineResponse) {
    return addDoc(this.cuisineCollection, cuisine);
  }

  addRegion(region: RegionResponse) {
    return addDoc(this.regionCollection, region);
  }

  editCuisine(cuisine: СuisineResponse, id: string) {
    const cuisineDocumentReference = doc(this.afs, `cuisine/${id}`);
    return updateDoc(cuisineDocumentReference, { ...cuisine });
  }

  editRegion(region: RegionResponse, id: string) {
    const regionDocumentReference = doc(this.afs, `region/${id}`);
    return updateDoc(regionDocumentReference, { ...region });
  }

  delCuisine(id: any) {
    const cuisineDocumentReference = doc(this.afs, `cuisine/${id}`);
    return deleteDoc(cuisineDocumentReference);
  }


  delRegion(id: any) {
    const cuisineDocumentReference = doc(this.afs, `cuisine/${id}`);
    return deleteDoc(cuisineDocumentReference);
  }


  getRegiopnByCusineID(cuisineID: string) {
    const queryRef = query(
      this.regionCollection,
      where('country.id', '==', cuisineID)
    );
    return collectionData(queryRef, { idField: 'id' }).pipe(
      map((region: any[]) =>
        region.map((region) => ({

          cuisineName: region.country.cuisineName,
          countryid: region.country.id,
          id: region.id,
          regionName: region.regionName,
          regionFlag: region.regionFlag,
        }))

      )

    );
  }

  // Перевірка наявності користувача в локальному сховищі
  isUserLoggedIn(): boolean {
    const currentUser = this.localStorageService.getData('currentUser');
    return !!currentUser;
  }
}
