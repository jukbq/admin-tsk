import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAboutProductsComponent } from './add-about-products.component';

describe('AddAboutProductsComponent', () => {
  let component: AddAboutProductsComponent;
  let fixture: ComponentFixture<AddAboutProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAboutProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAboutProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
