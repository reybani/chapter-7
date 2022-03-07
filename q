export enum StateType {
    Start = 1,
    End,
    NORMAL
}


export class State {
    name: string;
    id: string;
    type: number;

    constructor(name: string, type: number) {
        this.name = name;
        this.type = type;
    }
}

export class Trigger {
    state: string;
    stateId: string;
    name: string;
    // Unique id for each trigger. It can be same as triggerName
    id: string;
    type: string;
    domSelector: string;
    urlSelector: string;
}

export class Action {
    id: string;
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export class DataPoint {
    id: string;
    name: string;
    type: string;
    selector: string;
    pattern: string;
    patternIndex: number;
}

export class Callback {
    states: State[] = [];
    triggers: Trigger[] = [];
    actions: Action[] = [];
    actionMap: Map<string, Map<string, string>> = new Map();
    dataPoints: DataPoint[] = [];

    constructor() {
        // Add start and end state.
        const startState = new State('start', StateType.Start);
        const endState = new State('end', StateType.End);

        startState.id = 'start';
        this.states.push(startState);
        endState.id = 'end';
        this.states.push(endState);
    }
}
