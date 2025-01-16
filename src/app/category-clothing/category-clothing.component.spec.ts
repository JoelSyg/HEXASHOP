import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryClothingComponent } from './category-clothing.component';

describe('CategoryClothingComponent', () => {
  let component: CategoryClothingComponent;
  let fixture: ComponentFixture<CategoryClothingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryClothingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryClothingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
