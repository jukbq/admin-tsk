import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticleOaragraphComponent } from './add-article-oaragraph.component';

describe('AddArticleOaragraphComponent', () => {
  let component: AddArticleOaragraphComponent;
  let fixture: ComponentFixture<AddArticleOaragraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArticleOaragraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArticleOaragraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
