import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  AfterViewInit,
  ViewChild,
  Renderer2,
  signal,
} from '@angular/core';
import { ShopItem } from '../types/shop-item.interface';
import { CommonModule } from '@angular/common';
import { ItemService } from '../services/item-service.service';
import { ProductBoxComponent } from '../product-box/product-box.component';
import { fromEvent } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'app-latest-clothing',
  standalone: true,
  imports: [CommonModule, ProductBoxComponent],
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

  showLeftArrowState = new Map<string, boolean>();
  showRightArrowState = new Map<string, boolean>();
  scrollingInProgress = signal<boolean>(false);

  testImage = './assets/img/leather_bag_men.jpg';

  constructor(private itemService: ItemService, private renderer: Renderer2) {}

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  async ngOnInit(): Promise<void> {
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

  getItemsByCategory(category: string): ShopItem[] {
    return this.itemService
      .getFilteredItems()
      .filter((item) => item.category === category && item.new);
  }

  scrollLeft(category: string) {
    const container = this.getScrollContainer(category);
    if (container) {
      const itemWidth =
        (container.firstElementChild as HTMLElement)?.offsetWidth + 15.5;
      if (itemWidth) {
        container.scrollLeft = Math.round(container.scrollLeft - itemWidth * 4);
      }
    }
  }

  scrollRight(category: string) {
    const container = this.getScrollContainer(category);
    if (container) {
      const itemWidth =
        (container.firstElementChild as HTMLElement)?.offsetWidth + 15.5;
      if (itemWidth) {
        container.scrollLeft = Math.round(container.scrollLeft + itemWidth * 4);
      }
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
    return this.showLeftArrowState.get(category) ?? false;
  }

  showRightArrow(category: string): boolean {
    return this.showRightArrowState.get(category) ?? true;
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
