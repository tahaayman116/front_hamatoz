import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { UserFavorites, FavoriteCar, FavoritePart } from '../models/favorites.model';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private userFavorites = signal<Map<string, UserFavorites>>(new Map());

  constructor(private storageService: StorageService) {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const stored = this.storageService.getItem('userFavorites') || {};
    const favoritesMap = new Map<string, UserFavorites>(Object.entries(stored) as Array<[string, UserFavorites]>);
    this.userFavorites.set(favoritesMap);
  }

  private saveFavorites(): void {
    const obj = Object.fromEntries(this.userFavorites());
    this.storageService.setItem('userFavorites', obj);
  }

  private getUserFavorites(userId: string): UserFavorites {
    let favorites = this.userFavorites().get(userId);
    if (!favorites) {
      favorites = {
        userId,
        cars: [],
        parts: [],
        totalFavorites: 0,
        lastUpdated: new Date()
      };
      const map = new Map(this.userFavorites());
      map.set(userId, favorites);
      this.userFavorites.set(map);
      this.saveFavorites();
    }
    return favorites;
  }

  addFavoriteCar(userId: string, car: FavoriteCar): boolean {
    const favorites = this.getUserFavorites(userId);
    
    // Check if already favorited
    if (favorites.cars.some(c => c.id === car.id)) {
      return false;
    }

    favorites.cars.push(car);
    favorites.totalFavorites = favorites.cars.length + favorites.parts.length;
    favorites.lastUpdated = new Date();
    
    const map = new Map(this.userFavorites());
    map.set(userId, favorites);
    this.userFavorites.set(map);
    this.saveFavorites();

    return true;
  }

  addFavoritePart(userId: string, part: FavoritePart): boolean {
    const favorites = this.getUserFavorites(userId);
    
    // Check if already favorited
    if (favorites.parts.some(p => p.id === part.id)) {
      return false;
    }

    favorites.parts.push(part);
    favorites.totalFavorites = favorites.cars.length + favorites.parts.length;
    favorites.lastUpdated = new Date();
    
    const map = new Map(this.userFavorites());
    map.set(userId, favorites);
    this.userFavorites.set(map);
    this.saveFavorites();

    return true;
  }

  removeFavoriteCar(userId: string, carId: number): boolean {
    const favorites = this.getUserFavorites(userId);
    const initialLength = favorites.cars.length;
    
    favorites.cars = favorites.cars.filter(c => c.id !== carId);
    
    if (favorites.cars.length === initialLength) {
      return false;
    }

    favorites.totalFavorites = favorites.cars.length + favorites.parts.length;
    favorites.lastUpdated = new Date();
    
    const map = new Map(this.userFavorites());
    map.set(userId, favorites);
    this.userFavorites.set(map);
    this.saveFavorites();

    return true;
  }

  removeFavoritePart(userId: string, partId: number): boolean {
    const favorites = this.getUserFavorites(userId);
    const initialLength = favorites.parts.length;
    
    favorites.parts = favorites.parts.filter(p => p.id !== partId);
    
    if (favorites.parts.length === initialLength) {
      return false;
    }

    favorites.totalFavorites = favorites.cars.length + favorites.parts.length;
    favorites.lastUpdated = new Date();
    
    const map = new Map(this.userFavorites());
    map.set(userId, favorites);
    this.userFavorites.set(map);
    this.saveFavorites();

    return true;
  }

  isFavoriteCar(userId: string, carId: number): boolean {
    const favorites = this.getUserFavorites(userId);
    return favorites.cars.some(c => c.id === carId);
  }

  isFavoritePart(userId: string, partId: number): boolean {
    const favorites = this.getUserFavorites(userId);
    return favorites.parts.some(p => p.id === partId);
  }

  getFavorites(userId: string): UserFavorites {
    return this.getUserFavorites(userId);
  }

  getAllFavorites(): UserFavorites[] {
    return Array.from(this.userFavorites().values());
  }

  getFavoriteStats(userId: string) {
    const favorites = this.getUserFavorites(userId);
    return {
      totalCars: favorites.cars.length,
      totalParts: favorites.parts.length,
      total: favorites.totalFavorites,
      lastUpdated: favorites.lastUpdated
    };
  }
}
