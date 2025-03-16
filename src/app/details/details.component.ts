import { Component, inject } from '@angular/core';
import { UserFirebaseService } from '../services/user-firebase.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  private userService = inject(UserFirebaseService);

  currentUser = this.userService.currentUser;
}
