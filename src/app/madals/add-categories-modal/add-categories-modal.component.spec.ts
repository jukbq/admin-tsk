import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoriesModalComponent } from './add-categories-modal.component';

describe('AddCategoriesModalComponent', () => {
  let component: AddCategoriesModalComponent;
  let fixture: ComponentFixture<AddCategoriesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCategoriesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCategoriesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
