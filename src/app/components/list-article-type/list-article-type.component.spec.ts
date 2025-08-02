import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListArticleTypeComponent } from './list-article-type.component';

describe('ListArticleTypeComponent', () => {
  let component: ListArticleTypeComponent;
  let fixture: ComponentFixture<ListArticleTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListArticleTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListArticleTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
