import { inject, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserFirebaseService } from './services/user-firebase.service';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(UserFirebaseService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Prüfen, ob im Browser
  const isBrowser = isPlatformBrowser(platformId);

  // Falls nicht im Browser → sofort return
  if (!isBrowser) return false;

  if (!authService.currentUser() || authService.currentUser()?.role !== 'admin') {
    localStorage.setItem('redirectAfterLogin', state.url);
    router.navigate(['/']);
    return false;
  }

  return true;
};
