import { Injectable, signal } from '@angular/core';
import { ShopItem } from '../types/shop-item.interface';
import { ItemFirebaseService } from './item-firebase-service.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  itemsSig = signal<ShopItem[]>([]);

  constructor(private itemFirebaseService: ItemFirebaseService) {}

  async loadItems(): Promise<void> {
    try {
      const items = await firstValueFrom(this.itemFirebaseService.getItems());
      this.itemsSig.set(items);
    } catch (error) {
      console.error('Fehler beim Laden der Items:', error);
    }
  }

  getFilteredItems(): ShopItem[] {
    return this.itemsSig();
  }
}
