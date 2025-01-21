import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopItem } from '../types/shop-item.interface';
import { ItemService } from '../services/item-service.service';
import { ProductBoxComponent } from '../product-box/product-box.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-category-clothing',
  standalone: true,
  imports: [
    CommonModule,
    ProductBoxComponent,
    HeaderComponent,
    FooterComponent,
    RouterModule,
  ],
  templateUrl: './category-clothing.component.html',
  styleUrls: ['./category-clothing.component.scss'],
})
export class CategoryClothingComponent implements OnInit {
  @Input() category!: string;

  latestItems = signal<ShopItem[]>([]);
  casualItems = signal<ShopItem[]>([]);
  isLoading = signal<boolean>(true);

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.category = this.route.snapshot.data['category'];
    this.loadItems();
  }

  async loadItems() {
    try {
      await this.itemService.loadItems();

      const items = this.itemService
        .getFilteredItems()
        .filter((item) => item.category === this.category);

      this.latestItems.set(items.filter((item) => item.new));
      this.casualItems.set(items.filter((item) => !item.new));
    } catch (error) {
      console.error('Fehler beim Laden der Items:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
