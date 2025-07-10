import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProductTypesComponent } from './list-product-types.component';

describe('ListProductTypesComponent', () => {
  let component: ListProductTypesComponent;
  let fixture: ComponentFixture<ListProductTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListProductTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListProductTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
