import { HistoryCore } from "./HistoryCore";
import { IHistoryContext, HistoryContext } from "./HistoryContext";

/*
    MemoryHistory - currently only provides just enough support for server-side rendering.
    Does not provide anything that requires actual navigation for now. 
*/
export class MemoryHistory extends HistoryCore {

    go(delta?: any): any {
        throwNotImplemented();
    }

    replace(path: string, state?: any): any {
        throwNotImplemented();
    }

    push(path: string, state?: any): any {
        throwNotImplemented();
    }

    replaceContext(context: IHistoryContext): any {
        throwNotImplemented();
    }

    pushContext(context: IHistoryContext): any {
        throwNotImplemented();
    }

    start() { }
    
    dispose() { 
        super.dispose();
    }

    setContext(context: IHistoryContext) {
        this.current = context;
    }
}

function throwNotImplemented() {
    throw new Error("Navigational methods are not implemented for memory history.");
}