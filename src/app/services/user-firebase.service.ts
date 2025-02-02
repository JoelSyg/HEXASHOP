import { Injectable, Inject, Injector, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import { FirebaseError } from '@angular/fire/app';
import { Router } from '@angular/router';
import { ShoppingCartService } from './shopping-cart.service';
import { ShopItem } from '../types/shop-item.interface';
import { UserData } from '../types/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserFirebaseService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private isBrowser: boolean;

  currentUser = signal<UserData | null>(null);


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private injector: Injector) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }
  
  private get cartService(): ShoppingCartService {
    return this.injector.get(ShoppingCartService);
  }

  async doesUserExist(email: string): Promise<boolean> {
    const usersRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(usersRef);
    return userSnap.exists();
  }

  async handleAuth(email: string, password: string, name?: string, surname?: string): Promise<void> {
    console.log(' Prüfe Benutzer:', email);
    try {
      const userExists = await this.doesUserExist(email);
  
      if (userExists) {
        console.log(' Benutzer existiert, versuche Login...');
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        console.log(' Login erfolgreich:', userCredential);
      } else {
        console.log(' Benutzer existiert nicht, registriere...');
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        console.log(' Registrierung erfolgreich:', userCredential);
  
        await this.createUserInFirestore(userCredential.user.email!, name, surname);
      }
  
      await this.setCurrentUser(email);
      this.redirectAfterLogin();
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error(' Firebase Auth Fehler:', firebaseError.code, firebaseError.message);
    }
  }

  private async createUserInFirestore(email: string, name?: string, surname?: string) {
    const userRef = doc(this.firestore, `users/${email}`);

    const newUser: UserData = {
      email,
      role: 'user',
      name: name || '',
      surname: surname || '',
      cart: [],
      createdAt: new Date().toISOString(),
    };

    await setDoc(userRef, newUser);
  }

  private async setCurrentUser(email: string) {
    const userRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data() as UserData;

        // 🔥 Speichert den User mit Name, Nachname & Warenkorb
        this.currentUser.set({
            email: userData.email,
            role: userData.role,
            name: userData.name || '',
            surname: userData.surname || '',
            cart: userData.cart ?? []
        });

        this.saveUserToStorage();

        const localCart: ShopItem[] = this.isBrowser 
            ? JSON.parse(localStorage.getItem('shoppingCart') || '[]') 
            : [];

        const firestoreCart: ShopItem[] = userData.cart ?? [];

        const mergedCart = this.mergeCarts(localCart, firestoreCart);

        if (this.isBrowser) {
            localStorage.setItem('shoppingCart', JSON.stringify(mergedCart));
        }

        this.cartService.setCartFromFirestore(mergedCart);
        await this.cartService.saveCartToFirestore(mergedCart);
    } else {
        console.warn(`⚠️ Kein User-Dokument gefunden für: ${email}`);
    }
}


  private mergeCarts(localCart: ShopItem[], firestoreCart: ShopItem[]): ShopItem[] {
    const mergedCart: ShopItem[] = [...firestoreCart];

    localCart.forEach((localItem) => {
      const exists = mergedCart.some(
        (item) => item.id === localItem.id && item.chosenSize === localItem.chosenSize
      );

      if (!exists) {
        mergedCart.push(localItem);
      }
    });

    return mergedCart;
  }

  private saveUserToStorage() {
    if (this.isBrowser) {
      if (this.currentUser()) {
        localStorage.setItem('loggedInUser', JSON.stringify(this.currentUser()));
      } else {
        localStorage.removeItem('loggedInUser');
      }
    }
  }

  private loadUserFromStorage() {
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('loggedInUser');
      if (savedUser) {
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  redirectAfterLogin() {
    const redirectUrl = this.isBrowser ? localStorage.getItem('redirectAfterLogin') || '/' : '/';
    console.log('🔄 Redirect nach Login:', redirectUrl);
    if (this.isBrowser) {
      localStorage.removeItem('redirectAfterLogin');
    }
    this.router.navigate([redirectUrl]);
  }

  async logout() {
    await this.auth.signOut();
    this.currentUser.set(null);
    
    if (this.isBrowser) {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('shoppingCart');
    }

    this.cartService.setCartFromFirestore([]); 
    this.router.navigate(['/']);
  }
}
