import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackActionapiDialogComponent } from './callback-actionapi-dialog.component';

describe('CallbackActionapiDialogComponent', () => {
  let component: CallbackActionapiDialogComponent;
  let fixture: ComponentFixture<CallbackActionapiDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackActionapiDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackActionapiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
