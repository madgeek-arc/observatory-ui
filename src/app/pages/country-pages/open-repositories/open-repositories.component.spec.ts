import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenRepositoriesComponent } from './open-repositories.component';

describe('OpenRepositoriesComponent', () => {
  let component: OpenRepositoriesComponent;
  let fixture: ComponentFixture<OpenRepositoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenRepositoriesComponent]
    });
    fixture = TestBed.createComponent(OpenRepositoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
