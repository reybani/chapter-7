import { Component, ViewChild } from '@angular/core';
import { Dialogs, DrawingTools, Node, Port, Edge, Group, jsPlumbToolkit, Surface } from "jsplumbtoolkit";
import { jsPlumbSurfaceComponent, BaseNodeComponent } from 'jsplumbtoolkit-angular';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';

function isNode(obj: Node | Port | Edge | Group): obj is Node {
  return obj.objectType === 'Node';
}

/**
 * This is the base class for nodes in this demo. It extends `BaseNodeComponent`
 */
class BaseEditableNodeComponent extends BaseNodeComponent {

  // constructor() {
  // super()
  // }


  removeNode(node: any) {
    const info = this.surface.getObjectInfo(node);
    const obj = info.obj;
    if (obj != null) {
      if (isNode(obj)) {
        Dialogs.show({
          id: 'dlgConfirm',
          data: {
            msg: 'Delete \'' + obj.data.text + '\''
          },
          onOK: () => {
            this.toolkit.removeNode(obj as Node);

          }
        });
      }
    }
  }

  editNode(node: any) {
    const info = this.surface.getObjectInfo(node);
    Dialogs.show({
      id: 'dlgText',
      data: info.obj.data,
      title: `Edit ${info.obj.data.type} name`,
      onOK: (data: any) => {
        if (data.text && data.text.length > 2) {
          // if name is at least 2 chars long, update the underlying data and
          // update the UI.
          this.toolkit.updateNode(info.obj, data);
        }
      }
    });
  }

}

// ----------------- question node -------------------------------

@Component({ templateUrl: '../../../templates/question.html' })
export class QuestionNodeComponent extends BaseEditableNodeComponent {
  constructor(private cbService: CallbackDataServiceService) {
    super();

    this.cbService.on('updateNode').subscribe(res => {

      if (this.obj.id == res['id']) {
        this.obj.dirty = res['dirty'];
        this.obj.text = res['text'];
      }
    });

  }


  removeNode(data) {
    this.cbService.broadcast('nodeDeleted', data);
  }

  editNode(data) {
    this.cbService.broadcast('editQuestionNode', data);
  }
}

// ----------------- action node -------------------------------

@Component({ templateUrl: '../../../templates/action.html' })
export class ActionNodeComponent extends BaseEditableNodeComponent {
  constructor(private cbService: CallbackDataServiceService) {
    super();
    this.cbService.on('updateNode').subscribe(res => {

      if (this.obj.id == res['id']) {
        this.obj.dirty = res['dirty'];
        this.obj.text = res['text'];
      }
    });
  }


  removeNode(data) {
    this.cbService.broadcast('nodeDeleted', data);
  }


  editNode(data) {
    this.cbService.broadcast('editActionNode', data);
  }
}

@Component({ templateUrl: '../../../templates/SDAction.html' })
export class SDActionNodeComponent extends BaseEditableNodeComponent {
  constructor(private cbService: CallbackDataServiceService) {
    super();
  }

  editActionNode(data) {
    console.log('Edit Action node ', data);

    this.cbService.broadcast('editAction', data);
  }
}


// ----------------- start node -------------------------------

@Component({ templateUrl: '../../../templates/start.html' })
export class StartNodeComponent extends BaseEditableNodeComponent {
  @ViewChild('drawer2') public drawer2;
  constructor(private cbService: CallbackDataServiceService) {
    super();
  }

  editStateNode(data) {
    console.log('Edit State node ', data);

    this.cbService.broadcast('editState', data);
  }
}

// ----------- end node ---------------------------------------
@Component({ templateUrl: '../../../templates/end.html' })
export class EndNodeComponent extends BaseEditableNodeComponent { }

// ----------------- state node --------------------------------
@Component({ templateUrl: '../../../templates/state.html' })
export class StateNodeComponent extends BaseEditableNodeComponent {
  constructor(private cbService: CallbackDataServiceService) {
    super();
  }

  editStateNode(data) {
    console.log('Edit State node ', data);

    this.cbService.broadcast('editState', data);
  }
}

// ----------------- output node -------------------------------

@Component({ templateUrl: '../../../templates/output.html' })
export class OutputNodeComponent extends BaseEditableNodeComponent { }

// ---------------PlaceHolder node ------------
@Component({ templateUrl: '../../../templates/placeholder.html' })
export class PlaceHolderComponent extends BaseEditableNodeComponent {
  /*
  @Input() nodeid: string;
  // @Output() droppedInPlaceHolder: EventEmitter<any> = new EventEmitter();

  constructor(private cbService: CallbackDataServiceService, private element: ElementRef) {
    super();
  }

  ngAfterViewInit() {
    // register the drop related callback. As these were not getting registered.
    this.element.nativeElement.addEventListener('dragover', (event) => this.allowDrop(event));
    this.element.nativeElement.addEventListener('drop', (event) => this.drop(event));
  }

  // This event will be used by flowpath instance.
  drop(event) {
    console.log('PlaceHolder drop called');
    this.cbService.broadcast('droppedInPlaceHolder',
    {event, node: this.element.nativeElement.querySelector('[nodeid]').getAttribute('nodeid')});
    // stop propogration.
    event.stopPropagation();
  }

  allowDrop(event) {
    console.log('PlaceHolder drop called');
    event.prevendDefault();
    event.stopPropagation();
  }
  */

  constructor(private cbService: CallbackDataServiceService) {
    super();
    this.cbService.on('updateNode').subscribe(res => {

      if (this.obj.id == res['id']) {
        this.obj.dirty = res['dirty'];
        this.obj.text = res['text'];
      }
    });
  }


  removeNode(data) {
    this.cbService.broadcast('nodeDeleted', data);
  }


  editNode(data) {
    this.cbService.broadcast('editActionNode', data);
  }
}

// -------------- /node components ------------------------------------

@Component({
  selector: 'jsplumb-flowchart',
  template: `
    <div class="sidebar node-palette" jsplumb-palette selector="li" surfaceId="flowchartSurface" [typeExtractor]="typeExtractor" [dataGenerator]="dataGenerator">
      <ul>
          <li *ngFor="let nodeType of nodeTypes" [attr.jtk-node-type]="nodeType.type" title="Drag to add new" [attr.jtk-width]="nodeType.w" [attr.jtk-height]="nodeType.h">{{nodeType.label}}</li>
      </ul>
    </div>
    <jsplumb-surface [surfaceId]="surfaceId" [toolkitId]="toolkitId" [view]="view" [renderParams]="renderParams" [nodeResolver]="resolveNode"></jsplumb-surface>
    <jsplumb-miniview [surfaceId]="surfaceId"></jsplumb-miniview>
    <jsplumb-controls [surfaceId]="surfaceId"></jsplumb-controls>
`
})
export class FlowchartCommonComponent {

  @ViewChild(jsPlumbSurfaceComponent) surfaceComponent: jsPlumbSurfaceComponent;

  toolkit: jsPlumbToolkit;
  surface: Surface;

  toolkitId: string;
  surfaceId: string;

  nodeTypes = [
    { label: "Question", type: "question", w: 120, h: 120 },
    { label: "Action", type: "action", w: 120, h: 70 },
    { label: "Output", type: "output", w: 120, h: 70 }
  ];

  constructor() {
    this.toolkitId = "flowchart";
    this.surfaceId = "flowchartSurface";
  }

  resolveNode(typeId: string) {
    return ({
      "QuestionNode": QuestionNodeComponent,
      "ActionNode": ActionNodeComponent,
      "StartNode": StartNodeComponent,
      "OutputNode": OutputNodeComponent
    })[typeId]
  }

  getToolkit(): jsPlumbToolkit {
    return this.toolkit;
  }

  toggleSelection(node: any) {
    this.toolkit.toggleSelection(node);
  }

  removeEdge(edge: any) {
    this.toolkit.removeEdge(edge);
  }

  editLabel(edge: any) {
    Dialogs.show({
      id: "dlgText",
      data: {
        text: edge.data.label || ""
      },
      onOK: (data: any) => {
        this.toolkit.updateEdge(edge, { label: data.text });
      }
    });
  }

  view = {
    nodes: {
      "start": {
        template: "StartNode"
      },
      "selectable": {
        events: {
          tap: (params: any) => {
            this.toggleSelection(params.node);
          }
        }
      },
      "question": {
        parent: "selectable",
        template: "QuestionNode"
      },
      "output": {
        parent: "selectable",
        template: "OutputNode"
      },
      "action": {
        parent: "selectable",
        template: "ActionNode"
      }
    },
    edges: {
      "default": {
        anchor: "AutoDefault",
        endpoint: "Blank",
        connector: ["Flowchart", { cornerRadius: 5 }],
        paintStyle: { strokeWidth: 2, stroke: "#f76258", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
        hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
        events: {
          "dblclick": (params: any) => {
            Dialogs.show({
              id: "dlgConfirm",
              data: {
                msg: "Delete Edge"
              },
              onOK: () => { this.removeEdge(params.edge); }
            });
          }
        },
        overlays: [
          ["Arrow", { location: 1, width: 10, length: 10 }],
          ["Arrow", { location: 0.3, width: 10, length: 10 }]
        ]
      },
      "connection": {
        parent: "default",
        overlays: [
          [
            "Label", {
              label: "${label}",
              events: {
                click: (params: any) => {
                  this.editLabel(params.edge);
                }
              }
            }
          ]
        ]
      }
    },
    ports: {
      "start": {
        endpoint: "Blank",
        anchor: "Continuous",
        uniqueEndpoint: true,
        edgeType: "default"
      },
      "source": {
        endpoint: "Blank",
        paintStyle: { fill: "#84acb3" },
        anchor: "AutoDefault",
        maxConnections: -1,
        edgeType: "connection"
      },
      "target": {
        maxConnections: -1,
        endpoint: "Blank",
        anchor: "AutoDefault",
        paintStyle: { fill: "#84acb3" },
        isTarget: true
      }
    }
  }

  renderParams = {
    layout: {
      type: "Spring"
    },
    events: {
      canvasClick: (e: Event) => {
        this.toolkit.clearSelection();
      },
      edgeAdded: (params: any) => {
        if (params.addedByMouse) {
          this.editLabel(params.edge);
        }
      }
    },
    consumeRightClick: false,
    dragOptions: {
      filter: ".jtk-draw-handle, .node-action, .node-action i"
    }
  }

  typeExtractor(el: Element) {
    return el.getAttribute("jtk-node-type");
  }

  dataGenerator(type: string, el: Element) {
    return {
      type: el.getAttribute("jtk-node-type"),
      w: parseInt(el.getAttribute("jtk-width"), 10),
      h: parseInt(el.getAttribute("jtk-height"), 10)
    }
  }

  ngAfterViewInit() {
    this.surface = this.surfaceComponent.surface;
    this.toolkit = this.surface.getToolkit();

    new DrawingTools({
      renderer: this.surface
    });


    this.toolkit.load({ url: "assets/data/flowchart-1.json" });
  }

  ngOnDestroy() {
    console.log("flowchart being destroyed");
  }

}
