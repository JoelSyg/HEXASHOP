import { Component, inject, signal } from '@angular/core';
import { UserFirebaseService } from '../services/user-firebase.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private userService = inject(UserFirebaseService);
  private router = inject(Router);

  currentUser = this.userService.currentUser;

  logout() {
    this.userService.logout();
    this.router.navigate(['/']); // Nach Logout zur Startseite
  }
}
