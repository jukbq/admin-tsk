import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListArticleCategoriesComponent } from './list-article-categories.component';

describe('ListArticleCategoriesComponent', () => {
  let component: ListArticleCategoriesComponent;
  let fixture: ComponentFixture<ListArticleCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListArticleCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListArticleCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
