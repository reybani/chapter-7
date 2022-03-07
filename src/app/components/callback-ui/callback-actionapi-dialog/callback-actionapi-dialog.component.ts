import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ActionApi, ApiArgument } from './../../../interfaces/action-api';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';
import { Callback } from './../../../interfaces/callback';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'app-callback-actionapi-dialog',
  templateUrl: './callback-actionapi-dialog.component.html',
  styleUrls: ['./callback-actionapi-dialog.component.css']
})

export class CallbackActionapiDialogComponent implements OnInit, OnChanges {
  constructor(private dpData: CallbackDataServiceService, public dialog: MatDialog) {

    this.sessionStateList = [
      { label: 'BROWSER', value: 'BROWSER' },
      { label: 'SHOPPER', value: 'SHOPPER' },
      { label: 'BUYER', value: 'BUYER' }
    ];
  }

  @Input() api: ActionApi;
  @Input() args: any;

  // It is needed to show state in state Api.
  @Input() callback: Callback;
  @Output() actionApiSubmit: EventEmitter<any> = new EventEmitter();
  @Output() showApi: EventEmitter<boolean> = new EventEmitter();

  form: FormGroup;

  groupedVariableList: any = [];
  localVariableList: any = [];
  extractedData: any = null;
  // LocalVar: any = null;
  localVar: any;
  stateList: any[] = [];
  sessionStateList: any = [];

  showExtractDialog: any = false;

  showLocalVarDialog = false;

  ngOnInit() {
    this.getGroupedVarData();


    this.dpData.on('callbackChanged').subscribe(data => {
      this.getGroupedVarData();
    });

    // register for change.
    this.dpData.on('addedLocalVar').subscribe(() => this.getGroupedVarData());
    this.dpData.on('addedDataPoint').subscribe(() => this.getGroupedVarData());
  }

  ngOnChanges() {
    // console.log('ngOnChanges called', this.extracteddata, "\n", this.groupedVariableList);
    // TODO: Check if input will be available in constructor. if so then move this code in constructor.
    // create form group for api fields.
    if (this.api) {
      this.form = this.toFormGroup(this.api.arguments);
    }

    // Check if gotoState api then set stateList too.
    this.stateList = [];
    this.callback.states.forEach(state => {
      this.stateList.push({ label: state.text, value: state.id });
    });

    if (this.api.category === 'localVarApi') {
      this.localVariableList = [this.groupedVariableList[1]];
    }

    console.log('form group initialized');
  }

  toFormGroup(args: ApiArgument[]) {
    const group: any = {};

    // set the initial value from args input.
    // TODO: format the args.
    args.forEach(argument => {

      console.log('toFormGroup : argiment name - ', argument.name);

      let initialValue = '';
      if (this.args && typeof this.args[argument.name] === 'string') {
        initialValue = this.args[argument.name];
      }
      group[argument.name] = argument.required ? new FormControl(initialValue, Validators.required) : new FormControl('');
    });

    return new FormGroup(group);
  }

  onSubmit() {
    console.log('Form submitted successfully. value - ', this.form.value);
    this.actionApiSubmit.emit({ api: this.api, argument: this.form.value });
  }

  hideForm() {
    this.showApi.emit(false);
  }


  getGroupedVarData() {
    // TODO: it has to pass by parent component or some other service.
    this.groupedVariableList = [{
      label: 'Data points',
      value: 'fa fa-mixcloud',
      items: []
    }, {
      label: 'Local variables',
      value: 'fa fa-cubes',
      items: []

    }];

    const dataPoints = this.dpData.getDataPoint();
    const localVars = this.dpData.getLocalVar();

    if (dataPoints) {
      // this.groupedVariableList[0].items = [];
      for (let i = 0; i < dataPoints.length; i++) {
        const temp = { label: dataPoints[i].name, value: '@DP.' + dataPoints[i].name };
        this.groupedVariableList[0].items[i] = temp;
      }
    }
    if (localVars) {
      for (let i = 0; i < localVars.length; i++) {
        // this.groupedVariableList[1].items = [];
        console.log('items of localVar', localVars[i], ' , this.groupedVariableList[1]', this.groupedVariableList[1].items);
        this.groupedVariableList[1].items[i] = { label: localVars[i].name, value: '@Local.' + localVars[i].name };
      }
    }

    this.localVariableList = [this.groupedVariableList[1]];
  }
  openExtractDialog() {
    this.showExtractDialog = true;
  }

  ectractedDataPoint(event) {
    console.log('event on submit datapoint', event);
    this.showExtractDialog = false;
  }
  addLocalVar() {
    // let TempLocalVar = {label : this.localVar , value : this.localVar};
    this.dpData.addLocalVar({ name: this.localVar });
    // this.groupedVariableList[1].items.push(TempLocalVar);
    this.showLocalVarDialog = false;
  }

  allowDrop(ev) {
    console.log('api-dd: allowDrop called');
    ev.preventDefault();
  }

  drop(ev, control) {
    const value = ev.dataTransfer.getData('text').split('$')[1];
    const valueFor = ev.dataTransfer.getData('text').split('$')[0];
    console.log('api-dd: drop with value - ' + value);
    // set the value.
    this.form.controls[control].patchValue(value);

  }
}
