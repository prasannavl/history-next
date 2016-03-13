import { getQueryString, getPathName, getHash } from "./utils";

    export interface IHistoryContext {
        // The full url
        url: string;
        // The resource path. No scheme, host or port is included.
        pathname: string;
        /*
        Raw query string including after "?" (Does not include the question mark). Parsed qs 
        is not a part of this by design. Its very easy to use one of the external libs to do so, 
        and it adds pointless complexity doing it here efficiently and providing multiple 
        contexts. (Where to cache the object without parsing it for every context? Caching in root
        context is one way, but doesn't address if the listener chain modifies qs. Caching in each ctx
        addresses that, but incurs inefficiency. So, its best to leave that responsibility to the
        app to do it in a manner that's most suitable for the app.)
        The app can even have a listener that attaches a attaches a query object to the context.
        PS: Always parse on-demand and cache query on access. Avoid parsing it unnecessarily.
        Tip: Use accessor props
        */
        queryString: string;
        /*
        Always the hash after #, but not as #! to potentially leave it to be considered as a pathname
        instead. This is done so that #-based page links can work naturally and also keeps the option
        to use hash and history api based routing simultaneously, although not recommended.
        */
        hash: string;
        state: any;
        getRoot(): IHistoryContext;
        getParent(): IHistoryContext;
        createChild(): IHistoryContext;
}

export class HistoryContext implements IHistoryContext {
    url: string;
    pathname: string;
    queryString: string;
    hash: string;
    state: any;

    private _root: IHistoryContext = null;
    private _parent: IHistoryContext = null;

    static createEmpty() {
        return new HistoryContext(null, null, null, null, null);
    }

    static createFromPath(path: string, state: any = null) {
        return new HistoryContext(path, getPathName(path), getQueryString(path), getHash(path), state);
    }

    constructor(url: string, pathname: string, queryString: string, hash: string, state: any) {
        this.url = url;
        this.pathname = pathname;
        this.queryString = queryString;
        this.hash = hash;
        this.state = state;
    }

    getParent() {
        return this._parent;
    }

    getRoot(): IHistoryContext {
        return this._root || this;
    }

    createChild(): IHistoryContext {
        return Object.assign({}, this, { _parent: this, _root: this._root || this });
    }
}