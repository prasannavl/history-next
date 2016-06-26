import { HistoryCore } from "./HistoryCore";
import { IHistoryContext, HistoryContext } from "./HistoryContext";
import { cleanPathNameSlashses } from "./utils";

const POPSTATE_EVENT_KEY = "popstate";

export class BrowserHistory extends HistoryCore {

    static createContext() {
        const location = window.location;
        const url = location.href;
        const pathname = location.pathname;
        const queryString = location.search;
        const hash = location.hash;
        const state = window.history.state;

        return new HistoryContext(url, pathname, queryString, hash, state);
    }

    /**
     * Cleans up pathname as documented in utils/cleanPathNameSlashes  
     */
    static createNormalizedContext() {
        const context = BrowserHistory.createContext();
        context.pathname = cleanPathNameSlashses(context.pathname);
        return context;
    }

    private _popStateListener: (ev: any) => void = null;
    public createContext: () => IHistoryContext = BrowserHistory.createContext;
    public createContextFromPath: (path: string, state: any) => IHistoryContext = HistoryContext.createFromPath;

    constructor() {
        super();
    }

    get length() {
        return window.history.length;
    }

    go(delta?: any) {
        return this._processBeforeChange(null).then((change: boolean) => {
            if (change) window.history.go(delta);
            return change;
        });
    }

    replace(path: string, state?: any) {
        const context = this.createContextFromPath(path, state);
        return this.replaceContext(context);
    }

    replaceContext(context: IHistoryContext) {
        return this._processBeforeChange(context).then((change: boolean) => {
            if (change) {
                window.history.replaceState(context.state, null, context.url);
                let contextFromBrowser = this.createAndSetContexts();
                return this._process(contextFromBrowser).then(() => true);
            }
            return false;
        });
    }

    push(path: string, state?: any) {
        const context =  this.createContextFromPath(path, state);
        return this.pushContext(context);
    }

    pushContext(context: IHistoryContext) {
        return this._processBeforeChange(context).then((change: boolean) => {
            if (change) {
                window.history.pushState(context.state, null, context.url);
                let contextFromBrowser = this.createAndSetContexts();
                return this._process(contextFromBrowser).then(() => true);
            }
            return false;
        });
    }

    createAndSetContexts() {
        let prevContext = this.current;
        let context = this.createContext();
        this.current = context;
        this.previous = prevContext;
        return context;
    }

    dispose() {
        super.dispose();
        if (this._popStateListener) window.removeEventListener(POPSTATE_EVENT_KEY, this._popStateListener);
    }

    start() {
        if (!this.current)
            this.current = this.createContext();
        if (!this.previous)
            this.previous = null;
        
        const handler = (ev: any) => {
            let context = this.createAndSetContexts();
            this._process(context);
        };
        window.addEventListener(POPSTATE_EVENT_KEY, handler);
        this._popStateListener = handler;
    }
}