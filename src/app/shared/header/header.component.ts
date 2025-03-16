import { Component, OnInit, HostListener, inject, signal, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { filter } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  isProfileMenuOpen: boolean = false;
  isShoppingCartPage: boolean = false;
  isMobile: boolean = false; // **Hier wird geprüft, ob Mobile aktiv ist**
  isMobileMenuOpen = signal(false);
  private isBrowser: boolean;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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

    // **Prüfe beim Start, ob das Gerät unter 900px ist**
    if (this.isBrowser) {
      this.checkMobile();
      window.addEventListener('resize', this.checkMobile);
    }
  }

  // **Responsive Check**
  private checkMobile = () => {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 900;
    }
  };

  removeItem(item: ShopItem) {
    this.shoppingCartService.removeItem(item);
  }

  logout() {
    this.userService.logout();
  }

  closeCart() {
    this.shoppingCartService.closeCart();
  }

  doesUserExist() {
    this.doesUserExist();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    const clickedOnBagIcon = target.matches('.shopping-cart img');
    const clickedOnToBagButton = target.matches('#toBagButton')

    const clickedInsideCart =
      target.closest('.shopping-cart') && !clickedOnBagIcon;

    if (this.isCartOpen && (!clickedInsideCart || clickedOnBagIcon || clickedOnToBagButton)) {
      this.closeCart();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.checkMobile);
    }
  }
}
