import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, DocumentData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private collection!: CollectionReference<DocumentData>;


  constructor(private afs: Firestore) {
    this.collection = collection(this.afs, 'short-recipes')
  }

  getAll() {
    return collectionData(this.collection, { idField: 'id' });
  }

  searchRecipes(query: string): Observable<any[]> {
    return new Observable((observer) => {
      this.getAll().subscribe((recipes: any[]) => {
        const fuse = new Fuse(recipes, {
          keys: ['recipeTitle', 'descriptionRecipe'], // Пошук по назвах рецептів та опису
          includeScore: true,
          threshold: 0.3, // Регулює чутливість пошуку
        });

        const result = fuse.search(query).map((result: { item: any; }) => result.item);

        observer.next(result);
        observer.complete();
      });
    });
  }
}
