import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { State } from './../../../interfaces/callback';

@Component({
  selector: 'app-sd-addtriggerdialog',
  templateUrl: './sd-addtriggerdialog.component.html',
  styleUrls: ['./sd-addtriggerdialog.component.css']
})
export class SdAddtriggerdialogComponent implements OnInit {

  TriggerTypes: any[];

  @Input() triggerName: string;
  @Input() stateName: string;
  selectedState: any;
  @Input() states: State[];
  @Output() success: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();
  triggerType: any;
  timeOut: number = null;
  domSelector: string = null;
  urlPattern: string = null;
  // First argument mapping.
  firstArgument: any;
  dirty = false;
  stateList: any[] = [];

  constructor() {
    this.triggerName = 'Trigger1';
    this.stateName = 'State1';
    this.TriggerTypes = [
      { name: 'Click', code: 'CLICK' },
      { name: 'Input Change', code: 'INPUT_CHANGE' },
      { name: 'Visibility Change', code: 'VISIBILITY_CHANGE' },
      { name: 'Content Change', code: 'CONTENT_CHANGE' },
      { name: 'HashChange', code: 'HASHCHANGE' },
      { name: 'XHR Success', code: 'XHR_COMPLETE' },
      { name: 'XHR Failed', code: 'XHR_FAILED' },
      { name: 'Set TimeOut', code: 'TimeOut' }
    ];


    this.firstArgument = {
      CLICK: 'DOM_SELECTOR',
      INPUT_CHANGE: 'DOM_SELECTOR',
      VISIBILITY_CHANGE: 'DOM_SELECTOR',
      CONTENT_CHANGE: 'DOM_SELECTOR',
      HASHCHANGE: 'NONE',
      XHR_COMPLETE: 'URL_PATTERN',
      XHR_FAILED: 'URL_PATTERN',
      TimeOut: 'TimeOut'
    };
  }

  ngOnInit() {
    // If states are given then set the state option.
    // this.states.forEach(state => {
    //   if (state.type != StateType.End)
    //     this.stateList.push({name: state.text, value: state.id});
    // });
  }

  ngOnChange() {
    console.log(' triggerType - ', this.triggerType);
  }

  // reset() {
  //   this.triggerType = null;
  //   this.domSelector = '';
  //   this.urlPattern = '';
  // }

  submit() {
    const type = this.triggerType ? this.triggerType.code : null;
    if (type) {
      if (this.firstArgument[type] === 'DOM_SELECTOR' && !(this.domSelector && this.domSelector.length)) {
        this.dirty = true;
        console.log('form dirty');
        return;
      }
      if (this.firstArgument[type] === 'URL_PATTERN' && !(this.urlPattern && this.urlPattern)) {
        this.dirty = true;
        console.log('form dirty');
        return;
      }
      if (this.firstArgument[type] === 'TimeOut' && !(this.timeOut && this.timeOut)) {
        this.dirty = true;
        console.log('form dirty');
        return;
      }

      const trigger = {
        stateId: this.stateName,
        name: this.triggerName,
        type,
        urlPattern: this.urlPattern,
        domSelector: this.domSelector,
        timeOut: this.timeOut
      };
      this.success.emit(trigger);
      console.log('Trigger Dialog Success');
    }
    this.triggerType = null;
    this.domSelector = null;
    this.urlPattern = null;
    this.timeOut = null;
  }
}
