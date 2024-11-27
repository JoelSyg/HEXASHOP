import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-box',
  standalone: true,
  imports: [],
  templateUrl: './product-box.component.html',
  styleUrls: ['./product-box.component.scss'],
})
export class ProductBoxComponent {
  @Input() itemName!: string;
  @Input() itemImage!: string;
  @Input() itemPrice!: number;

  formatPrice(price: number): string {
    return price.toString().replace('.', ',');
  }
}
