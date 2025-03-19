import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserFirebaseService } from '../services/user-firebase.service';
import {
  ReactiveFormsModule,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseError } from '@angular/fire/app';

@Component({
  standalone: true,
  selector: 'app-auth-start',
  templateUrl: './auth-start.component.html',
  styleUrl: './auth-start.component.scss',
  imports: [ReactiveFormsModule, HeaderComponent, FooterComponent, RouterModule],
})
export class AuthStartComponent {
  private router = inject(Router);
  private userService = inject(UserFirebaseService);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  errors = signal<{ [key: string]: string }>({});

  emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, this.validEmailFormat],
  });

  emailErrorMessage = computed(() => this.errors()?.['email'] || '');

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.emailControl.setValue(params['email'] || '');
    });

    this.emailControl.valueChanges.subscribe(() => this.setError('email', ''));
  }

  async checkEmail() {
    if (!this.validateForm()) return;

    this.isLoading.set(true);
    this.errors.set({});

    try {
      const email = this.emailControl.value;
      const exists = await this.userService.doesUserExist(email);
      if (exists) {
        this.router.navigate(['/auth/login'], { queryParams: { email } });
      } else {
        this.router.navigate(['/auth/register'], { queryParams: { email } });
      }
    } catch (error) {
      this.setError('general', 'An error occurred while checking the email.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateForm(): boolean {
    this.emailControl.markAsTouched();
    this.emailControl.updateValueAndValidity();

    this.updateErrorMessages();

    return !this.emailControl.invalid;
  }

  private updateErrorMessages() {
    this.setError(
      'email',
      this.emailControl.errors?.['required']
        ? 'Email is required.'
        : this.emailControl.errors?.['invalidEmail']
        ? 'Please enter a valid email address.'
        : ''
    );
  }

  private setError(field: string, message: string) {
    this.errors.set({ ...this.errors(), [field]: message });
  }

  private validEmailFormat(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  onGoogleLogin() {
    this.signInWithGoogle();
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await this.userService.signInWithGoogle();
    } catch (error) {
      const firebaseError = error as FirebaseError;

      if (
        firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request' ||
        firebaseError.code === 'auth/user-cancelled'
      ) {
        return;
      }

      this.setError('general', 'Google login failed.');
    }
  }
}
