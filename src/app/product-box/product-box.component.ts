import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-box',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './product-box.component.html',
  styleUrls: ['./product-box.component.scss'],
})
export class ProductBoxComponent {
  @Input() itemName!: string;
  @Input() itemImage!: string;
  @Input() itemPrice!: number;
}
