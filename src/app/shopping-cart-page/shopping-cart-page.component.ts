import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { CommonModule } from '@angular/common';
import { ShopItem } from '../types/shop-item.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './shopping-cart-page.component.html',
  styleUrls: ['./shopping-cart-page.component.scss'],
})
export class ShoppingCartPageComponent {
  options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  cartItems$ = this.shoppingCartService.cartItems$;
  cartTotal$ = this.shoppingCartService.cartTotal$;
  shippingCost$ = this.shoppingCartService.shippingCost$;
  finalTotal$ = this.shoppingCartService.finalTotal$;

  constructor(private shoppingCartService: ShoppingCartService) {}

  removeItem(item: ShopItem) {
    this.shoppingCartService.removeItem(item);
  }

  updateQuantity(item: ShopItem, quantity: number): void {
    this.shoppingCartService.updateItemQuantity(
      item.id,
      item.chosenSize || '',
      quantity
    );
  }
}
