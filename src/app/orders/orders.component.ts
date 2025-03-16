import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { UserFirebaseService } from '../services/user-firebase.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Order } from '../types/order.interface';
import { isPlatformBrowser } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  private userService = inject(UserFirebaseService);
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  isBrowser: boolean;
  hasRetried = false;

  authState$ = user(this.auth);
  currentUser = toSignal(this.authState$, { initialValue: null });

  currentUserEmail = computed(() => this.currentUser()?.email ?? null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    effect(async () => {
      const email = this.currentUserEmail();
      if (email) {
        setTimeout(async () => {
          await this.loadOrdersFromFirestore(email);
          this.isLoading.set(false);
        }, 500);
      } else {
        console.log('No user found (waiting for Firebase)');
      }
    });
  }

  async ngOnInit() {
    if (!this.isBrowser) return;
    this.isLoading.set(true);
  }

  private async loadOrdersFromFirestore(email: string) {
    const userRef = doc(this.firestore, `users/${email}`);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as { orders?: Order[] };

      if (!userData.orders && !this.hasRetried) {
        this.hasRetried = true;
        setTimeout(() => this.loadOrdersFromFirestore(email), 1500);
      } else {
        this.orders.set(userData.orders ?? []);
      }
    } else {
      this.orders.set([]);
    }
  }
}
