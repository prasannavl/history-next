import { HistoryCore } from "./HistoryCore";
import { IHistoryContext, HistoryContext } from "./HistoryContext";

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

    private _popStateListener: (ev: any) => void = null;

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
        const context = HistoryContext.createFromPath(path, state);
        return this.replaceContext(context);
    }

    replaceContext(context: IHistoryContext) {
        return this._processBeforeChange(context).then((change: boolean) => {
            if (change) {
                window.history.replaceState(context.state, null, context.pathname);
                return this._process(BrowserHistory.createContext()).then(() => true);
            }
            return false;
        });
    }

    push(path: string, state?: any) {
        const context = HistoryContext.createFromPath(path, state);
        return this.pushContext(context);
    }

    pushContext(context: IHistoryContext) {
        return this._processBeforeChange(context).then((change: boolean) => {
            if (change) {
                window.history.pushState(context.state, null, context.pathname);
                return this._process(BrowserHistory.createContext()).then(() => true);
            }
            return false;
        });
    }

    dispose() {
        if (this._popStateListener) window.removeEventListener(POPSTATE_EVENT_KEY, this._popStateListener);
    }

    start() {
        if (!this.context)
            this.context = BrowserHistory.createContext();

        const handler = (ev: any) => {
            const context = BrowserHistory.createContext();
            this.context = context;
            this._process(context);
        };
        window.addEventListener(POPSTATE_EVENT_KEY, handler);
        this._popStateListener = handler;
    }
}