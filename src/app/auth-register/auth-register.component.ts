import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserFirebaseService } from '../services/user-firebase.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-auth-register',
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss',
  imports: [FormsModule],
})
export class AuthRegisterComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserFirebaseService);

  email = signal('');
  password = signal('');
  name = signal('');
  surname = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    // E-Mail aus URL übernehmen
    this.route.queryParams.subscribe(params => {
      this.email.set(params['email'] || '');
    });
  }

  async register() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.userService.handleAuth(
        this.email(),
        this.password(),
        this.name(),
        this.surname()
      );
    } catch (error) {
      this.errorMessage.set('Registrierung fehlgeschlagen. Passwort zu kurz?');
    }

    this.isLoading.set(false);
  }

  goBack() {
    this.router.navigate(['/auth']);
  }
}
