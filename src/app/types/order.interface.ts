import { ShopItem } from "./shop-item.interface";

export interface Order {
    orderDate: string;
    items: ShopItem[];
    totalPrice: number;
  }
  