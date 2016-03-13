import { BrowserHistory } from "./lib/BrowserHistory";

const win = window as any;
win["HistoryNext"] = {
    BrowserHistory: BrowserHistory,
    MemoryHistory: MemoryHistory,
}
win["historyNext"] = new BrowserHistory();