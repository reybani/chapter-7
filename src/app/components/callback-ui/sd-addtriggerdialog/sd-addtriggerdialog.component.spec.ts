import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SdAddtriggerdialogComponent } from './sd-addtriggerdialog.component';

describe('SdAddtriggerdialogComponent', () => {
  let component: SdAddtriggerdialogComponent;
  let fixture: ComponentFixture<SdAddtriggerdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SdAddtriggerdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SdAddtriggerdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
