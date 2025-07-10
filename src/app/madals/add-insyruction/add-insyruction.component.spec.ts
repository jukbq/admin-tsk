import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInsyructionComponent } from './add-insyruction.component';

describe('AddInsyructionComponent', () => {
  let component: AddInsyructionComponent;
  let fixture: ComponentFixture<AddInsyructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInsyructionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInsyructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
