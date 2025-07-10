import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDishesModalComponent } from './add-dishes-modal.component';

describe('AddDishesModalComponent', () => {
  let component: AddDishesModalComponent;
  let fixture: ComponentFixture<AddDishesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDishesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDishesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
