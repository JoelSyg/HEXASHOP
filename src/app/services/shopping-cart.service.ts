import { Injectable, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ShopItem } from '../types/shop-item.interface.js';
import { UserFirebaseService } from './user-firebase.service.js';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService implements OnDestroy {
  private shippingCostSubject = new BehaviorSubject<number>(0);
  shippingCost$ = this.shippingCostSubject.asObservable();

  private finalTotalSubject = new BehaviorSubject<number>(0);
  finalTotal$ = this.finalTotalSubject.asObservable();

  private cartTotalSubject = new BehaviorSubject<number>(0);
  cartTotal$ = this.cartTotalSubject.asObservable();

  private cartItemsSubject = new BehaviorSubject<ShopItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private cartItemCount = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCount.asObservable();

  private cartOpen = new BehaviorSubject<boolean>(false);
  cartOpen$ = this.cartOpen.asObservable();

  private isMobile = new BehaviorSubject<boolean>(false);
  isMobile$ = this.isMobile.asObservable();

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserFirebaseService,
    private firestore: Firestore
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadCartFromStorage();
      this.checkMobile();
      window.addEventListener('resize', this.checkMobile);
      window.addEventListener('popstate', this.handlePopState);
    }

    this.cartItems$.subscribe((cartItems) => {
      if (this.userService.currentUser()) {
        this.saveCartToFirestore(cartItems);
      }
    });
    

  }

  

  private checkMobile = () => {
    const isSmallScreen = window.innerWidth < 900;
    this.isMobile.next(isSmallScreen);
    if (isSmallScreen) {
      this.cartOpen.next(false);
    }
  };

  addItem(item: ShopItem) {
    const currentItems = this.cartItemsSubject.getValue();
    const existingItemIndex = currentItems.findIndex(
      (cartItem) =>
        cartItem.id === item.id && cartItem.chosenSize === item.chosenSize
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity =
        Number(updatedItems[existingItemIndex].quantity || 1) + 1;
      this.cartItemsSubject.next(updatedItems);
    } else {
      this.cartItemsSubject.next([...currentItems, { ...item, quantity: 1 }]);
    }

    this.updateCartItemCount();
    this.updateCartTotal();
    this.saveCartToStorage();

  
    this.openCart();
  }

  removeItem(item: ShopItem) {
    const updatedItems = this.cartItemsSubject
      .getValue()
      .filter(
        (cartItem) =>
          cartItem.id !== item.id || cartItem.chosenSize !== item.chosenSize
      );

    this.cartItemsSubject.next(updatedItems);
    this.updateCartItemCount();
    this.updateCartTotal();
    this.saveCartToStorage();
  }

  updateItemQuantity(id: string, chosenSize: string, quantity: number) {
    const currentItems = this.cartItemsSubject.getValue();
    const updatedItems = currentItems.map((item) => {
      if (item.id === id && item.chosenSize === chosenSize) {
        return { ...item, quantity };
      }
      return item;
    });

    this.cartItemsSubject.next(updatedItems);
    this.updateCartItemCount();
    this.updateCartTotal();
    this.saveCartToStorage();
  }

  private updateShippingCost() {
    const total = this.cartTotalSubject.getValue();
    const shippingCost = total < 50 ? 4.99 : 0;
    this.shippingCostSubject.next(shippingCost);
  }

  private updateCartTotal() {
    const total = this.cartItemsSubject
      .getValue()
      .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    this.cartTotalSubject.next(total);
    this.updateShippingCost();
    this.updateFinalTotal();
  }

  private updateFinalTotal() {
    const subtotal = this.cartTotalSubject.getValue();
    const shipping = this.shippingCostSubject.getValue();
    const finalTotal = subtotal + shipping;
    this.finalTotalSubject.next(finalTotal);
  }

  openCart() {
    if (!this.isMobile.getValue()) {
      this.cartOpen.next(true);
    }
  }

  closeCart() {
    this.cartOpen.next(false);
  }

  private updateCartItemCount() {
    this.cartItemCount.next(
      this.cartItemsSubject
        .getValue()
        .reduce((count, cartItem) => count + Number(cartItem.quantity || 0), 0)
    );
  }

  private saveCartToStorage() {
    if (this.isBrowser) {
      localStorage.setItem(
        'shoppingCart',
        JSON.stringify(this.cartItemsSubject.getValue())
      );
    }
  }

  private loadCartFromStorage() {
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('shoppingCart');
      if (savedCart) {
        const cartItems: ShopItem[] = JSON.parse(savedCart);
        this.cartItemsSubject.next(cartItems);
        this.updateCartItemCount();
        this.updateCartTotal();
      }
    }
  }

  async saveCartToFirestore(cartItems?: ShopItem[]) {
    const user = this.userService.currentUser();
    if (!user) return;

    const cartToSave: ShopItem[] =
      cartItems || this.cartItemsSubject.getValue();
    const userRef = doc(this.firestore, `users/${user.email}`);
    await setDoc(userRef, { cart: cartToSave }, { merge: true });
  }

  setCartFromFirestore(cartItems: ShopItem[]) {
    this.cartItemsSubject.next(cartItems);
    this.updateCartItemCount();
    this.updateCartTotal();
  }

  clearCart() {
    this.cartItemsSubject.next([]);
    this.cartItemCount.next(0);
    this.cartTotalSubject.next(0);
    this.finalTotalSubject.next(0);
    this.shippingCostSubject.next(0);
    this.saveCartToStorage();

  }

  private handlePopState = () => {
    this.closeCart();
  };

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.checkMobile);
      window.removeEventListener('popstate', this.handlePopState);
    }
  }

  getFinalTotal(): number {
    return this.finalTotalSubject.getValue();
  }
  
  getCartItems(): ShopItem[] {
    return this.cartItemsSubject.getValue();
  }

  
}
