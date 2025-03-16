import { Order } from './order.interface';
import { ShopItem } from './shop-item.interface';

export interface UserData {
  email: string;
  role: 'user' | 'admin';
  cart?: ShopItem[];
  orders?: Order[];
  name?: string;
  surname?: string;
  createdAt?: string; 
}
