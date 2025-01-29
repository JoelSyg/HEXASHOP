import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserFirebaseService } from '../services/user-firebase.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss',
  imports: [FormsModule],
})
export class AuthLoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserFirebaseService);

  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    // E-Mail aus URL übernehmen
    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || '');
    });
  }

  async login() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.userService.handleAuth(this.email(), this.password());
    } catch (error) {
      this.errorMessage.set('Falsches Passwort oder Konto existiert nicht.');
    }

    this.isLoading.set(false);
  }

  goBack() {
    this.router.navigate(['/auth']);
  }
}
