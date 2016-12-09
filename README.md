# history-next

A history component that providers asynchronous listeners with promises.

[![Build Status](https://travis-ci.org/prasannavl/history-next.svg?branch=master)](https://travis-ci.org/prasannavl/history-next)

> npm install history-next


- **npm**: https://www.npmjs.com/package/history-next
- **Github**: https://github.com/prasannavl/history-next
- **Changelog**: [history-next/CHANGELOG.txt](https://raw.githubusercontent.com/prasannavl/history-next/master/CHANGELOG.txt)

> Works both on the browser, webpack, browserify, and node (MemoryHistory).

> Zero dependencies.

> In-built type definitions. TypeScript 2 and later should pick it up natively with no effort.

It provides a simple API surface that tries to stay close to the actual history API, with extras.

```typescript
export interface IHistory {
    current: IHistoryContext;
    previous: IHistoryContext;
    length: number;
    go(delta?: any): Promise<boolean>;
    replace(url: string, state?: any): Promise<boolean>;
    push(url: string, state?: any): Promise<boolean>;
    replaceContext(context: IHistoryContext): Promise<boolean>;
    pushContext(context: IHistoryContext): Promise<boolean>;
    listen(listener: HistoryListener, capture?: boolean): () => void;
    listenBeforeChange(listener: HistoryBeforeChangeListener,
        capture?: boolean): () => void;
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
    Raw query string including after "?" (Does not include the question
    mark). Parsed qs is not a part of this by design. Its very easy to use
    one of the external libs to do so, and it adds pointless complexity 
    doing it here efficiently and providing multiple contexts. (Where to
    cache the object without parsing it for every context? Caching in root
    context is one way, but doesn't address if the listener chain modifies
    qs. Caching in each ctx addresses that, but incurs inefficiency. So, its
    best to leave that responsibility to the app to do it in a manner that's
    most suitable for the app). The app can even have a listener that
    attaches a attaches a query object to the context.

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
export interface HistoryListener {
    (context: IHistoryContext): Promise<void>;
}

/*
Returning false in the promise will prevent the change from happening.
This can be used for confirmation, authentication, and so on.
*/
export interface HistoryBeforeChangeListener {
    (context: IHistoryContext): Promise<boolean>;
}
```

Evidently, promises are required for it to work. Should work out of the box in ES6+ browsers, or it requires the promises polyfill. 

#### History implementations

Provides the implementation for HTML5 history API, and a minimal memory history for server side rendering out of the box.
A `HistoryCore` class is also exposed which does all the heavy lifting for the listener chaining logic. So, its very easy to create a new implementation by prototyping from `HistoryCore`.

Have a look at `MemoryHistory` and `BrowserHistory` implementation for details.

#### Notes

- BrowserHistory: The before change listeners aren't executed when its changed through pop-state (browser buttons, for example).
- BrowserHistory: The `capture` defaults to `true` for `beforeChange` and to `false` for `listen` listeners, since that's
  generally what's expected out of it.

If any of the above behavior doesn't suit you, you can simply subclass BrowserHistory, or even create your own by using the 
lower level HistoryCore.

The code is tiny, modular and has comments when required. Have a look directly if something's missing from the documentation.

##### Historical Notes

**Initial Conception:**

Most api's that wrap the browser history like [rackt/history](https://github.com/rackt/history) does a great job of abstracting the it, but does not provide a contexual view of history. You are stuck to one view of the history for the entire set of application, or manually handling wrapping them further, which cascades a lot more problems. With chained contextual history, it becomes super easy to do stuff like contextual routing with ease, without the use of external routers, or to make awesome routers. 

This is an API that provides a contextual view, and also with promises that allows you to keep chaining history listeners along with a context. The `listenBeforeChange` also accepts promises so history changes can be paused, until callbacks (useful for animations and other validations and confirmations). 

**Today:**

*This above is no longer the case starting from v2.0*, as it was learnt that it was far simpler and easier to reason with to deal with contexts, in the application level than at the history api. However, history API's like the above still seems overtly complex for my taste and the code, highly confusing with too many moving parts for just a history abstraction. This library accomplishes all of it, and provides the extension patterns for the anything missing as well cleanly.
