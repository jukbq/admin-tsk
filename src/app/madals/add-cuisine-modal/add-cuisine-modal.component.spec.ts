import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCuisineModalComponent } from './add-cuisine-modal.component';

describe('AddCuisineModalComponent', () => {
  let component: AddCuisineModalComponent;
  let fixture: ComponentFixture<AddCuisineModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCuisineModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCuisineModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
