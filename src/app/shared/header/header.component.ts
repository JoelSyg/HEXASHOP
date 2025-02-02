import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router'; // Event importiert
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShopItem } from '../../types/shop-item.interface';
import { UserFirebaseService } from '../../services/user-firebase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  shippingCost$ = this.shoppingCartService.shippingCost$;
  finalTotal$ = this.shoppingCartService.finalTotal$;
  cartItems$ = this.shoppingCartService.cartItems$;
  private userService = inject(UserFirebaseService);

  currentUser = this.userService.currentUser;
  cartItemsNumber: number = 0;
  isCartOpen: boolean = false;
  isShoppingCartPage: boolean = false;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.shoppingCartService.cartItemCount$.subscribe((count) => {
      this.cartItemsNumber = count;
    });

    this.shoppingCartService.cartOpen$.subscribe((isOpen) => {
      this.isCartOpen = isOpen;
    });

    this.router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd))
      .subscribe((event: RouterEvent) => {
        const navEnd = event as NavigationEnd;
        console.log('Aktuelle Route:', navEnd.url);
        this.isShoppingCartPage = navEnd.url === '/shopping-cart-page';
      });

    this.isShoppingCartPage = this.router.url === '/shopping-cart-page';
  }

  removeItem(item: ShopItem) {
    this.shoppingCartService.removeItem(item);
  }

  goToProfile() {
    if (this.currentUser()) {
      this.router.navigate(['/profile']); // Falls eingeloggt → Profilseite
    } else {
      this.router.navigate(['/auth']); // Falls nicht eingeloggt → Login/Register
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    const clickedOnBagIcon = target.matches('.shopping-cart img');
    const clickedOnToBagButton = target.matches('#toBagButton')

    const clickedInsideCart =
      target.closest('.shopping-cart') && !clickedOnBagIcon;

    if (this.isCartOpen && (!clickedInsideCart || clickedOnBagIcon || clickedOnToBagButton)) {
      this.shoppingCartService.closeCart();
    }
  }
}
