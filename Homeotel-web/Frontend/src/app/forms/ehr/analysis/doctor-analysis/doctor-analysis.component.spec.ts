import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorAnalysisComponent } from './doctor-analysis.component';

describe('DoctorAnalysisComponent', () => {
  let component: DoctorAnalysisComponent;
  let fixture: ComponentFixture<DoctorAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
