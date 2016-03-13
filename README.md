# history-next

A history component that providers asynchronous listeners with promises and provides a view of history for each listener with a context.

`npm install history-next`

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
    listenBeforeChange(listener: HistoryBeforeChangeListener, frontline?: boolean): () => void;
    start(): void;
    dispose(): void;
}
```

And the history context API: 

```typescript
export interface IHistoryContext {
    url: string;
    pathname: string;
    queryString: string;
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
    (ctx: IHistoryContext): Promise<void>;
}
export interface HistoryListener {
    (context: IHistoryContext, next: HistoryListenerDelegate): Promise<void>;
}
export interface HistoryBeforeChangeListenerDelegate {
    (ctx: IHistoryContext): Promise<boolean>;
}
export interface HistoryBeforeChangeListener {
    (context: IHistoryContext, next: HistoryBeforeChangeListenerDelegate): Promise<boolean>;
}
```

Evidently, promises are required for it to work. Should work out of the box in ES6+ browsers, or it requires the promises polyfill. 