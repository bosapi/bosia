// ─── Error / Redirect Helpers ────────────────────────────
// Throw these from load() functions; the server catches and handles them.

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "HttpError";
    }
}

export class Redirect {
    constructor(public status: number, public location: string) {}
}

/** Throw an HTTP error from a load() function. */
export function error(status: number, message: string): never {
    throw new HttpError(status, message);
}

/** Redirect the user from a load() function. */
export function redirect(status: number, location: string): never {
    throw new Redirect(status, location);
}

// ─── Form Action Helpers ─────────────────────────────────
// Return from form actions — not thrown, just returned.

export class ActionFailure<T extends Record<string, any> = Record<string, any>> {
    constructor(public status: number, public data: T) {}
}

/** Return a failure from a form action with a status code and data. */
export function fail<T extends Record<string, any>>(status: number, data: T): ActionFailure<T> {
    return new ActionFailure(status, data);
}
