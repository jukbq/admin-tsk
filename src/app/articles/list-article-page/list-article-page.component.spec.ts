import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListArticlePageComponent } from './list-article-page.component';

describe('ListArticlePageComponent', () => {
  let component: ListArticlePageComponent;
  let fixture: ComponentFixture<ListArticlePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListArticlePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListArticlePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
