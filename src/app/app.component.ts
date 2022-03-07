import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { DatasetComponent } from './dataset';
import { Dialogs, jsPlumbToolkit, jsPlumb, jsPlumbToolkitUtil } from 'jsplumbtoolkit';
import { jsPlumbService } from 'jsplumbtoolkit-angular';

@Component({
  selector: 'jsplumb-demo',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {

  @ViewChild(DatasetComponent) dataset: DatasetComponent;

  toolkitId: string;
  toolkit: jsPlumbToolkit;

  constructor(private $jsplumb: jsPlumbService, private elementRef: ElementRef) {
    this.toolkitId = this.elementRef.nativeElement.getAttribute('toolkitId');
  }

  ngOnInit() {
    this.toolkit = this.$jsplumb.getToolkit(this.toolkitId, this.toolkitParams);
  }

  ngAfterViewInit() {
    this.toolkit.load({ url: 'assets/data/flowchart-1.json' });
  }

  toolkitParams = {
    nodeFactory: (type: string, data: any, callback: Function) => {
      Dialogs.show({
        id: 'dlgText',
        title: 'Enter ' + type + ' name:',
        onOK: (d: any) => {
          data.text = d.text;
          // if the user entered a name...
          if (data.text) {
            // and it was at least 2 chars
            if (data.text.length >= 2) {
              // set an id and continue.
              data.id = jsPlumbToolkitUtil.uuid();
              callback(data);
            }
            else
              // else advise the user.
              alert(type + ' names must be at least 2 characters!');
          }
          // else...do not proceed.
        }
      });
    },
    beforeStartConnect: (node: any, edgeType: string) => {
      return { label: '...' };
    }
  }

}
