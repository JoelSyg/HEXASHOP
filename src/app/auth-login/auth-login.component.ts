import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserFirebaseService } from '../services/user-firebase.service';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { FirebaseError } from '@angular/fire/app';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss',
  imports: [ReactiveFormsModule, HeaderComponent, FooterComponent],
})
export class AuthLoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserFirebaseService);

  email = signal('');
  isLoading = signal(false);
  errors = signal<{ [key: string]: string }>({});

  passwordControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  passwordErrorMessage = computed(() => this.errors()?.['password'] || '');

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      const email = params['email'] || '';
      this.email.set(email);

      if (!email) {
        this.router.navigate(['/auth']);
      }
    });

    this.passwordControl.valueChanges.subscribe(() =>
      this.setError('password', '')
    );
  }

  async login() {
    if (!this.validateForm()) return;

    this.isLoading.set(true);
    this.errors.set({});

    try {
      await this.userService.login(this.email(), this.passwordControl.value);
    } catch (error) {
      this.handleFirebaseError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateForm(): boolean {
    this.passwordControl.markAsTouched();
    this.passwordControl.updateValueAndValidity();

    this.updateErrorMessages();

    return !this.passwordControl.invalid;
  }

  private updateErrorMessages() {
    this.setError(
      'password',
      this.passwordControl.errors?.['required'] ? 'Password is required.' : ''
    );
  }

  private setError(field: string, message: string) {
    this.errors.set({ ...this.errors(), [field]: message });
  }

  private handleFirebaseError(error: unknown) {
    const firebaseError = error as FirebaseError;

    const errorMessages: Record<string, string> = {
      'auth/invalid-credential': 'Incorrect password or email.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/invalid-email': 'Invalid email format.',
    };

    this.setError(
      'password',
      errorMessages[firebaseError.code] ||
        'An unexpected error occurred. Please try again.'
    );
  }

  editEmail() {
    this.router.navigate(['/auth'], { queryParams: { email: this.email() } });
  }
}
