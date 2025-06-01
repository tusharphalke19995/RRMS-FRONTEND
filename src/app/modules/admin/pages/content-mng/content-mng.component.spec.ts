import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMngComponent } from './content-mng.component';

describe('ContentMngComponent', () => {
  let component: ContentMngComponent;
  let fixture: ComponentFixture<ContentMngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentMngComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentMngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
