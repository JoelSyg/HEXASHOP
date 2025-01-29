import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthStartComponent } from './auth-start.component';

describe('AuthComponent', () => {
  let component: AuthStartComponent;
  let fixture: ComponentFixture<AuthStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthStartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
