import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShopItem } from '../types/shop-item.interface';
import { ItemService } from '../services/item-service.service';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ShoppingCartService } from '../services/shopping-cart.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-single-item-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './single-item-page.component.html',
  styleUrls: ['./single-item-page.component.scss'],
})
export class SingleItemPageComponent implements OnInit {
  item = signal<ShopItem | null>(null);
  isLoading = signal<boolean>(true);

  sizes = signal<{ name: string; available: boolean }[]>([]);

  isOneSize = signal<boolean>(false);

  selectedSize = signal<string | null>(null);

  showSizeError = signal<boolean>(false);

  selectSize(size: string) {
    this.selectedSize.set(size);
    this.showSizeError.set(false);
  }

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private shoppingCartService: ShoppingCartService
  ) {}

  ngOnInit(): void {
    this.loadItem();
  }

  async loadItem() {
    try {
      this.isLoading.set(true);

      await this.itemService.loadItems();

      const itemId = this.route.snapshot.paramMap.get('id');
      if (!itemId) {
        console.error('Artikel-ID fehlt in der URL.');
        return;
      }

      const loadedItem = this.itemService.getItemById(itemId);
      if (!loadedItem) {
        console.error(`Item mit ID ${itemId} nicht gefunden.`);
        return;
      }

      this.item.set(loadedItem);

      this.processSizes(loadedItem);
    } catch (error) {
      console.error('Fehler beim Laden des Items:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private processSizes(loadedItem: ShopItem): void {
    const sizesWithAvailability = this.getSizesWithAvailability(loadedItem);
    this.sizes.set(sizesWithAvailability);

    const isOneSize = this.checkIfOneSize(sizesWithAvailability);
    this.isOneSize.set(isOneSize);
  }

  private getSizesWithAvailability(
    loadedItem: ShopItem
  ): { name: string; available: boolean }[] {
    const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
    const itemSizes = loadedItem.sizes || {};

    const sizes = STANDARD_SIZES.map((size) => ({
      name: size,
      available: !!itemSizes[size],
    }));

    if (this.shouldAddOneSize(itemSizes, sizes)) {
      sizes.push({ name: 'ONESIZE', available: true });
    }

    return sizes;
  }

  private shouldAddOneSize(
    itemSizes: Record<string, boolean>,
    sizes: { name: string; available: boolean }[]
  ): boolean {
    const isOneSizeAvailable = !!itemSizes['ONESIZE'];
    const hasOtherAvailableSizes = sizes.some((size) => size.available);
    return isOneSizeAvailable && !hasOtherAvailableSizes;
  }

  private checkIfOneSize(
    sizes: { name: string; available: boolean }[]
  ): boolean {
    const isOneSizeAvailable = sizes.some(
      (size) => size.name === 'ONESIZE' && size.available
    );
    const hasOtherAvailableSizes = sizes.some(
      (size) => size.name !== 'ONESIZE' && size.available
    );
    return isOneSizeAvailable && !hasOtherAvailableSizes;
  }

  isCartButtonDisabled(): boolean {
    const selected = this.selectedSize();

    if (!selected) {
      return false;
    }

    const size = this.sizes().find((size) => size.name === selected);
    return size ? !size.available : false;
  }

  addItemToCart() {
    if (!this.isOneSize() && !this.selectedSize()) {
      this.showSizeError.set(true);
      return;
    }
    this.showSizeError.set(false);

    const currentItem = this.item();

    if (currentItem) {
      const itemToAdd: ShopItem = {
        ...currentItem,
        id: currentItem.id ?? '',
        chosenSize: this.isOneSize()
          ? 'ONESIZE'
          : this.selectedSize() ?? undefined,
        quantity: 1,
      };

      this.shoppingCartService.addItem(itemToAdd);

      setTimeout(() => {
        this.shoppingCartService.openCart();
      }, 100);

      console.log('Item hinzugefügt:', itemToAdd);
    } else {
      console.error('Kein Item zum Hinzufügen gefunden.');
    }
  }
}
