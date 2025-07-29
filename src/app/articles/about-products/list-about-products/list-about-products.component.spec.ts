import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAboutProductsComponent } from './list-about-products.component';

describe('ListAboutProductsComponent', () => {
  let component: ListAboutProductsComponent;
  let fixture: ComponentFixture<ListAboutProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAboutProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAboutProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
