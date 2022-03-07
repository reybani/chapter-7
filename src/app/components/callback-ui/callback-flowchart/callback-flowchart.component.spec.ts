import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackFlowchartComponent } from './callback-flowchart.component';

describe('CallbackFlowchartComponent', () => {
  let component: CallbackFlowchartComponent;
  let fixture: ComponentFixture<CallbackFlowchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackFlowchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackFlowchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
