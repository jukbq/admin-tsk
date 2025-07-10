import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  saveData(key: string, data: any) {
    if (this.isBrowser()) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  getData(key: string) {
    if (this.isBrowser()) {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    }
    return null;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
