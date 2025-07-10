import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToolModalComponent } from './add-tool-modal.component';

describe('AddToolModalComponent', () => {
  let component: AddToolModalComponent;
  let fixture: ComponentFixture<AddToolModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToolModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToolModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
