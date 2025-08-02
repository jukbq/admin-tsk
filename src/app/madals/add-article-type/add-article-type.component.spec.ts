import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticleTypeComponent } from './add-article-type.component';

describe('AddArticleTypeComponent', () => {
  let component: AddArticleTypeComponent;
  let fixture: ComponentFixture<AddArticleTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArticleTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArticleTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
