import { Component, inject, signal } from '@angular/core';
import { UserFirebaseService } from '../services/user-firebase.service';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { OrdersComponent } from "../orders/orders.component";
import { DetailsComponent } from '../details/details.component';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [HeaderComponent, FooterComponent, RouterModule, OrdersComponent, DetailsComponent, OrdersComponent],
})
export class ProfileComponent {
  private userService = inject(UserFirebaseService);
  private router = inject(Router); 

  currentUser = this.userService.currentUser;

  isOverviewPage = signal(false);

  constructor() {
    this.router.events.subscribe(() => {
      this.isOverviewPage.set(this.router.url === '/profile');
    });
  }
}
