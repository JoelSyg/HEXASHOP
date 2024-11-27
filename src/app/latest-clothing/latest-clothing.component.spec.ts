import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestClothingComponent } from './latest-clothing.component';

describe('LatestClothingComponent', () => {
  let component: LatestClothingComponent;
  let fixture: ComponentFixture<LatestClothingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestClothingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LatestClothingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
