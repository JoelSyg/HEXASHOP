import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CategoryClothingComponent } from './category-clothing/category-clothing.component';
import { SingleItemPageComponent } from './single-item-page/single-item-page.component';
import { ShoppingCartPageComponent } from './shopping-cart-page/shopping-cart-page.component';

export const routes: Routes = [
    { path: '', component: MainPageComponent},
    { path: 'about-us', component: AboutUsComponent},
    { path: 'mens-clothing', component: CategoryClothingComponent, data: { category: 'mens' }},
    { path: 'womens-clothing', component: CategoryClothingComponent, data: { category: 'womens' }},
    { path: 'kids-clothing', component: CategoryClothingComponent, data: { category: 'kids' }},
    { path: 'single-item-page/:id', component: SingleItemPageComponent},
    { path: 'shopping-cart-page', component: ShoppingCartPageComponent},
];
