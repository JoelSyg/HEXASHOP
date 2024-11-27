import { TestBed } from '@angular/core/testing';

import { ItemFirebaseService } from '../services/item-firebase-service.service';

describe('ItemFirebaseServiceService', () => {
  let service: ItemFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
