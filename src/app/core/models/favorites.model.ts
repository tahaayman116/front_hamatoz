export interface FavoriteCar {
  id: number;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
}

export interface FavoritePart {
  id: number;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
}

export interface UserFavorites {
  userId: string;
  cars: FavoriteCar[];
  parts: FavoritePart[];
  totalFavorites: number;
  lastUpdated: Date;
}
