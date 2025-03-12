import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  AfterViewInit,
  ViewChild,
  Renderer2,
  signal,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ShopItem } from '../types/shop-item.interface';
import { CommonModule } from '@angular/common';
import { ItemService } from '../services/item-service.service';
import { ProductBoxComponent } from '../product-box/product-box.component';
import { fromEvent } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-latest-clothing',
  standalone: true,
  imports: [CommonModule, ProductBoxComponent, RouterModule],
  templateUrl: './latest-clothing.component.html',
  styleUrls: ['./latest-clothing.component.scss'],
})
export class LatestClothingComponent implements OnInit, AfterViewInit {
  categories = [
    { title: "Men's Latest", category: 'mens' },
    { title: "Women's Latest", category: 'womens' },
    { title: "Kid's Latest", category: 'kids' },
  ];

  mensLatestItems = signal<ShopItem[]>([]);
  isLoading = signal(true);
  scrollingInProgress = signal<boolean>(false);
  showLeftArrowState = new Map<string, boolean>();
  showRightArrowState = new Map<string, boolean>();
  isTouchDevice = signal<boolean>(false);

  constructor(
    private itemService: ItemService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  async ngOnInit(): Promise<void> {
    this.detectTouchDevice();
    try {
      await this.itemService.loadItems();
    } catch (error) {
      console.error('Fehler beim Laden der Items:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngAfterViewInit() {
    this.categories.forEach((category) => {
      const container = this.getScrollContainer(category.category);
      if (container) {
        fromEvent(container, 'scroll')
          .pipe(
            tap(() => {
              this.scrollingInProgress.set(true);
              this.showLeftArrowState.set(category.category, false);
              this.showRightArrowState.set(category.category, false);
            }),
            debounceTime(200)
          )
          .subscribe(() => {
            this.scrollingInProgress.set(false);
            this.updateArrowVisibility(category.category);
          });
      }
    });
  }

  detectTouchDevice() {
    if (isPlatformBrowser(this.platformId)) {
      this.isTouchDevice.set(
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      );
    }
  }

  getItemsByCategory(category: string): ShopItem[] {
    return this.itemService
      .getFilteredItems()
      .filter((item) => item.category === category && item.new);
  }

  scrollLeft(category: string) {
    const container = this.getScrollContainer(category);
    if (container) {
      const firstItem = container.querySelector(
        'app-product-box'
      ) as HTMLElement;
      if (!firstItem) return;

      const itemWidth = firstItem.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(container).gap) || 0;
      const scrollAmount = (itemWidth + gap) * 4; // 4 Artikel auf einmal

      container.scrollTo({
        left: container.scrollLeft - scrollAmount,
        behavior: 'smooth',
      });
    }
  }

  scrollRight(category: string) {
    const container = this.getScrollContainer(category);
    if (container) {
      const firstItem = container.querySelector(
        'app-product-box'
      ) as HTMLElement;
      if (!firstItem) return;

      const itemWidth = firstItem.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(container).gap) || 0;
      const scrollAmount = (itemWidth + gap) * 4; // 4 Artikel auf einmal

      container.scrollTo({
        left: container.scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  }

  updateArrowVisibility(category: string) {
    const container = this.getScrollContainer(category);
    if (container) {
      const scrollLeft = Math.round(container.scrollLeft);
      const scrollWidth = Math.round(container.scrollWidth);
      const clientWidth = Math.round(container.clientWidth);

      const tolerance = 5;

      if (!this.scrollingInProgress()) {
        this.showLeftArrowState.set(category, scrollLeft > tolerance);
        this.showRightArrowState.set(
          category,
          scrollLeft + clientWidth < scrollWidth - tolerance
        );
      }
    }
  }

  showLeftArrow(category: string): boolean {
    return (
      !this.isTouchDevice() && (this.showLeftArrowState.get(category) ?? false)
    );
  }

  showRightArrow(category: string): boolean {
    return (
      !this.isTouchDevice() && (this.showRightArrowState.get(category) ?? true)
    );
  }

  getScrollContainer(category: string): HTMLElement | null {
    const containers = this.renderer
      .selectRootElement('body', true)
      .querySelectorAll(
        `.products-container[data-category="${category}"] .products-div`
      );
    return containers.length ? (containers[0] as HTMLElement) : null;
  }

  @HostListener('window:resize')
  onResize() {
    this.categories.forEach((category) =>
      this.updateArrowVisibility(category.category)
    );
  }
}
