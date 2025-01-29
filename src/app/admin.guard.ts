import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserFirebaseService } from './services/user-firebase.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(UserFirebaseService);
  const router = inject(Router);

  if (!authService.currentUser() || !authService.currentUser()?.isAdmin) {
    localStorage.setItem('redirectAfterLogin', state.url);
    router.navigate(['/']);
    return false;
  }

  return true;
};
