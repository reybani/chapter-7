import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { jsPlumbSurfaceComponent, jsPlumbService } from 'jsplumbtoolkit-angular';
import { jsPlumbToolkit, Surface, Dialogs, DrawingTools, jsPlumbToolkitUtil } from 'jsplumbtoolkit';
import { QuestionNodeComponent, ActionNodeComponent, StartNodeComponent, OutputNodeComponent, PlaceHolderComponent } from './../flowchart-common/flowchart-common.component';
import { Callback, Action, ActionApiCallingNodes, ConditionNode, JtkNodeParam } from './../../../interfaces/callback';
import { ActionApi, ActionApiList } from './../../../interfaces/action-api';
import { CallbackDataServiceService } from './../../../services/callback-data-service.service';

@Component({
  selector: 'app-callback-flowchart',
  templateUrl: './callback-flowchart.component.html',
  styleUrls: ['./callback-flowchart.component.css']
})

export class CallbackFlowchartComponent implements OnInit, OnChanges {
  isFirstTimeLoaded = false;

  constructor(private $jsplumb: jsPlumbService, private cdService: CallbackDataServiceService) {
    this.toolkitId = 'callbackFlowchart';
    this.surfaceId = 'callbackFlowchartSurface';

    this.cdService.on('nodeDeleted').subscribe(node => {
      Dialogs.show({
        id: 'dlgConfirm',
        data: {
          msg: 'Delete ' + node['text'] + ' '
        },
        onOK: () => {
          this.deleteNode(node);
        }
      });
      // this.deleteNode(data);
    });
  }

  @Input() callback: Callback;
  @Input() action: Action;
  // @ViewChild(jsPlumbSurfaceComponent) surfaceComponent: jsPlumbSurfaceComponent;

  // This is flow chart data.
  flowChartData: any = {
    nodes: [],
    edges: []
  };

  // It will be used to edit node.
  editNode = null;


  // Handling input for api.
  showApiDialog = false;
  currentActionApi: ActionApi = null;
  currentActionApiArgs: any = null;

  // Handling for condition dialog.
  showConditionDialog = false;
  currentConditionArg = null;

  lastPlaceHolderSource: string = null;
  lastPlaceHolderLabel: string = null;

  @ViewChild(jsPlumbSurfaceComponent) surfaceComponent: jsPlumbSurfaceComponent;

  toolkit: jsPlumbToolkit;
  surface: Surface;

  toolkitId: string;
  surfaceId: string;

  private flowDiagramData: any;

  nodeTypes = [
    { label: 'Question', type: 'question', w: 120, h: 120 },
    { label: 'Action', type: 'action', w: 120, h: 70 },
    { label: 'Output', type: 'output', w: 120, h: 70 },
    { label: 'PlaceHolder', type: 'placeholder', w: 120, h: 70 }

  ];

  toolkitParams = {
    nodeFactory: (type: string, data: any, callback: Function) => {
      if (this.action == null) {
        console.log('No Action selected.');
        return;
      }

      if (type === 'action' || type === 'question') {
        // in data there is left and top.

        console.log('Checking for placeholder element - ', data);
        this.toolkit.getNodes().some(node => {
          if (node.data.type === 'placeholder') {
            // check if point lie in between node.
            if (this.isInsideRectange(node.data, data)) {
              // remove this node and take it's position.
              data.left = node.data.left;
              data.top = node.data.top;

              const edges = node['getAllEdges']();
              if (edges.length) {
                this.lastPlaceHolderSource = edges[0].source.id;
                this.lastPlaceHolderLabel = !!edges[0].data ? edges[0].data.label : null;
              }

              console.log('last placeholder source - ' + this.lastPlaceHolderSource);
              this.toolkit.removeNode(node);
              // adjust placeholder nodes count.
              this.action.placeHolderNodes--;
              return true;
            }
          }
          return false;
        });
      }
      console.log('Dropped node type - ', type);

      if (type === 'action') {
        // get api name first.
        const api = ActionApiList.getApiData(data.api);
        if (api === null) { return; }

        // add node.
        data.text = api.api + '(...)';
        // data.id = 'api_' + this.action.data.aNOdes.length;
        data.id = 'api_' + this.callback.counter.api++;

        // add aNodes.
        const apiNodeData = new ActionApiCallingNodes();
        apiNodeData.id = data.id;
        // This should be populated on form update.
        apiNodeData.text = api.api + '(...)';
        apiNodeData.data = { api, argument: null };
        // mark this as dirty as not put valid data yet.
        apiNodeData.dirty = true;
        data.dirty = true;
        this.action.data.aNOdes.push(apiNodeData);

        // mark the action and callback both dirty.
        this.action.dirty = true;
        this.callback.dirty = true;

        callback(data);

        // open edit popup.
        this.editNode = data;

        this.showApiDialog = true;

        this.currentActionApi = api;
        // Initially there is no data available.
        this.currentActionApiArgs = null;

        console.log('api name - ', data.api, ' data - ', api);
        return;

      } else if (type === 'question') {
        data.text = '...';
        // data.id = 'condition_' + this.action.data.cNodes.length;
        data.id = 'condition_' + this.callback.counter.condition++;

        const conditionNodeData = new ConditionNode();
        conditionNodeData.id = data.id;
        conditionNodeData.text = '...';
        conditionNodeData.data = null;

        // mark it dirty.
        conditionNodeData.dirty = true;
        data.dirty = true;

        this.action.data.cNodes.push(conditionNodeData);

        console.log('callback - dirty : ', this.callback.dirty);
        this.action.dirty = true;
        this.callback.dirty = true;

        callback(data);

        this.showConditionDialog = true;
        this.currentConditionArg = null;
        this.editNode = data;
        return;

      } else {
        console.log('nodeFactory called for unknown node - ', type, data);
        // Check if id it not there then add a new one.
        data.id = jsPlumbToolkitUtil.uuid();
        // create it.
        callback(data);
      }
      /*
            Dialogs.show({
              id: "dlgText",
              title: "Enter " + type + " name:",
              onOK: (d:any) => {
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
                    alert(type + " names must be at least 2 characters!");
                }
                // else...do not proceed.
              }
            });
            */
    },
    beforeStartConnect: (node: any, edgeType: string) => {
      return { label: '...' };
    }
  };

  view = {
    nodes: {
      start: {
        template: 'StartNode'
      },
      selectable: {
        events: {
          tap: (params: any) => {
            this.toggleSelection(params.node);

            switch (params.node.data.type) {
              case 'question':
                this.editConditionNode(params.node.data);
                break;
              case 'action':
                this.editApiNode(params.node.data);
                break;
            }

          },
          dblclick: (params: any) => {
            Dialogs.show({
              id: 'dlgConfirm',
              data: {
                msg: 'Delete ' + params.node.data.text + ' '
              },
              onOK: () => {
                this.deleteNode(params.node);
              }
            });
          }
        }
      },
      question: {
        parent: 'selectable',
        template: 'QuestionNode'
      },
      output: {
        parent: 'selectable',
        template: 'OutputNode'
      },
      action: {
        parent: 'selectable',
        template: 'ActionNode'
      },
      placeholder: {
        parent: 'selectable',
        template: 'PlaceHolder'
      }
    },
    edges: {
      default: {
        anchor: 'AutoDefault',
        endpoint: 'Blank',
        connector: ['Flowchart', { curviness: 10 }],
        paintStyle: { strokeWidth: 2, stroke: '#f76258', outlineWidth: 3, outlineStroke: 'transparent' },	// 	paint style for this edge type.
        hoverPaintStyle: { strokeWidth: 2, stroke: 'rgb(67,67,67)' }, // hover paint style for this edge type.
        events: {
          dblclick: (params: any) => {
            Dialogs.show({
              id: 'dlgConfirm',
              data: {
                msg: 'Delete Edge'
              },
              onOK: () => { this.removeEdge(params.edge); }
            });
          }
        },
        overlays: [
          ['Arrow', { location: 1, width: 10, length: 10 }],

        ]
      },
      connection: {
        parent: 'default',
        overlays: [
          [
            'Label', {
              label: '${label}',
              events: {
                /*
                click: (params: any) => {
                  this.editLabel(params.edge);
                }*/
              }
            }
          ]
        ]
      }
    },
    ports: {
      start: {
        endpoint: 'Blank',
        anchor: 'Continuous',
        uniqueEndpoint: true,
        edgeType: 'default',
        maxConnections: 1
      },
      source: {
        endpoint: 'Blank',
        paintStyle: { fill: '#84acb3' },
        anchor: 'AutoDefault',
        maxConnections: 2,
        edgeType: 'connection'
      },
      target: {
        maxConnections: 1,
        endpoint: 'Blank',
        anchor: 'AutoDefault',
        paintStyle: { fill: '#84acb3' },
        isTarget: true
      }
    }
  };

  renderParams = {
    layout: {
      type: 'Spring',
      magnetize: true /*By Default it is true */

    },
    refreshLayoutOnEdgeConnect: true,
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
      filter: '.jtk-draw-handle, .node-action, .node-action i'
    }
  };

  ngOnChanges() {
    // If action got change then initialize flowchart.

    if (this.action != null) {

      this.action.dirty = false;

      // reset placeholder node count.
      this.action.placeHolderNodes = 0;

      // this.isFirstTimeLoaded = true;
      this.flowDiagramData = this.getFlowDiagramData();

      // this.flowDiagramData = this.getFlowDiagramData(this.callback);
      this.toolkit.load({ data: this.flowDiagramData });

    } else {

      //reset flowchart
      if (this.toolkit) {
        this.toolkit.clear();
      }
    }
    console.log('Flowchart-component', this.action, this.callback);

  }


  copyJData(input: any, out: any) {
    if (!input) { return; }

    const keys = ['w', 'h', 'top', 'left'];
    keys.forEach(key => {
      if (input[key] !== undefined) {
        out[key] = input[key];
      }
    });

    return true;
  }

  getFlowDiagramData() {
    const fdData = {
      nodes: [],
      edges: []
    };

    fdData.nodes.push({
      type: 'start',
      text: 'start',
      id: 'start',
      w: 100,
      h: 70
    });

    // FIXME: how to remember start position.
    // this.copyJData(da.jData, fdData.nodes[fdData.nodes.length - 1]);
    this.copyJData(this.action.data.startNodeJData, fdData.nodes[fdData.nodes.length - 1]);

    this.action.data.aNOdes.forEach(da => {
      fdData.nodes.push({
        id: da.id,
        text: da.data.api.id,
        type: 'action',
        data: da.data,
        w: 180,
        h: 70
      });
      this.copyJData(da.jData, fdData.nodes[fdData.nodes.length - 1]);
    });

    this.action.data.cNodes.forEach(d => {
      const text = `'${d.data.lhs}' ${d.data.operator['name']} ${d.data.rhs}`;
      fdData.nodes.push({
        id: d.id,
        text,
        type: 'question',
        data: d.data,
        w: 180,
        h: 70
      });
      this.copyJData(d.jData, fdData.nodes[fdData.nodes.length - 1]);
    });

    // this.callback.actions.forEach(action =>{
    //   fdData.edges = action.data.edges;
    //   console.log("inside getflo",fdData);
    // });

    // console.log("refresh edge of flowchart",this.callback.actions);
    fdData.edges = this.action.data.edges;



    // this.callback.actions.forEach(action => {
    //   if (this.action != null && action.id == this.action.id) {
    //     fdData.nodes.push({
    //       type: 'start',
    //       text: 'start',
    //       id: 'start',
    //       w: 100,
    //       h: 70
    //     });

    // if (this.action.data.aNOdes.length) {
    //   this.action.data.aNOdes.forEach(da => {
    //     fdData.nodes.push({
    //       "id": da.id,
    //       "text": da.data.api["id"],
    //       "type": "action",
    //       "data": da.data,
    //       w: 180,
    //       h: 70
    //     });
    //   });
    // }
    // if (this.action.data.cNodes.length) {
    //   this.action.data.cNodes.forEach(d => {
    //     let text = "'" + d.data.lhs + "' " + d.data.operator["name"] + " " + d.data.rhs;
    //     fdData.nodes.push({
    //       "id": d.id,
    //       "text": text,
    //       "type": "question",
    //       "data": d.data,
    //       w: 180,
    //       h: 70
    //     });
    //   });
    // }
    // if (this.action.data.edges.length) {
    //   this.action.data.edges.forEach(n => {
    //     fdData.edges.push({
    //       id: fdData.edges.length,
    //       source: n.source,
    //       target: n.target,
    //       data: n.data
    //     });
    //   });
    // }
    // }
    // else{
    //   fdData.nodes.push({
    //     type: 'start',
    //     text: 'start',
    //     id: 'start',
    //     w: 100,
    //     h: 70
    //   });
    // }
    // });


    console.log('GetflowdiagramData called ===>', this.action.data.edges, fdData, this.callback);
    return fdData;
  }


  ngOnInit() {

    // get the toolkit instance
    this.toolkit = this.$jsplumb.getToolkit(this.toolkitId, this.toolkitParams);

    this.toolkit.bind('dataUpdated', this.dataUpdateListener.bind(this));

    this.cdService.on('editActionNode').subscribe((data) => {
      console.log('data : ', data);
      this.editApiNode(data);
    });

    this.cdService.on('editQuestionNode').subscribe((data) => {
      this.editConditionNode(data);
    });

    // register nodeAdded.
    this.toolkit.bind('nodeAdded', (param) => {
      const data = param.data;
      // data, node, eventInfo.
      console.log('nodeAdded data - ', param);
      // eventInfo will only come when drag and drop.
      if (param.eventInfo) {
        if (data.type === 'question' || data.type === 'action') {
          // try to add to previous node.
          if (this.lastPlaceHolderSource != null) {
            this.toolkit.addEdge({
              source: this.lastPlaceHolderSource,
              target: data.id,
              data: {
                label: this.lastPlaceHolderLabel,
                type: 'connection'
              }
            });
          } else {
            // Add the edge with previous node.
            const aboveNode = this.findAboveNode2(data);

            console.log('aboveNode - ', aboveNode);

            if (aboveNode) {
              this.toolkit.addEdge({
                source: aboveNode.id,
                target: data.id
              });
            }
          }
        }

        this.lastPlaceHolderSource = null;
        this.lastPlaceHolderLabel = null;

        // check if condition node added then add another two nodes.
        if (data.type === 'question') {
          console.log('New question node added by user.');

          // add placeholder nodes.
          const leftNodePosisiton = { left: data.left - (50 + 180), top: data.top + (70 + 50) };
          const rightNodePostition = { left: data.left + (50 + 180), top: data.top + (70 + 50) };
          // add new nodes.
          // Add two more placeholder nodes.
          // ID should be generated automatically.
          this.toolkit.addNode({
            type: 'placeholder',
            id: data.id + '_left_ph',
            w: 100, h: 70,
            text: 'Drag it here.',
            top: leftNodePosisiton.top,
            left: leftNodePosisiton.left,
            data: {
              label: 'yes',
              type: 'connection',
              id: jsPlumbToolkitUtil.uuid()
            }
          });
          this.toolkit.addNode({
            type: 'placeholder',
            id: data.id + '_right_ph',
            w: 100, h: 70,
            text: 'Drag it here.',
            top: rightNodePostition.top,
            left: rightNodePostition.left,
            data: {
              label: 'no',
              type: 'connection',
              id: jsPlumbToolkitUtil.uuid()
            }
          });

          // increase placeholder count.
          this.action.placeHolderNodes += 2;
        }
      } else {
        if (data.type === 'placeholder') {
          // Connect it with it's parent.
          const parentId = data.id.replace(/_left_ph$/, '').replace(/_right_ph$/, '');
          this.toolkit.addEdge({
            source: parentId,
            target: data.id,
            data: {
              type: 'connection',
              label: data.id.endsWith('_left_ph') ? 'yes' : 'no',
              id: jsPlumbToolkitUtil.uuid()
            }
          });

          // make these node droppable.
          setTimeout(() => {
            this.makePlaceHolderDroppable(data.id);
          }, 100);
        }
      }
    });

    console.log('Flow Diagram onInit ===>', this.flowChartData, this.toolkit);



  }

  makePlaceHolderDroppable(nodeid: string) {
    // search for Element.
    const element: any = document.querySelector('[nodeid="' + nodeid + '"]');
    if (element != null) {
      element.addEventListener('drop', (event) => {
        console.log('Dropped in Placeholder ' + nodeid + '. EventData - ', event);
        event.stopPropagation();
      }, true);

      element.addEventListener('dragover', (event) => {
        console.log('dragover in placeholder ' + nodeid + '.');
        event.preventDefault();
      }, true);
    }

  }

  // data will have node information like id, type, top, left etc.
  findAboveNode(data: any): any {
    if (this.action === null) {
      return null;
    }

    const hasJData = (jData) => {
      return jData && !isNaN(jData.top) && !isNaN(jData.left);
    };

    const nodeHasEdge = {};
    const connectedNodes = [];
    // iteate all aNdoes and cNodes to find the one which does not have edge and on top of it.
    this.action.data.edges.forEach(edge => {
      nodeHasEdge[edge.source] = true;
    });

    // filter those do not have edge.
    this.action.data.aNOdes.forEach(aNode => {
      // Need to filter above nodes only.
      if (!nodeHasEdge[aNode.id] && (hasJData(aNode.jData) && aNode.jData.top > data.top)) {
        connectedNodes.push(aNode);
      }
    });

    this.action.data.cNodes.forEach(cNode => {
      if (!nodeHasEdge[cNode.id] && (hasJData(cNode.jData) && cNode.jData.top > data.top)) {
        connectedNodes.push(cNode);
      }
    });

    // Find the node which is most close.
    let aboveNode = null;
    let minDistance = Number.MAX_SAFE_INTEGER;

    // Check with start node too.
    if (!connectedNodes['start'] && hasJData(this.action.data.startNodeJData)) {
      const jDataForStart = this.action.data.startNodeJData;
      // get it's distance form current node.
      const distance = Math.sqrt(
        Math.pow((Math.abs(data.top - jDataForStart.top)), 2) +
        Math.pow((Math.abs(data.left - jDataForStart.left)), 2)
      );
      minDistance = distance;

      aboveNode = {
        id: 'start'
      };
    }
    connectedNodes.forEach((node) => {
      const distance = Math.sqrt(
        Math.pow((Math.abs(data.top - node.jData.top)), 2) +
        Math.pow((Math.abs(data.left - node.jData.left)), 2)
      );

      console.log('diagonal distance - ' + distance);

      if (distance < minDistance) {
        aboveNode = node;
        minDistance = distance;
      }
    });

    return aboveNode;
  }

  findAboveNode2(data: any): any {
    if (this.action === null) {
      return null;
    }

    let nodeAboveThis = null;
    // check for node above this node.
    this.toolkit.getNodes().forEach(node => {
      // get all nodes above this node.
      const rect = node.data;
      if (rect.top && rect.left &&
        (rect.left > (data.left - (data.w / 2 + 20))) &&
        (rect.left < (data.left + (data.w / 2 + 20))) &&
        (rect.top < data.top)) {
        // this node is above the
        if (nodeAboveThis) {
          if (nodeAboveThis.data.top < node.data.top) {
            nodeAboveThis = node;
          }
        } else {
          nodeAboveThis = node;
        }
      }
    });

    // if above node found then check it has connection or not.
    if (nodeAboveThis != null) {
      // check for it's edges.
      const edges = nodeAboveThis.getAllEdges();
      if (!edges.some(edge => {
        if (edge.source === nodeAboveThis.data.id) {
          return true;
        }
      })) {
        return nodeAboveThis.data;
      }
    }
    return null;
  }

  updateBTInfo(toolKitData: any) {
    // console.log("updateListner called ===>",toolKitData);
    toolKitData.nodes.forEach((node: any) => {
      if (node.type === 'start') {
        if (!this.action.data.startNodeJData) {
          this.action.data.startNodeJData = new JtkNodeParam();
        }
        return this.copyJData(node, this.action.data.startNodeJData);
      }
      if (node.type === 'action') {
        // this.callback.actions.forEach(action => {
        this.action.data.aNOdes.some(n => {
          if (node.id === n.id) {
            if (n.jData === undefined) {
              n.jData = new JtkNodeParam();
            }
            return this.copyJData(node, n.jData);
          }
        });
        return false;
        // });
      }
      if (node.type === 'question') {
        // this.callback.actions.forEach(action => {
        this.action.data.cNodes.some(nq => {
          if (node.id === nq.id) {
            if (nq.jData === undefined) {
              nq.jData = new JtkNodeParam();
            }
            return this.copyJData(node, nq.jData);
          }
        });
        // })
      }
    });


    console.log('callback after updateBTInfo for flowdiagram - ', this.callback, toolKitData);
  }

  dataUpdateListener() {
    console.log('JSPlumb data updated in flow Diagram - ', this.toolkit.exportData());
    // TODO: update jsplumb data.
    const tempToolkitData = Object(this.toolkit.exportData());
    this.action.data.edges = tempToolkitData.edges;

    // filter placeholder edges.
    this.action.data.edges = tempToolkitData.edges.filter(edge => {
      return (!(edge.source.endsWith('_right_ph') || edge.source.endsWith('_left_ph') ||
        edge.target.endsWith('_right_ph') || edge.target.endsWith('_left_ph')));
    });

    this.updateBTInfo(tempToolkitData);

    // FIXME : Nedd to Handle it properly
    // ISSUE : this is called multiple times

    // if (this.isFirstTimeLoaded === false) {
    //   this.callback.dirty = true;
    //   this.action.dirty = true;

    // }

    this.isFirstTimeLoaded = false;


    console.log('toolKitData on refresh', tempToolkitData, this.callback);
  }

  isInsideRectange(react: any, point: any): boolean {
    return ((react.left - (react.w / 2 + 20) < point.left) &&
      (react.left + (react.w / 2 + 20) > point.left) &&
      (react.top - (react.h / 2 + 20) < point.top) &&
      (react.top + (react.h / 2 + 20) > point.top));
  }

  resolveNode(typeId: string) {
    return ({
      QuestionNode: QuestionNodeComponent,
      ActionNode: ActionNodeComponent,
      StartNode: StartNodeComponent,
      OutputNode: OutputNodeComponent,
      PlaceHolder: PlaceHolderComponent

    })[typeId];
  }

  getToolkit(): jsPlumbToolkit {
    return this.toolkit;
  }

  toggleSelection(node: any) {
    this.toolkit.toggleSelection(node);
    console.log('Node Selected : ', node);
  }

  removeEdge(edge: any) {
    this.toolkit.removeEdge(edge);
  }

  deleteNode(node: any) {

    this.toolkit.removeNode(node);


    // tslint:disable-next-line: forin

    let data: any;
    if (node.data !== undefined) {
      data = node.data;
    } else {
      data = node;
    }

    switch (data.type) {
      case 'action':
        this.action.data.aNOdes.forEach((item, i) => {
          if (item.id === data.id) {
            this.action.data.aNOdes.splice(i, 1);
          }
          return;
        });
        break;

      case 'question':
        this.action.data.cNodes.forEach((item: any, i: number) => {
          if (item.id === data.id) {
            this.action.data.cNodes.splice(i, 1);
          }
          return;
        });

        break;
    }

    this.showConditionDialog = false;
    this.showApiDialog = false;
  }

  editLabel(edge: any) {
    console.log('On Edit edge', edge, this.action, Object(this.toolkit.exportData()));

    if (edge.source.getType() !== 'question') { return; }

    Dialogs.show({
      id: 'dlgRadio',
      data: {
        yes: edge.data.label,
        no: edge.data.label
      },
      onOK: (data: any) => {
        this.toolkit.updateEdge(edge, { label: data.text });
      }
    });

    // Dialogs.show({
    //   id: "dlgText",
    //   data: {
    //     text: edge.data.label || ""
    //   },
    //   onOK: (data: any) => {
    //     this.toolkit.updateEdge(edge, { label: data.text });
    //   }
    // });
  }

  typeExtractor(el: Element) {
    return el.getAttribute('jtk-node-type');
  }

  dataGenerator(type: string, el: Element) {
    return {
      type: el.getAttribute('jtk-node-type'),
      w: parseInt(el.getAttribute('jtk-width'), 10),
      h: parseInt(el.getAttribute('jtk-height'), 10)
    };
  }

  ngAfterViewInit() {
    this.surface = this.surfaceComponent.surface;
    this.toolkit = this.surface.getToolkit();

    new DrawingTools({
      renderer: this.surface
    });

    // this.toolkit.load({ url: "assets/data/flowchart-small.json" });
  }

  ngOnDestroy() {
    console.log('flowchart being destroyed');
  }


  getNode(id: string, type: string): any {
    if (this.action == null) {
      return null;
    }

    const list: any[] = type === 'a' ? this.action.data.aNOdes : this.action.data.cNodes;
    let qnode = null;
    list.some((node: any) => {
      if (node.id === id) {
        qnode = node;
        return true;
      }
    });
    return qnode;
  }

  getANode(id: string): ActionApiCallingNodes {
    return this.getNode(id, 'a');
  }

  getCNode(id: string): ConditionNode {
    return this.getNode(id, 'c');
  }



  // argument is node obj. It will comtain id too.
  editApiNode(data) {
    console.log('editApiNode data : ', data);
    const aNode = this.getANode(data.id);

    if (aNode != null) {
      this.editNode = data;
      this.showApiDialog = true;
      this.currentActionApi = aNode.data.api;
      this.currentActionApiArgs = aNode.data.argument;
    }
  }


  // Handling for action api.
  handleActionApiAdded($event) {
    // TODO: set action.
    console.log('action api submitted with values - ', $event, this.action.data.aNOdes);

    // Add in action.
    const value: any = $event.argument;
    // set the arguments.
    let args = '';
    this.currentActionApi.arguments.forEach(arg => {
      if (args !== '') {
        args += ',';
      }
      args += `${arg.name}:${value[arg.name]}`;
    });

    // get the anode.
    const aNode = this.getANode(this.editNode.id);

    if (aNode != null) {
      aNode.data.argument = $event.argument;
      // TODO: update text.
      aNode.text = $event.api.api + '(' + args + ')';
      // this.editNode.text = aNode.text;

      aNode.dirty = false;
      this.editNode.dirty = false;


      this.cdService.broadcast('updateNode', this.editNode);

      this.action.dirty = true;
      console.log('callback - dirty : ', this.callback.dirty);
      this.callback.dirty = true;

      // In case gotoState api called then trigger event. and do handling for edges at sd.
      if ($event.api.id === 'gotoState') {
        console.log('on goto', $event.api.id);
        this.cdService.broadcast('refreshSDEdge', $event.argument.stateName);
      }
    }

    this.editNode = null;
    this.showApiDialog = false;
    this.currentActionApi = null;
    this.currentActionApiArgs = null;
  }

  editConditionNode(data) {
    console.log('editConditionNode data : ', data);
    const cNode = this.getCNode(data.id);
    if (cNode !== null) {
      this.editNode = data;
      this.showConditionDialog = true;
      this.currentConditionArg = cNode.data;
    }
  }


  handleConditionAdded($event) {
    console.log('HandleConditionAdded', $event);
    const data = $event;
    // TODO: instead of showing name for operator, better to show sign eg. >=
    const text = `'${data.lhs}' ${data.operator.name} ${data.rhs}`;

    const cNode = this.getCNode(this.editNode.id);
    if (cNode !== null) {
      cNode.data = $event;
      cNode.text = text;
      this.editNode.text = text;

      // Its fixed.
      cNode.dirty = false;
      this.editNode.dirty = false;

      this.cdService.broadcast('updateNode', this.editNode);
      // mark dirty.
      this.action.dirty = true;
      console.log('callback - dirty : ', this.callback.dirty);

      this.callback.dirty = true;
    }

    this.editNode = null;
    this.showConditionDialog = false;
    this.currentConditionArg = null;

    console.log('handleConditionAdded completed', this.flowChartData, $event);
  }

  hideCondition(e) {
    this.showConditionDialog = e;
  }

  hideApi(e) {
    this.showApiDialog = e;
  }
}
