import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisheListComponent } from './dishe-list.component';

describe('DisheListComponent', () => {
  let component: DisheListComponent;
  let fixture: ComponentFixture<DisheListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisheListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisheListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
