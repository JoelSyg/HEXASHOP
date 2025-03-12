import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CategoryClothingComponent } from './category-clothing/category-clothing.component';
import { SingleItemPageComponent } from './single-item-page/single-item-page.component';
import { ShoppingCartPageComponent } from './shopping-cart-page/shopping-cart-page.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { AdminComponent } from './admin/admin.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AuthStartComponent } from './auth-start/auth-start.component';
import { AuthRegisterComponent } from './auth-register/auth-register.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { ProfileComponent } from './profile/profile.component';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

export const routes: Routes = [
    { path: '', component: MainPageComponent},
    { path: 'about-us', component: AboutUsComponent},
    { path: 'mens-clothing', component: CategoryClothingComponent, data: { category: 'mens' }},
    { path: 'womens-clothing', component: CategoryClothingComponent, data: { category: 'womens' }},
    { path: 'kids-clothing', component: CategoryClothingComponent, data: { category: 'kids' }},
    { path: 'single-item-page/:id', component: SingleItemPageComponent},
    { path: 'shopping-cart-page', component: ShoppingCartPageComponent},
    { path: 'legal-notice', component: LegalNoticeComponent},
    { path: 'contact-us', component: ContactUsComponent},

    { path: 'auth', component: AuthStartComponent },
    { path: 'auth/login', component: AuthLoginComponent }, 
    { path: 'auth/register', component: AuthRegisterComponent },


    { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
    { path: 'checkout-success', component: CheckoutSuccessComponent},
    { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
];
