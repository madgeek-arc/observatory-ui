import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenScienceTrainingComponent } from './open-science-training.component';

describe('OpenScienceTrainingComponent', () => {
  let component: OpenScienceTrainingComponent;
  let fixture: ComponentFixture<OpenScienceTrainingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenScienceTrainingComponent]
    });
    fixture = TestBed.createComponent(OpenScienceTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
