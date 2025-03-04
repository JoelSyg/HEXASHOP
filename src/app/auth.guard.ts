import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserFirebaseService } from './services/user-firebase.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(UserFirebaseService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  const isBrowser = isPlatformBrowser(platformId);

  if (!isBrowser) return false;

  if (!authService.currentUser()) {
    localStorage.setItem('redirectAfterLogin', state.url);
    router.navigate(['/auth']);
    return false;
  }

  return true;
};
