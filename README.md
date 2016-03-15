# history-next

A history component that providers asynchronous listeners with promises and provides a view of history for each listener with a context.

> npm install history-next



- **npm**: https://www.npmjs.com/package/history-next
- **Github**: https://github.com/prasannavl/history-next

> Works both on the browser and node environment.

Most api's that wrap the browser history like [rackt/history](https://github.com/rackt/history) does a great job of abstracting the it, but does not provide a contexual view of history. You are stuck to one view of the history for the entire set of application, or manually handling wrapping them further, which cascades a lot more problems. With chained contextual history, it becomes super easy to do stuff like contextual routing with ease, without the use of external routers, or to make awesome routers. 

This is an API that provides a contextual view, and also with promises that allows you to keep chaining history listeners along with a context. The `listenBeforeChange` also accepts promises so history changes can be paused, until callbacks (useful for animations and other validations and confirmations). 

It provides a simple API surface that tries to stay close to the actual history API, with extras.

```typescript
export interface IHistory {
    context: IHistoryContext;
    length: number;
    go(delta?: any): Promise<boolean>;
    replace(url: string, state?: any): Promise<boolean>;
    push(url: string, state?: any): Promise<boolean>;
    replaceContext(context: IHistoryContext): Promise<boolean>;
    pushContext(context: IHistoryContext): Promise<boolean>;
    listen(listener: HistoryListener, frontline?: boolean): () => void;
    listenBeforeChange(listener: 
        HistoryBeforeChangeListener, frontline?: boolean): () => void;
    start(): void;
    dispose(): void;
}
```

And the history context API: 

```typescript
export interface IHistoryContext {
    // The full url
    url: string;
    // The resource path. No scheme, host or port is included.
    pathname: string;
    /*
    Raw query string including after "?" (Does not include the question mark). 
    Parsed qs is not a part of this by design. Its very easy to use one of the
    external libs to do so, and it adds pointless complexity doing it here 
    efficiently and providing multiple contexts. (Where to cache the object 
    without parsing it for every context? Caching in root context is one way,
    but doesn't address if the listener chain modifies qs. Caching in each ctx
    addresses that, but incurs inefficiency. So, its best to leave that 
    responsibility to the app to do it in a manner that's most suitable for the
    app). The app can even have a listener that attaches a attaches a query 
    object to the context. 
    
    PS: Always parse on-demand and cache query on access. Avoid parsing it
    unnecessarily. Tip: Use accessor props
    */
    queryString: string;
    /*
    Always the hash after #, but not as #! to potentially leave it to be 
    considered as a pathname instead. This is done so that #-based page links 
    can work naturally and also keeps the option to use hash and history api 
    based routing simultaneously, although not recommended.
    */
    hash: string;
    state: any;
    getRoot(): IHistoryContext;
    getParent(): IHistoryContext;
    createChild(): IHistoryContext;
}
```

And the history listeners follow these interfaces: 

```typescript
export interface HistoryListenerDelegate {
    (context: IHistoryContext): Promise<void>;
}

export interface HistoryListener {
    (context: IHistoryContext, 
        next: HistoryListenerDelegate): Promise<void>;
}

export interface HistoryBeforeChangeListenerDelegate {
    (context: IHistoryContext): Promise<boolean>;
}

/*
Returning false in the promise will prevent the change from happening.
This can be used for confirmation, authentication, and so on.
*/
export interface HistoryBeforeChangeListener {
    (context: IHistoryContext, 
        next: HistoryBeforeChangeListenerDelegate): Promise<boolean>;
}
```

Evidently, promises are required for it to work. Should work out of the box in ES6+ browsers, or it requires the promises polyfill. 

#### History implementations

Provides the implementation for HTML5 history API, and a minimal memory history for server side rendering out of the box.
A `HistoryCore` class is also exposed which does all the heavy lifting for the listener chaining logic. So, its very easy to create a new implementation by prototyping from `HistoryCore`. 

Have a look at `MemoryHistory` and `BrowserHistory` implementation for details.  