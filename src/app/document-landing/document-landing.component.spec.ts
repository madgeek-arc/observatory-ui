import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentLandingComponent } from './document-landing.component';

describe('DocumentLandingComponent', () => {
  let component: DocumentLandingComponent;
  let fixture: ComponentFixture<DocumentLandingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentLandingComponent]
    });
    fixture = TestBed.createComponent(DocumentLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
