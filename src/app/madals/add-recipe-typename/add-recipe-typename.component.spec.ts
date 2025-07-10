import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecipeTypenameComponent } from './add-recipe-typename.component';

describe('AddRecipeTypenameComponent', () => {
  let component: AddRecipeTypenameComponent;
  let fixture: ComponentFixture<AddRecipeTypenameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRecipeTypenameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRecipeTypenameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
