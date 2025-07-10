import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRecipeTypeComponent } from './list-recipe-type.component';

describe('ListRecipeTypeComponent', () => {
  let component: ListRecipeTypeComponent;
  let fixture: ComponentFixture<ListRecipeTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRecipeTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListRecipeTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
