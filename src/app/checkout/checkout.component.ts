import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { ShoppingCartService } from '../services/shopping-cart.service';
import { UserFirebaseService } from '../services/user-firebase.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  private router = inject(Router);
  private shoppingCartService = inject(ShoppingCartService);

    private userService = inject(UserFirebaseService);
  

  // simulateCheckout() {
  //   setTimeout(() => {
      
  //     this.shoppingCartService.clearCart();
  //     this.router.navigate(['/checkout-success']);
  //   }, 250);
  // }

  simulateCheckout() {
    this.userService.placeOrder().then(() => {
      this.router.navigate(['/checkout-success']);
    });
  }
  
}
