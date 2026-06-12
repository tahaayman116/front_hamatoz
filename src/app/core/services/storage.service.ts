import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefixKey = 'hamatoz_';

  constructor() {
    this.initializeStorageIfEmpty();
  }

  private initializeStorageIfEmpty() {
    if (!localStorage.getItem(this.prefixKey + 'initialized')) {
      localStorage.setItem(this.prefixKey + 'initialized', 'true');
    }
  }

  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(this.prefixKey + key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  getItem(key: string): any {
    try {
      const item = localStorage.getItem(this.prefixKey + key);
      if (!item || item === 'undefined' || item === 'null') {
        return null;
      }
      return JSON.parse(item);
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefixKey + key);
    } catch (e) {
      console.error('Error removing from localStorage', e);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefixKey)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
  }
}
