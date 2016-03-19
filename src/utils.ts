export function getQueryString(path: string): string {
    const index = path.indexOf("?");
    return index > -1 ? path.slice(index + 1) : "";
}

export function getPathName(path: string): string {
    if (!path) path = "";
    const match = path.match(/^((https?:)?\/\/.*?)?\/([^#\?]*)?/i);
    if (match) {
        const pathname = match[3];
        return "/" + (pathname || "");
    }
    return "/" + path;
}

export function getHash(path: string): string {
    const index = getHashIndex(path);
    return index > -1 ? path.slice(index + 1) : "";
}

export function getHashIndex(path: string) {
    let index = path.indexOf("#");
    while (index > -1) {
        const nextCharIndex = index + 1;
        if (path[nextCharIndex] !== "!") return index;
        index = path.indexOf("#", index);
    }
    return -1;
}

export function trimLeft(str: string, delimiter: string) {
    let res = str;
    while (res.startsWith(delimiter)) {
        res = res.slice(1);
    }
    return res;
}

export function trimRight(str: string, delimiter: string) {
    let res = str;
    while (res.endsWith(delimiter)) {
        res = res.slice(0, -1);
    }
    return res;
}

export function trimSlashes(str: string) {
    return trimRight(trimLeft(str, "/"), "/");
}

/**
 * Removes slashes from both beginning and end of string, so that
 * path may be used for relative contexts in application. This enables
 * routing application to be completely independent of the path and
 * safely provide nested routing.
 *
 * Also cleans up any duplicate slashes anywhere in the pathname.
 * Note: It only parses the pathname, so any part after "#" or
 * "?" will simply be removed.
 */
export function cleanPathNameSlashses(path: string) {
    let res = "";
    for (let i = 0; i < path.length; i++) {
        const c = path[i];
        if (c === "/") {
            if (i === 0 || res[res.length - 1] === "/") continue;
        }
        if (c === "#" || c === "?") break;
        res += c;
    }
    return trimRight(res, "/");
}