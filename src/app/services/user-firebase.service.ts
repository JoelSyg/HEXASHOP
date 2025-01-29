import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';
import { FirebaseError } from '@angular/fire/app';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserFirebaseService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signal für aktuellen User (wird von Auth-start-Component genutzt)
  currentUser = signal<{ email: string; isAdmin: boolean } | null>(null);

  // Prüft, ob User existiert (für Login/Register-Logik)
  async doesUserExist(email: string): Promise<boolean> {
    const usersRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(usersRef);
    return userSnap.exists();
  }

  // Registrieren oder Einloggen
  async handleAuth(email: string, password: string): Promise<void> {
    console.log('🔍 Prüfe Benutzer:', email);
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

        // Speichert neuen Benutzer in Firestore mit Standardrolle "user"
        await this.createUserInFirestore(userCredential.user.email!);
      }

      // Setzt den aktuellen Benutzer (Admin-Status wird geprüft)
      await this.setCurrentUser(email);
      this.redirectAfterLogin();
    } catch (error) {
      const firebaseError = error as FirebaseError; //  Fehler als FirebaseError casten
      console.error(
        ' Firebase Auth Fehler:',
        firebaseError.code,
        firebaseError.message
      );
    }
  }

  // Speichert neuen User in Firestore
  private async createUserInFirestore(email: string) {
    const userRef = doc(this.firestore, `users/${email}`);
    await setDoc(userRef, {
      email,
      role: 'user', // Standardmäßig kein Admin
    });
  }

  // Setzt aktuellen User + Admin-Status
  private async setCurrentUser(email: string) {
    const userRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as { email: string; role: string };
      this.currentUser.set({
        email: userData.email,
        isAdmin: userData.role === 'admin',
      });
    }
  }

  redirectAfterLogin() {
    const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
    console.log(' Redirect nach Login:', redirectUrl);
    localStorage.removeItem('redirectAfterLogin'); // Einmalige Nutzung, daher entfernen
    this.router.navigate([redirectUrl]);
  }

  // Logout-Funktion
  async logout() {
    await this.auth.signOut();
    this.currentUser.set(null);
  }
}
