import { sequence } from "bosia";
import type { Handle } from "bosia";
import { db } from "./features/drizzle";

const dbHandle: Handle = async ({ event, resolve }) => {
    event.locals.db = db;
    return resolve(event);
};

const loggingHandle: Handle = async ({ event, resolve }) => {
    const start = Date.now();
    event.locals.requestTime = start;
    const res = await resolve(event);
    const ms = Date.now() - start;
    console.log(`[${event.request.method}] ${event.url.pathname} ${res.status} (${ms}ms)`);
    res.headers.set("X-Response-Time", `${ms}ms`);
    return res;
};

export const handle = sequence(dbHandle, loggingHandle);
