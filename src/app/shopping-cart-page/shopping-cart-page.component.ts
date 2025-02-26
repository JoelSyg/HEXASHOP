import {
  Component,
  HostListener,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ShopItem } from '../types/shop-item.interface';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shopping-cart-page',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './shopping-cart-page.component.html',
  styleUrls: ['./shopping-cart-page.component.scss'],
})
export class ShoppingCartPageComponent implements OnInit, OnDestroy {
  options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  private observer!: IntersectionObserver;

  cartItemsCount$ = this.shoppingCartService.cartItemCount$;
  cartItems$ = this.shoppingCartService.cartItems$;
  cartTotal$ = this.shoppingCartService.cartTotal$;
  shippingCost$ = this.shoppingCartService.shippingCost$;
  finalTotal$ = this.shoppingCartService.finalTotal$;

  @ViewChild('summaryElement', { static: false }) summaryElement!: ElementRef;

  screenWidth = 0;
  isBrowser: boolean;

  isSummaryVisible = signal(false);

  constructor(
    private shoppingCartService: ShoppingCartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.screenWidth = window.innerWidth;
      window.addEventListener('resize', this.onResize);
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser && this.summaryElement) {
      console.log('Observer gestartet', this.summaryElement.nativeElement);

      this.observer = new IntersectionObserver(
        ([entry]) => {
          queueMicrotask(() => {
            this.isSummaryVisible.set(entry.isIntersecting);
          });
        },
        { threshold: 0.3 }
      );

      this.observer.observe(this.summaryElement.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onResize);
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize = () => {
    this.screenWidth = window.innerWidth;
  };

  get isMobile(): boolean {
    return this.screenWidth <= 440;
  }

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
