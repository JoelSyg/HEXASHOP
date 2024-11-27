import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { RouterModule } from '@angular/router';
import { HeroSectionComponent } from "../hero-section/hero-section.component";
import { LatestClothingComponent } from '../latest-clothing/latest-clothing.component';
import { ProductsSectionComponent } from '../products-section/products-section.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterModule, HeroSectionComponent, LatestClothingComponent, ProductsSectionComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

}
