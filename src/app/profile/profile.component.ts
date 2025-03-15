import { Component, inject, signal } from '@angular/core';
import { UserFirebaseService } from '../services/user-firebase.service';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [HeaderComponent, FooterComponent, RouterModule],
})
export class ProfileComponent {
  private userService = inject(UserFirebaseService);

  currentUser = this.userService.currentUser;
}
