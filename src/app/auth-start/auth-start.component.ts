import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserFirebaseService } from '../services/user-firebase.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-auth-start',
  templateUrl: './auth-start.component.html',
  styleUrl: './auth-start.component.scss',
  imports: [FormsModule],
})
export class AuthStartComponent {
  private router = inject(Router);
  private userService = inject(UserFirebaseService);

  email = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  async checkEmail() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const exists = await this.userService.doesUserExist(this.email());
      if (exists) {
        this.router.navigate(['/auth/login'], { queryParams: { email: this.email() } });
      } else {
        this.router.navigate(['/auth/register'], { queryParams: { email: this.email() } });
      }
    } catch (error) {
      this.errorMessage.set('Fehler beim Überprüfen der E-Mail.');
    }

    this.isLoading.set(false);
  }
}
