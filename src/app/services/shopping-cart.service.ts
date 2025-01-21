import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  private items: any[] = [];
  private cartItemCount = new BehaviorSubject<number>(0);

  cartItemCount$ = this.cartItemCount.asObservable();

  getCartItems() {
    return this.items;
  }

  addItem(item: any) {
    this.items.push(item);
    this.cartItemCount.next(this.items.length);
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.cartItemCount.next(this.items.length);
  }

  clearCart() {
    this.items = [];
    this.cartItemCount.next(0);
  }
}
