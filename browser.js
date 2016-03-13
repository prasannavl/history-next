import { BrowserHistory, MemoryHistory } from "./index";

window["HistoryNext"] = {
    BrowserHistory: BrowserHistory,
    MemoryHistory: MemoryHistory,
}

window["historyNext"] = new BrowserHistory();