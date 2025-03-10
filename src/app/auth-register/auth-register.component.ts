import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { FirebaseError } from '@angular/fire/app';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-auth-register',
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss',
  imports: [ReactiveFormsModule, HeaderComponent, FooterComponent],
})
export class AuthRegisterComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserFirebaseService);

  email = signal('');
  isLoading = signal(false);
  errors = signal<{ [key: string]: string }>({});

  nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, this.validNameSurname],
  });

  surnameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, this.validNameSurname],
  });

  passwordControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(6)],
  });

  nameErrorMessage = computed(() => this.errors()?.['name'] || '');
  surnameErrorMessage = computed(() => this.errors()?.['surname'] || '');
  passwordErrorMessage = computed(() => this.errors()?.['password'] || '');

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.email.set(params['email'] || '');

      if (!params['email']) {
        this.router.navigate(['/auth']);
      }
    });

    this.nameControl.valueChanges.subscribe(() => this.setError('name', ''));
    this.surnameControl.valueChanges.subscribe(() =>
      this.setError('surname', '')
    );
    this.passwordControl.valueChanges.subscribe(() =>
      this.setError('password', '')
    );
  }

  async register() {
    if (!this.validateForm()) return;

    this.isLoading.set(true);
    this.errors.set({});

    try {
      await this.userService.register(
        this.email(),
        this.passwordControl.value,
        this.nameControl.value,
        this.surnameControl.value
      );
    } catch (error) {
      this.handleFirebaseError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateForm(): boolean {
    this.surnameControl.markAsTouched();
    this.passwordControl.markAsTouched();
    this.nameControl.updateValueAndValidity();
    this.surnameControl.updateValueAndValidity();
    this.passwordControl.updateValueAndValidity();

    this.updateErrorMessages();

    return !(
      this.nameControl.invalid ||
      this.surnameControl.invalid ||
      this.passwordControl.invalid
    );
  }

  private updateErrorMessages() {
    this.setError(
      'name',
      this.nameControl.errors?.['required']
        ? 'First name is required.'
        : this.nameControl.errors?.['invalidName']
        ? 'Invalid first name.'
        : ''
    );

    this.setError(
      'surname',
      this.surnameControl.errors?.['required']
        ? 'Last name is required.'
        : this.surnameControl.errors?.['invalidName']
        ? 'Invalid last name.'
        : ''
    );

    this.setError(
      'password',
      this.passwordControl.errors?.['required']
        ? 'Password is required.'
        : this.passwordControl.errors?.['minlength']
        ? 'Password must be at least 6 characters.'
        : ''
    );
  }

  private setError(field: string, message: string) {
    this.errors.set({ ...this.errors(), [field]: message });
  }

  private handleFirebaseError(error: unknown) {
    const firebaseError = error as FirebaseError;

    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use':
        'This email is already registered. Try logging in.',
      'auth/invalid-email': 'Invalid email format.',
      'auth/weak-password': 'Password must be at least 6 characters.',
    };

    this.setError(
      'password',
      errorMessages[firebaseError.code] ||
        'An unexpected error occurred. Please try again.'
    );
  }

  private validNameSurname(control: AbstractControl): ValidationErrors | null {
    return /^[a-zA-ZäöüÄÖÜß' -]+$/.test(control.value.trim())
      ? null
      : { invalidName: true };
  }

  goBack() {
    this.router.navigate(['/auth'], { queryParams: { email: this.email() } });
  }
}
