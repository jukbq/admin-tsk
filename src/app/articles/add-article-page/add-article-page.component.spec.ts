import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticlePageComponent } from './add-article-page.component';

describe('AddArticlePageComponent', () => {
  let component: AddArticlePageComponent;
  let fixture: ComponentFixture<AddArticlePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArticlePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArticlePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
