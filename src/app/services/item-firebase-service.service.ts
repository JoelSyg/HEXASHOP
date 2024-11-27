import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ShopItem } from '../types/shop-item.interface';

@Injectable({
  providedIn: 'root',
})
export class ItemFirebaseService {
  constructor(private firestore: Firestore) {}

  /**
   * Alle Items aus Firebase abrufen, optional mit Filtern
   * @param filters - Key-Value-Paare für dynamische Filterung
   * @returns Observable<ShopItem[]>
   */
  getItems(filters?: { [key: string]: any }): Observable<ShopItem[]> {
    const itemsRef = collection(this.firestore, 'items');
    let itemsQuery = query(itemsRef);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        itemsQuery = query(itemsQuery, where(key, '==', value));
      });
    }

    return collectionData(itemsQuery, { idField: 'id' }) as Observable<ShopItem[]>;
  }
}
