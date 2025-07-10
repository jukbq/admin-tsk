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
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { RecipesResponse } from '../../interfaces/recipes';
import { combineLatest, Observable } from 'rxjs';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private recipesArr!: Array<RecipesResponse>;
  private recipesCollection!: CollectionReference<DocumentData>;

  constructor(private afs: Firestore) {
    this.recipesCollection = collection(this.afs, 'short-recipes');
  }

  getAll() {
    return collectionData(this.recipesCollection, { idField: 'id' });
  }

  getAllrecipes(name: string) {
    return collectionData(this.recipesCollection, { idField: 'name' });
  }

  getRecipeByCategoryID(categoryID: string) {
    const queryRef = query(
      this.recipesCollection,
      where('categoriesDishes.id', '==', categoryID)
    );

    return collectionData(queryRef, { idField: 'id' });
  }

  getRecipeByDishesID(dishesID: string) {
    const queryRef = query(
      this.recipesCollection,
      where('dishes.id', '==', dishesID)
    );

    return collectionData(queryRef, { idField: 'id' });
  }

  addRecipess(recipes: RecipesResponse, slug?: string) {
    const recipesCol = collection(this.afs, 'short-recipes');
    if (slug) {
      // Використовуємо slug як ID
      return setDoc(doc(recipesCol, slug), recipes);
    } else {
      // Якщо slug не заданий — авто-ID
      return addDoc(recipesCol, recipes);
    }
  }


  editrecipes(recipes: RecipesResponse, id: string) {
    const recipesDocumentReference = doc(this.afs, `short-recipes/${id}`);
    return updateDoc(recipesDocumentReference, { ...recipes });
  }

  delRecipess(id: any) {
    const recipesDocumentReference = doc(this.afs, `short-recipes/${id}`);
    return deleteDoc(recipesDocumentReference);
  }

  private serchRecipeByID(recipeIDs: string) {
    const queryRef = query(
      this.recipesCollection,
      where('categoriesDishes.id', '==', recipeIDs)
    );
    return collectionData(queryRef, { idField: 'id' });
  }

  getRecipeByID(recipeID: string) {
    const queryRef = query(
      this.recipesCollection,
      where('id', '==', recipeID)
    );
    return collectionData(queryRef, { idField: 'id' });
  }

  filterrecipeByID(recipeIDs: string[]): Observable<RecipesResponse[][]> {
    const observablesArray: Observable<RecipesResponse[]>[] = [];
    recipeIDs.forEach((id) => {
      const observable: any = this.serchRecipeByID(id);
      observablesArray.push(observable);
    });

    return combineLatest(observablesArray);
  }

  async getRecipesByFilter(filter: {
    cuisineID?: string;
    regionID?: string;
    productID?: string;
    dishesID?: string;
    categoriesID?: string;
    holidayID?: string;
    toolsID?: string;
    recipeTypeID?: string;
  }) {
    const q = query(this.recipesCollection);
    const querySnapshot = await getDocs(q);
    const matchedRecipes: any[] = [];


    querySnapshot.forEach((document) => {
      const recipeData = document.data();
      const recipeId = document.id;

      let matchesDishese = false;
      let matchescategories = false;
      let matchesCuisine = false;
      let matchesRegion = false;
      let matchesProduct = false;
      let matchesHoliday = false;
      let matchesRecipeType = false;
      let matchesTools = false;

      // Перевіряємо збіг за DishesID
      if (filter.dishesID && recipeData['dishes'] && typeof recipeData['dishes'] === 'object') {
        matchesDishese = recipeData['dishes'].id === filter.dishesID;
      }

      // Перевіряємо збіг за categoriesID
      if (filter.categoriesID && recipeData['categoriesDishes'] && typeof recipeData['categoriesDishes'] === 'object') {
        matchescategories = recipeData['categoriesDishes'].id === filter.categoriesID;
      }



      // Перевіряємо збіг за toolsID
      if (filter.toolsID && recipeData['tools'] && typeof recipeData['tools'] === 'object') {
        matchesTools = recipeData['tools'].id === filter.toolsID;
      }

      // Перевіряємо збіг за CuisineID
      if (filter.cuisineID && recipeData['cuisine'] && typeof recipeData['cuisine'] === 'object') {
        matchesCuisine = recipeData['cuisine'].id === filter.cuisineID;
      }

      // Перевіряємо збіг за regionID
      if (filter.regionID && recipeData['region'] && typeof recipeData['region'] === 'object') {
        matchesRegion = recipeData['region'].id === filter.regionID;
      }


      // Перевіряємо збіг за holidayID
      if (filter.holidayID && Array.isArray(recipeData['holiday'])) {
        recipeData['holiday'].forEach((holiday: any) => {
          if (holiday.id === filter.holidayID)
            matchesHoliday = true;
        })
      }

      // Перевіряємо збіг за recipeTypeID
      if (filter.recipeTypeID && Array.isArray(recipeData['recipeType'])) {
        recipeData['recipeType'].forEach((recipeType: any) => {
          if (recipeType.id === filter.recipeTypeID)
            matchesRecipeType = true;
        })
      }

      // Перевіряємо збіг за ProductID
      if (filter.productID && Array.isArray(recipeData['ingredients'])) {
        recipeData['ingredients'].forEach((ingredient: any) => {
          if (Array.isArray(ingredient.group)) {
            ingredient.group.forEach((groupItem: any) => {
              if (groupItem.selectedProduct?.id === filter.productID) {
                matchesProduct = true;
              }
            });
          }
        });
      }

      // Додаємо рецепт, якщо він відповідає хоча б одному з фільтрів
      if (
        matchesCuisine ||
        matchesRegion ||
        matchescategories ||
        matchesProduct ||
        matchesHoliday ||
        matchesRecipeType ||
        matchesTools ||
        matchesDishese) {
        matchedRecipes.push({ id: recipeId, ...recipeData });
      }
    });

    console.log('Matched Recipes:', matchedRecipes);
    return matchedRecipes;
  }


  async getCollectionCount(): Promise<number> {
    const snapshot = await getCountFromServer(this.recipesCollection);
    return snapshot.data().count;
  }

  searchRecipes(query: string): Observable<any[]> {
    return new Observable((observer) => {
      this.getAll().subscribe((recipes: any[]) => {
        const fuse = new Fuse(recipes, {
          keys: ['recipeTitle', 'descriptionRecipe'], // Пошук по назвах рецептів та опису
          includeScore: true,
          threshold: 0.3, // Регулює чутливість пошуку
        });

        const result = fuse.search(query).map((result) => result.item);

        // Мапінг рецептів перед поверненням
        const mappedResults = result.map((recipe: any) => ({
          id: recipe.id,
          recipeTitle: recipe.recipeTitle,
          descriptionRecipe: recipe.descriptionRecipe,
          mainImage: recipe.mainImage,
          createdAt: recipe.createdAt,
        }));

        observer.next(mappedResults);
        observer.complete();
      });
    });
  }


  async addPetitionField(): Promise<void> {
    const q = query(this.recipesCollection);
    const querySnapshot = await getDocs(q);


    querySnapshot.forEach(async (document) => {
      const docRef = doc(this.afs, `short-recipes/${document.id}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dishesArray = docSnap.data()?.['dishes'] || [];

        console.log(dishesArray);

        if (dishesArray.id === 'hszE9T3DZUpP8SpkV4b2') {
          dishesArray.id = '4MCFaem0AFHOcC65nqMX'
          console.log(dishesArray);
        }

        await updateDoc(docRef, { dishes: dishesArray });
        console.log(`Updated document ${document.id}`);
      }


    });
  }


  checkSlugExistsOnce(slug: string) {
    const ref = doc(this.afs, `short-recipes/${slug}`);
    return getDoc(ref);
  }



  /*   async clearHolidayFieldInAllRecipes(): Promise<void> {
      const q = query(this.recipesCollection);
      const querySnapshot = await getDocs(q);
  
      for (const document of querySnapshot.docs) {
        const data = document.data();
  
        if (data['holiday']) {
          const docRef = doc(this.afs, `short-recipes/${document.id}`);
  
          // Очищуємо масив holiday (якщо поле - масив)
          await updateDoc(docRef, { holiday: [] });
  
          // Якщо хочеш видалити поле повністю, заміни попередній рядок на:
          // import { deleteField } from 'firebase/firestore';
          // await updateDoc(docRef, { holiday: deleteField() });
  
          console.log(`Очищено holiday у документі: ${document.id}`);
        }
      }
      console.log('Операція очищення holiday завершена.');
    } */



}
