import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsContainerComponent } from './pms-container.component';

describe('PmsContainerComponent', () => {
  let component: PmsContainerComponent;
  let fixture: ComponentFixture<PmsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmsContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PmsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
