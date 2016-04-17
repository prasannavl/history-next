import { IHistoryContext } from "./HistoryContext";

export interface IHistory {
    current: IHistoryContext;
    previous: IHistoryContext;
    length: number;
    go(delta?: any): Promise<boolean>;
    replace(url: string, state?: any): Promise<boolean>;
    push(url: string, state?: any): Promise<boolean>;
    replaceContext(context: IHistoryContext): Promise<boolean>;
    pushContext(context: IHistoryContext): Promise<boolean>;
    listen(listener: HistoryListenerDelegate, capture?: boolean): () => void;
    listenBeforeChange(listener: HistoryBeforeChangeListenerDelegate, capture?: boolean): () => void;
    start(): void;
    dispose(): void;
}

export interface HistoryListenerDelegate {
    (context: IHistoryContext): Promise<void>;
}

/*
Returning false in the promise will prevent the change from happening.
This can be used for confirmation, authentication, and so on.
*/
export interface HistoryBeforeChangeListenerDelegate {
    (context: IHistoryContext): Promise<boolean>;
}

export abstract class HistoryCore implements IHistory {
    
    current: IHistoryContext;
    length: number;
    previous: IHistoryContext;
    
    _listeners: Array<HistoryListenerDelegate>;
    _beforeChangeListeners: Array<HistoryBeforeChangeListenerDelegate>;
    
    constructor() {
        this._listeners = [];
        this._beforeChangeListeners = [];
    }

    abstract start(): void;
    abstract dispose(): void;
    abstract go(delta?: any): Promise<boolean>;
    abstract replace(url: string, state?: any): Promise<boolean>;
    abstract push(url: string, state?: any): Promise<boolean>;
    abstract replaceContext(context: IHistoryContext): Promise<boolean>;
    abstract pushContext(context: IHistoryContext): Promise<boolean>;
    
    listen(listener: HistoryListenerDelegate, capture: boolean = false) {
        return this._addListener(this._listeners, listener, capture);
    }

    listenBeforeChange(listener: HistoryBeforeChangeListenerDelegate, capture: boolean = true) {
        return this._addListener(this._beforeChangeListeners, listener, capture);
    }

    private _addListener<T>(target: Array<T>, listener: T, capture: boolean) {
        if (capture) {
            target.unshift(listener);
        } else {
            target.push(listener);
        }
        return () => {
            // Note: Do not use the return index from above. Since,
            // the index could be different.
            let index = target.findIndex(x => x === listener);
            if (index) {
                target.splice(index, 1); 
            }
        };
    }

    protected _process(context: IHistoryContext) {
        let listenerCallPromises = this._listeners.map(x => x(context));
        return Promise.all(listenerCallPromises);
    }

    protected _processBeforeChange(context: IHistoryContext): Promise<boolean> {
        return this._runBeforeChangeListenerChain(0, context);
    }

    private _runBeforeChangeListenerChain(index: number, context: IHistoryContext): Promise<boolean> {
        let listener = this._beforeChangeListeners[index];
        if (listener) {
            return listener(context)
                .then(x => {
                    if (x) return this._runBeforeChangeListenerChain(index + 1, context);
                    else return StaticCache.PromiseFalse;
                });
        }
        return StaticCache.PromiseTrue;
    }
}

class StaticCache {
    static PromiseFalse = Promise.resolve(false);
    static PromiseTrue = Promise.resolve(true);
}