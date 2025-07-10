import { Injectable } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  updateDoc,
  DocumentData,
  collection,
} from '@angular/fire/firestore';
import { UnitResponse } from '../../interfaces/units';

@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  private unitsArr!: Array<UnitResponse>;
  private unitsCollection!: CollectionReference<DocumentData>;

  constructor(private afs: Firestore) {
    this.unitsCollection = collection(this.afs, 'units');
  }

  getAll() {
    return collectionData(this.unitsCollection, { idField: 'id' });
  }

  getAllUnits(name: string) {
    return collectionData(this.unitsCollection, { idField: 'name' });
  }

  addUnits(units: UnitResponse) {
    return addDoc(this.unitsCollection, units);
  }

  editUnits(units: UnitResponse, id: string) {
    const unitsDocumentReference = doc(this.afs, `units/${id}`);
    return updateDoc(unitsDocumentReference, { ...units });
  }

  delUnits(id: any) {
    const unitsDocumentReference = doc(this.afs, `units/${id}`);
    return deleteDoc(unitsDocumentReference);
  }
}
