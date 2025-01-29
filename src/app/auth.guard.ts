import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserFirebaseService } from './services/user-firebase.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(UserFirebaseService);
  const router = inject(Router);

  // Falls User nicht eingeloggt ist, URL speichern und zum Login leiten
  if (!authService.currentUser()) {
    localStorage.setItem('redirectAfterLogin', state.url);
    router.navigate(['/auth']); // Leitet zum Login weiter
    return false;
  }

  return true; // Falls eingeloggt, Zugriff erlauben
};
