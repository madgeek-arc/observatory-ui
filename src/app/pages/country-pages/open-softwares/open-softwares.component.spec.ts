import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSoftwaresComponent } from './open-softwares.component';

describe('OpenSoftwaresComponent', () => {
  let component: OpenSoftwaresComponent;
  let fixture: ComponentFixture<OpenSoftwaresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenSoftwaresComponent]
    });
    fixture = TestBed.createComponent(OpenSoftwaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
