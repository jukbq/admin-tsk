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
import { ToolsResponse } from '../../interfaces/tools';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  private toolsArr!: Array<ToolsResponse>;
  private toolsCollection!: CollectionReference<DocumentData>;

  constructor(private afs: Firestore) {
    this.toolsCollection = collection(this.afs, 'tools');
  }

  getAll() {
    return collectionData(this.toolsCollection, { idField: 'id' });
  }

  getAllTools(name: string) {
    return collectionData(this.toolsCollection, { idField: 'name' });
  }

  addTools(tools: ToolsResponse) {
    return addDoc(this.toolsCollection, tools);
  }

  editTools(tools: ToolsResponse, id: string) {
    const toolsDocumentReference = doc(this.afs, `tools/${id}`);
    return updateDoc(toolsDocumentReference, { ...tools });
  }

  deltools(id: any) {
    const toolsDocumentReference = doc(this.afs, `tools/${id}`);
    return deleteDoc(toolsDocumentReference);
  }
}
