import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HolidayResponse } from '../../interfaces/holiday';
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
import { LocalStorageService } from '../local-storage/local-storage.service';


@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private holidayCollection!: CollectionReference<DocumentData>;

  constructor(
    private afs: Firestore,
    private localStorageService: LocalStorageService
  ) {
    this.holidayCollection = collection(this.afs, 'holidays');
  }

  getAll() {
    return collectionData(this.holidayCollection, { idField: 'id' });
  }

  addHoliday(holiday: HolidayResponse) {
    return addDoc(this.holidayCollection, holiday);
  }

  editHoliday(holiday: HolidayResponse, id: string) {
    const holidayDocumentReference = doc(this.afs, `holidays/${id}`);
    return updateDoc(holidayDocumentReference, { ...holiday });
  }

  delHoliday(id: any) {
    const holidayDocumentReference = doc(this.afs, `holidays/${id}`);
    return deleteDoc(holidayDocumentReference);
  }
}
