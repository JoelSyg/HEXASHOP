import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CategoryClothingComponent } from './category-clothing/category-clothing.component';

export const routes: Routes = [
    { path: '', component: MainPageComponent},
    { path: 'about-us', component: AboutUsComponent},
    { path: 'mens-clothing', component: CategoryClothingComponent, data: { category: 'mens' }},
    { path: 'womens-clothing', component: CategoryClothingComponent, data: { category: 'womens' }},
    { path: 'kids-clothing', component: CategoryClothingComponent, data: { category: 'kids' }},
];
