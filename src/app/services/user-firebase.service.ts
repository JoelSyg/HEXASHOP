import {
  Injectable,
  Inject,
  Injector,
  PLATFORM_ID,
  signal,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  private googleProvider = new GoogleAuthProvider();
  currentUser = signal<UserData | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private injector: Injector
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;

      if (!user.email)
        throw new Error('Google Login fehlgeschlagen, keine E-Mail vorhanden');

      const [name, surname] = user.displayName?.split(' ') ?? [''];

      const userExists = await this.doesUserExist(user.email);
      if (!userExists) {
        await this.createUserInFirestore(user.email, name, surname);
      }

      await this.setCurrentUser(user.email);
      this.redirectAfterLogin();
    } catch (error) {
      const firebaseError = error as FirebaseError;

      if (
        firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request' ||
        firebaseError.code === 'auth/user-cancelled'
      ) {
        return;
      }

      console.error('Google Login fehlgeschlagen:', firebaseError);
      throw firebaseError;
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

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email.trim(),
        password
      );

      await this.setCurrentUser(userCredential.user.email!);
      this.redirectAfterLogin();
    } catch (error) {
      const firebaseError = error as FirebaseError;
      throw firebaseError;
    }
  }

  async register(
    email: string,
    password: string,
    name?: string,
    surname?: string
  ): Promise<void> {
    try {
      const userExists = await this.doesUserExist(email);
      if (userExists) {
        throw new FirebaseError(
          'auth/email-already-in-use',
          'Email is already registered.'
        );
      }

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email.trim(),
        password
      );

      await this.createUserInFirestore(
        userCredential.user.email!,
        name,
        surname
      );
      await this.setCurrentUser(userCredential.user.email!);
      this.redirectAfterLogin();
    } catch (error) {
      const firebaseError = error as FirebaseError;
      throw firebaseError;
    }
  }

  private async createUserInFirestore(
    email: string,
    name?: string,
    surname?: string
  ) {
    const usersRef = doc(this.firestore, `users/${email}`);

    const newUser: UserData = {
      email,
      role: 'user',
      name: name || '',
      surname: surname || '',
      cart: [],
      createdAt: new Date().toISOString(),
    };

    await setDoc(usersRef, newUser);
  }

  private async setCurrentUser(email: string) {
    const usersRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(usersRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData;

      this.currentUser.set({
        email: userData.email,
        role: userData.role,
        name: userData.name || '',
        surname: userData.surname || '',
        cart: userData.cart ?? [],
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
    }
  }

  private mergeCarts(
    localCart: ShopItem[],
    firestoreCart: ShopItem[]
  ): ShopItem[] {
    const mergedCart: ShopItem[] = [...firestoreCart];

    localCart.forEach((localItem) => {
      const exists = mergedCart.some(
        (item) =>
          item.id === localItem.id && item.chosenSize === localItem.chosenSize
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
        localStorage.setItem(
          'loggedInUser',
          JSON.stringify(this.currentUser())
        );
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
    const redirectUrl = this.isBrowser
      ? localStorage.getItem('redirectAfterLogin') || '/'
      : '/';
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
    this.router.navigate(['']);
  }
}
