import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowchartCommonComponent } from './flowchart-common.component';

describe('FlowchartCommonComponent', () => {
  let component: FlowchartCommonComponent;
  let fixture: ComponentFixture<FlowchartCommonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowchartCommonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowchartCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
