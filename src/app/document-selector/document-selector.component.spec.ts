import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentSelectorComponent } from './document-selector.component';

describe('DocumentSelectorComponent', () => {
  let component: DocumentSelectorComponent;
  let fixture: ComponentFixture<DocumentSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
