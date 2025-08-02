import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticleComponentsComponent } from './add-article-components.component';

describe('AddArticleComponentsComponent', () => {
  let component: AddArticleComponentsComponent;
  let fixture: ComponentFixture<AddArticleComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArticleComponentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArticleComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
