import { ShopItem } from './shop-item.interface';

export interface UserData {
  email: string;
  role: 'user' | 'admin';
  cart?: ShopItem[];
  name?: string;
  surname?: string;
  createdAt?: string; 
}
