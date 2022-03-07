import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { jsPlumbToolkitModule } from 'jsplumbtoolkit-angular';
import { Dialogs } from 'jsplumbtoolkit';
import { ROUTING } from './app.routing';
import { DatasetComponent } from './dataset';
import { ControlsComponent } from './controls';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenubarModule } from 'primeng/menubar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { QuestionNodeComponent, ActionNodeComponent, StartNodeComponent, OutputNodeComponent, EndNodeComponent, StateNodeComponent, SDActionNodeComponent, PlaceHolderComponent } from './components/callback-ui/flowchart-common/flowchart-common.component';
import { CallbackSdComponent } from './components/callback-ui/callback-sd/callback-sd.component';
import { SdAddtriggerdialogComponent } from './components/callback-ui/sd-addtriggerdialog/sd-addtriggerdialog.component';
import { FieldsetModule } from 'primeng/fieldset';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { SidebarModule } from 'primeng/sidebar';
import { AccordionModule } from 'primeng/accordion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToolbarModule } from 'primeng/toolbar';
import { InputMaskModule } from 'primeng/inputmask';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TreeModule } from 'primeng/tree';

import { CallbackDesignerComponent } from './components/callback-ui/callback-designer/callback-designer.component';
import { CallbackFlowchartComponent } from './components/callback-ui/callback-flowchart/callback-flowchart.component';
import { CallbackSidebarMenuComponent } from './components/callback-ui/callback-sidebar-menu/callback-sidebar-menu.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule, MatDialogModule } from '@angular/material';
import { CallbackActionapiDialogComponent } from './components/callback-ui/callback-actionapi-dialog/callback-actionapi-dialog.component';
import { CallbackActionConditionDialogComponent } from './components/callback-ui/callback-action-condition-dialog/callback-action-condition-dialog.component';
import { CallbackDataServiceService } from './services/callback-data-service.service';
import { ExtractdataComponent } from './components/callback-ui/extractdata/extractdata.component';
import { MatCardModule } from '@angular/material/card';
import { CallbackSdTriggerActionComponent } from './components/callback-ui/callback-sd/callback-sd-trigger-action/callback-sd-trigger-action.component';
import { FlowchartCommonComponent } from './components/callback-ui/flowchart-common/flowchart-common.component';
import { LoaderComponent } from './components/loader/loader.component';
import { OrderListModule } from 'primeng/orderlist';



@NgModule({
  imports: [BrowserModule, HttpClientModule, CommonModule, BrowserAnimationsModule, jsPlumbToolkitModule, ROUTING, FormsModule, ReactiveFormsModule,
    InputTextModule, DropdownModule, FieldsetModule, DialogModule, ToolbarModule, ButtonModule, TabViewModule, SidebarModule, ConfirmDialogModule, OrderListModule,
    MatDividerModule, MatButtonModule, AccordionModule, TreeModule, ListboxModule, PanelMenuModule, MatSidenavModule, MultiSelectModule, MatDialogModule, MatCardModule, MatSnackBarModule, MatListModule, MatMenuModule, MenubarModule, TieredMenuModule, DragDropModule, InputMaskModule, MenuModule],
  declarations: [AppComponent, QuestionNodeComponent, ActionNodeComponent, StartNodeComponent, OutputNodeComponent,
    DatasetComponent, ControlsComponent, CallbackSdComponent,
    SdAddtriggerdialogComponent, CallbackDesignerComponent, EndNodeComponent, StateNodeComponent, PlaceHolderComponent, FlowchartCommonComponent,
    CallbackFlowchartComponent,
    CallbackSidebarMenuComponent,
    CallbackActionapiDialogComponent,
    CallbackActionConditionDialogComponent,
    SDActionNodeComponent, ExtractdataComponent, CallbackSdTriggerActionComponent, LoaderComponent],
  bootstrap: [AppComponent],
  providers: [CallbackDataServiceService],
  entryComponents: [QuestionNodeComponent, ActionNodeComponent, StartNodeComponent, OutputNodeComponent, EndNodeComponent, StateNodeComponent, SDActionNodeComponent, ExtractdataComponent, PlaceHolderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() {
    // initialize dialogs
    Dialogs.initialize({
      selector: '.dlg'
    });
  }
}

